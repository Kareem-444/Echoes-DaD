from django.contrib import admin
from .models import Message

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'match', 'content_snippet', 'is_read', 'created_at')
    search_fields = ('content', 'sender__email', 'sender__anonymous_name')
    list_filter = ('is_read', 'created_at')

    def content_snippet(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_snippet.short_description = 'Content'
