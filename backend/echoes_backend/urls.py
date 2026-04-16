from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/users/', include('apps.users.urls')),
    path('api/echoes/', include('apps.echoes.urls')),
    path('api/matches/', include('apps.matches.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/tokens/', include('apps.tokens.urls')),
]
