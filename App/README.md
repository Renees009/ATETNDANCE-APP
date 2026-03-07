# Employee Attendance Application

A Django-based web application for managing employee attendance records.

## Features

- **Employee Management**
  - Add, edit, and view employee information
  - Organize employees by department
  - Track employment status (active/inactive)

- **Attendance Tracking**
  - Mark daily attendance with status (Present, Absent, Late, Half Day, On Leave)
  - Record check-in and check-out times
  - Add remarks/notes for attendance records
  - Prevent duplicate attendance entries per employee per day

- **Reporting**
  - Generate attendance reports by month and year
  - Filter reports by employee or date range
  - View attendance history
  - Calculate attendance percentages

- **Dashboard**
  - Quick statistics (total employees, present today, absent today)
  - Easy navigation to key features

## Installation & Setup

### Prerequisites
- Python 3.8+
- Django 6.0.3
- pip (Python package manager)

### Steps

1. **Install Django** (if not already installed):
   ```bash
   pip install django
   ```

2. **Navigate to the project directory**:
   ```bash
   cd App
   ```

3. **Create and apply database migrations**:
   ```bash
   python manage.py makemigrations attendance
   python manage.py migrate
   ```

4. **Create a superuser** (admin account):
   ```bash
   python manage.py createsuperuser
   ```
   Follow the prompts to create your admin account.

5. **Run the development server**:
   ```bash
   python manage.py runserver
   ```

6. **Access the application**:
   - Application: http://127.0.0.1:8000/
   - Admin Panel: http://127.0.0.1:8000/admin/

## Application Structure

```
attendance/
├── models.py           # Database models (Employee, Attendance, AttendanceReport)
├── views.py            # View functions for handling requests
├── forms.py            # Django forms for data validation
├── urls.py             # URL routing configuration
├── admin.py            # Django admin configuration
├── apps.py             # App configuration
├── tests.py            # Unit tests
└── templates/          # HTML templates
    ├── base.html       # Base template with navigation
    └── attendance/     # App-specific templates
        ├── dashboard.html
        ├── employee_list.html
        ├── employee_detail.html
        ├── add_employee.html
        ├── edit_employee.html
        ├── mark_attendance.html
        ├── attendance_report.html
        └── attendance_history.html
```

## Database Models

### Employee
Stores employee information:
- `employee_id`: Unique employee ID (format: EMPXXXX)
- `first_name`, `last_name`: Employee name
- `email`: Email address (unique)
- `phone`: Contact number
- `department`: Department (HR, IT, Sales, Marketing, Operations, Finance)
- `position`: Job title
- `date_of_joining`: Joining date
- `is_active`: Employment status

### Attendance
Tracks daily attendance records:
- `employee`: Reference to Employee
- `attendance_date`: Date of attendance
- `status`: Attendance status (Present, Absent, Late, Half Day, On Leave)
- `check_in_time`: Time of arrival (optional)
- `check_out_time`: Time of departure (optional)
- `remarks`: Additional notes

### AttendanceReport
Monthly attendance reports:
- `employee`: Reference to Employee
- `month` & `year`: Report period
- Statistics: present_days, absent_days, late_days, half_days, leave_days
- `attendance_percentage`: Calculated attendance %

## Usage Guide

### Adding Employees
1. Click "Employees" → "Add New Employee"
2. Fill in the employee details
3. Click "Save Employee"

### Marking Attendance
1. Click "Mark Attendance"
2. Select employee and date
3. Choose attendance status
4. Optionally add check-in/check-out times and remarks
5. Click "Save Attendance"

### Viewing Reports
1. Click "Reports"
2. Use filters to narrow down results (optional)
3. View attendance statistics and percentages

### Managing Employees
1. Click "Employees" to view the employee list
2. Use search to find specific employees
3. Click "View" to see detailed attendance history
4. Click "Edit" to modify employee information

## Key Features Details

### Employee ID Validation
Employee IDs must follow the format: **EMPXXXX** (e.g., EMP0001, EMP1234)

### Attendance Status Options
- **PRESENT**: Employee was present on this date
- **ABSENT**: Employee was absent
- **LATE**: Employee arrived late
- **HALF_DAY**: Employee worked half day
- **LEAVE**: Employee was on approved leave

### Department Options
- Human Resources (HR)
- Information Technology (IT)
- Sales
- Marketing
- Operations
- Finance

## Admin Interface

Access the Django admin panel at `/admin/` with your superuser credentials to:
- Manage all data directly
- View and filter records
- Generate bulk operations
- View detailed model information

## Upcoming Features

- Biometric integration for automatic check-in/check-out
- Email notifications for absenteeism
- Holiday management
- Leave request system
- Advanced analytics and charts
- Export to Excel/PDF reports

## Troubleshooting

### Database Errors
If you encounter database errors:
```bash
python manage.py makemigrations
python manage.py migrate
```

### Static files issues
```bash
python manage.py collectstatic
```

### Port already in use
Use a different port:
```bash
python manage.py runserver 8001
```

## Support

For issues or feature requests, please contact the development team.

## License

This project is licensed under the MIT License.
