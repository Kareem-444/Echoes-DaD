from django.urls import path
from . import views

urlpatterns = [
    path('', views.echo_list_create, name='echo-list-create'),
    path('<uuid:echo_id>/resonate/', views.resonate, name='echo-resonate'),
    path('<uuid:echo_id>/', views.echo_detail, name='echo-detail'),
    path('<uuid:echo_id>/report/', views.report_echo, name='echo-report'),
    path('prompts/today/', views.get_today_prompt, name='today-prompt'),
]
