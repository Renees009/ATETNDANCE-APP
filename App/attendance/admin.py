from django.contrib import admin
from django.utils.html import format_html
from .models import Employee, Attendance, AttendanceReport


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    """Admin interface for Employee management"""
    list_display = ('employee_id', 'employee_name', 'department', 'position', 'status_badge')
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
            
        }),
    )
    
    def employee_name(self, obj):
        """Display full employee name"""
        return obj.get_full_name()
    employee_name.short_description = 'Name'
    
    def status_badge(self, obj):
        """Display status as a colored badge"""
        if obj.is_active:
            color = 'green'
            text = 'Active'
        else:
            color = 'red'
            text = 'Inactive'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px;">{}</span>',
            color, text
        )
    status_badge.short_description = 'Status'


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    """Admin interface for Attendance records with admin override capability"""
    list_display = ('employee', 'attendance_date', 'status_badge', 'check_in_time', 'check_out_time', 'age_display', 'editability')
    list_filter = ('status', 'attendance_date', 'employee__department')
    search_fields = ('employee__employee_id', 'employee__first_name', 'employee__last_name')
    readonly_fields = ('created_at', 'updated_at', 'editable_info')
    date_hierarchy = 'attendance_date'
    fieldsets = (
        ('Attendance Details', {
            'fields': ('employee', 'attendance_date', 'status')
        }),
        ('Time Information', {
            'fields': ('check_in_time', 'check_out_time')
        }),
        ('Additional Information', {
            'fields': ('remarks',)
        }),
        ('Admin Information', {
            'fields': ('editable_info', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    ordering = ('-attendance_date', 'employee')
    
    def status_badge(self, obj):
        """Display status as colored badge"""
        status_colors = {
            'PRESENT': 'green',
            'ABSENT': 'red',
            # WORKING_LEAVE rows represent work-from-home entries
            'WORKING_LEAVE': 'blue',
            'NFD': 'orange',
            'LATE': 'gold',
        }
        color = status_colors.get(obj.status, 'gray')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'
    
    def age_display(self, obj):
        """Display how old the record is"""
        from django.utils import timezone
        from datetime import timedelta
        
        age = timezone.now() - obj.created_at
        days_old = age.days
        
        if days_old < 1:
            return format_html('<span style="color: green;">Today</span>')
        elif days_old < 30:
            return format_html('<span style="color: green;">{} days old</span>', days_old)
        else:
            return format_html('<span style="color: red;">{} days old</span>', days_old)
    age_display.short_description = 'Record Age'
    
    def editability(self, obj):
        """Show if record is editable by regular users"""
        from django.utils import timezone
        from datetime import timedelta
        
        one_month_ago = timezone.now() - timedelta(days=30)
        is_editable = obj.created_at >= one_month_ago
        
        if is_editable:
            return format_html('<span style="color: green;">✓ Editable</span>')
        else:
            return format_html('<span style="color: red;">✗ Read-only (Admin can override)</span>')
    editability.short_description = 'Editability'
    
    def editable_info(self, obj):
        """Show editability information"""
        status = obj.get_editable_status(None)
        return f"Status: {status['reason']}"
    editable_info.short_description = 'Editing Status'
    
    def has_delete_permission(self, request, obj=None):
        """Only allow admins to delete attendance records"""
        return request.user.is_staff
    
    def get_readonly_fields(self, request, obj=None):
        """
        Make certain fields readonly for non-admin users
        Admins can edit everything
        """
        readonly_fields = list(self.readonly_fields)
        
        if obj and request.user.is_staff:
            # Admins can edit everything
            return readonly_fields
        
        return readonly_fields


@admin.register(AttendanceReport)
class AttendanceReportAdmin(admin.ModelAdmin):
    """Admin interface for Attendance Reports"""
    list_display = ('employee', 'period', 'present_days', 'absent_days', 'attendance_percentage_display', 'working_leave_days', 'nfd_days')
    list_filter = ('year', 'month', 'employee__department')
    search_fields = ('employee__employee_id', 'employee__first_name')
    readonly_fields = ('generated_at', 'attendance_percentage')
    fieldsets = (
        ('Employee Information', {
            'fields': ('employee', ('month', 'year'))
        }),
        ('Attendance Statistics', {
            'fields': (
                ('present_days', 'absent_days', 'late_days'),
                ('working_leave_days', 'nfd_days', 'total_days'),
                ('attendance_percentage',)
            )
        }),
        ('Additional Information', {
            'fields': ('absent_with_reason', 'generated_at'),
            'classes': ('collapse',)
        }),
    )
    ordering = ('-year', '-month')
    
    def period(self, obj):
        """Display month and year"""
        month_names = {
            1: 'January', 2: 'February', 3: 'March', 4: 'April',
            5: 'May', 6: 'June', 7: 'July', 8: 'August',
            9: 'September', 10: 'October', 11: 'November', 12: 'December'
        }
        return f"{month_names.get(obj.month, 'Unknown')} {obj.year}"
    period.short_description = 'Period'
    
    def attendance_percentage_display(self, obj):
        """Display attendance percentage with color coding"""
        percentage = obj.attendance_percentage
        
        if percentage >= 90:
            color = 'green'
        elif percentage >= 75:
            color = 'orange'
        else:
            color = 'red'
        
        return format_html(
            '<span style="color: {}; font-weight: bold;">{:.1f}%</span>',
            color, percentage
        )
    attendance_percentage_display.short_description = 'Attendance %'
