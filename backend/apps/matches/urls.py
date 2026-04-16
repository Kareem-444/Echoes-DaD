from django.urls import path
from . import views

urlpatterns = [
    path('', views.match_list, name='match-list'),
    path('generate/', views.generate_matches, name='generate-matches'),
    path('<uuid:pk>/', views.match_detail, name='match-detail'),
]
