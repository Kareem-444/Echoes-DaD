from django.urls import path
from . import views

urlpatterns = [
    path('balance/', views.token_balance, name='token-balance'),
    path('daily/', views.daily_reward, name='daily-reward'),
]
