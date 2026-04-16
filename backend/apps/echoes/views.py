from django.db import models as django_models
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from django.utils import timezone
from .models import Echo, Report, DailyPrompt
from .serializers import EchoSerializer, EchoCreateSerializer, DailyPromptSerializer
from apps.users.models import Block


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
        ).exclude(author_id__in=excluded_ids).select_related('author').all()
        serializer = EchoSerializer(echoes, many=True)
        return Response(serializer.data)

    serializer = EchoCreateSerializer(data=request.data)
    if serializer.is_valid():
        echo = serializer.save(author=request.user)
        request.user.echoes_shared = django_models.F('echoes_shared') + 1
        request.user.save(update_fields=['echoes_shared'])
        return Response(EchoSerializer(echo).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resonate(request, echo_id):
    try:
        echo = Echo.objects.get(id=echo_id)
    except Echo.DoesNotExist:
        return Response({'detail': 'Echo not found.'}, status=status.HTTP_404_NOT_FOUND)

    echo.resonance_count = django_models.F('resonance_count') + 1
    echo.save(update_fields=['resonance_count'])

    echo.author.resonances = django_models.F('resonances') + 1
    echo.author.save(update_fields=['resonances'])

    echo.refresh_from_db()
    
    # Milestone Detection
    current_count = echo.resonance_count
    milestones = [50, 100, 500]
    milestone_reached = current_count in milestones
    
    response_data = EchoSerializer(echo).data
    response_data['milestone_reached'] = milestone_reached
    response_data['milestone_value'] = current_count if milestone_reached else None
    
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
        return Response({'detail': 'Echo not found.'}, status=status.HTTP_404_NOT_FOUND)

    if echo.author != request.user:
        return Response({'detail': 'You can only delete your own echo.'}, status=status.HTTP_403_FORBIDDEN)
        
    echo.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def report_echo(request, echo_id):
    try:
        echo = Echo.objects.get(id=echo_id)
    except Echo.DoesNotExist:
        return Response({'detail': 'Echo not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    reason = request.data.get('reason')
    if reason not in ['spam', 'harmful', 'inappropriate', 'other']:
        return Response({'detail': 'Invalid reason.'}, status=status.HTTP_400_BAD_REQUEST)
        
    report, created = Report.objects.get_or_create(
        reporter=request.user,
        echo=echo,
        defaults={'reason': reason}
    )
    
    if not created:
         return Response({'detail': 'You have already reported this echo.'}, status=status.HTTP_400_BAD_REQUEST)
         
    return Response({'detail': 'Report submitted.'}, status=status.HTTP_201_CREATED)
