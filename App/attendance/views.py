from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.db.models import Q, Count
from django.utils import timezone
from datetime import datetime, timedelta, date
from calendar import monthrange
import json

from .models import Employee, Attendance, AttendanceReport
from .forms import (
    EmployeeForm, AttendanceForm, AttendanceFilterForm,
    AttendanceSummaryFilterForm
)
from .hash_table_util import attendance_hash_table


def dashboard(request):
    """Dashboard view showing attendance statistics"""
    today = datetime.today().date()
    
    total_employees = Employee.objects.filter(is_active=True).count()
    present_today = Attendance.objects.filter(
        attendance_date=today,
        status='PRESENT'
    ).count()
    absent_today = Attendance.objects.filter(
        attendance_date=today,
        status='ABSENT'
    ).count()
    # count entries marked as WFH (previously working leave)
    wfh_today = Attendance.objects.filter(
        attendance_date=today,
        status='WORKING_LEAVE'
    ).count()
    
    context = {
        'total_employees': total_employees,
        'present_today': present_today,
        'absent_today': absent_today,
        'wfh_today': wfh_today,
        'today': today,
    }
    return render(request, 'attendance/dashboard.html', context)


def employee_list(request):
    """List all employees with search and filter"""
    employees = Employee.objects.all()
    search_query = request.GET.get('search', '')
    department = request.GET.get('department', '')
    
    if search_query:
        employees = employees.filter(
            Q(employee_id__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(email__icontains=search_query)
        )
    
    if department:
        employees = employees.filter(department=department)
    
    context = {
        'employees': employees,
        'search_query': search_query,
        'selected_department': department,
        'departments': Employee.DEPARTMENT_CHOICES,
    }
    return render(request, 'attendance/employee_list.html', context)


def employee_detail(request, employee_id):
    """View employee details with attendance history"""
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
            return redirect('attendance:employee_list')
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
            return redirect('attendance:employee_detail', employee_id=employee_id)
        else:
            form = EmployeeForm(instance=employee)
    
    return render(request, 'attendance/edit_employee.html', {'form': form, 'employee': employee})


@require_http_methods(["GET", "POST"])
def mark_attendance(request):
    """Mark attendance for employees using hash table structure.

    Business rules implemented:
    * Only current-day attendance may be marked.
    * After 5 PM any employee without an entry is automatically recorded as absent.
    * Working‑from‑home entries are treated as PRESENT with a timestamp.
    * Once a record exists for an employee on a given day it cannot be changed (no edits allowed).
    """
    today = timezone.localdate()
    now = timezone.localtime()

    # automatically mark absent for everyone who hasn't submitted by 5pm
    if now.time() >= datetime.strptime("17:00", "%H:%M").time():
        # build a set of employee IDs that already have records for today
        existing_ids = set(
            Attendance.objects.filter(attendance_date=today).values_list('employee_id', flat=True)
        )
        to_create = []
        for emp in Employee.objects.filter(is_active=True):
            if emp.id not in existing_ids:
                to_create.append(
                    Attendance(
                        employee=emp,
                        attendance_date=today,
                        status='ABSENT',
                        remarks='Auto‑marked absent after 5pm'
                    )
                )
        if to_create:
            Attendance.objects.bulk_create(to_create)
            # refresh list after inserting
    
    if request.method == 'POST':
        form = AttendanceForm(request.POST, user=request.user)
        if form.is_valid():
            attendance = form.save(commit=False)
            # ensure check-in time is populated (form logic should handle it but double-check)
            if not attendance.check_in_time:
                attendance.check_in_time = timezone.localtime().time().replace(microsecond=0)
            attendance.save()

            # Also populate hash table for efficient retrieval
            try:
                attendance_hash_table.mark_attendance(
                    employee_id=attendance.employee.employee_id,
                    attendance_date=attendance.attendance_date,
                    status=attendance.status,
                    check_in_time=str(attendance.check_in_time) if attendance.check_in_time else None,
                    check_out_time=str(attendance.check_out_time) if attendance.check_out_time else None,
                    remarks=attendance.remarks,
                    created_at=attendance.created_at.isoformat()
                )
            except Exception as e:
                messages.warning(request, f'Attendance marked but hash table sync failed: {str(e)}')

            messages.success(request, 'Attendance marked successfully!')
            return redirect('attendance:mark_attendance')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        form = AttendanceForm(user=request.user)
    
    # Show today's attendance records (refresh after potential auto‑absent)
    today_attendance = Attendance.objects.filter(attendance_date=today).select_related('employee')
    recorded_ids = list(today_attendance.values_list('employee_id', flat=True))
    
    context = {
        'form': form,
        'today_attendance': today_attendance,
        'today': today,
        'recorded_ids': recorded_ids,
    }
    return render(request, 'attendance/mark_attendance.html', context)


@require_http_methods(["GET", "POST"])
def edit_attendance(request, attendance_id):
    """Edit an attendance record with editing restrictions"""
    attendance = get_object_or_404(Attendance, pk=attendance_id)
    
     # Check if user can edit
    if not attendance.is_editable(request.user):
        status = attendance.get_editable_status(request.user)
        messages.error(request, f"Cannot edit this record: {status['reason']}")
        return redirect('attendance:attendance_history')
    
    if request.method == 'POST':
        form = AttendanceForm(request.POST, instance=attendance, user=request.user)
        if form.is_valid():
            attendance = form.save()
            messages.success(request, 'Attendance updated successfully!')
            return redirect('attendance:attendance_history')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        form = AttendanceForm(instance=attendance, user=request.user)
    
    context = {
        'form': form,
        'attendance': attendance,
        'is_editable': attendance.is_editable(request.user),
    }
    return render(request, 'attendance/edit_attendance.html', context)


def attendance_by_date(request):
    """View attendance records by specific date"""
    form = AttendanceFilterForm(request.GET)
    records = Attendance.objects.all().select_related('employee')
    
    selected_date = None
    if form.is_valid() and form.cleaned_data.get('from_date'):
        selected_date = form.cleaned_data['from_date']
        records = records.filter(attendance_date=selected_date)
    
    context = {
        'form': form,
        'records': records,
        'selected_date': selected_date,
        'view_type': 'date',
    }
    return render(request, 'attendance/attendance_by_date.html', context)


def attendance_by_month(request):
    """View attendance records by month"""
    form = AttendanceSummaryFilterForm(request.GET)
    records = Attendance.objects.all().select_related('employee')
    
    selected_month = None
    selected_year = None
    
    if form.is_valid():
        month = form.cleaned_data.get('month')
        year = form.cleaned_data.get('year')
        employee = form.cleaned_data.get('employee')
        
        if month or year:
            if year:
                selected_year = year
            else:
                selected_year = datetime.today().year
            
            if month:
                selected_month = month
                days_in_month = monthrange(selected_year, selected_month)[1]
                start_date = date(selected_year, selected_month, 1)
                end_date = date(selected_year, selected_month, days_in_month)
                records = records.filter(
                    attendance_date__gte=start_date,
                    attendance_date__lte=end_date
                )
            
            if employee:
                records = records.filter(employee=employee)
    
    # Group records by employee
    records_by_employee = {}
    for record in records.order_by('employee', 'attendance_date'):
        emp_id = record.employee.employee_id
        if emp_id not in records_by_employee:
            records_by_employee[emp_id] = {
                'employee': record.employee,
                'records': []
            }
        records_by_employee[emp_id]['records'].append(record)
    
    context = {
        'form': form,
        'records_by_employee': records_by_employee,
        'selected_month': selected_month,
        'selected_year': selected_year,
        'view_type': 'month',
    }
    return render(request, 'attendance/attendance_by_month.html', context)


def attendance_by_year(request):
    """View attendance records by year"""
    form = AttendanceSummaryFilterForm(request.GET)
    records = Attendance.objects.all().select_related('employee')
    
    selected_year = None
    
    if form.is_valid():
        year = form.cleaned_data.get('year')
        employee = form.cleaned_data.get('employee')
        
        if year:
            selected_year = year
            start_date = date(selected_year, 1, 1)
            end_date = date(selected_year, 12, 31)
            records = records.filter(
                attendance_date__gte=start_date,
                attendance_date__lte=end_date
            )
        
        if employee:
            records = records.filter(employee=employee)
    
    # Organize records by month
    records_by_month = {}
    for record in records.order_by('attendance_date'):
        month_key = record.attendance_date.strftime('%B')
        if month_key not in records_by_month:
            records_by_month[month_key] = []
        records_by_month[month_key].append(record)
    
    context = {
        'form': form,
        'records_by_month': records_by_month,
        'selected_year': selected_year,
        'view_type': 'year',
    }
    return render(request, 'attendance/attendance_by_year.html', context)


def attendance_summary(request):
    """Generate and display attendance summary reports"""
    form = AttendanceSummaryFilterForm(request.GET)
    summaries = []
    
    if form.is_valid():
        month = form.cleaned_data.get('month')
        year = form.cleaned_data.get('year')
        employee = form.cleaned_data.get('employee')
        
        # Default to current month/year
        if not month:
            month = datetime.today().month
        if not year:
            year = datetime.today().year
        
        employees = Employee.objects.filter(is_active=True)
        if employee:
            employees = employees.filter(pk=employee.pk)
        
        for emp in employees:
            # Get records for the month
            days_in_month = monthrange(year, month)[1]
            start_date = date(year, month, 1)
            end_date = date(year, month, days_in_month)
            
            records = Attendance.objects.filter(
                employee=emp,
                attendance_date__gte=start_date,
                attendance_date__lte=end_date
            ).values('status').annotate(count=Count('status'))
            
            # Calculate summary
            summary = {
                'employee': emp,
                'month': month,
                'year': year,
                'total_days': len([d for d in range(1, days_in_month + 1)
                                 if date(year, month, d).weekday() < 5]),  # Excluding weekends
                'present': 0,
                'absent': 0,
                'absent_reasons': {},
                'working_leave': 0,
                'nfd': 0,
                'late': 0,
            }
            
            # Populate statistics
            for record in records:
                if record['status'] == 'PRESENT':
                    summary['present'] = record['count']
                elif record['status'] == 'ABSENT':
                    summary['absent'] = record['count']
                elif record['status'] == 'WORKING FROM HOME':
                    summary['working_leave'] = record['count']
                # elif record['status'] == 'NFD':
                #     summary['nfd'] = record['count']
                elif record['status'] == 'LATE':
                    summary['late'] = record['count']
            
            # Get absence reasons
            # we no longer track structured absence reasons; remarks hold any detail
            summary['absent_reasons'] = {}
            
            # Calculate attendance percentage (excluding working leaves)
            working_days = summary['total_days'] - summary['working_leave']
            if working_days > 0:
                summary['attendance_percentage'] = round(
                    (summary['present'] / working_days * 100), 2
                )
            else:
                summary['attendance_percentage'] = 0
            
            summaries.append(summary)
    
    context = {
        'form': form,
        'summaries': summaries,
    }
    return render(request, 'attendance/attendance_summary.html', context)


def attendance_history(request):
    """View complete attendance history with advanced filtering"""
    records = Attendance.objects.all().select_related('employee')
    form = AttendanceFilterForm(request.GET)
    
    if form.is_valid():
        if form.cleaned_data.get('employee'):
            records = records.filter(employee=form.cleaned_data['employee'])
        
        if form.cleaned_data.get('status'):
            records = records.filter(status=form.cleaned_data['status'])
        
        if form.cleaned_data.get('from_date'):
            records = records.filter(attendance_date__gte=form.cleaned_data['from_date'])
        
        if form.cleaned_data.get('to_date'):
            records = records.filter(attendance_date__lte=form.cleaned_data['to_date'])
        
        if form.cleaned_data.get('month'):
            records = records.filter(attendance_date__month=form.cleaned_data['month'])
        
        if form.cleaned_data.get('year'):
            records = records.filter(attendance_date__year=form.cleaned_data['year'])
    
    records = records.order_by('-attendance_date')
    
    context = {
        'records': records,
        'form': form,
    }
    return render(request, 'attendance/attendance_history.html', context)


def attendance_report(request):
    """Generate attendance reports - Deprecated, using summary instead"""
    return redirect('attendance:attendance_summary')


def admin_override_edit(request, attendance_id):
    """Admin panel to override and edit any attendance record"""
    if not request.user.is_staff:
        messages.error(request, 'Only administrators can access this page.')
        return redirect('attendance:dashboard')
    
    attendance = get_object_or_404(Attendance, pk=attendance_id)
    
    if request.method == 'POST':
        form = AttendanceForm(request.POST, instance=attendance, user=request.user)
        if form.is_valid():
            attendance = form.save()
            messages.success(request, f'Attendance record updated by admin (Admin Override)!')
            return redirect('attendance:attendance_history')
    else:
        form = AttendanceForm(instance=attendance, user=request.user)
    
    context = {
        'form': form,
        'attendance': attendance,
        'is_admin_override': True,
    }
    return render(request, 'attendance/admin_override_edit.html', context)
