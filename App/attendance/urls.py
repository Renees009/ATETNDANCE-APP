from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('employees/', views.employee_list, name='employee_list'),
    path('employees/add/', views.add_employee, name='add_employee'),
    path('employees/<str:employee_id>/', views.employee_detail, name='employee_detail'),
    path('employees/<str:employee_id>/edit/', views.edit_employee, name='edit_employee'),
    path('mark-attendance/', views.mark_attendance, name='mark_attendance'),
    path('attendance-report/', views.attendance_report, name='attendance_report'),
    path('attendance-history/', views.attendance_history, name='attendance_history'),
]
