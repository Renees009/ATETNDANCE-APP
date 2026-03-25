import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


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

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedEmployee) {
      localStorage.setItem('selectedEmployeeId', selectedEmployee);
      navigate(`/employee-home/${selectedEmployee}`);
    }
  };


  return (
    <div className="row justify-content-center mt-5">
      <div className="col-md-6">

        <div className="card">
          <div className="card-header text-center">
            <h4 className="mb-0">👤 Employee Portal</h4>
            <p className="text-muted mb-0">Please select your profile</p>
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