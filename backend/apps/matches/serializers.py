from rest_framework import serializers
from .models import Match
from apps.users.serializers import UserSerializer
from apps.echoes.serializers import EchoSerializer


class MatchSerializer(serializers.ModelSerializer):
    user1 = UserSerializer(read_only=True)
    user2 = UserSerializer(read_only=True)
    echo1 = EchoSerializer(read_only=True)
    echo2 = EchoSerializer(read_only=True)

    class Meta:
        model = Match
        fields = ['id', 'user1', 'user2', 'echo1', 'echo2', 'harmony_score', 'created_at']
        read_only_fields = fields
