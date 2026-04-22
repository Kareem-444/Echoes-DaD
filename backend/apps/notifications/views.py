from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer
from apps.core.pagination import CreatedAtCursorPagination


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    notifications = Notification.objects.filter(user=request.user).order_by('-created_at')
    paginator = CreatedAtCursorPagination()
    page = paginator.paginate_queryset(notifications, request)
    serializer = NotificationSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def mark_notifications_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'detail': 'Notifications marked as read.'}, status=status.HTTP_200_OK)
