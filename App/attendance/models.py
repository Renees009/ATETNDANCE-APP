from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone
from datetime import datetime, timedelta

class Employee(models.Model):
    """Model to store employee information"""
    DEPARTMENT_CHOICES = [
        ('HR', 'Human Resources'),
        ('IT', 'Information Technology'),
        ('SALES', 'Sales'),
        ('MARKETING', 'Marketing'),
        ('OPERATIONS', 'Operations'),
        ('FINANCE', 'Finance'),
    ]
    
    employee_id = models.CharField(
        max_length=10, 
        unique=True, 
        validators=[RegexValidator(r'^EMP\d{4}$', 'Employee ID must be in format EMPXXXX')]
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15)
    department = models.CharField(max_length=20, choices=DEPARTMENT_CHOICES)
    position = models.CharField(max_length=100)
    date_of_joining = models.DateField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['employee_id']
        verbose_name_plural = "Employees"
    
    def __str__(self):
        return f"{self.employee_id} - {self.first_name} {self.last_name}"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"


class Attendance(models.Model):
    """Model to track employee attendance with hash table optimization"""
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        # label changed per user request to display 'Work From Home'
        ('WORKING_LEAVE', 'Work From Home'),
        ('NFD', 'No Full Day / Half Day'),
        ('LATE', 'Late'),
    ]
    
    # free‑text reason/notes are stored in `remarks` now; there is no separate
    # absence_reason field to avoid migration drift.
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    attendance_date = models.DateField(db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-attendance_date']
        unique_together = ['employee', 'attendance_date']
        verbose_name_plural = "Attendance Records"
        indexes = [
            models.Index(fields=['employee', 'attendance_date']),
            models.Index(fields=['attendance_date', 'status']),
        ]
    
    def __str__(self):
        status_display = self.get_status_display()
        # include remarks if available for absences or special entries
        if self.remarks:
            return f"{self.employee.employee_id} - {self.attendance_date} ({status_display}) – {self.remarks}"
        return f"{self.employee.employee_id} - {self.attendance_date} ({status_display})"
    
    def is_editable(self, user=None):
        """
        Check if attendance record can be edited.
        - Records for the current day may **never** be modified once submitted
        - Non-admin users: Can edit records older than a day but only within 30 days
        - Admin users: Can edit any record (including today's)
        """
        today = timezone.localdate()
        # prevent editing today by anybody except staff
        if self.attendance_date == today and not (user and user.is_staff):
            return False
        if user and user.is_staff:
            return True
        one_month_ago = timezone.now() - timedelta(days=30)
        return self.created_at >= one_month_ago
    
    def get_editable_status(self, user=None):
        """Get detailed status of editability"""
        if user and user.is_staff:
            return {'editable': True, 'reason': 'Admin privilege'}
        
        if self.is_editable(user):
            return {'editable': True, 'reason': 'Within 1 month'}
        
        days_elapsed = (timezone.now() - self.created_at).days
        return {
            'editable': False, 
            'reason': f'Record is {days_elapsed} days old. Cannot edit records older than 30 days.'
        }


class AttendanceReport(models.Model):
    """Model to generate and store attendance reports with summary statistics"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    month = models.IntegerField()  # Month (1-12)
    year = models.IntegerField()   # Year (e.g., 2024)
    total_days = models.IntegerField()
    present_days = models.IntegerField()
    absent_days = models.IntegerField()
    absent_with_reason = models.TextField()  # JSON field for absence reasons
    late_days = models.IntegerField()
    half_days = models.IntegerField()
    # count for work‑from‑home records (previously called working_leave)
    working_leave_days = models.IntegerField()
    nfd_days = models.IntegerField(default=0, verbose_name="No Full Day / Half Days")
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    generated_at = models.DateTimeField()
    
    class Meta:
        ordering = ['-year', '-month']
        unique_together = ['employee', 'month', 'year']
        verbose_name_plural = "Attendance Reports"
    
    def __str__(self):
        return f"{self.employee.employee_id} - {self.month}/{self.year}"
