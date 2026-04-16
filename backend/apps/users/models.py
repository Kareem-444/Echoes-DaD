import uuid
import random
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.conf import settings

ADJECTIVES = [
    'Silent', 'Velvet', 'Prismatic', 'Hollow', 'Gilded', 'Faded', 'Drifting',
    'Amber', 'Cosmic', 'Neon', 'Wandering', 'Lucid', 'Phantom', 'Serene',
    'Vivid', 'Distant', 'Echoing', 'Fluid', 'Gentle', 'Hidden', 'Infinite',
    'Jade', 'Kinetic', 'Lunar', 'Mystic', 'Nebula', 'Obsidian', 'Polar',
    'Quantum', 'Radiant', 'Stellar', 'Twilight', 'Umbral', 'Vapour', 'Whispering',
]

SHAPES = ['Circle', 'Triangle', 'Hexagon', 'Square']

AVATAR_COLORS = [
    '#3b309e', '#534ab7', '#006c52', '#403b76',
    '#58538f', '#0f6e56', '#5dcaa5', '#c5c0ff',
]

AVATAR_SHAPE_CHOICES = [
    ('circle', 'Circle'),
    ('triangle', 'Triangle'),
    ('hexagon', 'Hexagon'),
    ('square', 'Square'),
]


def generate_anonymous_name():
    adj = random.choice(ADJECTIVES)
    shape = random.choice(SHAPES)
    return f"{adj} {shape}"


def random_avatar_shape():
    return random.choice([s[0] for s in AVATAR_SHAPE_CHOICES])


def random_avatar_color():
    return random.choice(AVATAR_COLORS)


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        extra_fields.setdefault('anonymous_name', generate_anonymous_name())
        extra_fields.setdefault('avatar_shape', random_avatar_shape())
        extra_fields.setdefault('avatar_color', random_avatar_color())
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    anonymous_name = models.CharField(max_length=100, blank=True)
    avatar_shape = models.CharField(max_length=20, choices=AVATAR_SHAPE_CHOICES, default='circle')
    avatar_color = models.CharField(max_length=20, default='#3b309e')
    token_balance = models.IntegerField(default=50)
    echoes_shared = models.IntegerField(default=0)
    resonances = models.IntegerField(default=0)
    last_daily_claim = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.anonymous_name} ({self.email})"


class Block(models.Model):
    blocker = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blocks_made'
    )
    blocked = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blocks_received'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'blocks'
        unique_together = ('blocker', 'blocked')

    def __str__(self):
        return f"{self.blocker.anonymous_name} blocked {self.blocked.anonymous_name}"
