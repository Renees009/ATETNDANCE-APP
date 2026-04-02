import React, { useState, useEffect } from "react";

function Dashboard() {
  const [stats, setStats] = useState({
    total_employees: 0,
    present_today: 0,
    absent_today: 0,
    wfh_today: 0,
  });

  const [viewType, setViewType] = useState('day');
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch dashboard data
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard/")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      });
  }, []);

  // Fetch attendance data based on view type
  useEffect(() => {
    if (viewType) {
      setLoading(true);
      const endpoint = viewType === 'day' ? 'api/attendance-by-date/' :
                      viewType === 'month' ? 'api/attendance-by-month/' :
                      'api/attendance-by-year/';
      fetch(`http://127.0.0.1:8000/attendance/${endpoint}`)
        .then(res => res.json())
        .then(data => {
          setAttendanceData(data.records || data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Attendance fetch failed:', err);
          setLoading(false);
        });
    }
  }, [viewType]);

  return (
    <div>

      {/* Stats Cards */}
      <div className="row g-4">
        
        <div className="col-md-3">
          <div className="stat-card text-center">
            <div className="stat-number">{stats.total_employees}</div>
            <div className="stat-label">Total Employees</div>
            <div className="mt-2">
              <a href="/employees" className="btn btn-sm btn-outline-primary">
                View All
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card text-center">
            <div className="stat-number">{stats.present_today}</div>
            <div className="stat-label">Present Today</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card text-center">
            <div className="stat-number">{stats.absent_today}</div>
            <div className="stat-label">Absent Today</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stat-card text-center">
            <div className="stat-number">{stats.wfh_today}</div>
            <div className="stat-label">Work From Home</div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">

            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>

            <div className="card-body">
              <div className="row">

                <div className="col-md-3 mb-2">
                  <a
                    href="/add-employee"
                    className="btn btn-primary w-100"
                  >
                    ➕ Add Employee
                  </a>
                </div>

                <div className="col-md-3 mb-2">
                  <a
                    href="/mark-attendance"
                    className="btn btn-success w-100"
                  >
                    ✓ Mark Attendance
                  </a>
                </div>

                <div className="col-md-3 mb-2">
                  <a
                    href="/attendance-by-month"
                    className="btn btn-info w-100"
                  >
                    🗓️ View By Month
                  </a>
                </div>

                <div className="col-md-3 mb-2">
                  <a
                    href="/attendance-summary"
                    className="btn btn-warning w-100"
                  >
                     Reports
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Attendance View Dropdown + Table */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Attendance View</h5>
              <div className="d-flex gap-2">
                <select 
                  className="form-select form-select-sm" 
                  style={{width: 'auto'}}
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                >
                  <option value="day">By Day</option>
                  <option value="month">By Month</option>
                  <option value="year">By Year</option>
                </select>
              </div>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : attendanceData.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Employee</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Check In</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((record, index) => (
                        <tr key={index}>
                          <td>{record.employee_name || `${record.employee__first_name} ${record.employee__last_name}`}</td>
                          <td>{record.attendance_date}</td>
                          <td>
                            <span className={`badge bg-${record.status === 'PRESENT' ? 'success' : record.status === 'ABSENT' ? 'danger' : 'warning'}`}>
                              {record.status}
                            </span>
                          </td>
                          <td>{record.check_in_time || '--'}</td>
                          <td>{record.remarks || '--'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center p-4 text-muted">
                  No attendance data available for {viewType.toUpperCase()} view
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;