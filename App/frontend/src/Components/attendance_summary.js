import React, { useState } from "react";

function AttendanceSummary() {
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    employee: "",
  });

  const [summaries, setSummaries] = useState([]);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const query = `month=${filters.month}&year=${filters.year}&employee=${filters.employee}`;

    fetch(`http://127.0.0.1:8000/api/attendance-summary/?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setSummaries(data.summaries || []);
      });
  };

  const getProgressBarClass = (percentage) => {
    if (percentage >= 90) return "bg-success";
    if (percentage >= 75) return "bg-warning";
    return "bg-danger";
  };

  return (
    <div>
      {/* Title */}
      <div className="row mb-4">
        <div className="col-md-12">
          <h2>📊 Attendance Summary Report</h2>
        </div>
      </div>

      {/* Filter Section */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Filter Summary</h5>
            </div>

            <div className="card-body">
              <form onSubmit={handleSubmit} className="row g-3">

                <div className="col-md-3">
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

                <div className="col-md-3">
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

                <div className="col-md-3">
                  <label className="form-label">Employee</label>
                  <input
                    type="text"
                    name="employee"
                    className="form-control"
                    value={filters.employee}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-3" style={{ paddingTop: "32px" }}>
                  <button type="submit" className="btn btn-primary">
                    Generate Report
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summaries.length > 0 ? (
        <div className="row">
          {summaries.map((summary, index) => (
            <div className="col-md-6 mb-4" key={index}>
              <div className="card">

                {/* Header */}
                <div
                  className="card-header"
                  style={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  }}
                >
                  <h5 className="mb-0 text-white">
                    {summary.employee_name}
                    <span className="float-end" style={{ fontSize: "0.8em" }}>
                      {summary.month}-{summary.year}
                    </span>
                  </h5>
                </div>

                <div className="card-body">

                  {/* Employee Info */}
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <small className="text-muted">Department</small>
                      <p>{summary.department}</p>
                    </div>
                    <div className="col-md-6">
                      <small className="text-muted">Position</small>
                      <p>{summary.position}</p>
                    </div>
                  </div>

                  <hr />

                  {/* Stats */}
                  <h6>Attendance Statistics</h6>

                  <div className="row mb-3">
                    <div className="col-md-4 text-center">
                      <div className="p-2 bg-light rounded">
                        <small>Present</small>
                        <h4 className="text-success">{summary.present}</h4>
                      </div>
                    </div>

                    <div className="col-md-4 text-center">
                      <div className="p-2 bg-light rounded">
                        <small>Absent</small>
                        <h4 className="text-danger">{summary.absent}</h4>
                      </div>
                    </div>

                    <div className="col-md-4 text-center">
                      <div className="p-2 bg-light rounded">
                        <small>Late</small>
                        <h4 className="text-warning">{summary.late}</h4>
                      </div>
                    </div>
                  </div>

                  <div className="row mb-3">
                    <div className="col-md-4 text-center">
                      <div className="p-2 bg-light rounded">
                        <small>Work From Home</small>
                        <h4 className="text-primary">
                          {summary.working_leave}
                        </h4>
                      </div>
                    </div>

                    <div className="col-md-4 text-center">
                      <div className="p-2 bg-light rounded">
                        <small>NFD</small>
                        <h4 style={{ color: "#cc6600" }}>{summary.nfd}</h4>
                      </div>
                    </div>

                    <div className="col-md-4 text-center">
                      <div className="p-2 bg-light rounded">
                        <small>Total Days</small>
                        <h4 style={{ color: "#4f46e5" }}>
                          {summary.total_days}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <hr />

                  {/* Progress Bar */}
                  <h6>Attendance Percentage</h6>
                  <div className="progress" style={{ height: "30px" }}>
                    <div
                      className={`progress-bar ${getProgressBarClass(
                        summary.attendance_percentage
                      )}`}
                      style={{
                        width: `${summary.attendance_percentage}%`,
                      }}
                    >
                      {summary.attendance_percentage}%
                    </div>
                  </div>

                  {/* Absence Reasons */}
                  {summary.absent_reasons &&
                    Object.keys(summary.absent_reasons).length > 0 && (
                      <>
                        <hr />
                        <h6>Absence Reasons</h6>
                        <ul style={{ listStyle: "none", padding: 0 }}>
                          {Object.entries(summary.absent_reasons).map(
                            ([reason, count], idx) => (
                              <li key={idx}>
                                {reason}: <strong>{count}</strong>
                              </li>
                            )
                          )}
                        </ul>
                      </>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row">
          <div className="col-md-12">
            <div className="alert alert-info">
              Click "Generate Report" to view attendance summary for the
              selected period.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceSummary;