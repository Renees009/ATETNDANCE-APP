import React, { useState } from "react";
import { Link } from "react-router-dom"; 

function AddEmployee() {
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

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/attendance/api/employees/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (data.success) {
        alert('New Employee added successfully!');
        // Reset form
        setFormData({
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
        setErrors({});
      } else {
        setErrors(data.errors || { general: 'Validation error' });
      }
    } catch (error) {
      console.error('Add employee failed:', error);
      alert('Error saving employee: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row">
      <div className="col-md-8 offset-md-2">
        <h2>Add New Employee</h2>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Employee ID <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="employee_id"
                    className="form-control"
                    value={formData.employee_id}
                    onChange={handleChange}
                    required
                  />
                  {errors.employee_id && (
                    <div className="text-danger small">{errors.employee_id}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Email <span className="text-danger">*</span></label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  {errors.email && (
                    <div className="text-danger small">{errors.email}</div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">First Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="first_name"
                    className="form-control"
                    value={formData.first_name}
                    onChange={handleChange}
                    required
                  />
                  {errors.first_name && (
                    <div className="text-danger small">{errors.first_name}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Last Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="last_name"
                    className="form-control"
                    value={formData.last_name}
                    onChange={handleChange}
                    required
                  />
                  {errors.last_name && (
                    <div className="text-danger small">{errors.last_name}</div>
                  )}
                </div>
              </div>

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
                    <div className="text-danger small">{errors.phone}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Department <span className="text-danger">*</span></label>
                  <select
                    name="department"
                    className="form-control"
                    value={formData.department}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="HR">HR</option>
                    <option value="IT">IT</option>
                    <option value="SALES">Sales</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="OPERATIONS">Operations</option>
                    <option value="FINANCE">Finance</option>
                  </select>
                  {errors.department && (
                    <div className="text-danger small">{errors.department}</div>
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Position <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    name="position"
                    className="form-control"
                    value={formData.position}
                    onChange={handleChange}
                    required
                  />
                  {errors.position && (
                    <div className="text-danger small">{errors.position}</div>
                  )}
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Date of Joining <span className="text-danger">*</span></label>
                  <input
                    type="date"
                    name="date_of_joining"
                    className="form-control"
                    value={formData.date_of_joining}
                    onChange={handleChange}
                    required
                  />
                  {errors.date_of_joining && (
                    <div className="text-danger small">{errors.date_of_joining}</div>
                  )}
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="is_active"
                    className="form-check-input"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="is_active">
                    Is Active
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <button type="submit" className="btn btn-success me-2" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Employee'}
                </button>
                <Link to="/employees" className="btn btn-secondary">
                  Cancel
                </Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEmployee;

