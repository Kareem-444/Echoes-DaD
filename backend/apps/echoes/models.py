import uuid
from datetime import timedelta
from django.db import models
from django.conf import settings
from django.utils import timezone


class Echo(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='echoes'
    )
    content = models.TextField(max_length=500)
    resonance_count = models.IntegerField(default=0)
    mood = models.CharField(max_length=20, null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_boosted = models.BooleanField(default=False)
    boost_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'echoes'
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    @property
    def is_expired(self):
        return self.expires_at < timezone.now()

    def __str__(self):
        return f"Echo by {self.author.anonymous_name}: {self.content[:60]}"


class Report(models.Model):
    REASON_CHOICES = [
        ('spam', 'Spam'),
        ('harmful', 'Harmful content'),
        ('inappropriate', 'Inappropriate'),
        ('other', 'Other'),
    ]
    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reports_made'
    )
    echo = models.ForeignKey(
        Echo,
        on_delete=models.CASCADE,
        related_name='reports'
    )
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reports'
        unique_together = ('reporter', 'echo')

    def __str__(self):
        return f"Report by {self.reporter.anonymous_name} on {self.echo.id}"


class DailyPrompt(models.Model):
    text = models.TextField()
    date = models.DateField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'daily_prompts'
        ordering = ['-date']

    def __str__(self):
        return f"Prompt for {self.date}: {self.text[:50]}"
