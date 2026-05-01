import React, { useEffect, useState } from "react";

function EmployeeHome({ employeeId }) {
  const localEmployeeId = localStorage.getItem('selectedEmployeeId') || employeeId;
  if (!employeeId) console.error('NO EMPLOYEE ID PROP! Check routing in App.js');
  const [employee, setEmployee] = useState({});
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);

  useEffect(() => {
    console.log('🔍 Fetching employee ID:', localEmployeeId);
    fetch(`http://127.0.0.1:8000/attendance/api/employees/${localEmployeeId}/`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const empData = data.employee;
        if (empData) setEmployee(empData);
      })
      .catch((err) => console.error(' Employee API failed:', err));

    fetch(`http://127.0.0.1:8000/attendance/api/mark-attendance/`)
      .then(res => res.json())
      .then(data => {
        const todayRecord = (data.records || []).find(
          rec => String(rec.employee_id) === String(localEmployeeId)
        );
        setTodayAttendance(todayRecord);
      });

    fetch(`http://127.0.0.1:8000/attendance/api/attendance-history/`)
      .then(res => res.json())
      .then(data => {
        const recent = (data.records || [])
          .filter(rec =>
            rec.employee__employee_id === localEmployeeId ||
            rec.employee_id === localEmployeeId
          )
          .slice(0, 7);
        setRecentAttendance(recent);
      });
  }, [localEmployeeId]);

  const getStatusBadge = (status) => {
    const badges = {
      'PRESENT': 'bg-success',
      'ABSENT': 'bg-danger',
      'LATE': 'bg-warning',
      'WORKING_LEAVE': 'bg-info',
      'NFD': 'bg-warning'
    };
    return badges[status] || 'bg-secondary';
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'PRESENT': 'Present',
      'ABSENT': 'Absent',
      'LATE': 'Late',
      'WORKING_LEAVE': 'Work From Home',
      'NFD': 'Half Day'
    };
    return statusMap[status] || status;
  };

  return (
    <div 
      className="container-fluid py-4"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e3c72, #2a5298)"
      }}
    >

      {/* 🔷 PROFILE BOX */}
      <div className="row mb-5">
        <div className="col-md-12">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body">
              <div className="row align-items-center">

                <div className="col-md-2 text-center mb-3">
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto"
                    style={{ width: "80px", height: "80px", fontSize: "28px" }}
                  >
                    {employee.first_name
                      ? employee.first_name.charAt(0)
                      : "E"}
                  </div>
                </div>

                <div className="col-md-10">
                  <h4 className="fw-bold mb-2">
                    {employee.first_name || "No Name"} {employee.last_name || ""}
                  </h4>

                  <div className="row">
                    <div className="col-md-4">
                      <p className="mb-1">
                        <strong>ID:</strong> {employee.employee_id || "--"}
                      </p>
                    </div>

                    <div className="col-md-4">
                      <p className="mb-1">
                        <strong>Department:</strong> {employee.department || "--"}
                      </p>
                    </div>

                    <div className="col-md-4">
                      <p className="mb-1">
                        <strong>Status:</strong>{" "}
                        <span className="badge bg-success">Active</span>
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      

      {/* ================= TODAY'S STATUS ================= */}

      <div className="row mb-4">
        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0"> Today&apos;s Status</h5>
            </div>
            <div className="card-body text-center py-4">
              {todayAttendance ? (
                <>
                  <div className={`badge fs-3 p-3 mb-3 display-6 shadow ${getStatusBadge(todayAttendance.status)}`}>
                    {getStatusDisplay(todayAttendance.status)}
                  </div>
                  <p className="mb-2">
                    <strong>Check-in:</strong> {todayAttendance.check_in_time || '--:--'}
                  </p>
                  <p className="mb-0 text-muted small">
                    <strong>Remarks:</strong> {todayAttendance.remarks || 'None'}
                  </p>
                </>
              ) : (
                <>
                  <div className="badge bg-secondary fs-3 p-3 mb-3 display-6 shadow">
                    Not Marked
                  </div>
                  <p className="text-muted mb-0">Mark your attendance for today!</p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0"> Quick Actions</h5>
            </div>
            <div className="card-body d-flex flex-column justify-content-center">
              {todayAttendance ? (
                <>
                  <div className="alert alert-success mb-3">
                    <strong>✓ Attendance Marked for Today</strong>
                  </div>
                  <a href={`/mark-attendance?employee_id=${employee.employee_id}`} 
                     className="btn btn-primary btn-lg w-100 shadow-sm">
                    View Attendance
                  </a>
                </>
              ) : (
                <a href={`/mark-attendance?employee_id=${employee.employee_id}`} 
                   className="btn btn-success btn-lg w-100 mb-3 shadow-sm">
                  Mark Today's Attendance
                </a>
              )}
              <a href={`/attendance-summary?employee=${employee.id}`} 
                 className="btn btn-primary btn-lg w-100 shadow-sm">
                View My Reports
              </a>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default EmployeeHome;