from datetime import date
from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.core.throttles import DailyTokenRateThrottle
from .models import TokenTransaction
from .serializers import TokenBalanceSerializer, TokenTransactionSerializer

DAILY_REWARD = 5


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def token_balance(request):
    serializer = TokenBalanceSerializer({
        'balance': request.user.token_balance,
        'last_daily_claim': request.user.last_daily_claim,
    })
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([DailyTokenRateThrottle])
def daily_reward(request):
    today = date.today()

    with transaction.atomic():
        user = type(request.user).objects.select_for_update().get(pk=request.user.pk)

        if user.last_daily_claim == today:
            return Response(
                {'detail': 'Daily tokens already claimed. Come back tomorrow!'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.token_balance += DAILY_REWARD
        user.last_daily_claim = today
        user.save(update_fields=['token_balance', 'last_daily_claim'])

        transaction_record = TokenTransaction.objects.create(
            user=user,
            amount=DAILY_REWARD,
            reason='daily_reward',
        )

    return Response({
        'detail': f'{DAILY_REWARD} tokens added to your balance.',
        'balance': user.token_balance,
        'transaction': TokenTransactionSerializer(transaction_record).data,
    }, status=status.HTTP_200_OK)
