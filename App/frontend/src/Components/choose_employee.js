import React, { useState, useEffect } from "react";

function ChooseEmployee() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // Fetch employees from backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/employees/")
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.employees || []);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log("Selected Employee:", selectedEmployee);

    // Example: redirect or send to backend
    // window.location.href = `/next-page/${selectedEmployee}`;
  };

  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6">

        <div className="card">
          <div className="card-header text-center">
            <h5 className="mb-0">Select Employee</h5>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit}>
              
              <div className="mb-3">
                <label className="form-label">Employee</label>

                <select
                  className="form-control"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  required
                >
                  <option value="">-- Select Employee --</option>

                  {employees.map((emp) => (
                    <option key={emp.employee_id} value={emp.employee_id}>
                      {emp.full_name} ({emp.employee_id})
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn btn-primary w-100">
                Continue
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ChooseEmployee;