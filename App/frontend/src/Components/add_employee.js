import React, { useState } from "react";

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
    is_active: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    // TODO: Send data to Django API
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
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    name="employee_id"
                    className="form-control"
                    value={formData.employee_id}
                    onChange={handleChange}
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
                    Is Active
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <button type="submit" className="btn btn-success">
                  Save Employee
                </button>
                <a href="/employees" className="btn btn-secondary ms-2">
                  Cancel
                </a>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddEmployee;