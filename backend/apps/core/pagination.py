from rest_framework.pagination import CursorPagination


class CreatedAtCursorPagination(CursorPagination):
    page_size = 20
    ordering = '-created_at'


class ChatHistoryCursorPagination(CursorPagination):
    page_size = 30
    ordering = '-created_at'
