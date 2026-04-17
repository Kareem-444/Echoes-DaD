from django.urls import path

from . import views


urlpatterns = [
    path('', views.notification_list, name='notification-list'),
    path('read/', views.mark_notifications_read, name='notification-read'),
]
