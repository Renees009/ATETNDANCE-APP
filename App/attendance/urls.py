from django.urls import path
from . import views

app_name = 'attendance'

urlpatterns = [
    # landing/login
    path('', views.login_view, name='login'),
    # Dashboard and Employee Management
    path('dashboard/', views.dashboard, name='dashboard'),
    path('employees/', views.employee_list, name='employee_list'),
    path('employees/choose/', views.choose_employee, name='choose_employee'),
    path('employee-portal/<str:employee_id>/', views.employee_home, name='employee_home'),
    path('employees/add/', views.add_employee, name='add_employee'),
    path('employees/<str:employee_id>/', views.employee_detail, name='employee_detail'),
    path('employees/<str:employee_id>/edit/', views.edit_employee, name='edit_employee'),
    
    # Attendance Management
    path('mark-attendance/', views.mark_attendance, name='mark_attendance'),
    path('attendance/<int:attendance_id>/edit/', views.edit_attendance, name='edit_attendance'),
    path('attendance/<int:attendance_id>/admin-edit/', views.admin_override_edit, name='admin_override_edit'),
    
    # Attendance Views by Different Criteria
    path('attendance-by-date/', views.attendance_by_date, name='attendance_by_date'),
    path('attendance-by-month/', views.attendance_by_month, name='attendance_by_month'),
    path('attendance-by-year/', views.attendance_by_year, name='attendance_by_year'),
    path('attendance-history/', views.attendance_history, name='attendance_history'),
    
    # Reports
    path('attendance-summary/', views.attendance_summary, name='attendance_summary'),
    path('attendance-report/', views.attendance_report, name='attendance_report'),
]
