import React, { useState } from "react";

function AttendanceByMonth() {
  const [formData, setFormData] = useState({
    month: "",
    year: "",
    employee: "",
  });

  const [recordsByEmployee, setRecordsByEmployee] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(
      `http://127.0.0.1:8000/api/attendance-by-month/?month=${formData.month}&year=${formData.year}&employee=${formData.employee}`
    )
      .then((res) => res.json())
      .then((data) => {
        setRecordsByEmployee(data.records_by_employee || {});
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
          <h2>View Attendance by Month</h2>
        </div>
      </div>

      {/* Form */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Select Month and Year</h5>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Month</label>
                  <input
                    type="number"
                    name="month"
                    className="form-control"
                    value={formData.month}
                    onChange={handleChange}
                    placeholder="1-12"
                    required
                  />
                </div>

                <div className="col-md-3">
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

                <div className="col-md-3">
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

                <div className="col-md-3" style={{ paddingTop: "32px" }}>
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
      {Object.keys(recordsByEmployee).length > 0 ? (
        <div className="row">
          <div className="col-md-12">
            {Object.entries(recordsByEmployee).map(([empId, data]) => (
              <div className="card mb-4" key={empId}>
                <div className="card-header">
                  <h5 className="mb-0">
                    {data.employee_name} ({data.employee_id}) -{" "}
                    {data.department}
                    <span className="badge bg-secondary float-end">
                      {data.records.length} records
                    </span>
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
                        <th>Absence Reason</th>
                        <th>Remarks</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.records.map((record, index) => (
                        <tr key={index}>
                          <td>{record.attendance_date}</td>
                          <td>{getStatusBadge(record.status)}</td>
                          <td>{record.check_in_time || "--"}</td>
                          <td>{record.check_out_time || "--"}</td>
                          <td>{record.remarks || "--"}</td>
                          <td>{record.remarks || "--"}</td>
                          <td>
                            {record.is_editable && (
                              <a
                                href={`/edit-attendance/${record.id}`}
                                className="btn btn-sm btn-warning"
                              >
                                Edit
                              </a>
                            )}
                          </td>
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
              Select month and year above to view attendance records.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceByMonth;