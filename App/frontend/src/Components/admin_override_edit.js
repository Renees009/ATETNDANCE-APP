import React, { useState, useEffect } from "react";

function EditAttendance() {
  const [formData, setFormData] = useState({
    employee: "",
    attendance_date: "",
    status: "",
    check_in_time: "",
    check_out_time: "",
    remarks: "",
  });

  const [errors, setErrors] = useState({});
  const [nonFieldErrors, setNonFieldErrors] = useState([]);
  const [attendance, setAttendance] = useState(null);

  // Example: Fetch existing attendance data
  useEffect(() => {
    // Replace with your API
    fetch("http://127.0.0.1:8000/api/attendance/1/")
      .then((res) => res.json())
      .then((data) => {
        setAttendance(data);
        setFormData({
          employee: data.employee || "",
          attendance_date: data.attendance_date || "",
          status: data.status || "",
          check_in_time: data.check_in_time || "",
          check_out_time: data.check_out_time || "",
          remarks: data.remarks || "",
        });
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch("http://127.0.0.1:8000/api/attendance/1/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Updated:", data);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <div>
      {/* Title */}
      <div className="row mb-4">
        <div className="col-md-12">
          <h2>Admin Override - Edit Attendance Record</h2>
        </div>
      </div>

      {/* Admin Warning */}
      <div className="row mb-4">
        <div className="col-md-12">
          <div className="alert alert-warning">
            <strong>⚙️ Administrator Privilege Active</strong>
            <p className="mb-0">
              As an administrator, you can edit any attendance record regardless
              of when it was created. Changes will be recorded with admin
              override status.
            </p>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card">
            <div
              className="card-header"
              style={{ background: "#ff9800", color: "white" }}
            >
              <h5 className="mb-0">Edit Attendance</h5>
            </div>

            <div className="card-body">
              {/* Attendance Info */}
              {attendance && (
                <div className="alert alert-info mb-4">
                  <small>
                    <strong>Record Information:</strong>
                    <br />
                    Employee: {attendance.employee_name} (
                    {attendance.employee_id})
                    <br />
                    Date: {attendance.attendance_date}
                    <br />
                    Created: {attendance.created_at}
                    <br />
                    Age: {attendance.age_in_days} days old
                  </small>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Employee */}
                <div className="mb-3">
                  <label className="form-label">Employee</label>
                  <input
                    type="text"
                    name="employee"
                    className="form-control"
                    value={formData.employee}
                    onChange={handleChange}
                  />
                  {errors.employee && (
                    <div className="text-danger">{errors.employee}</div>
                  )}
                </div>

                {/* Attendance Date */}
                <div className="mb-3">
                  <label className="form-label">Attendance Date</label>
                  <input
                    type="date"
                    name="attendance_date"
                    className="form-control"
                    value={formData.attendance_date}
                    onChange={handleChange}
                  />
                  {errors.attendance_date && (
                    <div className="text-danger">
                      {errors.attendance_date}
                    </div>
                  )}
                </div>

                {/* Status */}
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <input
                    type="text"
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleChange}
                  />
                  {errors.status && (
                    <div className="text-danger">{errors.status}</div>
                  )}
                </div>

                {/* Check In / Out */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Check In Time</label>
                    <input
                      type="time"
                      name="check_in_time"
                      className="form-control"
                      value={formData.check_in_time}
                      onChange={handleChange}
                    />
                    {errors.check_in_time && (
                      <div className="text-danger">
                        {errors.check_in_time}
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Check Out Time</label>
                    <input
                      type="time"
                      name="check_out_time"
                      className="form-control"
                      value={formData.check_out_time}
                      onChange={handleChange}
                    />
                    {errors.check_out_time && (
                      <div className="text-danger">
                        {errors.check_out_time}
                      </div>
                    )}
                  </div>
                </div>

                {/* Remarks */}
                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    name="remarks"
                    className="form-control"
                    value={formData.remarks}
                    onChange={handleChange}
                  />
                  {errors.remarks && (
                    <div className="text-danger">{errors.remarks}</div>
                  )}
                </div>

                {/* Non-field Errors */}
                {nonFieldErrors.length > 0 && (
                  <div className="alert alert-danger">
                    {nonFieldErrors.map((err, index) => (
                      <p key={index} className="mb-0">
                        {err}
                      </p>
                    ))}
                  </div>
                )}

                {/* Buttons */}
                <div className="mb-3">
                  <button type="submit" className="btn btn-warning">
                    <strong>Save Changes (Admin Override)</strong>
                  </button>
                  <a
                    href="/attendance-history"
                    className="btn btn-secondary ms-2"
                  >
                    Cancel
                  </a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditAttendance;