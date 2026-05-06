import React, { useState, useEffect } from "react";
import api from "../api.js";

function Dashboard() {
  const [stats, setStats] = useState({
    total_employees: 0,
    present_today: 0,
    absent_today: 0,
    wfh_today: 0,
  });

  const [viewType, setViewType] = useState("day");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // ✅ Fetch Dashboard Stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        const data = await api.getDashboard();
        setStats(data);
      } catch (error) {
        console.error("Dashboard stats fetch failed:", error);
        setStatsError(error.message);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, []);

  // ✅ Fetch Attendance Data
  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);

        const endpoint =
          viewType === "day"
            ? "attendance-by-date/"
            : viewType === "month"
            ? "attendance-by-month/"
            : "attendance-by-year/";

        const res = await fetch(
          `http://127.0.0.1:8000/attendance/api/${endpoint}`
        );

        if (!res.ok) throw new Error("Attendance fetch failed");

        const data = await res.json();

        setAttendanceData(data.records || data || []);
      } catch (err) {
        console.error("Attendance fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [viewType]);

  return (
    <>
      {/* Stats Cards */}
      <div className="row g-4">
        {statsLoading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Loading dashboard stats...</p>
          </div>
        ) : statsError ? (
          <div className="col-12">
            <div className="alert alert-warning">
              <h6>Stats unavailable</h6>
              <p>{statsError}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <div className="stat-number text-primary">
                    {stats.total_employees}
                  </div>
                  <div className="stat-label text-muted">
                    Total Employees
                  </div>
                  <a href="/employees" className="btn btn-sm btn-outline-primary mt-2">
                    View All
                  </a>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <div className="stat-number text-success">
                    {stats.present_today}
                  </div>
                  <div className="stat-label text-muted">
                    Present Today
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <div className="stat-number text-danger">
                    {stats.absent_today}
                  </div>
                  <div className="stat-label text-muted">
                    Absent Today
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <div className="stat-number text-info">
                    {stats.wfh_today}
                  </div>
                  <div className="stat-label text-muted">
                    Work From Home
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="row mt-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Quick Actions</h5>
            </div>

            <div className="card-body d-flex justify-content-center">
              <div className="row g-4 w-75 justify-content-center">

                <div className="col-md-4">
                  <a href="/add-employee" className="btn btn-primary w-100">
                    ➕ Add Employee
                  </a>
                </div>

                <div className="col-md-4">
                  <a href="/attendance-history" className="btn btn-info w-100">
                    View Attendance
                  </a>
                </div>

                <div className="col-md-4">
                  <a href="/attendance-report" className="btn btn-warning w-100">
                    Reports
                  </a>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;