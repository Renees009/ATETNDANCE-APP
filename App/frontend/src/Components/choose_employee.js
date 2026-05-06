import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ChooseEmployee() {
  const [employees, setEmployees] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
    if (username !== password || !username.trim()) {
      setError("Username and password must be identical and match your Employee ID");
      return;
    }
    const emp = employees.find(e => e.employee_id === username.trim());
    if (!emp) {
      setError("Invalid Username/Password. Please check and try again.");
      return;
    }
    localStorage.setItem("selectedEmployeeId", username.trim());
    navigate(`/employee-home/${username.trim()}`);
    setError(null);
  };

  // Loading UI
  if (loading) {
    return (
      <div className="app-shell d-flex justify-content-center align-items-center">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Fetching employee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell d-flex justify-content-center align-items-center">
      <div className="card panel-card shadow-sm" style={{ width: "100%", maxWidth: "420px" }}>
        <div className="card-body p-4">

          {/* Header */}
          <div className="text-center mb-4">
            <h5 className="fw-semibold mb-1">Employee Login</h5>
            <p className="text-muted small mb-0">
            
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-danger small">
             Please try again.
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Username</label>
              <input
                type="text"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Password</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {employees.length === 0 && !error && !loading && (
              <small className="text-muted d-block mb-3">
                No employees available
              </small>
            )}
            {error && (
              <div className="alert alert-danger small mb-3">{error}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 btn-pill"
              disabled={loading || username.trim() !== password.trim() || !username.trim()}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default ChooseEmployee;