from django.contrib import admin
from .models import Employee, Attendance, AttendanceReport

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'first_name', 'last_name', 'department', 'position', 'is_active')
    list_filter = ('department', 'is_active', 'date_of_joining')
    search_fields = ('employee_id', 'first_name', 'last_name', 'email')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('Personal Information', {
            'fields': ('employee_id', 'first_name', 'last_name', 'email', 'phone')
        }),
        ('Work Information', {
            'fields': ('department', 'position', 'date_of_joining', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'attendance_date', 'status', 'check_in_time', 'check_out_time')
    list_filter = ('status', 'attendance_date', 'employee__department')
    search_fields = ('employee__employee_id', 'employee__first_name', 'employee__last_name')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = 'attendance_date'


@admin.register(AttendanceReport)
class AttendanceReportAdmin(admin.ModelAdmin):
    list_display = ('employee', 'month', 'year', 'present_days', 'absent_days', 'attendance_percentage')
    list_filter = ('year', 'month', 'employee__department')
    search_fields = ('employee__employee_id', 'employee__first_name')
    readonly_fields = ('generated_at',)
