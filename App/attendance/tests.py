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
        # create record simulating a work-from-home entry; form logic should
        # translate it the same way as before
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

    def test_check_in_time_auto_and_readonly(self):
        """New attendance forms should show and lock the current time.
        Submitting without providing a value still results in a timestamp.
        """
        from .forms import AttendanceForm
        from django.utils import timezone

        # fresh empty form should have field disabled and with an initial value
        form = AttendanceForm(user=None)
        self.assertTrue(form.fields['check_in_time'].widget.attrs.get('disabled'))
        self.assertIsNotNone(form.fields['check_in_time'].initial)
        self.assertIsInstance(form.fields['check_in_time'].initial, timezone.datetime.time)

        # simulate submission where check_in_time is omitted (disabled inputs are not sent)
        data = {
            'employee': self.employee.id,
            'attendance_date': date.today(),
            'status': 'PRESENT',
        }
        form2 = AttendanceForm(data=data, user=None)
        self.assertTrue(form2.is_valid())
        record = form2.save()
        # the record should have been stamped with the current time
        self.assertIsNotNone(record.check_in_time)
        self.assertIsInstance(record.check_in_time, timezone.datetime.time)
        # value should be within a few minutes of now
        now = timezone.localtime().time()
        delta = (timezone.datetime.combine(timezone.localdate(), now) -
                 timezone.datetime.combine(timezone.localdate(), record.check_in_time)).seconds
        self.assertLess(delta, 300)  # within 5 minutes

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

    def test_choose_employee_and_override(self):
        # posting to choose_employee should redirect to the portal
        from django.urls import reverse
        resp = self.client.post(reverse('attendance:choose_employee'), {'employee': self.employee.employee_id})
        self.assertRedirects(resp, reverse('attendance:employee_home', args=[self.employee.employee_id]))

        # accessing mark_attendance with override should lock employee field
        resp2 = self.client.get(reverse('attendance:mark_attendance') + f'?employee_id={self.employee.employee_id}')
        self.assertContains(resp2, 'Recording attendance for')
        self.assertContains(resp2, self.employee.get_full_name())
