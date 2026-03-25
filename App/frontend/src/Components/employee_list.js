import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch employees
  const fetchEmployees = () => {
    let url = "http://127.0.0.1:8000/attendance/api/employees/";

    if (search) {
      url += `?search=${search}`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data.employees || data);
      });
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEmployees();
  };

  const clearSearch = () => {
    setSearch("");
    fetchEmployees();
  };

  return (
    <div>

      {/* Title */}
      <div className="row mb-4">
        <div className="col-md-12">
          <h2>Employees</h2>
        </div>
      </div>

      {/* Search + Add */}
      <div className="row mb-4">

        <div className="col-md-6">
          <form onSubmit={handleSearch} className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Search by ID, name, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn btn-primary" type="submit">
              Search
            </button>

            {search && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={clearSearch}
              >
                Clear
              </button>
            )}
          </form>
        </div>

        <div className="col-md-6 text-end">
          <Link to="/add-employee" className="btn btn-success">
            ➕ Add New Employee
          </Link>
        </div>

      </div>

      {/* Table */}
      <div className="row">
        <div className="col-md-12">
          <div className="card">

            <div className="card-header">
              <h5 className="mb-0">
                Employee List ({employees.length})
              </h5>
            </div>

            <div className="table-responsive">
              <table className="table table-hover mb-0">

                <thead className="table-light">
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.length > 0 ? (
                    employees.map((emp, index) => (
                      <tr key={emp.id || index}>
                        <td><strong>{emp.employee_id}</strong></td>
                        <td>{emp.first_name} {emp.last_name}</td>
                        <td>{emp.email}</td>
                        <td>{emp.department}</td>
                        <td>{emp.position}</td>
                        <td>
                          {emp.is_active ? (
                            <span className="badge bg-success">Active</span>
                          ) : (
                            <span className="badge bg-danger">Inactive</span>
                          )}
                        </td>
                        <td>
                          <Link
                            to={`/employees/${emp.employee_id}`}
                            className="btn btn-sm btn-info me-2"
                          >
                            View
                          </Link>
                          <Link
                            to={`/employees/${emp.employee_id}/edit`}
                            className="btn btn-sm btn-warning"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

export default EmployeeList;
