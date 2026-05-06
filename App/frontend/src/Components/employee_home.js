import React, { useEffect, useState } from "react";

function EmployeeHome({ employeeId }) {
  const [localEmployeeId, setLocalEmployeeId] = useState(
    localStorage.getItem("selectedEmployeeId") || employeeId
  );

  const [employee, setEmployee] = useState({});
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localEmployeeId) {
      console.error("❌ No Employee ID found!");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        // ✅ Employee API
        const empRes = await fetch(
          `http://127.0.0.1:8000/attendance/api/employees/${localEmployeeId}/`
        );
        if (!empRes.ok) throw new Error("Employee fetch failed");
        const empData = await empRes.json();
        if (empData.employee) setEmployee(empData.employee);

        // ✅ Today Attendance API (Make sure this exists in backend)
        const todayRes = await fetch(
          `http://127.0.0.1:8000/attendance/api/today-attendance/`
        );
        if (!todayRes.ok) throw new Error("Today attendance failed");
        const todayData = await todayRes.json();

        const todayRecord = (todayData.records || []).find(
          (rec) =>
            String(rec.employee_id) === String(localEmployeeId)
        );

        setTodayAttendance(todayRecord || null);

        // ✅ Attendance History
        const historyRes = await fetch(
          `http://127.0.0.1:8000/attendance/api/attendance-history/`
        );
        if (!historyRes.ok) throw new Error("History fetch failed");
        const historyData = await historyRes.json();

        const recent = (historyData.records || [])
          .filter(
            (rec) =>
              String(rec.employee__employee_id) ===
                String(localEmployeeId) ||
              String(rec.employee_id) === String(localEmployeeId)
          )
          .slice(0, 7);

        setRecentAttendance(recent);
      } catch (error) {
        console.error("❌ API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [localEmployeeId]);

  // ✅ Badge styles
  const getStatusBadge = (status) => {
    const badges = {
      PRESENT: "bg-success",
      ABSENT: "bg-danger",
      LATE: "bg-warning",
      WORKING_LEAVE: "bg-info",
      NFD: "bg-warning",
    };
    return badges[status] || "bg-secondary";
  };

  // ✅ Status text
  const getStatusDisplay = (status) => {
    const statusMap = {
      PRESENT: "Present",
      ABSENT: "Absent",
      LATE: "Late",
      WORKING_LEAVE: "Work From Home",
      NFD: "Half Day",
    };
    return statusMap[status] || status;
  };

  // ✅ Loading UI
  if (loading) {
    return (
      <div className="text-center mt-5">
        <h5>Loading dashboard...</h5>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="page-container">

        {/* HEADER */}
        <div className="d-flex justify-content-between mb-4">
          <div>
            <h2 className="fw-bold">Employee Dashboard</h2>
            <p className="text-muted">
              Overview of your attendance and activity
            </p>
          </div>
          <div className="text-muted small">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* PROFILE */}
        <div className="card shadow-sm rounded-4 mb-4 p-4">
          <div className="row align-items-center">
            <div className="col-md-2 text-center">
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
              <h4 className="fw-bold">
                {employee.first_name || "No Name"}{" "}
                {employee.last_name || ""}
              </h4>

              <div className="row">
                <div className="col-md-4">
                  <p>
                    <strong>ID:</strong>{" "}
                    {employee.employee_id || "--"}
                  </p>
                </div>

                <div className="col-md-4">
                  <p>
                    <strong>Department:</strong>{" "}
                    {employee.department || "--"}
                  </p>
                </div>

                <div className="col-md-4">
                  <p>
                    <strong>Status:</strong>{" "}
                    <span className="badge bg-success">
                      Active
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TODAY + ACTIONS */}
        <div className="row">

          {/* TODAY STATUS */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-light">
                <h5 className="text-primary mb-0">
                  Today's Status
                </h5>
              </div>

              <div className="card-body text-center">
                {todayAttendance ? (
                  <>
                    <div
                      className={`badge fs-4 p-3 mb-3 ${getStatusBadge(
                        todayAttendance.status
                      )}`}
                    >
                      {getStatusDisplay(todayAttendance.status)}
                    </div>

                    <p>
                      <strong>Check-in:</strong>{" "}
                      {todayAttendance.check_in_time ||
                        "--:--"}
                    </p>

                    <p className="text-muted">
                      <strong>Remarks:</strong>{" "}
                      {todayAttendance.remarks || "None"}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="badge bg-secondary fs-4 p-3 mb-3">
                      Not Marked
                    </div>
                    <p className="text-muted">
                      Mark your attendance today!
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="col-md-6 mb-4">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-light">
                <h5 className="text-success mb-0">
                  Quick Actions
                </h5>
              </div>

              <div className="card-body d-flex flex-column justify-content-center">
                {todayAttendance ? (
                  <>
                    <div className="alert alert-success">
                      ✓ Attendance Marked
                    </div>

                    <a
                      href={`/mark-attendance?employee_id=${employee.employee_id}`}
                      className="btn btn-outline-primary mb-3"
                    >
                      View Attendance
                    </a>
                  </>
                ) : (
                  <a
                    href={`/mark-attendance?employee_id=${employee.employee_id}`}
                    className="btn btn-success mb-3"
                  >
                    Mark Attendance
                  </a>
                )}

                <a
                  href={`/attendance-summary?employee=${employee.id}`}
                  className="btn btn-outline-secondary"
                >
                  View Reports
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* RECENT ATTENDANCE */}
        <div className="card shadow-sm p-3">
          <h5 className="mb-3">Recent Attendance</h5>

          {recentAttendance.length === 0 ? (
            <p className="text-muted">No records found</p>
          ) : (
            <ul className="list-group">
              {recentAttendance.map((rec, index) => (
                <li
                  key={index}
                  className="list-group-item d-flex justify-content-between"
                >
                  <span>{rec.date}</span>
                  <span
                    className={`badge ${getStatusBadge(
                      rec.status
                    )}`}
                  >
                    {getStatusDisplay(rec.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}

export default EmployeeHome;