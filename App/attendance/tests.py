from django.test import TestCase
from .models import Employee, Attendance
from datetime import date, timedelta

class EmployeeModelTest(TestCase):
    def setUp(self):
        self.employee = Employee.objects.create(
            employee_id='EMP0001',
            first_name='John',
            last_name='Doe',
            email='john@example.com',
            phone='1234567890',
            department='IT',
            position='Software Engineer',
            date_of_joining=date(2023, 1, 15)
        )
    
    def test_employee_creation(self):
        self.assertEqual(self.employee.get_full_name(), 'John Doe')
        self.assertTrue(self.employee.is_active)
    
    def test_employee_str(self):
        self.assertEqual(str(self.employee), 'EMP0001 - John Doe')


class AttendanceModelTest(TestCase):
    def setUp(self):
        self.employee = Employee.objects.create(
            employee_id='EMP0001',
            first_name='John',
            last_name='Doe',
            email='john@example.com',
            phone='1234567890',
            department='IT',
            position='Software Engineer',
            date_of_joining=date(2023, 1, 15)
        )
        self.attendance = Attendance.objects.create(
            employee=self.employee,
            attendance_date=date.today(),
            status='PRESENT'
        )
    
    def test_attendance_creation(self):
        self.assertEqual(self.attendance.employee, self.employee)
        self.assertEqual(self.attendance.status, 'PRESENT')

    def test_cannot_edit_today_record(self):
        # today's record should not be editable by regular user
        self.assertFalse(self.attendance.is_editable())
        # admin user can still edit
        class DummyUser: is_staff = True
        self.assertTrue(self.attendance.is_editable(DummyUser()))

    def test_wfh_converts_to_present(self):
        # create using form save logic without submitting request
        from .forms import AttendanceForm
        data = {
            'employee': self.employee.id,
            'attendance_date': date.today(),
            'status': 'WORKING_LEAVE',
            'remarks': 'Working from home due to internet issue'
        }
        form = AttendanceForm(data=data, user=None)
        self.assertTrue(form.is_valid())
        record = form.save()
        self.assertEqual(record.status, 'PRESENT')
        self.assertIsNotNone(record.check_in_time)

    def test_only_today_allowed(self):
        from .forms import AttendanceForm
        data = {
            'employee': self.employee.id,
            'attendance_date': date.today() - timedelta(days=1),
            'status': 'PRESENT',
        }
        form = AttendanceForm(data=data, user=None)
        self.assertFalse(form.is_valid())
        self.assertIn('attendance_date', form.errors)

    def test_auto_absent_after_5pm(self):
        # start with a fresh employee that has no attendance yet
        from django.test import RequestFactory
        from django.contrib.auth.models import AnonymousUser
        from django.utils import timezone as djtimezone
        from unittest.mock import patch

        # remove any prior record for the employee
        Attendance.objects.filter(employee=self.employee, attendance_date=date.today()).delete()

        factory = RequestFactory()
        request = factory.get('/attendance/mark/')
        request.user = AnonymousUser()

        # patch localtime to be 6pm and localdate to today
        with patch('django.utils.timezone.localtime') as mock_localtime, patch('django.utils.timezone.localdate') as mock_localdate:
            mock_dt = djtimezone.datetime.combine(date.today(), djtimezone.datetime.min.time()).replace(hour=18)
            mock_localtime.return_value = mock_dt
            mock_localdate.return_value = date.today()
            # call the view
            from .views import mark_attendance
            response = mark_attendance(request)
            # after calling, a record for self.employee should exist and be ABSENT
            rec = Attendance.objects.get(employee=self.employee, attendance_date=date.today())
            self.assertEqual(rec.status, 'ABSENT')
