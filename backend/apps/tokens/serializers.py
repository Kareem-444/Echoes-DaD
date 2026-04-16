from rest_framework import serializers
from .models import TokenTransaction


class TokenTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = TokenTransaction
        fields = ['id', 'amount', 'reason', 'created_at']
        read_only_fields = fields


class TokenBalanceSerializer(serializers.Serializer):
    balance = serializers.IntegerField()
    last_daily_claim = serializers.DateField(allow_null=True)
