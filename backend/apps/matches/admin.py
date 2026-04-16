from django.contrib import admin
from .models import Match

@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    list_display = ('id', 'user1', 'user2', 'harmony_score', 'created_at')
    search_fields = ('user1__email', 'user2__email', 'user1__anonymous_name', 'user2__anonymous_name')
    list_filter = ('harmony_score', 'created_at')
