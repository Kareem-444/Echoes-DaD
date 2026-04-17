import random
from django.db.models import Q
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Match
from .serializers import MatchSerializer
from apps.echoes.models import Echo
from apps.notifications.services import create_notification_for_user
from apps.users.models import User, Block


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def match_list(request):
    blocked_user_ids = Block.objects.filter(
        Q(blocker=request.user) | Q(blocked=request.user)
    ).values_list('blocker_id', 'blocked_id')
    
    excluded_ids = set()
    for b1, b2 in blocked_user_ids:
        if b1 != request.user.id: excluded_ids.add(b1)
        if b2 != request.user.id: excluded_ids.add(b2)
        
    matches = Match.objects.filter(
        (Q(user1=request.user) | Q(user2=request.user)),
        is_active=True
    ).exclude(user1_id__in=excluded_ids).exclude(user2_id__in=excluded_ids).select_related('user1', 'user2', 'echo1', 'echo2')
    serializer = MatchSerializer(matches, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_matches(request):
    user = request.user

    # Get the latest echo by the current user
    my_echo = Echo.objects.filter(author=user).order_by('-created_at').first()
    if not my_echo:
        return Response(
            {'detail': 'You need to share at least one echo before generating matches.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Find other users (not already matched) who have echoes
    already_matched_user_ids = Match.objects.filter(
        Q(user1=user) | Q(user2=user)
    ).values_list('user1_id', 'user2_id')

    excluded_ids = set()
    excluded_ids.add(user.id)
    for u1, u2 in already_matched_user_ids:
        excluded_ids.add(u1)
        excluded_ids.add(u2)
        
    blocked_user_ids = Block.objects.filter(
        Q(blocker=request.user) | Q(blocked=request.user)
    ).values_list('blocker_id', 'blocked_id')
    
    for b1, b2 in blocked_user_ids:
        excluded_ids.add(b1)
        excluded_ids.add(b2)

    candidate_users = User.objects.exclude(id__in=excluded_ids).filter(
        echoes__isnull=False
    ).distinct()

    if not candidate_users.exists():
        return Response([], status=status.HTTP_200_OK)

    # Pick up to 3 random candidates
    candidates = list(candidate_users)
    selected = random.sample(candidates, min(3, len(candidates)))

    created_matches = []
    channel_layer = get_channel_layer()
    for candidate in selected:
        their_echo = Echo.objects.filter(author=candidate).order_by('-created_at').first()
        if not their_echo:
            continue
        harmony = random.randint(60, 99)
        
        # Mood Boost: same mood = +20% harmony
        if my_echo.mood and their_echo.mood and my_echo.mood == their_echo.mood:
            harmony = min(100, int(harmony * 1.2))
            
        match = Match.objects.create(
            user1=user,
            user2=candidate,
            echo1=my_echo,
            echo2=their_echo,
            harmony_score=harmony,
        )
        created_matches.append(match)

        payload_for_user = {
            'type': 'new_match',
            'match_id': str(match.id),
            'harmony_score': match.harmony_score,
            'anonymous_name': candidate.anonymous_name,
        }
        create_notification_for_user(user.id, payload_for_user)
        async_to_sync(channel_layer.group_send)(
            f'user_{user.id}',
            {
                'type': 'send_notification',
                'payload': payload_for_user,
            },
        )
        payload_for_candidate = {
            'type': 'new_match',
            'match_id': str(match.id),
            'harmony_score': match.harmony_score,
            'anonymous_name': user.anonymous_name,
        }
        create_notification_for_user(candidate.id, payload_for_candidate)
        async_to_sync(channel_layer.group_send)(
            f'user_{candidate.id}',
            {
                'type': 'send_notification',
                'payload': payload_for_candidate,
            },
        )

    serializer = MatchSerializer(created_matches, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def match_detail(request, pk):
    try:
        match = Match.objects.get(id=pk)
    except Match.DoesNotExist:
        return Response({'detail': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    if request.user not in (match.user1, match.user2):
        return Response({'detail': 'Not your match.'}, status=status.HTTP_403_FORBIDDEN)
        
    if request.method == 'GET':
        blocked = Block.objects.filter(
            (Q(blocker=request.user) & Q(blocked=match.user1 if match.user2 == request.user else match.user2)) |
            (Q(blocked=request.user) & Q(blocker=match.user1 if match.user2 == request.user else match.user2))
        ).exists()
        
        data = MatchSerializer(match).data
        data['is_active'] = match.is_active
        data['is_blocked'] = blocked
        return Response(data)

    if request.query_params.get('unmatch_only') == 'true':
        match.is_active = False
        match.save(update_fields=['is_active'])
        return Response(status=status.HTTP_204_NO_CONTENT)
        
    match.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
