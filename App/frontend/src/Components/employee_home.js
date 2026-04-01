import React, { useEffect, useState } from "react";

function EmployeeHome({ employeeId }) {
  const localEmployeeId = localStorage.getItem('selectedEmployeeId') || employeeId;
  if (!employeeId) console.error('NO EMPLOYEE ID PROP! Check routing in App.js');
  const [employee, setEmployee] = useState({});
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);

  useEffect(() => {
    // Fetch employee details
    console.log('🔍 Fetching employee ID:', localEmployeeId);
    fetch(`http://127.0.0.1:8000/attendance/api/employees/${localEmployeeId}/`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const empData = data.employee;
        console.log(' Employee API success:', empData);
        if (empData) {
          setEmployee(empData);
        } else {
          console.warn('No employee data found in response');
        }
      })
      .catch((err) => {
        console.error('❌ Employee API failed:', err);
      });

    // Fetch today's attendance for this employee
    fetch(`http://127.0.0.1:8000/attendance/api/mark-attendance/`)
      .then(res => res.json())
      .then(data => {
        const todayRecords = data.records || [];
        const todayRecord = todayRecords.find(rec => rec.employee_id === employeeId);
        setTodayAttendance(todayRecord);
      });

    // Fetch recent attendance history
    fetch(`http://127.0.0.1:8000/attendance/api/attendance-history/`)
      .then(res => res.json())
      .then(data => {
        const allRecords = data.records || [];
        const recent = allRecords
          .filter(rec => rec.employee__employee_id === employeeId || rec.employee_id === employeeId)
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

  return (
    <div className="container-fluid py-4">
      
      {/* Profile Header */}
      <div className="row mb-5">
        <div className="col-md-12 text-center">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="mb-4">
                <h1 className="display-4 mb-2">
                   Welcome, <span className="text-primary">{employee.first_name || 'NO NAME'} {employee.last_name || ''}</span>
                </h1>
                {/* <p className="lead">
                <span className="badge bg-success fs-5 me-2">{employee.employee_id || employee.id || 'NO ID'}</span>
                  <span className="badge bg-info fs-5">{employee.department || 'NO DEPT'}</span>
                </p> */}
                {/* <div className="alert alert-info mt-3">
                  DEBUG: full employee = <pre>{JSON.stringify(employee, null, 2)}</pre>
                </div> */}
              </div>
              <p className="lead text-muted mb-0">
                Employee ID: <strong>{employee.employee_id}</strong> | 
                Department - {employee.department}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        {/* Today's Status */}
        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0"> Today&apos;s Status</h5>
            </div>
            <div className="card-body text-center py-4">
              {todayAttendance ? (
                <>
                  <div className={`badge fs-3 p-3 mb-3 display-6 shadow ${getStatusBadge(todayAttendance.status)}`}>
                    {todayAttendance.status}
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

        {/* Quick Actions */}
        <div className="col-md-6 mb-4">
          <div className="card h-100 shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0"> Quick Actions</h5>
            </div>
            <div className="card-body d-flex flex-column justify-content-center">
              <a href={`/mark-attendance?employee_id=${employee.employee_id}`} 
                 className="btn btn-success btn-lg w-100 mb-3 shadow-sm">
                <i className="bi bi-check-circle-fill me-2"></i>
                Mark Today&apos;s Attendance
              </a>
              <a href={`/attendance-summary?employee=${employee.id}`} 
                 className="btn btn-primary btn-lg w-100 shadow-sm">
                <i className="bi bi-graph-up me-2"></i>
                View My Reports
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attendance History
      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                 Recent Attendance History
              </h5>
            </div>
            <div className="card-body p-0">
              {recentAttendance.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Check-in Time</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentAttendance.map((rec, index) => (
                        <tr key={index}>
                          <td><strong>{rec.attendance_date}</strong></td>
                          <td>
                            <span className={`badge ${getStatusBadge(rec.status)} px-3 py-2`}>
                              {rec.status}
                            </span>
                          </td>
                          <td>{rec.check_in_time || '--'}</td>
                          <td>{rec.remarks ? rec.remarks.substring(0, 30) + '...' : 'None'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x fs-1 text-muted mb-3"></i>
                  <p className="text-muted">No attendance records found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div> */}

    </div>
  );
}

export default EmployeeHome;

