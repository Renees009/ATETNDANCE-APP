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
          background: 'linear-gradient(135deg, #1e3c72, #2a5298)', 
          borderRadius: '0 0 0 10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        }}
      >
        <button 
          onClick={handleLogout}
          className="btn btn-outline-light btn-sm"
        >
          <i className="bi bi-box-arrow-right me-1"></i>Logout
        </button>
      </div>

      {/* Main Content - Add top padding to avoid overlap */}
      <div className="container-fluid mt-5 pt-4 page-container">
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
