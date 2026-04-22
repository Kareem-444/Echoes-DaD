from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.db import close_old_connections
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


@database_sync_to_async
def get_user_from_token(token):
    User = get_user_model()

    if not token:
        return AnonymousUser()

    try:
        validated_token = AccessToken(token)
        user_id = validated_token['user_id']
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, KeyError, TypeError, User.DoesNotExist):
        return AnonymousUser()


class JWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        close_old_connections()
        scope['user'] = AnonymousUser()
        return await self.inner(scope, receive, send)
