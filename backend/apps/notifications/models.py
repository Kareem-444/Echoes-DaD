import uuid

from django.conf import settings
from django.db import models


class Notification(models.Model):
    TYPE_CHAT_MESSAGE = 'chat_message'
    TYPE_NEW_MATCH = 'new_match'
    TYPE_RESONANCE_MILESTONE = 'resonance_milestone'

    TYPE_CHOICES = [
        (TYPE_CHAT_MESSAGE, 'Chat Message'),
        (TYPE_NEW_MATCH, 'New Match'),
        (TYPE_RESONANCE_MILESTONE, 'Resonance Milestone'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    type = models.CharField(max_length=32, choices=TYPE_CHOICES)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read', 'created_at'], name='notif_user_read_created_idx'),
        ]

    def __str__(self):
        return f'{self.user.anonymous_name}: {self.type}'
