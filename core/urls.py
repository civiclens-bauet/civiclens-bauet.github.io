from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),

    path(
        'analyze/',
        views.analyze_and_save_report,
        name='analyze_report'
    ),

    path(
        'reports/',
        views.get_reports,
        name='get_reports'
    ),

    path(
        'reports/<str:tracking_id>/status/',
        views.update_report_status,
        name='update_report_status'
    ),
]