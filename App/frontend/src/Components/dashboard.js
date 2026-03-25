import React, { useState, useEffect } from "react";

function Dashboard() {
  const [stats, setStats] = useState({
    total_employees: 0,
    present_today: 0,
    absent_today: 0,
    wfh_today: 0,
  });

  // Fetch dashboard data
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/dashboard/")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      });
  }, []);

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

    </div>
  );
}

export default Dashboard;