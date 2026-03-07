from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views.decorators.http import require_http_methods
from django.db.models import Q
from datetime import datetime, timedelta
from .models import Employee, Attendance, AttendanceReport
from .forms import EmployeeForm, AttendanceForm, AttendanceFilterForm

def dashboard(request):
    """Dashboard view showing attendance statistics"""
    total_employees = Employee.objects.filter(is_active=True).count()
    present_today = Attendance.objects.filter(
        attendance_date=datetime.today().date(),
        status='PRESENT'
    ).count()
    absent_today = Attendance.objects.filter(
        attendance_date=datetime.today().date(),
        status='ABSENT'
    ).count()
    
    context = {
        'total_employees': total_employees,
        'present_today': present_today,
        'absent_today': absent_today,
    }
    return render(request, 'attendance/dashboard.html', context)


def employee_list(request):
    """List all employees"""
    employees = Employee.objects.all()
    search_query = request.GET.get('search', '')
    
    if search_query:
        employees = employees.filter(
            Q(employee_id__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(email__icontains=search_query)
        )
    
    context = {
        'employees': employees,
        'search_query': search_query,
    }
    return render(request, 'attendance/employee_list.html', context)


def employee_detail(request, employee_id):
    """View employee details"""
    employee = get_object_or_404(Employee, employee_id=employee_id)
    # Get last 30 days of attendance
    thirty_days_ago = datetime.today().date() - timedelta(days=30)
    attendance_records = Attendance.objects.filter(
        employee=employee,
        attendance_date__gte=thirty_days_ago
    ).order_by('-attendance_date')
    
    context = {
        'employee': employee,
        'attendance_records': attendance_records,
    }
    return render(request, 'attendance/employee_detail.html', context)


@require_http_methods(["GET", "POST"])
def add_employee(request):
    """Add a new employee"""
    if request.method == 'POST':
        form = EmployeeForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Employee added successfully!')
            return redirect('employee_list')
    else:
        form = EmployeeForm()
    
    return render(request, 'attendance/add_employee.html', {'form': form})


@require_http_methods(["GET", "POST"])
def edit_employee(request, employee_id):
    """Edit employee information"""
    employee = get_object_or_404(Employee, employee_id=employee_id)
    
    if request.method == 'POST':
        form = EmployeeForm(request.POST, instance=employee)
        if form.is_valid():
            form.save()
            messages.success(request, 'Employee updated successfully!')
            return redirect('employee_detail', employee_id=employee_id)
    else:
        form = EmployeeForm(instance=employee)
    
    return render(request, 'attendance/edit_employee.html', {'form': form, 'employee': employee})


def mark_attendance(request):
    """Mark attendance for employees"""
    if request.method == 'POST':
        form = AttendanceForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Attendance marked successfully!')
            return redirect('mark_attendance')
    else:
        form = AttendanceForm()
    
    # Show today's attendance records
    today = datetime.today().date()
    today_attendance = Attendance.objects.filter(attendance_date=today).select_related('employee')
    
    context = {
        'form': form,
        'today_attendance': today_attendance,
        'today': today,
    }
    return render(request, 'attendance/mark_attendance.html', context)


def attendance_report(request):
    """Generate attendance reports"""
    form = AttendanceFilterForm(request.GET)
    reports = AttendanceReport.objects.all().select_related('employee')
    
    if form.is_valid():
        if form.cleaned_data.get('employee'):
            reports = reports.filter(employee=form.cleaned_data['employee'])
        if form.cleaned_data.get('month'):
            reports = reports.filter(month=form.cleaned_data['month'])
        if form.cleaned_data.get('year'):
            reports = reports.filter(year=form.cleaned_data['year'])
    
    context = {
        'form': form,
        'reports': reports,
    }
    return render(request, 'attendance/attendance_report.html', context)


def attendance_history(request):
    """View attendance history"""
    records = Attendance.objects.all().select_related('employee')
    form = AttendanceFilterForm(request.GET)
    
    if form.is_valid():
        if form.cleaned_data.get('employee'):
            records = records.filter(employee=form.cleaned_data['employee'])
    
    context = {
        'records': records,
        'form': form,
    }
    return render(request, 'attendance/attendance_history.html', context)
