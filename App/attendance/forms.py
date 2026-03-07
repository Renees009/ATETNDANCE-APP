from django import forms
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
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
    """Form for marking and editing attendance with validation"""
    
    class Meta:
        model = Attendance
        fields = ['employee', 'attendance_date', 'status', 'check_in_time', 'check_out_time', 'absence_reason', 'remarks']
        widgets = {
            'employee': forms.Select(attrs={'class': 'form-control'}),
            'attendance_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'check_in_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'check_out_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'absence_reason': forms.Select(attrs={'class': 'form-control'}),
            'remarks': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }
    
    def __init__(self, *args, user=None, instance=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user
        self.instance_obj = instance
        
        # Make absence_reason optional initially, will be validated in clean()
        self.fields['absence_reason'].required = False
        self.fields['absence_reason'].label = "Reason (Required if Absent)"
        
        # Check if this is an edit and if record is editable
        if instance and instance.pk:
            # Check editing restrictions
            if not instance.is_editable(user):
                editable_status = instance.get_editable_status(user)
                self._mark_fields_readonly(reason=editable_status['reason'])
    
    def _mark_fields_readonly(self, reason: str = ""):
        """Mark all fields as readonly when record cannot be edited"""
        readonly_fields = ['employee', 'attendance_date', 'status', 'check_in_time', 'check_out_time', 'absence_reason', 'remarks']
        for field_name in readonly_fields:
            if field_name in self.fields:
                self.fields[field_name].widget.attrs['readonly'] = True
                self.fields[field_name].widget.attrs['disabled'] = True
        
        # Store the reason for use in form display
        self.readonly_reason = reason
    
    def clean(self):
        """Validate form data"""
        cleaned_data = super().clean()
        status = cleaned_data.get('status')
        absence_reason = cleaned_data.get('absence_reason')
        
        # Validate: Absence reason is mandatory for ABSENT status
        if status == 'ABSENT' and not absence_reason:
            raise ValidationError(
                "Absence reason is mandatory when marking an employee as Absent.",
                code='absent_requires_reason'
            )
        
        # Validate: Check-in and check-out times logic
        check_in = cleaned_data.get('check_in_time')
        check_out = cleaned_data.get('check_out_time')
        
        if check_in and check_out and check_in >= check_out:
            raise ValidationError(
                "Check-out time must be after check-in time.",
                code='invalid_check_times'
            )
        
        # Validate: Check editing restrictions
        if self.instance_obj and self.instance_obj.pk:
            if not self.instance_obj.is_editable(self.user):
                raise ValidationError(
                    f"This attendance record cannot be edited. {self.instance_obj.get_editable_status(self.user)['reason']}",
                    code='record_not_editable'
                )
        
        return cleaned_data


class AttendanceFilterForm(forms.Form):
    """Form for filtering attendance records"""
    
    MONTH_CHOICES = [
        ('', 'All Months'),
        (1, 'January'),
        (2, 'February'),
        (3, 'March'),
        (4, 'April'),
        (5, 'May'),
        (6, 'June'),
        (7, 'July'),
        (8, 'August'),
        (9, 'September'),
        (10, 'October'),
        (11, 'November'),
        (12, 'December'),
    ]
    
    STATUS_CHOICES = [
        ('', 'All Statuses'),
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('WORKING_LEAVE', 'Working Leave'),
        ('NFD', 'No Full Day / Half Day'),
        ('LATE', 'Late'),
    ]
    
    employee = forms.ModelChoiceField(
        queryset=Employee.objects.all(),
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'}),
        empty_label="All Employees"
    )
    
    month = forms.ChoiceField(
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'}),
        choices=MONTH_CHOICES
    )
    
    year = forms.IntegerField(
        required=False,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Year'}),
    )
    
    status = forms.ChoiceField(
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'}),
        choices=STATUS_CHOICES
    )
    
    from_date = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        label="From Date"
    )
    
    to_date = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
        label="To Date"
    )
    
    def clean(self):
        """Validate filter inputs"""
        cleaned_data = super().clean()
        from_date = cleaned_data.get('from_date')
        to_date = cleaned_data.get('to_date')
        
        if from_date and to_date and from_date > to_date:
            raise ValidationError(
                "From Date must be before To Date.",
                code='invalid_date_range'
            )
        
        return cleaned_data


class AttendanceSummaryFilterForm(forms.Form):
    """Form for filtering attendance summary reports"""
    
    MONTH_CHOICES = [
        (1, 'January'), (2, 'February'), (3, 'March'), (4, 'April'),
        (5, 'May'), (6, 'June'), (7, 'July'), (8, 'August'),
        (9, 'September'), (10, 'October'), (11, 'November'), (12, 'December'),
    ]
    
    employee = forms.ModelChoiceField(
        queryset=Employee.objects.all(),
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'}),
        empty_label="All Employees"
    )
    
    month = forms.ChoiceField(
        required=False,
        widget=forms.Select(attrs={'class': 'form-control'}),
        choices=MONTH_CHOICES
    )
    
    year = forms.IntegerField(
        required=False,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Year'}),
    )
    
    def clean(self):
        """Validate summary filter inputs"""
        cleaned_data = super().clean()
        return cleaned_data

