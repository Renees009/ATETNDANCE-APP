from django.db import models
from django.core.validators import RegexValidator
from datetime import datetime

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
    """Model to track employee attendance"""
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('LATE', 'Late'),
        ('HALF_DAY', 'Half Day'),
        ('LEAVE', 'On Leave'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendance_records')
    attendance_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    check_in_time = models.TimeField(null=True, blank=True)
    check_out_time = models.TimeField(null=True, blank=True)
    remarks = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-attendance_date']
        unique_together = ['employee', 'attendance_date']
        verbose_name_plural = "Attendance Records"
    
    def __str__(self):
        return f"{self.employee.employee_id} - {self.attendance_date} ({self.status})"


class AttendanceReport(models.Model):
    """Model to generate and store attendance reports"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    month = models.IntegerField()  # Month (1-12)
    year = models.IntegerField()   # Year (e.g., 2024)
    total_days = models.IntegerField()
    present_days = models.IntegerField()
    absent_days = models.IntegerField()
    late_days = models.IntegerField()
    half_days = models.IntegerField()
    leave_days = models.IntegerField()
    attendance_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    generated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-year', '-month']
        unique_together = ['employee', 'month', 'year']
        verbose_name_plural = "Attendance Reports"
    
    def __str__(self):
        return f"{self.employee.employee_id} - {self.month}/{self.year}"
