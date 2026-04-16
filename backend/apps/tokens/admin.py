from django.contrib import admin
from .models import TokenTransaction

@admin.register(TokenTransaction)
class TokenTransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'amount', 'reason', 'created_at')
    search_fields = ('user__email', 'user__anonymous_name')
    list_filter = ('reason', 'created_at')
