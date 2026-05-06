import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      localStorage.setItem("authToken", "admin-mock-token");
      navigate("/dashboard");
    } else {
      setError("Invalid Username/Password. Please try again");
    }
  };

  return (
    <div className="app-shell d-flex justify-content-center align-items-center">
      <div className="card panel-card shadow-sm" style={{ width: "100%", maxWidth: "420px" }}>
        <div className="card-body p-4">

          {/* Title */}
          <div className="text-center mb-4">
            <h3 className="fw-bold text-black">Admin Login</h3>
            <p className="text-muted mb-0">Enter credentials to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger mb-3">{error}</div>
            )}
            <div className="mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="password"
                className="form-control form-control-lg"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-lg w-100 btn-pill"
            >
              Login as Admin
            </button>
          </form>



        </div>
      </div>
    </div>
  );
}

export default AdminLogin;

