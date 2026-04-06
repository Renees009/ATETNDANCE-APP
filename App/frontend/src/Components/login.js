import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("authToken");
  }, []);

  const handleAdminLogin = () => {
    localStorage.setItem("authToken", "admin-mock-token");
    navigate("/dashboard");
  };

  const handleEmployeeLogin = () => {
    localStorage.setItem("authToken", "employee-mock-token");
    navigate("/employees/choose");
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e3c72, #2a5298)",
      }}
    >
      <div
        className="card shadow-lg"
        style={{
          width: "100%",
          maxWidth: "420px",
          borderRadius: "15px",
        }}
      >
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
              className="btn btn-primary btn-lg"
              style={{ borderRadius: "10px" }}
            >
               Admin Login
            </button>

            {/* Employee Button */}
            <button
              onClick={handleEmployeeLogin}
              className="btn btn-outline-secondary btn-lg"
              style={{ borderRadius: "10px" }}
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
