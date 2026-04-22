import logging

from django.conf import settings
from django.contrib.auth import authenticate
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.throttles import AuthRateThrottle
from .models import User, Block
from .serializers import GoogleAuthSerializer, LoginSerializer, RegisterSerializer, UserSerializer, UserSettingsSerializer

logger = logging.getLogger(__name__)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def verify_google_token(raw_token):
    if not settings.GOOGLE_CLIENT_ID:
        raise ValueError('Google OAuth is not configured.')

    token_info = google_id_token.verify_oauth2_token(
        raw_token,
        google_requests.Request(),
        settings.GOOGLE_CLIENT_ID,
    )

    issuer = token_info.get('iss')
    if issuer not in {'accounts.google.com', 'https://accounts.google.com'}:
        raise ValueError('Invalid Google token issuer.')

    email = token_info.get('email')
    if not email:
        raise ValueError('Google account email is missing.')

    if not token_info.get('email_verified', False):
        raise ValueError('Google account email is not verified.')

    return token_info


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response({
            'access': tokens['access'],
            'refresh': tokens['refresh'],
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def login(request):
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    email = serializer.validated_data['email']
    password = serializer.validated_data['password']
    user = authenticate(request, username=email, password=password)

    if user is None:
        logger.warning('Failed login attempt.')
        return Response(
            {'detail': 'Invalid email or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    tokens = get_tokens_for_user(user)
    return Response({
        'access': tokens['access'],
        'refresh': tokens['refresh'],
        'user': UserSerializer(user).data,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def google_login(request):
    serializer = GoogleAuthSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    try:
        token_info = verify_google_token(serializer.validated_data['id_token'])
    except ValueError as exc:
        logger.warning('Google OAuth token rejected: %s', exc)
        return Response({'detail': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        logger.exception('Unhandled Google OAuth verification error.')
        return Response(
            {'detail': 'Unable to verify Google sign-in token.'},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    email = User.objects.normalize_email(token_info['email'])
    user = User.objects.filter(email__iexact=email).first()

    if user is None:
        user = User.objects.create_user(email=email)

    if not user.is_active:
        return Response(
            {'detail': 'This account is inactive.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    tokens = get_tokens_for_user(user)
    return Response({
        'access': tokens['access'],
        'refresh': tokens['refresh'],
        'user': UserSerializer(user).data,
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response(
            {'detail': 'Refresh token is required.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except TokenError:
        logger.warning('Logout received invalid or already blacklisted refresh token for user %s.', request.user.id)
        return Response(
            {'detail': 'Refresh token is invalid or already blacklisted.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({'detail': 'Successfully logged out.'}, status=status.HTTP_200_OK)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == 'PATCH':
        serializer = UserSettingsSerializer(request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)

    if request.method == 'DELETE':
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def block_user(request, user_id):
    # uuid comparison requires str format matching or direct id matching. user_id is passed as kwarg (UUID), so str matches
    if str(request.user.id) == str(user_id):
        return Response({'detail': 'You cannot block yourself.'}, status=status.HTTP_400_BAD_REQUEST)
        
    try:
        blocked_user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.warning('Block attempt targeted missing user %s by user %s.', user_id, request.user.id)
        return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    block, created = Block.objects.get_or_create(
        blocker=request.user,
        blocked=blocked_user
    )
    
    if not created:
         return Response({'detail': 'User is already blocked.'}, status=status.HTTP_400_BAD_REQUEST)
         
    return Response({'detail': 'User blocked successfully.'}, status=status.HTTP_201_CREATED)
