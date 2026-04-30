import React, { useState } from "react";

function AttendanceReports() {
  const [filters, setFilters] = useState({
    employee: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setExpandedRow(null);

    const query = `employee=${filters.employee}&month=${filters.month}&year=${filters.year}`;

    fetch(`http://127.0.0.1:8000/attendance/api/attendance-reports/?${query}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          throw new Error(data.error);
        }
        setReports(data.reports || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 90) return "text-success";
    if (percentage >= 75) return "text-warning";
    return "text-danger";
  };

  const getProgressBarClass = (percentage) => {
    if (percentage >= 90) return "bg-success";
    if (percentage >= 75) return "bg-warning";
    return "bg-danger";
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PRESENT': return 'bg-success';
      case 'ABSENT': return 'bg-danger';
      case 'WORKING_LEAVE': return 'bg-info';
      case 'LATE': return 'bg-warning';
      case 'NFD': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const toggleExpand = (index) => {
    setExpandedRow(expandedRow === index ? null : index);
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

                {/* <div className="col-md-4">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    name="employee"
                    className="form-control"
                    value={filters.employee}
                    onChange={handleChange}
                    placeholder="EMP0001"
                  />
                </div> */}

                <div className="col-md-4">
                  <label className="form-label">Month</label>
                  <input
                    type="number"
                    name="month"
                    className="form-control"
                    value={filters.month}
                    onChange={handleChange}
                    placeholder="1-12"
                    min="1"
                    max="12"
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
                    min="2020"
                  />
                </div>

                <div className="col-12">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Loading...
                      </>
                    ) : (
                      "Filter"
                    )}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="alert alert-danger" role="alert">
              <strong>Error:</strong> {error}
            </div>
          </div>
        </div>
      )}

      {/* Reports Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Reports ({reports.length})
              </h5>
              {reports.length === 0 && !loading && (
                <span className="badge bg-warning">No reports found</span>
              )}
            </div>

            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '40px' }}></th>
                    <th>Employee</th>
                    <th>Period</th>
                    <th>Total Days</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Late</th>
                    <th>Half Day</th>
                    <th>Work from Home</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading reports...</p>
                      </td>
                    </tr>
                  ) : reports.length > 0 ? (
                    reports.map((report, index) => (
                      <React.Fragment key={index}>
                        <tr
                          onClick={() => toggleExpand(index)}
                          style={{ cursor: 'pointer' }}
                          className={expandedRow === index ? 'table-active' : ''}
                        >
                          <td>
                            <span className="badge bg-light text-dark">
                              {expandedRow === index ? '▼' : '▶'}
                            </span>
                          </td>
                          <td>
                            <strong>{report.employee_name}</strong>
                            <br />
                            <small className="text-muted">{report.employee_id}</small>
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

                          <td style={{ minWidth: '150px' }}>
                            <div className="d-flex align-items-center">
                              <div className="progress flex-grow-1 me-2" style={{ height: '20px' }}>
                                <div
                                  className={`progress-bar ${getProgressBarClass(report.attendance_percentage)}`}
                                  role="progressbar"
                                  style={{ width: `${Math.min(report.attendance_percentage, 100)}%` }}
                                  aria-valuenow={report.attendance_percentage}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                >
                                  {report.attendance_percentage}%
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Detail Row */}
                        {expandedRow === index && (
                          <tr>
                            <td colSpan="10" className="p-0">
                              <div className="card border-0 rounded-0">
                                <div className="card-header bg-light">
                                  <h6 className="mb-0">
                                    📋 Attendance Details for {report.employee_name} — {report.month}/{report.year}
                                  </h6>
                                </div>
                                <div className="card-body p-0">
                                  {report.records && report.records.length > 0 ? (
                                    <div className="table-responsive">
                                      <table className="table table-sm table-striped mb-0">
                                        <thead className="table-dark">
                                          <tr>
                                            <th>Date</th>
                                            <th>Status</th>
                                            <th>Check In</th>
                                            <th>Remarks</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {report.records.map((record, rIndex) => (
                                            <tr key={rIndex}>
                                              <td><strong>{record.attendance_date}</strong></td>
                                              <td>
                                                <span className={`badge ${getStatusBadgeClass(record.status)}`}>
                                                  {record.status.replace('_', ' ')}
                                                </span>
                                              </td>
                                              <td>{record.check_in_time || '--:--'}</td>
                                              <td>
                                                {record.remarks ? (
                                                  <span className="text-muted small" title={record.remarks}>
                                                    {record.remarks.length > 40 ? record.remarks.substring(0, 40) + '...' : record.remarks}
                                                  </span>
                                                ) : (
                                                  '—'
                                                )}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  ) : (
                                    <div className="text-center py-4 text-muted">
                                      <i className="bi bi-calendar-x fs-1 mb-3"></i>
                                      <h6>No individual attendance records found for this period.</h6>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center py-4">
                        <i className="bi bi-inbox fs-1 text-muted mb-3"></i>
                        <h5 className="text-muted">No reports found.</h5>
                        <p className="text-muted">Try adjusting your filters or generate a report first.</p>
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

