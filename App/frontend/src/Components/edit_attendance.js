import React, { useState, useEffect } from "react";

function EditAttendance({ recordId }) {
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
  const [isEditable, setIsEditable] = useState(false);

  // Fetch existing record
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/attendance/${recordId}/`)
      .then((res) => res.json())
      .then((data) => {
        setFormData({
          employee: data.employee,
          attendance_date: data.attendance_date,
          status: data.status,
          check_in_time: data.check_in_time || "",
          check_out_time: data.check_out_time || "",
          remarks: data.remarks || "",
        });
        setIsEditable(data.is_editable);
      });
  }, [recordId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`http://127.0.0.1:8000/api/attendance/${recordId}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) {
          setErrors(data.errors);
        } else if (data.non_field_errors) {
          setNonFieldErrors(data.non_field_errors);
        } else {
          alert("Attendance updated successfully!");
        }
      });
  };

  return (
    <div>

      {/* Title */}
      <div className="row mb-4">
        <div className="col-md-12">
          <h2>Edit Attendance Record</h2>
        </div>
      </div>

      {/* Editability Status */}
      <div className="row mb-4">
        <div className="col-md-12">
          {isEditable ? (
            <div className="alert alert-success">
              <strong>✓ Record is Editable</strong>
              <p className="mb-0">
                This record can be edited as it was created within the last 30 days.
              </p>
            </div>
          ) : (
            <div className="alert alert-danger">
              <strong>✗ Record is Not Editable</strong>
              <p className="mb-0">
                This record is older than 30 days and cannot be edited.
                Contact an administrator if needed.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card">
            <div className="card-body">

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

                {/* Date */}
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
                    <div className="text-danger">{errors.attendance_date}</div>
                  )}
                </div>

                {/* Status */}
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-control"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="WORKING_LEAVE">Work From Home</option>
                    <option value="LATE">Late</option>
                    <option value="NFD">NFD</option>
                  </select>
                  {errors.status && (
                    <div className="text-danger">{errors.status}</div>
                  )}
                </div>

                {/* Time */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Check In</label>
                    <input
                      type="time"
                      name="check_in_time"
                      className="form-control"
                      value={formData.check_in_time}
                      onChange={handleChange}
                    />
                    {errors.check_in_time && (
                      <div className="text-danger">{errors.check_in_time}</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Check Out</label>
                    <input
                      type="time"
                      name="check_out_time"
                      className="form-control"
                      value={formData.check_out_time}
                      onChange={handleChange}
                    />
                    {errors.check_out_time && (
                      <div className="text-danger">{errors.check_out_time}</div>
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
                      <p key={index} className="mb-0">{err}</p>
                    ))}
                  </div>
                )}

                {/* Buttons */}
                <div className="mb-3">
                  <button
                    type="submit"
                    className="btn btn-success"
                    disabled={!isEditable}
                  >
                    Update Attendance
                  </button>

                  <a href="/attendance-history" className="btn btn-secondary ms-2">
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