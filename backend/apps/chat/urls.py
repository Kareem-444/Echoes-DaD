from django.urls import path
from . import views

urlpatterns = [
    path('<uuid:match_id>/', views.chat_messages, name='chat-messages'),
]
