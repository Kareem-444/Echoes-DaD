from rest_framework import serializers
from .models import Message
from apps.users.serializers import UserSerializer


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'match', 'sender', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'match', 'sender', 'is_read', 'created_at']


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content']
