import React, { useState } from "react";

function AttendanceByDate() {
  const [selectedDate, setSelectedDate] = useState("");
  const [records, setRecords] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Fetch data from Django API
    fetch(`http://127.0.0.1:8000/api/attendance-by-date/?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        setRecords(data.records || []);
      });
  };

  const handleClear = () => {
    setSelectedDate("");
    setRecords([]);
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
          <h2>View Attendance by Specific Date</h2>
        </div>
      </div>

      {/* Date Selection Card */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Select Date</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Select Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6" style={{ paddingTop: "32px" }}>
                  <button type="submit" className="btn btn-primary">
                    View Attendance
                  </button>

                  {selectedDate && (
                    <button
                      type="button"
                      className="btn btn-secondary ms-2"
                      onClick={handleClear}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      {selectedDate ? (
        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">
                  Attendance for {selectedDate} ({records.length} records)
                </h5>
              </div>

              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Department</th>
                      <th>Status</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Absence Reason</th>
                    </tr>
                  </thead>

                  <tbody>
                    {records.length > 0 ? (
                      records.map((record, index) => (
                        <tr key={index}>
                          <td>
                            <strong>{record.employee_id}</strong>
                          </td>
                          <td>{record.employee_name}</td>
                          <td>{record.department}</td>
                          <td>{getStatusBadge(record.status)}</td>
                          <td>{record.check_in_time || "--"}</td>
                          <td>{record.check_out_time || "--"}</td>
                          <td>{record.remarks || "--"}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          No attendance records for this date.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-md-12">
            <div className="alert alert-info">
              Select a date above to view attendance records.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceByDate;