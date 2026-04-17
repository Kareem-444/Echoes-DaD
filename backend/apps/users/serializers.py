from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import AVATAR_COLORS, AVATAR_SHAPE_CHOICES, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'anonymous_name', 'avatar_shape',
            'avatar_color', 'token_balance', 'echoes_shared',
            'resonances', 'created_at', 'last_daily_claim',
        ]
        read_only_fields = ['id', 'email', 'anonymous_name', 'created_at', 'last_daily_claim']


class UserSettingsSerializer(serializers.ModelSerializer):
    avatar_shape = serializers.ChoiceField(choices=[choice[0] for choice in AVATAR_SHAPE_CHOICES], required=False)
    avatar_color = serializers.ChoiceField(choices=AVATAR_COLORS, required=False)

    class Meta:
        model = User
        fields = ['email', 'anonymous_name', 'avatar_shape', 'avatar_color']
        read_only_fields = ['email', 'anonymous_name']


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(write_only=True)


class TokenPairSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()
