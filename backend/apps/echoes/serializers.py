from rest_framework import serializers
from .models import Echo
from apps.users.serializers import UserSerializer


class EchoSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Echo
        fields = ['id', 'author', 'content', 'resonance_count', 'mood', 'expires_at', 'created_at']
        read_only_fields = ['id', 'author', 'resonance_count', 'expires_at', 'created_at']

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('Echo content cannot be empty.')
        return value


class EchoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Echo
        fields = ['id', 'content', 'mood', 'resonance_count', 'expires_at', 'created_at']
        read_only_fields = ['id', 'resonance_count', 'expires_at', 'created_at']

class DailyPromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Echo
        fields = ['text', 'date']
