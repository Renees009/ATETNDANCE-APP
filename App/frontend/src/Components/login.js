import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("authToken");
  }, []);

const handleAdminLogin = () => {
    navigate("/admin-login");
  };

  const handleEmployeeLogin = () => {
    localStorage.setItem("authToken", "employee-mock-token");
    navigate("/employees/choose");
  };

  return (
    <div className="app-shell d-flex justify-content-center align-items-center">
      <div className="card panel-card shadow-sm" style={{ width: "100%", maxWidth: "420px" }}>
        <div className="card-body p-4">

          {/* Title */}
          <div className="text-center mb-4">
            <h3 className="fw-bold">Welcome Back</h3>
            <p className="text-muted mb-0">Please select your role to continue</p>
          </div>

          {/* Buttons */}
          <div className="d-grid gap-3">

            {/* Admin Button */}
            <button
              onClick={handleAdminLogin}
              className="btn btn-primary btn-lg btn-pill"
            >
               Admin Login
            </button>

            {/* Employee Button */}
            <button
              onClick={handleEmployeeLogin}
              className="btn btn-outline-secondary btn-lg btn-pill"
            >
               Employee Login
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
