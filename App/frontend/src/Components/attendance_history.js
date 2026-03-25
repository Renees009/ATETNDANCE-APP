import React, { useState } from "react";

function AttendanceHistory() {
  const [filters, setFilters] = useState({
    employee: "",
    status: "",
    month: "",
    year: "",
  });

  const [records, setRecords] = useState([]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const query = `employee=${filters.employee}&status=${filters.status}&month=${filters.month}&year=${filters.year}`;

    fetch(`http://127.0.0.1:8000/api/attendance-history/?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setRecords(data.records || []);
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

  const truncateText = (text, words = 3) => {
    if (!text) return "--";
    const split = text.split(" ");
    return split.length > words
      ? split.slice(0, words).join(" ") + "..."
      : text;
  };

  return (
    <div>
      {/* Title */}
      <div className="row mb-4">
        <div className="col-md-12">
          <h2>Attendance History</h2>
        </div>
      </div>

      {/* Filter Card */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Advanced Filtering</h5>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  
                  <div className="col-md-2">
                    <label className="form-label">Employee</label>
                    <input
                      type="text"
                      name="employee"
                      className="form-control"
                      value={filters.employee}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Status</label>
                    <select
                      name="status"
                      className="form-control"
                      value={filters.status}
                      onChange={handleChange}
                    >
                      <option value="">All</option>
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                      <option value="WORKING_LEAVE">Work From Home</option>
                      <option value="NFD">NFD</option>
                      <option value="LATE">Late</option>
                    </select>
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Month</label>
                    <input
                      type="number"
                      name="month"
                      className="form-control"
                      value={filters.month}
                      onChange={handleChange}
                      placeholder="1-12"
                    />
                  </div>

                  <div className="col-md-2">
                    <label className="form-label">Year</label>
                    <input
                      type="number"
                      name="year"
                      className="form-control"
                      value={filters.year}
                      onChange={handleChange}
                      placeholder="2026"
                    />
                  </div>

                  <div className="col-md-4">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ marginTop: "32px" }}
                    >
                      Filter
                    </button>
                  </div>

                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                Attendance Records ({records.length})
              </h5>
            </div>

            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Reason</th>
                    <th>Remarks</th>
                    <th>Editability</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {records.length > 0 ? (
                    records.map((record, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{record.employee_name}</strong>
                        </td>
                        <td>{record.attendance_date}</td>
                        <td>{getStatusBadge(record.status)}</td>
                        <td>{record.check_in_time || "--"}</td>
                        <td>{record.check_out_time || "--"}</td>
                        <td>{record.remarks || "--"}</td>
                        <td>{truncateText(record.remarks)}</td>

                        <td>
                          {record.is_editable ? (
                            <span className="badge bg-success">
                              Editable
                            </span>
                          ) : (
                            <span className="badge bg-secondary">
                              Read-only
                            </span>
                          )}
                        </td>

                        <td>
                          {record.is_editable ? (
                            <a
                              href={`/edit-attendance/${record.id}`}
                              className="btn btn-sm btn-warning"
                            >
                              Edit
                            </a>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
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

export default AttendanceHistory;