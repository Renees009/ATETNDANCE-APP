# Attendance Report Page Enhancement - TODO

## Plan
1. **Backend (`views.py`)**: Create `attendance_reports_api` view that aggregates attendance summary and includes nested individual attendance records.
2. **Backend (`urls.py`)**: Add missing `api/attendance-reports/` route.
3. **Frontend (`attendance_report.js`)**: Fix API URL, add loading/error states, expandable detail rows, and progress bar.

## Progress
- [x] Step 1: Add `attendance_reports_api` to `App/attendance/views.py`
- [x] Step 2: Add URL route to `App/attendance/urls.py`
- [x] Step 3: Update `App/frontend/src/Components/attendance_report.js`
- [x] Step 4: Test integration

