import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ChooseEmployee() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:8000/attendance/api/employees/");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const employeeList = data.employees || data || [];

        setEmployees(employeeList);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedEmployee) {
      localStorage.setItem("selectedEmployeeId", selectedEmployee);
      navigate(`/employee-home/${selectedEmployee}`);
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1e3c72, #2a5298)",
        }}
      >
        <div className="text-center text-white">
          <div className="spinner-border text-light" role="status"></div>
          <p className="mt-3">Fetching employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e3c72, #2a5298)",
      }}
    >
      <div
        className="card border-0 shadow"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "12px",
        }}
      >
        <div className="card-body p-4">

          {/* Header */}
          <div className="text-center mb-4">
            <h5 className="fw-semibold mb-1">Employee Portal</h5>
            <p className="text-muted small mb-0">
              Select your profile to continue
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger small">
              Unable to load employees. Please try again.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">
                Employee
              </label>

              <select
                className="form-select"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                required
                style={{ padding: "10px", borderRadius: "6px" }}
              >
                <option value="">Select an employee</option>

                {employees.map((emp, index) => (
                  <option key={emp.employee_id || index} value={emp.employee_id}>
                    {emp.full_name ||
                      `${emp.first_name || ""} ${emp.last_name || ""}`.trim()}{" "}
                    ({emp.employee_id})
                  </option>
                ))}
              </select>

              {employees.length === 0 && !error && (
                <small className="text-muted">
                  No employees available
                </small>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100"
              disabled={!selectedEmployee}
              style={{ padding: "10px", borderRadius: "6px" }}
            >
              Continue
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default ChooseEmployee;