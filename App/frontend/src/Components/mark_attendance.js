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
  const [recentSubmitSuccess, setRecentSubmitSuccess] = useState(false);
  const [employeeHistory, setEmployeeHistory] = useState([]);
  const [warning, setWarning] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const filteredTodayAttendance = formData.employee_id 
    ? todayAttendance.filter(record => String(record.employee_id) === String(formData.employee_id))
    : todayAttendance;

  // Debug logs
  console.log('Filter Debug:', {
    employee_id: formData.employee_id,
    filteredCount: filteredTodayAttendance.length,
    todayAttendance,
    sampleRecord: todayAttendance[0]
  });

  // Debug log
  console.log('MarkAttendance Debug:', {
    employee_id: formData.employee_id,
    selectedName: selectedEmployeeName,
    totalRecords: todayAttendance.length,
    filteredCount: filteredTodayAttendance.length,
    hasRecords: !!todayAttendance.length
  });

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

  // Fetch employee name when employee_id changes
  useEffect(() => {
    const id = formData.employee_id;
    if (id) {
      fetch(`http://127.0.0.1:8000/attendance/api/employees/${id}/`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then(data => {
          const name = `${data.first_name || ''} ${data.last_name || ''}`.trim();
          setSelectedEmployeeName(name || 'ID: ' + id);
        })
        .catch(err => {
          console.error('Employee name fetch failed:', err);
          setSelectedEmployeeName(`ID: ${id}`);
        });
    } else {
      setSelectedEmployeeName('');
    }
  }, [formData.employee_id]);

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Name fetch moved to useEffect

    // Check duplicate attendance
    if (name === "employee_id") {
    if (recordedIds.includes(value)) {
        setWarning("Attendance already marked for this employee today.");
      } else {
        setWarning("");
      }
    }
  };

  // Submit
  const refreshTodayAttendance = () => {
    console.log('Refreshing attendance data...');
    fetch("http://127.0.0.1:8000/attendance/api/mark-attendance/")
      .then(res => res.json())
      .then(data => {
        console.log('API Response:', data);
        setTodayAttendance(data.records || []);
        setRecordedIds(data.recorded_ids || []);
        setWarning(""); // Clear warning after refresh
      })
      .catch(err => {
        console.error("Refresh failed:", err);
        showError("Failed to refresh table - please refresh page");
      });
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setErrorMsg("");
    setTimeout(() => setSuccessMsg(""), 36000000); // 10 hours
  };

  const showError = (msg) => {
    setErrorMsg(msg);
    setSuccessMsg("");
  };

  const clearMessages = () => {
    setSuccessMsg("");
    setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    // Client-side validations first
    if (!formData.employee_id) {
      showError("Please select an employee");
      return;
    }

    if (recordedIds.includes(parseInt(formData.employee_id))) {
      showError("Today's attendance already marked for this employee");
      return;
    }

    if (
      (formData.status === "ABSENT" || formData.status === "WORKING_LEAVE") &&
      !formData.remarks
    ) {
      showError("Remarks required for Absent or Work From Home");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/attendance/api/mark-attendance/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || "Failed to save attendance");
      }

      // Optimistic update + flag
      showSuccess("Attendance marked successfully!");
      setRecentSubmitSuccess(true);
      
      // Optimistically add to local state
      const newRecord = {
        employee_id: formData.employee_id,
        employee_name: selectedEmployeeName,
        status: formData.status,
        check_in_time: formData.check_in_time,
        remarks: formData.remarks || '--',
        attendance_date: formData.attendance_date
      };
      setTodayAttendance(prev => [newRecord, ...prev]);
      
      refreshTodayAttendance(); // Sync with server
      
      // Reset form but keep employee
      setFormData({ 
        employee_id: formData.employee_id, 
        attendance_date: formData.attendance_date, 
        status: "", 
        remarks: "", 
        check_in_time: formData.check_in_time 
      });
      
      // Clear success flag after 10 hours
      
    } catch (error) {
      // Handle backend duplicate or other errors
      const errorMsg = error.message.toLowerCase();
      if (errorMsg.includes("already marked") || errorMsg.includes("duplicate")) {
        showError("Today's attendance has already been marked for this employee");
      } else {
        showError(`Failed to save: ${error.message}`);
      }
    }
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
  
                <div className="alert alert-success mb-3 p-3">
                  <small className="text-muted">ID: {formData.employee_id}</small>
                </div>
              {/* Messages */}
              {successMsg && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                  {successMsg}
                  <button type="button" className="btn-close" onClick={clearMessages}></button>
                </div>
              )}
              {errorMsg && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  {errorMsg}
                  <button type="button" className="btn-close" onClick={clearMessages}></button>
                </div>
              )}
              {warning && (
                <div className="alert alert-warning alert-dismissible fade show" role="alert">
                  {warning}
                  <button type="button" className="btn-close" onClick={() => setWarning("")}></button>
                </div>
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
                  <option value="NFD">Half Day work</option>
                </select>
              </div>

              {/* Remarks */}
              <div className="mb-3">
                <label>Remarks</label>                <textarea
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

              <button 
                type="submit" 
                className="btn btn-success"
                disabled={!formData.status || warning || errorMsg || recordedIds.includes(formData.employee_id)}
              >
                {recordedIds.includes(parseInt(formData.employee_id)) ? "Already Marked" : "Save Attendance"}
              </button>

            </form>
          </div>
        </div>
      </div>

      {/* RIGHT TABLE */}
      <div className="col-md-6">
        <div className="card">
          <div className="card-header">
            <h5>{formData.employee_id ? (
              `${selectedEmployeeName || 'Selected Employee'} - Today` +
              (recentSubmitSuccess || filteredTodayAttendance.length > 0 ? ' (Marked)' : ' (Not Marked)')
            ) : 'Today\'s Attendance (All)'}</h5>
          </div>

          <div className="table-responsive">
            <table className="table table-sm">
              <thead className="table-dark">
                <tr>
                  <th>Employee ID</th>
                  <th>Employee Name</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
             
                  <th>Remarks</th>
                </tr>
              </thead>

              <tbody>
                {filteredTodayAttendance.length > 0 ? (
                  filteredTodayAttendance.map((rec, i) => (
                    <tr key={`${rec.employee_id}-${rec.attendance_date || i}`}>
                      <td><strong>{rec.employee_id}</strong></td>
                      <td>{rec.employee__first_name || rec.employee_name || '—'}</td>
                      <td>{rec.attendance_date}</td>
                      <td>
                        <span className={`badge fs-6 px-2 py-1 ${getBadge(rec.status)}`}>
                          {rec.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{rec.check_in_time || '—'}</td>
                 
                      <td className="text-truncate" style={{maxWidth: '150px'}} title={rec.remarks}>
                        {rec.remarks || '—'}
                      </td>
                    </tr>
                  ))
                ) : recentSubmitSuccess ? (
                  <tr>
                    <td colSpan="7" className="text-center text-success fw-bold p-4">
                       Today's attendance marked successfully
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted p-4">
                      {formData.employee_id ? `No attendance record for ${selectedEmployeeName} today.` : 'No attendance records for today.'}
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