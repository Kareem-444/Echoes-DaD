from django.db.models import Q
from rest_framework import status

from apps.matches.models import Match
from apps.tokens.models import TokenTransaction
from apps.users.models import Block

from .models import Message
from .serializers import MessageCreateSerializer, MessageSerializer

MESSAGE_TOKEN_COST = 5


class ChatServiceError(Exception):
    def __init__(self, detail, status_code):
        self.detail = detail if isinstance(detail, dict) else {'detail': detail}
        self.status_code = status_code
        super().__init__(str(self.detail))


def get_match_for_user(match_id, user):
    try:
        match = Match.objects.select_related('user1', 'user2').get(id=match_id)
    except Match.DoesNotExist as exc:
        raise ChatServiceError('Match not found.', status.HTTP_404_NOT_FOUND) from exc

    if user not in (match.user1, match.user2):
        raise ChatServiceError('You are not a participant in this match.', status.HTTP_403_FORBIDDEN)

    return match


def get_other_user(match, user):
    return match.user1 if match.user2 == user else match.user2


def ensure_match_is_writable(match, user):
    if not match.is_active:
        raise ChatServiceError('This conversation is read-only. You are unmatched.', status.HTTP_403_FORBIDDEN)

    other_user = get_other_user(match, user)
    blocked = Block.objects.filter(
        (Q(blocker=user) & Q(blocked=other_user)) |
        (Q(blocked=user) & Q(blocker=other_user))
    ).exists()

    if blocked:
        raise ChatServiceError('This conversation is read-only due to a block.', status.HTTP_403_FORBIDDEN)

    return other_user


def send_match_message(match_id, user, payload):
    match = get_match_for_user(match_id, user)
    recipient = ensure_match_is_writable(match, user)

    if user.token_balance < MESSAGE_TOKEN_COST:
        raise ChatServiceError(
            f'Insufficient tokens. Sending a message costs {MESSAGE_TOKEN_COST} tokens.',
            status.HTTP_402_PAYMENT_REQUIRED,
        )

    serializer = MessageCreateSerializer(data={'content': payload.get('content', '')})
    if not serializer.is_valid():
        raise ChatServiceError(serializer.errors, status.HTTP_400_BAD_REQUEST)

    user.token_balance -= MESSAGE_TOKEN_COST
    user.save(update_fields=['token_balance'])

    TokenTransaction.objects.create(
        user=user,
        amount=-MESSAGE_TOKEN_COST,
        reason='connect_chat',
    )

    message = Message.objects.create(
        match=match,
        sender=user,
        content=serializer.validated_data['content'],
    )

    return {
        'message': MessageSerializer(message).data,
        'message_instance': message,
        'recipient_id': str(recipient.id),
        'new_token_balance': user.token_balance,
    }
