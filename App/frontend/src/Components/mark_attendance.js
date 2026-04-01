import React, { useEffect, useState } from "react";

function MarkAttendance({ employeeOverride }) {
  const [selectedEmployeeName, setSelectedEmployeeName] = useState('');
  const [formData, setFormData] = useState({
    employee_id: "",
    attendance_date: "",
    status: "",
    remarks: "",
    check_in_time: "",
  });

  const [employees, setEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [recordedIds, setRecordedIds] = useState([]);
  const [warning, setWarning] = useState("");

  // Auto-detect employee from URL/localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlEmployeeId = urlParams.get('employee_id');
    const lsEmployeeId = localStorage.getItem('selectedEmployeeId');
    const employeeId = urlEmployeeId || lsEmployeeId;

    if (employeeId) {
      setFormData(prev => ({ ...prev, employee_id: employeeId }));
fetch(`http://127.0.0.1:8000/attendance/api/employees/${employeeId}/`)
        .then(res => res.json())
        .then(data => {
          setSelectedEmployeeName(`${data.first_name} ${data.last_name}`);
        })
        .catch(err => console.error('Failed to fetch employee:', err));
    }
  }, []);

  // Fetch data
  useEffect(() => {
    fetch("http://127.0.0.1:8000/attendance/api/employees/")
      .then(res => res.json())
      .then(data => {
        const employeeList = data.employees || data || [];
        setEmployees(employeeList);
      });

    fetch("http://127.0.0.1:8000/attendance/api/mark-attendance/")
      .then(res => res.json())
      .then(data => {
        setTodayAttendance(data.records || []);
        setRecordedIds(data.recorded_ids || []);
      });

    // Set today's date
    const today = new Date().toISOString().split("T")[0];
    setFormData(prev => ({ ...prev, attendance_date: today }));
  }, []);

  // Live clock for check-in
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const time =
        String(now.getHours()).padStart(2, "0") +
        ":" +
        String(now.getMinutes()).padStart(2, "0") +
        ":" +
        String(now.getSeconds()).padStart(2, "0");

      setFormData(prev => ({ ...prev, check_in_time: time }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Check duplicate attendance
    if (name === "employee_id") {
      if (recordedIds.includes(parseInt(value))) {
        setWarning("Attendance already marked for this employee today.");
      } else {
        setWarning("");
      }
    }
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (recordedIds.includes(parseInt(formData.employee_id))) {
      alert("Already recorded!");
      return;
    }

    if (
      (formData.status === "ABSENT" ||
        formData.status === "WORKING_LEAVE") &&
      !formData.remarks
    ) {
      alert("Remarks required!");
      return;
    }

    fetch("http://127.0.0.1:8000/attendance/api/mark-attendance/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(() => {
        alert("Attendance saved!");
        window.location.reload();
      });
  };

  const getBadge = (status) => {
    switch (status) {
      case "PRESENT":
        return "bg-success";
      case "ABSENT":
        return "bg-danger";
      case "LATE":
        return "bg-warning";
      case "NFD":
        return "bg-warning";
      case "WORKING_LEAVE":
        return "bg-info";
      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="row">

      {/* LEFT FORM */}
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h5>Record Attendance</h5>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>

              {/* Employee */}
              {!(employeeOverride || selectedEmployeeName) && (
                <div className="mb-3">
                  <label className="form-label">Employee</label>
                  <select
                    name="employee_id"
                    className="form-control"
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.first_name} {emp.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(employeeOverride || selectedEmployeeName) && (
                <p className="text-info">
                  Recording for <strong>{selectedEmployeeName || employeeOverride}</strong>
                </p>
              )}

              {/* Warning */}
              {warning && (
                <div className="alert alert-warning">{warning}</div>
              )}

              {/* Date */}
              <div className="mb-3">
                <label>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={formData.attendance_date}
                  disabled
                />
              </div>

              {/* Status */}
              <div className="mb-3">
                <label>Status</label>
                <select
                  name="status"
                  className="form-control"
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LATE">Late</option>
                  <option value="WORKING_LEAVE">Work From Home</option>
                  <option value="NFD">NFD</option>
                </select>
              </div>

              {/* Remarks */}
              <div className="mb-3">
                <label>Remarks</label>
                <textarea
                  name="remarks"
                  className="form-control"
                  onChange={handleChange}
                />
                <small className="text-muted">
                  Required for Absent or Work From Home
                </small>
              </div>

              {/* Check-in */}
              <div className="mb-3">
                <label>Check In Time</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.check_in_time}
                  readOnly
                />
              </div>

              <button className="btn btn-success">
                Save Attendance
              </button>

            </form>
          </div>
        </div>
      </div>

      {/* RIGHT TABLE */}
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h5>Today's Attendance</h5>
          </div>

          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Reason</th>
                </tr>
              </thead>

              <tbody>
                {todayAttendance.length > 0 ? (
                  todayAttendance.map((rec, i) => (
                    <tr key={i}>
                      <td>{rec.employee_name}</td>
                      <td>
                        <span className={`badge ${getBadge(rec.status)}`}>
                          {rec.status}
                        </span>
                      </td>
                      <td>{rec.check_in_time || "--"}</td>
                      <td>{rec.check_out_time || "--"}</td>
                      <td>{rec.remarks || "--"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No attendance records for today.
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>
      </div>

    </div>
  );
}

export default MarkAttendance;