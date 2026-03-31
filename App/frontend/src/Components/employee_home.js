import React, { useEffect, useState } from "react";

function EmployeePortal({ employeeId }) {
  const [employee, setEmployee] = useState({});

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/employees/${employeeId}/`)
      .then((res) => res.json())
      .then((data) => {
        setEmployee(data);
      });
  }, [employeeId]);

  return (
    <div>

      {/* Title */}
      <div className="row mb-4">
        <div className="col-md-12 text-center">
          <h2>
            Employee Portal: {employee.first_name} {employee.last_name}
          </h2>
        </div>
      </div>

      {/* Actions */}
      <div className="row">

        <div className="col-md-6">
          <a
            href={`/mark-attendance?employee_id=${employee.employee_id}`}
            className="btn btn-success w-100 mb-2"
          >
             Mark Attendance
          </a>
        </div>

        <div className="col-md-6">
          <a
            href={`/attendance-summary?employee=${employee.id}`}
            className="btn btn-info w-100 mb-2"
          >
             View My Reports
          </a>
        </div>

      </div>

    </div>
  );
}

export default EmployeePortal;