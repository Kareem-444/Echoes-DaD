import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from apps.notifications.services import create_notification_for_user
from echoes_backend.middleware.jwt_auth_middleware import get_user_from_token
from .services import ChatServiceError, get_match_for_user, send_match_message


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.match_id = self.scope['url_route']['kwargs']['match_id']
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return

        try:
            payload = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'type': 'chat_error', 'detail': 'Invalid payload.'}))
            return

        if not getattr(self, 'is_authenticated', False):
            await self._authenticate(payload)
            return

        client_id = payload.get('client_id')

        try:
            result = await self._send_message(payload)
        except ChatServiceError as exc:
            error_payload = {
                'type': 'chat_error',
                'detail': exc.detail.get('detail', 'Failed to send message.'),
            }
            if client_id:
                error_payload['client_id'] = client_id
            await self.send(text_data=json.dumps(error_payload))
            return

        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'chat_message_event',
                'message': result['message'],
            },
        )

        notification_payload = {
            'type': 'chat_message',
            'match_id': str(self.match_id),
            'sender_anonymous_name': self.scope['user'].anonymous_name,
            'content': result['message_instance'].content,
            'timestamp': result['message_instance'].created_at.isoformat(),
        }
        await self._create_notification(result['recipient_id'], notification_payload)
        await self.channel_layer.group_send(
            f"user_{result['recipient_id']}",
            {
                'type': 'send_notification',
                'payload': notification_payload,
            },
        )

        await self.send(
            text_data=json.dumps(
                {
                    'type': 'chat_message_ack',
                    'client_id': client_id,
                    'message': result['message'],
                    'new_token_balance': result['new_token_balance'],
                }
            )
        )

    async def _authenticate(self, payload):
        if payload.get('type') != 'authenticate':
            await self.close(code=4001)
            return

        user = await get_user_from_token(payload.get('token'))
        if not getattr(user, 'is_authenticated', False):
            await self.close(code=4001)
            return

        self.scope['user'] = user

        try:
            await self._get_match()
        except ChatServiceError:
            await self.close(code=4003)
            return

        self.is_authenticated = True
        self.group_name = f'match_{self.match_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.send(text_data=json.dumps({'type': 'authenticated'}))

    async def chat_message_event(self, event):
        await self.send(
            text_data=json.dumps(
                {
                    'type': 'chat_message',
                    'message': event['message'],
                }
            )
        )

    @database_sync_to_async
    def _get_match(self):
        return get_match_for_user(self.match_id, self.scope['user'])

    @database_sync_to_async
    def _send_message(self, payload):
        return send_match_message(self.match_id, self.scope['user'], payload)

    @database_sync_to_async
    def _create_notification(self, user_id, payload):
        create_notification_for_user(user_id, payload)
