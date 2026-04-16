from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Message
from .serializers import MessageSerializer, MessageCreateSerializer
from apps.matches.models import Match
from apps.tokens.models import TokenTransaction
from apps.users.models import Block

MESSAGE_TOKEN_COST = 5


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_messages(request, match_id):
    # Verify the match exists and this user is a participant
    try:
        match = Match.objects.get(id=match_id)
    except Match.DoesNotExist:
        return Response({'detail': 'Match not found.'}, status=status.HTTP_404_NOT_FOUND)

    if request.user not in (match.user1, match.user2):
        return Response({'detail': 'You are not a participant in this match.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        messages = Message.objects.filter(match=match).select_related('sender')
        # Mark unread messages sent by the other user as read
        messages.exclude(sender=request.user).filter(is_read=False).update(is_read=True)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    # POST — send a message
    if not match.is_active:
        return Response({'detail': 'This conversation is read-only. You are unmatched.'}, status=status.HTTP_403_FORBIDDEN)
        
    blocked = Block.objects.filter(
        (Q(blocker=request.user) & Q(blocked=match.user1 if match.user2 == request.user else match.user2)) |
        (Q(blocked=request.user) & Q(blocker=match.user1 if match.user2 == request.user else match.user2))
    ).exists()
    
    if blocked:
        return Response({'detail': 'This conversation is read-only due to a block.'}, status=status.HTTP_403_FORBIDDEN)

    if request.user.token_balance < MESSAGE_TOKEN_COST:
        return Response(
            {'detail': f'Insufficient tokens. Sending a message costs {MESSAGE_TOKEN_COST} tokens.'},
            status=status.HTTP_402_PAYMENT_REQUIRED
        )

    serializer = MessageCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # Deduct tokens
    request.user.token_balance -= MESSAGE_TOKEN_COST
    request.user.save(update_fields=['token_balance'])

    # Record transaction
    TokenTransaction.objects.create(
        user=request.user,
        amount=-MESSAGE_TOKEN_COST,
        reason='connect_chat',
    )

    # Create message
    message = Message.objects.create(
        match=match,
        sender=request.user,
        content=serializer.validated_data['content'],
    )

    return Response(MessageSerializer(message).data, status=status.HTTP_201_CREATED)
