import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const MainLayout = ({ children, isEmployeePortal = false }) => {
  return (
    <>
      {/* Navbar */}
      {!isEmployeePortal && (
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(135deg, #1e3c72, #2a5298)' }}>
          <div className="container-fluid">
            <Link className="navbar-brand fw-bold fs-4" to="/dashboard">
               Attendance System
            </Link>

            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">

                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>

                {/* Employees Dropdown */}
                <li className="nav-item dropdown">
                  <span className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                    Employees
                  </span>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/employees">View All</Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/add-employee">Add New</Link>
                    </li>
                  </ul>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/mark-attendance">
                    Mark Attendance
                  </Link>
                </li>

                {/* View Attendance */}
                <li className="nav-item dropdown">
                  <span className="nav-link dropdown-toggle" data-bs-toggle="dropdown">
                    View Attendance
                  </span>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/attendance/date">By Date</Link></li>
                    <li><Link className="dropdown-item" to="/attendance/month">By Month</Link></li>
                    <li><Link className="dropdown-item" to="/attendance/year">By Year</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><Link className="dropdown-item" to="/attendance/history">Full History</Link></li>
                  </ul>
                </li>

                <li className="nav-item">
                  <Link className="nav-link" to="/reports">Reports</Link>
                </li>

              </ul>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <div className="container-fluid mt-4 page-container">
        {children}
      </div>

      {/* Footer */}
      <footer className="text-center py-4 mt-5" style={{background: 'linear-gradient(135deg, #1a3560, #244877)'}}>
        {/* Footer content removed as per original */}
      </footer>
    </>
  );
};

export default MainLayout;