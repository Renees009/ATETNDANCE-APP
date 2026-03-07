from django.test import TestCase
from .models import Employee, Attendance
from datetime import date

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
