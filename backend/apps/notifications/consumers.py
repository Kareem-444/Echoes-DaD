import json

from channels.generic.websocket import AsyncWebsocketConsumer

from echoes_backend.middleware.jwt_auth_middleware import get_user_from_token


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if getattr(self, 'is_authenticated', False):
            return None

        if not text_data:
            await self.close(code=4001)
            return None

        try:
            payload = json.loads(text_data)
        except json.JSONDecodeError:
            await self.close(code=4001)
            return None

        if payload.get('type') != 'authenticate':
            await self.close(code=4001)
            return None

        user = await get_user_from_token(payload.get('token'))
        if not getattr(user, 'is_authenticated', False):
            await self.close(code=4001)
            return None

        self.scope['user'] = user
        self.is_authenticated = True
        self.group_name = f'user_{user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.send(text_data=json.dumps({'type': 'authenticated'}))
        return None

    async def send_notification(self, event):
        await self.send(text_data=json.dumps(event['payload']))
