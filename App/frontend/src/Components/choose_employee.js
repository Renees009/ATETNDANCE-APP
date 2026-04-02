import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ChooseEmployee() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Fetch employees from backend (MySQL)
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://127.0.0.1:8000/attendance/api/employees/");
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Raw API response:', data);
        
        // Handle both {employees: [...]} and direct array response
        const employeeList = data.employees || data || [];
        console.log('Processed employees:', employeeList);
        
        setEmployees(employeeList);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
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
      localStorage.setItem('selectedEmployeeId', selectedEmployee);
      navigate(`/employee-home/${selectedEmployee}`);
    }
  };

  if (loading) {
    return (
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading employees...</span>
              </div>
              <p className="mt-2">Loading employees from database...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="row justify-content-center mt-5 min-vh-100 align-items-center">
      <div className="col-md-6">
        <div className="card shadow-lg">
          <div className="card-header bg-primary text-white text-center">
            <h4 className="mb-0">
               Employee Portal
            </h4>
            <p className="text-white-50 mb-0">Select your profile to continue</p>
          </div>

          <div className="card-body p-4">
            {error && (
              <div className="alert alert-danger mb-3">
                <strong>Error loading employees:</strong> {error}
                <br/>
                <small>Make sure Django server is running: <code>python manage.py runserver</code></small>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-bold">
                   Select Employee 
                </label>
                <select
                  className="form-select form-control form-select-lg"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  required
                >
                  <option value="">-- Choose Employee --</option>
                  {employees.map((emp, index) => (
                    <option key={emp.employee_id || index} value={emp.employee_id}>
                      {emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim()} 
                      ({emp.employee_id})
                      {emp.department ? ` - ${emp.department}` : ''}
                    </option>
                  ))}
                </select>
                {employees.length === 0 && !loading && !error && (
                  <small className="text-muted">
                    No employees found. Add some via Admin Panel first.
                  </small>
                )}
              </div>

              <button 
                type="submit" 
                className="btn btn-primary btn-lg w-100 shadow-sm"
                disabled={!selectedEmployee}
              >
                <i className="bi bi-arrow-right me-2"></i>
                Continue to Portal
              </button>
            </form>

            
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChooseEmployee;

