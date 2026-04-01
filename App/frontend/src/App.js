import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

import MainLayout from './Components/base';
import Login from './Components/login';
import Dashboard from './Components/dashboard';
import EmployeeList from './Components/employee_list';
import AddEmployee from './Components/add_employee';
import EmployeeDetail from './Components/employee_detail';
import EditEmployee from './Components/edit_employee';
import MarkAttendance from './Components/mark_attendance';
import EditAttendance from './Components/edit_attendance';
import AdminOverrideEdit from './Components/admin_override_edit';
import AttendanceByDate from './Components/attendance_by_date';
import AttendanceByMonth from './Components/attendance_by_month';
import AttendanceByYear from './Components/attendance_by_year';
import AttendanceHistory from './Components/attendance_history';
import AttendanceSummary from './Components/attendance_summary';
import AttendanceReport from './Components/attendance_report';
import ChooseEmployee from './Components/choose_employee';
import EmployeeHome from './Components/employee_home';

function App() {
  // Simple mock auth check
  const isAuthenticated = localStorage.getItem('authToken') !== null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
        <Route path="/employees" element={<MainLayout><EmployeeList /></MainLayout>} />
        <Route path="/add-employee" element={<MainLayout><AddEmployee /></MainLayout>} />
        <Route path="/employees/:employeeId" element={<MainLayout><EmployeeDetail /></MainLayout>} />
        <Route path="/employees/:employeeId/edit" element={<MainLayout><EditEmployee /></MainLayout>} />
        <Route path="/mark-attendance" element={<MainLayout isEmployeePortal={true}><MarkAttendance /></MainLayout>} />
        <Route path="/attendance/:attendanceId/edit" element={<MainLayout><EditAttendance /></MainLayout>} />
        <Route path="/attendance/:attendanceId/admin-edit" element={<MainLayout><AdminOverrideEdit /></MainLayout>} />
        <Route path="/attendance-by-date" element={<MainLayout><AttendanceByDate /></MainLayout>} />
        <Route path="/attendance-by-month" element={<MainLayout><AttendanceByMonth /></MainLayout>} />
        <Route path="/attendance-by-year" element={<MainLayout><AttendanceByYear /></MainLayout>} />
        <Route path="/attendance-history" element={<MainLayout><AttendanceHistory /></MainLayout>} />
        <Route path="/attendance-summary" element={<MainLayout isEmployeePortal={true}><AttendanceSummary /></MainLayout>} />
        <Route path="/attendance-report" element={<MainLayout><AttendanceReport /></MainLayout>} />
        <Route path="/employees/choose" element={<ChooseEmployee />} />
        <Route path="/employee-home/:employeeId" element={<EmployeeHome />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
