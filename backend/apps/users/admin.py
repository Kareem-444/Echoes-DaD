from django.contrib import admin
from .models import User

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'anonymous_name', 'token_balance', 'echoes_shared', 'resonances', 'is_active', 'is_staff', 'created_at')
    search_fields = ('email', 'anonymous_name')
    list_filter = ('is_active', 'is_staff', 'avatar_shape', 'created_at')
