from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Message
from .serializers import MessageSerializer
from .services import ChatServiceError, get_match_for_user, send_match_message
from apps.notifications.services import create_notification_for_user


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def chat_messages(request, match_id):
    try:
        match = get_match_for_user(match_id, request.user)
    except ChatServiceError as exc:
        return Response(exc.detail, status=exc.status_code)

    if request.method == 'GET':
        messages = Message.objects.filter(match=match).select_related('sender')
        messages.exclude(sender=request.user).filter(is_read=False).update(is_read=True)
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)

    try:
        result = send_match_message(match_id, request.user, request.data)
    except ChatServiceError as exc:
        return Response(exc.detail, status=exc.status_code)

    channel_layer = get_channel_layer()
    payload = {
        'type': 'chat_message',
        'match_id': str(match.id),
        'sender_anonymous_name': request.user.anonymous_name,
        'content': result['message_instance'].content,
        'timestamp': result['message_instance'].created_at.isoformat(),
    }
    create_notification_for_user(result['recipient_id'], payload)
    async_to_sync(channel_layer.group_send)(
        f"user_{result['recipient_id']}",
        {
            'type': 'send_notification',
            'payload': payload,
        },
    )

    return Response(result['message'], status=status.HTTP_201_CREATED)
