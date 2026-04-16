import uuid
from django.db import models
from django.conf import settings


class Match(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user1 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='matches_as_user1'
    )
    user2 = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='matches_as_user2'
    )
    echo1 = models.ForeignKey(
        'echoes.Echo',
        on_delete=models.CASCADE,
        related_name='matches_as_echo1'
    )
    echo2 = models.ForeignKey(
        'echoes.Echo',
        on_delete=models.CASCADE,
        related_name='matches_as_echo2'
    )
    harmony_score = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'matches'
        ordering = ['-created_at']

    def __str__(self):
        return f"Match: {self.user1.anonymous_name} ↔ {self.user2.anonymous_name} ({self.harmony_score}% harmony)"
