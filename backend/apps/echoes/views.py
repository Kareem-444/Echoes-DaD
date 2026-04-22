import logging

from datetime import timedelta
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import models as django_models
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.utils import timezone
from .models import Echo, Report, ResonanceRecord, DailyPrompt
from .serializers import EchoSerializer, EchoCreateSerializer, DailyPromptSerializer
from apps.core.pagination import CreatedAtCursorPagination
from apps.core.throttles import ReportRateThrottle, ResonateRateThrottle
from apps.notifications.services import create_notification_for_user
from apps.users.models import Block
from apps.tokens.models import TokenTransaction

BOOST_COST = 25
BOOST_DURATION = timedelta(hours=24)
BOOST_MAX_DURATION = timedelta(days=7)

logger = logging.getLogger(__name__)


def build_echo_preview(content):
    preview = content[:60]
    if len(content) > 60:
        return f'{preview}...'
    return preview


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def echo_list_create(request):
    if request.method == 'GET':
        blocked_user_ids = Block.objects.filter(
            django_models.Q(blocker=request.user) | django_models.Q(blocked=request.user)
        ).values_list('blocker_id', 'blocked_id')
        
        excluded_ids = set()
        for b1, b2 in blocked_user_ids:
            excluded_ids.add(b1)
            excluded_ids.add(b2)
            
        echoes = Echo.objects.filter(
            expires_at__gt=timezone.now()
        ).exclude(author_id__in=excluded_ids).select_related('author').order_by('-created_at')
        paginator = CreatedAtCursorPagination()
        page = paginator.paginate_queryset(echoes, request)
        serializer = EchoSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    serializer = EchoCreateSerializer(data=request.data)
    if serializer.is_valid():
        echo = serializer.save(author=request.user)
        request.user.echoes_shared = django_models.F('echoes_shared') + 1
        request.user.save(update_fields=['echoes_shared'])
        return Response(EchoSerializer(echo).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_echoes(request):
    echoes = Echo.objects.filter(author=request.user).select_related('author').order_by('-created_at')
    paginator = CreatedAtCursorPagination()
    page = paginator.paginate_queryset(echoes, request)
    serializer = EchoSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


class BoostEchoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, echo_id):
        with transaction.atomic():
            try:
                echo = Echo.objects.select_for_update().get(id=echo_id)
            except Echo.DoesNotExist:
                logger.warning('Boost requested for missing echo %s by user %s.', echo_id, request.user.id)
                return Response({'detail': 'Echo not found.'}, status=status.HTTP_404_NOT_FOUND)

            user = type(request.user).objects.select_for_update().get(pk=request.user.pk)
            now = timezone.now()

            if echo.author_id != user.id:
                logger.warning('Unauthorized boost attempt for echo %s by user %s.', echo_id, user.id)
                return Response({'detail': 'You can only boost your own echoes.'}, status=status.HTTP_403_FORBIDDEN)

            if echo.expires_at <= now:
                logger.warning('Boost rejected for expired echo %s by user %s.', echo_id, user.id)
                return Response({'detail': 'Cannot boost an expired echo.'}, status=status.HTTP_400_BAD_REQUEST)

            if user.token_balance < BOOST_COST:
                logger.warning('Boost rejected for insufficient token balance by user %s.', user.id)
                return Response({'detail': 'Insufficient tokens.'}, status=status.HTTP_400_BAD_REQUEST)

            max_expires_at = now + BOOST_MAX_DURATION
            new_expires_at = echo.expires_at + BOOST_DURATION

            if new_expires_at > max_expires_at:
                logger.warning('Boost rejected because echo %s reached max duration.', echo_id)
                return Response(
                    {'detail': 'Echo has reached the maximum boost duration.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.token_balance -= BOOST_COST
            user.save(update_fields=['token_balance'])

            echo.expires_at = new_expires_at
            echo.is_boosted = True
            echo.boost_count += 1
            echo.save(update_fields=['expires_at', 'is_boosted', 'boost_count'])

            TokenTransaction.objects.create(
                user=user,
                amount=-BOOST_COST,
                reason='boost',
            )

        logger.info('Echo %s boosted by user %s.', echo_id, user.id)
        return Response({
            'detail': 'Echo boosted successfully.',
            'new_expires_at': echo.expires_at,
            'new_token_balance': user.token_balance,
            'boost_count': echo.boost_count,
        }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([ResonateRateThrottle])
def resonate(request, echo_id):
    with transaction.atomic():
        try:
            echo = Echo.objects.select_related('author').select_for_update().get(id=echo_id)
        except Echo.DoesNotExist:
            logger.warning('Resonance requested for missing echo %s by user %s.', echo_id, request.user.id)
            return Response({'detail': 'Echo not found.'}, status=status.HTTP_404_NOT_FOUND)

        _, created = ResonanceRecord.objects.get_or_create(
            user=request.user,
            echo=echo,
        )
        if not created:
            logger.warning('Duplicate resonance rejected for echo %s by user %s.', echo_id, request.user.id)
            return Response(
                {'detail': 'You have already resonated with this echo.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        echo.resonance_count = django_models.F('resonance_count') + 1
        echo.save(update_fields=['resonance_count'])

        type(request.user).objects.filter(pk=echo.author_id).update(
            resonances=django_models.F('resonances') + 1
        )

        echo.refresh_from_db()
    
    # Milestone Detection
    current_count = echo.resonance_count
    milestones = [50, 100, 500]
    milestone_reached = current_count in milestones
    
    response_data = EchoSerializer(echo).data
    response_data['milestone_reached'] = milestone_reached
    response_data['milestone_value'] = current_count if milestone_reached else None

    if milestone_reached:
        channel_layer = get_channel_layer()
        payload = {
            'type': 'resonance_milestone',
            'echo_id': str(echo.id),
            'milestone': current_count,
            'echo_preview': build_echo_preview(echo.content),
        }
        create_notification_for_user(echo.author_id, payload)
        async_to_sync(channel_layer.group_send)(
            f'user_{echo.author_id}',
            {
                'type': 'send_notification',
                'payload': payload,
            },
        )
        logger.info('Resonance milestone %s reached for echo %s.', current_count, echo.id)
    
    return Response(response_data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_today_prompt(request):
    today = timezone.now().date()
    prompt = DailyPrompt.objects.filter(date=today).first()
    
    if not prompt:
        # Fallback to day-of-week based prompts if no specific date prompt exists
        # We assume prompts were seeded with dates or we can just pick one
        prompts = DailyPrompt.objects.all().order_by('id')
        if prompts.exists():
            day_idx = today.weekday() % prompts.count()
            prompt = prompts[day_idx]
    
    if not prompt:
        return Response({'detail': 'No prompt for today.'}, status=status.HTTP_404_NOT_FOUND)
        
    return Response({
        'text': prompt.text,
        'date': prompt.date
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def echo_detail(request, echo_id):
    try:
        echo = Echo.objects.get(id=echo_id)
    except Echo.DoesNotExist:
        logger.warning('Delete requested for missing echo %s by user %s.', echo_id, request.user.id)
        return Response({'detail': 'Echo not found.'}, status=status.HTTP_404_NOT_FOUND)

    if echo.author != request.user:
        logger.warning('Unauthorized delete attempt for echo %s by user %s.', echo_id, request.user.id)
        return Response({'detail': 'You can only delete your own echo.'}, status=status.HTTP_403_FORBIDDEN)
        
    echo.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([ReportRateThrottle])
def report_echo(request, echo_id):
    try:
        echo = Echo.objects.get(id=echo_id)
    except Echo.DoesNotExist:
        logger.warning('Report requested for missing echo %s by user %s.', echo_id, request.user.id)
        return Response({'detail': 'Echo not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    reason = request.data.get('reason')
    if reason not in ['spam', 'harmful', 'inappropriate', 'other']:
        logger.warning('Invalid report reason for echo %s by user %s.', echo_id, request.user.id)
        return Response({'detail': 'Invalid reason.'}, status=status.HTTP_400_BAD_REQUEST)
        
    report, created = Report.objects.get_or_create(
        reporter=request.user,
        echo=echo,
        defaults={'reason': reason}
    )
    
    if not created:
        logger.warning('Duplicate report rejected for echo %s by user %s.', echo_id, request.user.id)
        return Response({'detail': 'You have already reported this echo.'}, status=status.HTTP_400_BAD_REQUEST)
         
    return Response({'detail': 'Report submitted.'}, status=status.HTTP_201_CREATED)
