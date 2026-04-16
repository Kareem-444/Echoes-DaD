from django.contrib import admin
from .models import Echo

@admin.register(Echo)
class EchoAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'content_snippet', 'resonance_count', 'created_at')
    search_fields = ('content', 'author__email', 'author__anonymous_name')
    list_filter = ('created_at',)

    def content_snippet(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_snippet.short_description = 'Content'
