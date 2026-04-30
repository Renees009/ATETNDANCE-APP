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
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import json
from django.db.models import Q


def login_view(request):
    """Simple role-selection landing page.

    Clicking 'Admin' redirects to the normal dashboard.  Clicking 'Employee'
    takes the user to a page where they pick an employee record.

    Also clear any existing employee-portal session state.
    """
    request.session.pop('portal_employee', None)
    return render(request, 'frontend/src/Components/login.js')


@require_http_methods(["GET", "POST"])
def choose_employee(request):
    """Allow an employee user to pick their own record."""
    employees = Employee.objects.filter(is_active=True)
    if request.method == 'POST':
        emp_id = request.POST.get('employee')
        if emp_id:
            # store choice in session
            request.session['portal_employee'] = emp_id
            return redirect('attendance:employee_home', employee_id=emp_id)
    return render(request, 'frontend/src/Components/choose_employee.js', {'employees': employees})


def employee_home(request, employee_id):
    """Landing page for a selected employee showing their personal links."""
    # ensure session reflects current employee
    request.session['portal_employee'] = employee_id
    employee = get_object_or_404(Employee, employee_id=employee_id)
    return render(request, 'frontend/src/Components/employee_home.js', {'employee': employee})


def dashboard(request):
    """Dashboard view showing attendance statistics"""
    today = timezone.localdate()
    
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
    return render(request, 'attendance/dashboard.html', context)  # Fixed template path

@csrf_exempt
def dashboard_api(request):
    """API endpoint for dashboard stats"""
    today = timezone.localdate()
    
    total_employees = Employee.objects.filter(is_active=True).count()
    present_today = Attendance.objects.filter(
        attendance_date=today,
        status='PRESENT'
    ).count()
    absent_today = Attendance.objects.filter(
        attendance_date=today,
        status='ABSENT'
    ).count()
    wfh_today = Attendance.objects.filter(
        attendance_date=today,
        status='WORKING_LEAVE'
    ).count()
    
    # Debug logging for zero stats
    print(f"DEBUG Dashboard API {today}: total_emp={total_employees}, present={present_today}, absent={absent_today}, wfh={wfh_today}")
    
    context = {
        'total_employees': total_employees,
        'present_today': present_today,
        'absent_today': absent_today,
        'wfh_today': wfh_today,
        'today': today.isoformat(),
    }
    return JsonResponse(context)


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
    return render(request, 'frontend/src/Components/employee_list.js', context)

@csrf_exempt
def employee_list_api(request):
    """API endpoint for employee list"""
    employees = Employee.objects.all().values(
        'id', 'employee_id', 'first_name', 'last_name', 'email', 
        'department', 'position', 'is_active'
    )
    search_query = request.GET.get('search', '')
    department = request.GET.get('department', '')
    
    if search_query:
        from django.db.models import Q
        # Filter for search
        # Note: values() querysets need .filter before values for Q
        base_qs = Employee.objects.filter(
            Q(employee_id__icontains=search_query) |
            Q(first_name__icontains=search_query) |
            Q(last_name__icontains=search_query) |
            Q(email__icontains=search_query)
        )
        employees = base_qs.values(
            'id', 'employee_id', 'first_name', 'last_name', 'email', 
            'department', 'position', 'is_active'
        )
    
    if department:
        base_qs = Employee.objects.filter(department=department)
        employees = base_qs.values(
            'id', 'employee_id', 'first_name', 'last_name', 'email', 
            'department', 'position', 'is_active'
        )
    
    departments = [choice[0] for choice in Employee.DEPARTMENT_CHOICES]
    


    context = {
        'employees': list(employees),
        'departments': departments,
    }
    return JsonResponse(context)


@csrf_exempt
def add_employee_api(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            form = EmployeeForm(data)
            if form.is_valid():
                employee = form.save()
                
                # Auto-generate AttendanceReport for current month
                today = date.today()
                days_in_month = monthrange(today.year, today.month)[1]
                working_days = sum(1 for d in range(1, days_in_month + 1) 
                                 if date(today.year, today.month, d).weekday() < 5)
                
                AttendanceReport.objects.get_or_create(
                    employee=employee,
                    month=today.month,
                    year=today.year,
                    defaults={
                        'total_days': working_days,
                        'present_days': 0,
                        'absent_days': 0,
                        'late_days': 0,
                        'half_days': 0,
                        'working_leave_days': 0,
                        'nfd_days': 0,
                        'attendance_percentage': 0,
                        'absent_with_reason': '{}',
                        'generated_at': timezone.now()
                    }
                )
                
                return JsonResponse({
                    'success': True,
                    'message': 'Employee created successfully!',
                    'employee': {
                        'employee_id': employee.employee_id,
                        'name': f"{employee.first_name} {employee.last_name}"
                    }
                })
            else:
                return JsonResponse({'success': False, 'errors': form.errors}, status=400)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'POST required'}, status=405)


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
    return render(request, 'frontend/src/Components/employee_detail.js', context)


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
    
    return render(request, 'frontend/src/Components/add_employee.js', {'form': form})


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
    
    return render(request, 'frontend/src/Components/edit_employee.js', {'form': form, 'employee': employee})


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
    
    # check if we were asked to restrict to a particular employee (employee portal)
    employee_id = request.GET.get('employee_id') or request.POST.get('employee_id')
    emp_override = None
    if employee_id:
        try:
            emp_override = Employee.objects.get(employee_id=employee_id)
        except Employee.DoesNotExist:
            emp_override = None

    if request.method == 'POST':
        form = AttendanceForm(request.POST, user=request.user)
        # if we have an override, ensure user cannot change it
        if emp_override and 'employee' in form.fields:
            form.fields['employee'].queryset = Employee.objects.filter(pk=emp_override.pk)
        if form.is_valid():
            attendance = form.save(commit=False)
            # if employee override present, force it
            if emp_override:
                attendance.employee = emp_override
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
            if emp_override:
                from django.urls import reverse
                return redirect(f"{reverse('attendance:mark_attendance')}?employee_id={emp_override.employee_id}")
            return redirect('attendance:mark_attendance')
        else:
            for field, errors in form.errors.items():
                for error in errors:
                    messages.error(request, f"{field}: {error}")
    else:
        # prepopulate employee field for override
        if emp_override:
            form = AttendanceForm(user=request.user, initial={'employee': emp_override.pk})
            # lock the dropdown so it can't be changed
            if 'employee' in form.fields:
                form.fields['employee'].widget.attrs['readonly'] = True
                form.fields['employee'].widget.attrs['disabled'] = True
        else:
            form = AttendanceForm(user=request.user)
    
    # Show today's attendance records (refresh after potential auto‑absent)
    today_attendance = Attendance.objects.filter(attendance_date=today).select_related('employee')
    # if override, filter the attendance listing as well
    if emp_override:
        today_attendance = today_attendance.filter(employee=emp_override)
    recorded_ids = list(today_attendance.values_list('employee_id', flat=True))
    
    context = {
        'form': form,
        'today_attendance': today_attendance,
        'today': today,
        'recorded_ids': recorded_ids,
        'employee_override': emp_override,
    }
    return render(request, 'frontend/src/Components/mark_attendance.js', context)

@csrf_exempt
def mark_attendance_api(request):
    """API endpoint for mark attendance"""
    if request.method == 'GET':
        today = timezone.localdate()
        today_attendance = Attendance.objects.filter(attendance_date=today).select_related('employee').values(
            'id', 'employee_id', 'employee__first_name', 'employee__last_name', 'status', 
            'check_in_time', 'check_out_time', 'remarks'
        )
        recorded_ids = list(Attendance.objects.filter(attendance_date=today).values_list('employee__id', flat=True))
        return JsonResponse({
            'today_attendance': list(today_attendance),
            'recorded_ids': recorded_ids,
            'today': today.isoformat()
        })
    
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            employee_id = data.get('employee_id')
            status = data.get('status')
            remarks = data.get('remarks', '')
            
            employee = get_object_or_404(Employee, employee_id=employee_id)
            
            # Check duplicate
            today = timezone.localdate()
            if Attendance.objects.filter(employee=employee, attendance_date=today).exists():
                return JsonResponse({'success': False, 'error': 'Already marked today'}, status=400)
            
            attendance = Attendance(
                employee=employee,
                attendance_date=today,
                status=status,
                check_in_time=timezone.localtime().time().replace(microsecond=0),
                remarks=remarks
            )
            attendance.save()
            
            # Hash table sync
            attendance_hash_table.mark_attendance(
                employee_id=employee.employee_id,
                attendance_date=today,
                status=status,
                check_in_time=str(attendance.check_in_time),
                remarks=remarks,
                created_at=attendance.created_at.isoformat()
            )
            
            return JsonResponse({'success': True, 'message': 'Attendance marked'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)

@csrf_exempt
def attendance_by_date_api(request):
    """API: Attendance by specific date"""
    date_str = request.GET.get('date')
    if not date_str:
        return JsonResponse({'error': 'Date parameter required'}, status=400)
    
    try:
        from datetime import datetime
        selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        records = Attendance.objects.filter(attendance_date=selected_date).select_related('employee').values(
            'id', 'employee_id', 'employee__first_name', 'employee__last_name', 'employee__department',
            'status', 'check_in_time', 'check_out_time', 'remarks'
        )
        data = list(records)
        for record in data:
            record['employee_name'] = f"{record['employee__first_name']} {record['employee__last_name']}" 
            record['department'] = record['employee__department']
            del record['employee__first_name'], record['employee__last_name'], record['employee__department']
        
        return JsonResponse({'records': data, 'date': date_str})
    except ValueError:
        return JsonResponse({'error': 'Invalid date format'}, status=400)


@csrf_exempt
def attendance_by_month_api(request):
    """API: Attendance by month/year"""
    month = request.GET.get('month')
    year = request.GET.get('year')
    employee_id = request.GET.get('employee')
    
    if not month or not year:
        return JsonResponse({'error': 'month and year required'}, status=400)
    
    try:
        from calendar import monthrange
        y, m = int(year), int(month)
        days_in_month = monthrange(y, m)[1]
        start_date = date(y, m, 1)
        end_date = date(y, m, days_in_month)
        
        records = Attendance.objects.filter(
            attendance_date__gte=start_date, attendance_date__lte=end_date
        ).select_related('employee')
        
        if employee_id:
            records = records.filter(employee__employee_id=employee_id)
        
        data = list(records.values('id', 'employee__employee_id', 'employee__first_name', 
                                  'employee__last_name', 'attendance_date', 'status', 
                                  'check_in_time', 'check_out_time'))
        
        return JsonResponse({'records': data, 'month': month, 'year': year})
    except:
        return JsonResponse({'error': 'Invalid parameters'}, status=400)


@csrf_exempt  
def attendance_by_year_api(request):
    """API: Attendance by year"""
    year = request.GET.get('year')
    employee_id = request.GET.get('employee')
    
    if not year:
        return JsonResponse({'error': 'year required'}, status=400)
    
    try:
        y = int(year)
        start_date = date(y, 1, 1)
        end_date = date(y, 12, 31)
        
        records = Attendance.objects.filter(
            attendance_date__gte=start_date, attendance_date__lte=end_date
        ).select_related('employee')
        
        if employee_id:
            records = records.filter(employee__employee_id=employee_id)
        
        data = list(records.values('attendance_date', 'status', 'check_in_time'))
        return JsonResponse({'records': data, 'year': year})
    except:
        return JsonResponse({'error': 'Invalid year'}, status=400)


@csrf_exempt
def attendance_summary_api(request):
    """API: Attendance summary statistics"""
    month = request.GET.get('month', datetime.now().month)
    year = request.GET.get('year', datetime.now().year)
    
    try:
        from calendar import monthrange
        y, m = int(year), int(month)
        days_in_month = monthrange(y, m)[1]
        working_days = sum(1 for d in range(1, days_in_month+1) if date(y,m,d).weekday() < 5)
        
        summaries = []
        employees = Employee.objects.filter(is_active=True)
        
        for emp in employees:
            records = Attendance.objects.filter(
                employee=emp, attendance_date__month=m, attendance_date__year=y
            ).values('status').annotate(count=Count('status'))
            
            summary = {
                'employee_id': emp.employee_id,
                'name': f"{emp.first_name} {emp.last_name}",
                'present': 0, 'absent': 0, 'working_leave': 0, 'total_days': working_days,
                'attendance_percentage': 0
            }
            
            for r in records:
                summary[r['status']] = r['count']
            
            if working_days > 0:
                summary['attendance_percentage'] = round((summary['present'] / working_days) * 100, 2)
            summaries.append(summary)
        
        return JsonResponse({'summaries': summaries, 'month': m, 'year': y})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def attendance_reports_api(request):
    """API: Attendance reports with summary + individual records"""
    month = request.GET.get('month', datetime.now().month)
    year = request.GET.get('year', datetime.now().year)
    employee_id = request.GET.get('employee', '')
    
    try:
        from calendar import monthrange
        y, m = int(year), int(month)
        days_in_month = monthrange(y, m)[1]
        start_date = date(y, m, 1)
        end_date = date(y, m, days_in_month)
        total_working_days = sum(1 for d in range(1, days_in_month + 1) if date(y, m, d).weekday() < 5)
        
        employees = Employee.objects.filter(is_active=True)
        if employee_id:
            employees = employees.filter(employee_id__icontains=employee_id)
        
        reports = []
        for emp in employees:
            # Aggregate counts by status
            records = Attendance.objects.filter(
                employee=emp,
                attendance_date__gte=start_date,
                attendance_date__lte=end_date
            ).values('status').annotate(count=Count('status'))
            
            summary = {
                'present_days': 0,
                'absent_days': 0,
                'late_days': 0,
                'half_days': 0,
                'leave_days': 0,
            }
            
            for r in records:
                status = r['status']
                count = r['count']
                if status == 'PRESENT':
                    summary['present_days'] = count
                elif status == 'ABSENT':
                    summary['absent_days'] = count
                elif status == 'LATE':
                    summary['late_days'] = count
                elif status == 'NFD':
                    summary['half_days'] = count
                elif status == 'WORKING_LEAVE':
                    summary['leave_days'] = count
            
            # Calculate attendance percentage
            if total_working_days > 0:
                attendance_percentage = round((summary['present_days'] / total_working_days) * 100, 2)
            else:
                attendance_percentage = 0.0
            
            # Fetch individual attendance records for this employee in the period
            detail_records = list(Attendance.objects.filter(
                employee=emp,
                attendance_date__gte=start_date,
                attendance_date__lte=end_date
            ).values('attendance_date', 'status', 'check_in_time', 'remarks').order_by('attendance_date'))
            
            reports.append({
                'employee_name': f"{emp.first_name} {emp.last_name}",
                'employee_id': emp.employee_id,
                'month': m,
                'year': y,
                'total_days': total_working_days,
                'present_days': summary['present_days'],
                'absent_days': summary['absent_days'],
                'late_days': summary['late_days'],
                'half_days': summary['half_days'],
                'leave_days': summary['leave_days'],
                'attendance_percentage': attendance_percentage,
                'records': detail_records,
            })
        
        return JsonResponse({'reports': reports, 'month': m, 'year': y})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
def attendance_history_api(request):
    """API: Full attendance history with employee filter"""
    records = Attendance.objects.select_related('employee').values(
        'id', 'employee__employee_id', 'employee__first_name', 'employee__last_name',
        'attendance_date', 'status', 'check_in_time', 'check_out_time', 'remarks'
    ).order_by('-attendance_date')
    
    # Apply employee filter
    employee_id = request.GET.get('employee')
    if employee_id:
        records = records.filter(employee__employee_id=employee_id)
    
    data = list(records)
    return JsonResponse({'records': data})


@csrf_exempt
def employee_detail_api(request, employee_id):
    """API: Single employee details + recent attendance"""
    try:
        emp = Employee.objects.get(employee_id=employee_id)
        thirty_days_ago = datetime.now().date() - timedelta(days=30)
        attendance = list(Attendance.objects.filter(
            employee=emp, attendance_date__gte=thirty_days_ago
        ).values('attendance_date', 'status', 'check_in_time'))
        
        return JsonResponse({
            'employee': {
                'id': emp.id, 'employee_id': emp.employee_id,
                'first_name': emp.first_name, 'last_name': emp.last_name,
                'email': emp.email, 'department': emp.department
            },
            'attendance_records': attendance
        })
    except Employee.DoesNotExist:
        return JsonResponse({'error': 'Employee not found'}, status=404)


@csrf_exempt
def attendance_detail_api(request, record_id):
    """API: Single attendance record (GET)"""
    try:
        record = Attendance.objects.select_related('employee').get(id=record_id)
        data = {
            'id': record.id,
            'employee_id': record.employee.employee_id,
            'employee': record.employee.id,
            'attendance_date': record.attendance_date.isoformat(),
            'status': record.status,
            'check_in_time': str(record.check_in_time) if record.check_in_time else None,
            'remarks': record.remarks
        }
        return JsonResponse(data)
    except Attendance.DoesNotExist:
        return JsonResponse({'error': 'Record not found'}, status=404)


@csrf_exempt
def update_attendance_api(request, record_id):
    """API: Update attendance record (PUT/POST)"""
    if request.method not in ['POST', 'PUT']:
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        record = get_object_or_404(Attendance, id=record_id)
        
        # Update fields
        for field, value in data.items():
            if hasattr(record, field) and field != 'id':
                setattr(record, field, value)
        
        record.save()
        return JsonResponse({'success': True, 'message': 'Updated'})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)



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
    return render(request, 'frontend/src/Components/edit_attendance.js', context)


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
    return render(request, 'frontend/src/Components/attendance_by_date.js', context)


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
    return render(request, 'frontend/src/Components/attendance_by_month.js', context)


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
    return render(request, 'frontend/src/Components//attendance_by_year.js', context)


def attendance_summary(request):
    """Generate and display attendance summary reports"""
    # allow employee filter via querystring for employee portal
    employee_param = request.GET.get('employee')
    form = AttendanceSummaryFilterForm(request.GET)
    summaries = []
    
    if form.is_valid():
        month = form.cleaned_data.get('month')
        year = form.cleaned_data.get('year')
        employee = form.cleaned_data.get('employee')
        
        # support portal override
        if employee_param:
            try:
                employee = Employee.objects.get(pk=employee_param)
            except Employee.DoesNotExist:
                employee = None
        
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
                
                elif record['status'] == 'WORKING_LEAVE':
                    summary['working_leave'] = record['count']
                
                elif record['status'] == 'NFD':
                    summary['nfd'] = record['count']
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
    return render(request, 'frontend/src/Components/attendance_summary.js', context)


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
    return render(request, 'frontend/src/Components/attendance_history,js', context)


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
    return render(request, 'frontend/src/Components/admin_override_edit.js', context)
