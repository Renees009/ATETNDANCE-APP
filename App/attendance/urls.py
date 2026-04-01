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
    path('api/employees/', views.employee_list_api, name='employee_list_api'),
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
    
    # API endpoints
    path('api/dashboard/', views.dashboard_api, name='dashboard_api'),
    path('api/employees/', views.employee_list_api, name='employee_list_api'),
    path('api/mark-attendance/', views.mark_attendance_api, name='mark_attendance_api'),
    path('api/attendance-by-date/', views.attendance_by_date_api, name='attendance_by_date_api'),
    path('api/attendance-by-month/', views.attendance_by_month_api, name='attendance_by_month_api'),
    path('api/attendance-by-year/', views.attendance_by_year_api, name='attendance_by_year_api'),
    path('api/attendance-summary/', views.attendance_summary_api, name='attendance_summary_api'),
    path('api/attendance-history/', views.attendance_history_api, name='attendance_history_api'),
    path('api/employees/<str:employee_id>/', views.employee_detail_api, name='employee_detail_api'),
    path('api/attendance/<int:record_id>/', views.attendance_detail_api, name='attendance_detail_api'),
    path('api/attendance/<int:record_id>/update/', views.update_attendance_api, name='update_attendance_api'),
]

