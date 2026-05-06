import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const MainLayout = ({ children, isEmployeePortal = false }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/admin-login');
  };

  return (
    <>
      {/* Simple Logout Bar - Always shown for admin pages */}
      <div 
        className="position-fixed top-0 end-0 p-3 z-3" 
        style={{ 
          background: '#f8f9fa', 
          borderRadius: '0 0 0 10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <button 
          onClick={handleLogout}
          className="btn btn-outline-dark btn-sm"
        >
          <i className="bi bi-box-arrow-right me-1"></i>Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="app-shell">
        <div className="page-container">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 mt-5" style={{background: '#f8fafc'}}>
      </footer>
    </>
  );
};

export default MainLayout;
