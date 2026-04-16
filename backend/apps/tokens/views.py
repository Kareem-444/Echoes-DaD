from datetime import date
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
def daily_reward(request):
    user = request.user
    today = date.today()

    if user.last_daily_claim == today:
        return Response(
            {'detail': 'Daily tokens already claimed. Come back tomorrow!'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user.token_balance += DAILY_REWARD
    user.last_daily_claim = today
    user.save(update_fields=['token_balance', 'last_daily_claim'])

    transaction = TokenTransaction.objects.create(
        user=user,
        amount=DAILY_REWARD,
        reason='daily_reward',
    )

    return Response({
        'detail': f'{DAILY_REWARD} tokens added to your balance.',
        'balance': user.token_balance,
        'transaction': TokenTransactionSerializer(transaction).data,
    }, status=status.HTTP_200_OK)
