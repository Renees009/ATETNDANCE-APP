"""
Hash Table Utility for Employee Attendance Management
Provides efficient storage and retrieval of attendance records using hash table data structure
"""

from datetime import date, timedelta
from collections import defaultdict
from typing import Dict, List, Optional, Tuple


class AttendanceHashTable:
    
    def __init__(self):
        """Initialize the hash table for attendance records"""
        self._attendance_db = defaultdict(dict)
    
    def mark_attendance(
        self,
        employee_id: str,
        attendance_date: date,
        status: str,
        check_in_time: Optional[str] = None,
        check_out_time: Optional[str] = None,
        absence_reason: Optional[str] = None,
        remarks: Optional[str] = None,
        created_at: Optional[str] = None
    ) -> bool:
        # no longer require a structured absence_reason; remarks may contain info
        # (keep absence_reason arg only for backwards compatibility)
        
        date_key = attendance_date.isoformat()
        
        record = {
            'status': status,
            'check_in_time': check_in_time,
            'check_out_time': check_out_time,
            'absence_reason': absence_reason,
            'remarks': remarks,
            'created_at': created_at,
        }
        
        self._attendance_db[employee_id][date_key] = record
        return True
    
    def get_attendance(
        self,
        employee_id: str,
        attendance_date: Optional[date] = None
    ) -> Dict:
        """
        Get attendance record(s) for an employee.
        
        Args:
            employee_id: Employee ID
            attendance_date: Specific date (optional). If None, returns all records.
            
        Returns:
            dict: Attendance record(s)
        """
        if employee_id not in self._attendance_db:
            return {} if attendance_date else []
        
        if attendance_date:
            date_key = attendance_date.isoformat()
            return self._attendance_db[employee_id].get(date_key, {})
        
        return self._attendance_db[employee_id]
    
    def get_attendance_by_date_range(
        self,
        employee_id: str,
        start_date: date,
        end_date: date
    ) -> List[Tuple[str, Dict]]:
        """
        Get attendance records within a date range.
        
        Args:
            employee_id: Employee ID
            start_date: Start date (inclusive)
            end_date: End date (inclusive)
            
        Returns:
            list: List of (date, record) tuples sorted by date
        """
        if employee_id not in self._attendance_db:
            return []
        
        records = []
        for date_str, record in self._attendance_db[employee_id].items():
            record_date = date.fromisoformat(date_str)
            if start_date <= record_date <= end_date:
                records.append((date_str, record))
        
        return sorted(records, key=lambda x: x[0])
    
    def get_attendance_by_month(
        self,
        employee_id: str,
        month: int,
        year: int
    ) -> List[Tuple[str, Dict]]:
        """
        Get all attendance records for a specific month.
        
        Args:
            employee_id: Employee ID
            month: Month (1-12)
            year: Year
            
        Returns:
            list: List of (date, record) tuples for the month
        """
        from calendar import monthrange
        
        days_in_month = monthrange(year, month)[1]
        start_date = date(year, month, 1)
        end_date = date(year, month, days_in_month)
        
        return self.get_attendance_by_date_range(employee_id, start_date, end_date)
    
    def get_attendance_by_year(
        self,
        employee_id: str,
        year: int
    ) -> List[Tuple[str, Dict]]:
        """
        Get all attendance records for a specific year.
        
        Args:
            employee_id: Employee ID
            year: Year
            
        Returns:
            list: List of (date, record) tuples for the year
        """
        start_date = date(year, 1, 1)
        end_date = date(year, 12, 31)
        
        return self.get_attendance_by_date_range(employee_id, start_date, end_date)
    
    def update_attendance(
        self,
        employee_id: str,
        attendance_date: date,
        **kwargs
    ) -> bool:
        """
        Update an attendance record.
        
        Args:
            employee_id: Employee ID
            attendance_date: Date of attendance
            **kwargs: Fields to update (status, check_in_time, etc.)
            
        Returns:
            bool: True if updated successfully, False if record not found
        """
        date_key = attendance_date.isoformat()
        
        if employee_id not in self._attendance_db or date_key not in self._attendance_db[employee_id]:
            return False
        
        record = self._attendance_db[employee_id][date_key]
        
        # legacy support: no special validation required (remarks hold any detail)
        
        record.update(kwargs)
        return True
    
    def delete_attendance(
        self,
        employee_id: str,
        attendance_date: date
    ) -> bool:
        """
        Delete an attendance record.
        
        Args:
            employee_id: Employee ID
            attendance_date: Date of attendance
            
        Returns:
            bool: True if deleted, False if not found
        """
        date_key = attendance_date.isoformat()
        
        if employee_id not in self._attendance_db:
            return False
        
        if date_key in self._attendance_db[employee_id]:
            del self._attendance_db[employee_id][date_key]
            return True
        
        return False
    
    def get_attendance_summary(
        self,
        employee_id: str,
        month: int,
        year: int
    ) -> Dict:
        """
        Generate attendance summary for a month.
        
        Args:
            employee_id: Employee ID
            month: Month (1-12)
            year: Year
            
        Returns:
            dict: Summary statistics including counts by status
        """
        records = self.get_attendance_by_month(employee_id, month, year)
        
        summary = {
            'total_days': len(records),
            'present': 0,
            'absent': 0,
            'absent_reasons': defaultdict(int),
            'working_leave': 0,
            'nfd': 0,
            'late': 0,
        }
        
        for date_str, record in records:
            status = record.get('status', '')
            
            if status == 'PRESENT':
                summary['present'] += 1
            elif status == 'ABSENT':
                summary['absent'] += 1
                reason = record.get('absence_reason', 'OTHER')
                summary['absent_reasons'][reason] += 1
            elif status == 'WORKING_LEAVE':
                summary['working_leave'] += 1
            elif status == 'NFD':
                summary['nfd'] += 1
            elif status == 'LATE':
                summary['late'] += 1
        
        # Calculate attendance percentage
        if summary['total_days'] > 0:
            working_days = summary['total_days'] - summary['working_leave']
            present_days = summary['present']
            summary['attendance_percentage'] = round(
                (present_days / working_days * 100) if working_days > 0 else 0, 2
            )
        else:
            summary['attendance_percentage'] = 0
        
        return summary
    
    def get_all_employees_attendance(
        self,
        attendance_date: date
    ) -> Dict[str, Dict]:
        """
        Get attendance records for all employees on a specific date.
        
        Args:
            attendance_date: Specific date
            
        Returns:
            dict: Attendance records by employee ID
        """
        date_key = attendance_date.isoformat()
        result = {}
        
        for employee_id, dates in self._attendance_db.items():
            if date_key in dates:
                result[employee_id] = dates[date_key]
        
        return result
    
    def get_employees_by_status(
        self,
        status: str,
        attendance_date: Optional[date] = None
    ) -> Dict[str, Dict]:
        """
        Get all employees with a specific attendance status.
        
        Args:
            status: Attendance status to filter by
            attendance_date: Specific date (optional)
            
        Returns:
            dict: Employees matching the status
        """
        result = {}
        
        for employee_id, dates in self._attendance_db.items():
            if attendance_date:
                date_key = attendance_date.isoformat()
                record = dates.get(date_key, {})
                if record.get('status') == status:
                    result[employee_id] = record
            else:
                # Get latest record for the status
                for date_str, record in sorted(dates.items(), reverse=True):
                    if record.get('status') == status:
                        result[employee_id] = record
                        break
        
        return result
    
    def clear_old_records(self, days_to_keep: int = 365) -> int:
        """
        Remove records older than specified days (for maintenance).
        
        Args:
            days_to_keep: Number of days to keep (default 365)
            
        Returns:
            int: Number of records deleted
        """
        cutoff_date = date.today() - timedelta(days=days_to_keep)
        deleted_count = 0
        
        for employee_id in list(self._attendance_db.keys()):
            dates_to_delete = []
            for date_str in self._attendance_db[employee_id].keys():
                record_date = date.fromisoformat(date_str)
                if record_date < cutoff_date:
                    dates_to_delete.append(date_str)
            
            for date_str in dates_to_delete:
                del self._attendance_db[employee_id][date_str]
                deleted_count += 1
        
        return deleted_count


# Global instance for application-wide use
attendance_hash_table = AttendanceHashTable()
