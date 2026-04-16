import uuid
from django.db import models
from django.conf import settings

REASON_CHOICES = [
    ('connect_chat', 'Connect Chat'),
    ('daily_reward', 'Daily Reward'),
    ('purchase', 'Purchase'),
    ('resonate', 'Resonate'),
    ('boost', 'Boost'),
]


class TokenTransaction(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='token_transactions'
    )
    amount = models.IntegerField()
    reason = models.CharField(max_length=30, choices=REASON_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'token_transactions'
        ordering = ['-created_at']

    def __str__(self):
        sign = '+' if self.amount > 0 else ''
        return f"{self.user.anonymous_name}: {sign}{self.amount} tokens ({self.reason})"
