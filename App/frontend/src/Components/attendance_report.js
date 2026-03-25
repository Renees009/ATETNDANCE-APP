import React, { useState } from "react";

function AttendanceReports() {
  const [filters, setFilters] = useState({
    employee: "",
    month: "",
    year: "",
  });

  const [reports, setReports] = useState([]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const query = `employee=${filters.employee}&month=${filters.month}&year=${filters.year}`;

    fetch(`http://127.0.0.1:8000/api/attendance-reports/?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setReports(data.reports || []);
      });
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return "text-success";
    if (percentage >= 75) return "text-warning";
    return "text-danger";
  };

  return (
    <div>
      {/* Title */}
      <div className="row mb-4">
        <div className="col-md-12">
          <h2>Attendance Reports</h2>
        </div>
      </div>

      {/* Filter Section */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Filter Reports</h5>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit} className="row g-3">

                <div className="col-md-4">
                  <label className="form-label">Employee</label>
                  <input
                    type="text"
                    name="employee"
                    className="form-control"
                    value={filters.employee}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4">
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

                <div className="col-md-4">
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

                <div className="col-12">
                  <button type="submit" className="btn btn-primary">
                    Filter
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                Reports ({reports.length})
              </h5>
            </div>

            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Employee</th>
                    <th>Period</th>
                    <th>Total Days</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Late</th>
                    <th>Half Day</th>
                    <th>Leave</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>

                <tbody>
                  {reports.length > 0 ? (
                    reports.map((report, index) => (
                      <tr key={index}>
                        <td>
                          <strong>{report.employee_name}</strong>
                        </td>

                        <td>
                          {report.month}/{report.year}
                        </td>

                        <td>{report.total_days}</td>

                        <td>
                          <span className="badge bg-success">
                            {report.present_days}
                          </span>
                        </td>

                        <td>
                          <span className="badge bg-danger">
                            {report.absent_days}
                          </span>
                        </td>

                        <td>
                          <span className="badge bg-warning">
                            {report.late_days}
                          </span>
                        </td>

                        <td>
                          <span className="badge bg-info">
                            {report.half_days}
                          </span>
                        </td>

                        <td>
                          <span className="badge bg-secondary">
                            {report.leave_days}
                          </span>
                        </td>

                        <td>
                          <strong className={getPercentageColor(report.attendance_percentage)}>
                            {report.attendance_percentage}%
                          </strong>
                        </td>

                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4">
                        No reports found.
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

export default AttendanceReports;