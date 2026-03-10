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
        # remove the dropdown reason field (we'll reuse remarks for any text explanation)
        fields = ['employee', 'attendance_date', 'status', 'check_in_time', 'check_out_time', 'remarks']
        widgets = {
            'employee': forms.Select(attrs={'class': 'form-control'}),
            'attendance_date': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
            'check_in_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'check_out_time': forms.TimeInput(attrs={'class': 'form-control', 'type': 'time'}),
            'remarks': forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Reason or notes (required for absent or work-from-home)'}),
        }
    
    def __init__(self, *args, user=None, instance=None, **kwargs):
        super().__init__(*args, **kwargs)
        self.user = user
        self.instance_obj = instance
        
        # Ensure the date cannot be changed and defaults to today
        today = timezone.localdate()
        self.fields['attendance_date'].initial = today
        self.fields['attendance_date'].widget.attrs['readonly'] = True
        self.fields['attendance_date'].widget.attrs['disabled'] = True
        self.fields['attendance_date'].required = False  # disable validation, we'll enforce in clean()
        self.fields['attendance_date'].help_text = "Attendance for today only"
        
        # Limit status dropdown to the four required options; NFD is omitted
        if 'status' in self.fields:
            allowed = {'PRESENT', 'ABSENT', 'WORKING_LEAVE', 'LATE'}
            self.fields['status'].choices = [
                (key, label) for key, label in self.fields['status'].choices
                if key in allowed
            ]
        
        # Check if this is an edit and if record is editable
        if instance and instance.pk:
            # Check editing restrictions
            if not instance.is_editable(user):
                editable_status = instance.get_editable_status(user)
                self._mark_fields_readonly(reason=editable_status['reason'])
    
    def _mark_fields_readonly(self, reason: str = ""):
        """Mark all fields as readonly when record cannot be edited"""
        readonly_fields = ['employee', 'attendance_date', 'status', 'check_in_time', 'check_out_time', 'remarks']
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
        
        # Validate: Reason/remarks required for ABSENT or WORKING_LEAVE status
        remarks = cleaned_data.get('remarks')
        if status == 'ABSENT' and not remarks:
            raise ValidationError(
                "A reason must be provided when marking an employee as Absent.",
                code='absent_requires_reason'
            )
        if status == 'WORKING_LEAVE' and not remarks:
            raise ValidationError(
                "Please provide a brief explanation for work-from-home.",
                code='wfh_requires_reason'
            )
        
        # Validate: Check-in and check-out times logic
        check_in = cleaned_data.get('check_in_time')
        check_out = cleaned_data.get('check_out_time')
        
        if check_in and check_out and check_in >= check_out:
            raise ValidationError(
                "Check-out time must be after check-in time.",
                code='invalid_check_times'
            )
        
        # Validate: Check editing restrictions and date constraint
        if self.instance_obj and self.instance_obj.pk:
            if not self.instance_obj.is_editable(self.user):
                raise ValidationError(
                    f"This attendance record cannot be edited. {self.instance_obj.get_editable_status(self.user)['reason']}",
                    code='record_not_editable'
                )
        # ensure attendance_date is today (field is disabled so may not be submitted)
        att_date = cleaned_data.get('attendance_date')
        if not att_date:
            # populate missing value from server date
            att_date = timezone.localdate()
            cleaned_data['attendance_date'] = att_date
        if att_date != timezone.localdate():
            raise ValidationError(
                { 'attendance_date': "Attendance may only be marked for the current day." }
            )
        # ensure no duplicate for same employee
        emp = cleaned_data.get('employee')
        if emp and Attendance.objects.filter(employee=emp, attendance_date=timezone.localdate()).exclude(pk=(self.instance_obj.pk if self.instance_obj else None)).exists():
            raise ValidationError(
                "Attendance has already been submitted for this employee today."
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
        ('WORKING_LEAVE', 'Work From Home'),
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

