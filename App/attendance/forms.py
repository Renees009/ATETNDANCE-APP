from django import forms
from .models import Employee, Attendance, AttendanceReport

class EmployeeForm(forms.ModelForm):
    class Meta:
        model = Employee
        fields = ['employee_id', 'first_name', 'last_name', 'email', 'phone', 'department', 'position', 'date_of_joining', 'is_active']
        widgets = {
            'employee_id': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., EMP0001'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'department': forms.Select(attrs={'class': 'form-control'}),
            'position': forms.TextInput(attrs={'class': 'form-control'}),
            'date_of_joining': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }


class AttendanceForm(forms.ModelForm):
    class Meta:
        model = Attendance
        fields = ['employee', 'attendance_date', 'status', 'check_in_time', 'check_out_time', 'remarks']
        widgets = {
            'employee': forms.Select(attrs={'class': 'form-control'}),
            'attendance_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'check_in_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'check_out_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'remarks': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }


class AttendanceFilterForm(forms.Form):
    employee = forms.ModelChoiceField(
        queryset=Employee.objects.all(),
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'}),
        empty_label="All Employees"
    )
    month = forms.IntegerField(
        required=False,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'min': 1, 'max': 12, 'placeholder': 'Month (1-12)'}),
    )
    year = forms.IntegerField(
        required=False,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Year'}),
    )
