import React, { useState, useEffect } from "react";

function AttendanceSummary() {
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    employee: "",
  });
  const [summaries, setSummaries] = useState([]);
  const [records, setRecords] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [loading, setLoading] = useState(true);
  const [isEmployeeView, setIsEmployeeView] = useState(false);

  // Detect employee context on mount
  useEffect(() => {
    const selectedId = localStorage.getItem("selectedEmployeeId");
    const urlParams = new URLSearchParams(window.location.search);
    const urlEmployee = urlParams.get("employee");
    
    if (selectedId) {
      setEmployeeId(selectedId);
      setFilters(prev => ({...prev, employee: selectedId}));
      setIsEmployeeView(true);
      // Fetch employee details
      fetch(`http://127.0.0.1:8000/attendance/api/employees/${selectedId}/`)
        .then(res => res.json())
        .then(data => {
          setEmployeeName(data.employee ? `${data.employee.first_name} ${data.employee.last_name}` : selectedId);
        });
    }
    
    setLoading(false);
  }, []);

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const loadData = async () => {
    if (loading) return;
    
    setLoading(true);
    
    try {
      // Load summary stats - always single employee in employee view
      const summaryQuery = `month=${filters.month}&year=${filters.year}&employee=${employeeId}`;
      const summaryRes = await fetch(`http://127.0.0.1:8000/attendance/api/attendance-summary/?${summaryQuery}`);
      
      // Load full history records
      if (employeeId) {
        const historyFilters = { employee: employeeId };
        const historyQuery = new URLSearchParams(historyFilters).toString();
        const historyRes = await fetch(`http://127.0.0.1:8000/attendance/api/attendance-history/?${historyQuery}`);
        const historyData = await historyRes.json();
        setRecords(historyData.records || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  // Auto-load on employee context
  useEffect(() => {
    if (employeeId) {
      loadData();
    }
  }, [employeeId]);

  const getProgressBarClass = (percentage) => {
    if (percentage >= 90) return "bg-success";
    if (percentage >= 75) return "bg-warning";
    return "bg-danger";
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your attendance data...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Employee Header if in employee view */}
      {isEmployeeView && (
        <div className="row mb-4">
          <div className="col-md-12">
            <div className="card border-primary">
              <div className="card-header bg-primary text-white">
                <h3 className="mb-0">
                    Full Attendance History - {employeeName} ({employeeId})
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Title */}
      <div className="row mb-4">
        <div className="col-md-12">
          <h2>{isEmployeeView ? "My Summary & History" : "Attendance Summary Report"}</h2>
        </div>
      </div>

      {/* Filter Section */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
            
              
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
                    min="1" max="12"
                    disabled={isEmployeeView}
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
                    min="2020"
                    disabled={isEmployeeView}
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    name="employee"
                    className="form-control"
                    value={filters.employee || employeeId}
                    onChange={handleChange}
                    disabled={isEmployeeView}
                    placeholder="EMP0001"
                  />
                </div>
                <div className="col-md-3 d-flex align-items-end">
                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Loading..." : "Generate Report"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Current Month Summary */}
      {summaries.length > 0 && summaries[0] && (
        <div className="row mb-5">
          <div className="col-md-12">
            <div className="card shadow-lg">
              <div className="card-header bg-gradient-primary text-white">
                <h5 className="mb-0">
                  📊 Current Period Summary ({filters.month}/{filters.year})
                </h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-md-2">
                    <div className="p-3 bg-light rounded shadow-sm">
                      <small className="text-muted">Present</small>
                      <h3 className="text-success">{summaries[0].present}</h3>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="p-3 bg-light rounded shadow-sm">
                      <small className="text-muted">Absent</small>
                      <h3 className="text-danger">{summaries[0].absent}</h3>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="p-3 bg-light rounded shadow-sm">
                      <small>WFH</small>
                      <h3 className="text-primary">{summaries[0].working_leave}</h3>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="p-3 bg-light rounded shadow-sm">
                      <small>Late</small>
                      <h3 className="text-warning">{summaries[0].late}</h3>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="p-3 bg-light rounded shadow-sm">
                      <small>NFD</small>
                      <h3 className="text-orange">{summaries[0].nfd}</h3>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="p-3 bg-light rounded shadow-sm">
                      <small>Total Days</small>
                      <h3 className="text-indigo">{summaries[0].total_days}</h3>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-md-6">
                    <h6>Attendance %</h6>
                    <div className="progress" style={{height: '25px'}}>
                      <div 
                        className={`progress-bar ${getProgressBarClass(summaries[0].attendance_percentage)}`}
                        style={{width: `${summaries[0].attendance_percentage}%`}}
                      >
                        {summaries[0].attendance_percentage}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Attendance Records Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card shadow-lg">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                 Full Attendance History 
                {records.length > 0 && `(${records.length} records)`}
              </h5>
              {records.length === 0 && !loading && (
                <span className="badge bg-warning">No records found</span>
              )}
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading records...</span>
                  </div>
                  <p className="mt-2">Loading attendance records...</p>
                </div>
              ) : records.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-dark">
                      <tr>
                        
                        <th>Date</th>
                        <th>Status</th>
                        <th>Check In</th>
                
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((record, index) => (
                        <tr key={record.id || index}>
                          <td><strong>{record.attendance_date}</strong></td>
                          <td>
                            <span className={`badge fs-6 px-3 py-2 ${
                              record.status === 'PRESENT' ? 'bg-success' :
                              record.status === 'ABSENT' ? 'bg-danger' :
                              record.status === 'WORKING_LEAVE' ? 'bg-info' :
                              record.status === 'LATE' ? 'bg-warning' :
                              record.status === 'NFD' ? 'bg-secondary' : 'bg-secondary'
                            }`}>
                              {record.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{record.check_in_time || '--:--'}</td>
                         
                          <td>
                            {record.remarks ? (
                              <span className="text-muted small" title={record.remarks}>
                                {record.remarks.length > 30 ? record.remarks.substring(0, 30) + '...' : record.remarks}
                              </span>
                            ) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-calendar-x fs-1 text-muted mb-3"></i>
                  <h5 className="text-muted">No attendance records found</h5>
                  <p className="text-muted">
                    {isEmployeeView ? 'Mark your first attendance or check filters.' : 'Generate a report first.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AttendanceSummary;