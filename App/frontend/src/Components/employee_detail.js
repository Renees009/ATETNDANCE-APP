import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function EmployeeDetail() {
  const { employeeId } = useParams();
  const [employee, setEmployee] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch employee details and attendance records from single API
    fetch(`http://127.0.0.1:8000/attendance/api/employees/${employeeId}/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch employee details");
        }
        return res.json();
      })
      .then((data) => {
        setEmployee(data.employee || {});
        setAttendanceRecords(data.attendance_records || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [employeeId]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PRESENT":
        return <span className="badge bg-success">Present</span>;
      case "ABSENT":
        return <span className="badge bg-danger">Absent</span>;
      case "LATE":
        return <span className="badge bg-warning">Late</span>;
      case "HALF_DAY":
        return <span className="badge bg-info">Half Day</span>;
      case "LEAVE":
        return <span className="badge bg-secondary">Leave</span>;
      default:
        return <span className="badge bg-light">--</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Error: {error}
      </div>
    );
  }

  return (
    <div>

      {/* Title */}
      <div className="row mb-4">
        <div className="col-md-12">
          <h2>
            {employee.first_name} {employee.last_name}
          </h2>
        </div>
      </div>

      <div className="row">

        {/* Employee Info */}
        <div className="col-md-6">
          <div className="card">

            <div className="card-header">
              <h5 className="mb-0">Employee Information</h5>
            </div>

            <div className="card-body">
              <p><strong>Employee ID:</strong> {employee.employee_id}</p>
              <p><strong>Email:</strong> {employee.email}</p>
              <p><strong>Phone:</strong> {employee.phone}</p>
              <p><strong>Department:</strong> {employee.department}</p>
              <p><strong>Position:</strong> {employee.position}</p>
              <p>
                <strong>Date of Joining:</strong>{" "}
                {employee.date_of_joining}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {employee.is_active ? (
                  <span className="badge bg-success">Active</span>
                ) : (
                  <span className="badge bg-danger">Inactive</span>
                )}
              </p>

              <a
                href={`/employees/${employee.employee_id}/edit`}
                className="btn btn-warning"
              >
                Edit
              </a>
            </div>

          </div>
        </div>

        {/* Attendance Table */}
        <div className="col-md-6">
          <div className="card">

            <div className="card-header">
              <h5 className="mb-0">
                Recent Attendance (Last 30 Days)
              </h5>
            </div>

            <div className="table-responsive">
              <table className="table table-sm mb-0">

                <thead className="table-light">
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                  </tr>
                </thead>

                <tbody>
                  {attendanceRecords.length > 0 ? (
                    attendanceRecords.map((record, index) => (
                      <tr key={index}>
                        <td>{record.attendance_date}</td>
                        <td>{getStatusBadge(record.status)}</td>
                        <td>{record.check_in_time || "--"}</td>
                        <td>{record.check_out_time || "--"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-3">
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}

export default EmployeeDetail;