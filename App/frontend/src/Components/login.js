import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  // Clear any existing session when landing on the login/role selection page
  useEffect(() => {
    localStorage.removeItem('authToken');
  }, []);

  const handleAdminLogin = () => {
    localStorage.setItem('authToken', 'admin-mock-token');
    navigate('/dashboard');
  };

  const handleEmployeeLogin = () => {
    localStorage.setItem('authToken', 'employee-mock-token');
    navigate('/employees/choose');
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <div
        className="card p-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h4 className="mb-3 text-center">Select Role</h4>

        <div className="d-grid gap-2">

          {/* Admin */}
          <button onClick={handleAdminLogin} className="btn btn-primary">
            Admin
          </button>

          {/* Employee */}
          <button onClick={handleEmployeeLogin} className="btn btn-secondary">
            Employee
          </button>

        </div>
      </div>
    </div>
  );
}

export default Login;
