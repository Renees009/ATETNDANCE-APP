import React, { useState } from "react";

function AttendanceByYear() {
  const [formData, setFormData] = useState({
    year: "",
    employee: "",
  });

  const [recordsByMonth, setRecordsByMonth] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(
      `http://127.0.0.1:8000/api/attendance-by-year/?year=${formData.year}&employee=${formData.employee}`
    )
      .then((res) => res.json())
      .then((data) => {
        setRecordsByMonth(data.records_by_month || {});
      });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PRESENT":
        return <span className="badge bg-success">Present</span>;
      case "ABSENT":
        return <span className="badge bg-danger">Absent</span>;
      case "WORKING_LEAVE":
        return <span className="badge bg-info">Work From Home</span>;
      case "NFD":
        return <span className="badge bg-warning">NFD</span>;
      case "LATE":
        return <span className="badge bg-warning">Late</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Title */}
      <div className="row mb-4">
        <div className="col-md-12">
          <h2>View Attendance by Year</h2>
        </div>
      </div>

      {/* Form */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Select Year</h5>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Year</label>
                  <input
                    type="number"
                    name="year"
                    className="form-control"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="2026"
                    required
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Employee</label>
                  <input
                    type="text"
                    name="employee"
                    className="form-control"
                    value={formData.employee}
                    onChange={handleChange}
                    placeholder="Employee ID"
                  />
                </div>

                <div className="col-md-4" style={{ paddingTop: "32px" }}>
                  <button type="submit" className="btn btn-primary">
                    View Attendance
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Records */}
      {Object.keys(recordsByMonth).length > 0 ? (
        <div className="row">
          <div className="col-md-12">
            {Object.entries(recordsByMonth).map(([month, records]) => (
              <div className="card mb-4" key={month}>
                <div className="card-header">
                  <h5 className="mb-0">
                    {month}
                    <span className="badge bg-secondary float-end">
                      {records.length} records
                    </span>
                  </h5>
                </div>

                <div className="table-responsive">
                  <table className="table table-sm mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Employee</th>
                        <th>Status</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Absence Reason</th>
                      </tr>
                    </thead>

                    <tbody>
                      {records.map((record, index) => (
                        <tr key={index}>
                          <td>{record.attendance_date}</td>
                          <td>{record.employee_name}</td>
                          <td>{getStatusBadge(record.status)}</td>
                          <td>{record.check_in_time || "--"}</td>
                          <td>{record.check_out_time || "--"}</td>
                          <td>{record.remarks || "--"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-12">
            <div className="alert alert-info">
              Select a year above to view attendance records.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceByYear;