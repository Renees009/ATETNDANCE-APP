import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditEmployee() {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    employee_id: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    department: "",
    position: "",
    date_of_joining: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch employee data on component mount
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/attendance/api/employees/${employeeId}/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.employee) {
          setFormData({
            employee_id: data.employee.employee_id || "",
            email: data.employee.email || "",
            first_name: data.employee.first_name || "",
            last_name: data.employee.last_name || "",
            phone: data.employee.phone || "",
            department: data.employee.department || "",
            position: data.employee.position || "",
            date_of_joining: data.employee.date_of_joining || "",
            is_active: data.employee.is_active !== undefined ? data.employee.is_active : true,
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching employee:", err);
        setLoading(false);
      });
  }, [employeeId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    fetch(`http://127.0.0.1:8000/attendance/api/employees/${employeeId}/update/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        setSaving(false);
        if (data.error) {
          alert("Error: " + data.error);
        } else if (data.errors) {
          setErrors(data.errors);
        } else {
          alert("Employee updated successfully!");
          // Navigate back to employee detail page
          navigate(`/employees/${employeeId}`);
        }
      })
      .catch((err) => {
        setSaving(false);
        console.error("Error updating employee:", err);
        alert("Failed to update employee. Please try again.");
      });
  };

  const handleCancel = () => {
    navigate(`/employees/${employeeId}`);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="row">
      <div className="col-md-8 offset-md-2">

        <h2>
          Edit Employee: {formData.first_name} {formData.last_name}
        </h2>

        <div className="card">
          <div className="card-body">

            <form onSubmit={handleSubmit}>

              {/* Row 1 */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    name="employee_id"
                    className="form-control"
                    value={formData.employee_id}
                    onChange={handleChange}
                    disabled
                  />
                  {errors.employee_id && (
                    <div className="text-danger">{errors.employee_id}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && (
                    <div className="text-danger">{errors.email}</div>
                  )}
                </div>
              </div>

              {/* Row 2 */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-control"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                  {errors.first_name && (
                    <div className="text-danger">{errors.first_name}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-control"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                  {errors.last_name && (
                    <div className="text-danger">{errors.last_name}</div>
                  )}
                </div>
              </div>

              {/* Row 3 */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                  {errors.phone && (
                    <div className="text-danger">{errors.phone}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleChange}
                  />
                  {errors.department && (
                    <div className="text-danger">{errors.department}</div>
                  )}
                </div>
              </div>

              {/* Row 4 */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Position</label>
                  <input
                    type="text"
                    name="position"
                    className="form-control"
                    value={formData.position}
                    onChange={handleChange}
                  />
                  {errors.position && (
                    <div className="text-danger">{errors.position}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Date of Joining</label>
                  <input
                    type="date"
                    name="date_of_joining"
                    className="form-control"
                    value={formData.date_of_joining}
                    onChange={handleChange}
                  />
                  {errors.date_of_joining && (
                    <div className="text-danger">
                      {errors.date_of_joining}
                    </div>
                  )}
                </div>
              </div>

              {/* Active Checkbox */}
              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="is_active"
                    className="form-check-input"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">
                    Active Employee
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="mb-3">
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={saving}
                >
                  {saving ? "Updating..." : "Update Employee"}
                </button>

                <button 
                  type="button" 
                  className="btn btn-secondary ms-2"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>

            </form>

          </div>
        </div>
      </div>
    </div>
  );
}

export default EditEmployee;