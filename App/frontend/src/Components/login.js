import React from "react";

function Login() {
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
          <a href="/dashboard" className="btn btn-primary">
            Admin
          </a>

          {/* Employee */}
          <a href="/choose-employee" className="btn btn-secondary">
            Employee
          </a>

        </div>
      </div>
    </div>
  );
}

export default Login;