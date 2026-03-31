const API_BASE = 'http://127.0.0.1:8000/attendance';

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };
  
  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API ${response.status}: ${error}`);
  }
  return response.json();
};

export const api = {
  // Dashboard
  getDashboard: () => apiCall('api/dashboard/'),
  
  // Employees
  getEmployees: (params = {}) => apiCall('api/employees/', { 
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    params 
  }),
  getEmployee: (employeeId) => apiCall(`api/employees/${employeeId}/`),
  
  // Attendance Mark
  getTodayAttendance: () => apiCall('api/mark-attendance/'),
  markAttendance: (data) => apiCall('api/mark-attendance/', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  
  // Views
  getAttendanceByDate: (date) => apiCall(`api/attendance-by-date/?date=${date}`),
  getAttendanceByMonth: ({month, year, employee}) => apiCall(`api/attendance-by-month/?month=${month}&year=${year}${employee ? `&employee=${employee}` : ''}`),
  getAttendanceByYear: ({year, employee}) => apiCall(`api/attendance-by-year/?year=${year}${employee ? `&employee=${employee}` : ''}`),
  getAttendanceSummary: ({month, year}) => apiCall(`api/attendance-summary/?month=${month || new Date().getMonth()+1}&year=${year || new Date().getFullYear()}`),
  getAttendanceHistory: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`api/attendance-history/?${params}`);
  },
  
  // Detail/Update
  getAttendanceDetail: (id) => apiCall(`api/attendance/${id}/`),
  updateAttendance: (id, data) => apiCall(`api/attendance/${id}/update/`, {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

export default api;
