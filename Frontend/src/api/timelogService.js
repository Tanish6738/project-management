import apiClient from './axios.config';

const timelogService = {
  // Timer operations
  startTimer: (taskId) => apiClient.post(`/timelogs/${taskId}/start`),
  stopTimer: (taskId) => apiClient.post(`/timelogs/${taskId}/stop`),
  pauseTimer: (taskId) => apiClient.post(`/timelogs/${taskId}/pause`),
  resumeTimer: (taskId) => apiClient.post(`/timelogs/${taskId}/resume`),
  
  // Time entry management
  createTimeEntry: (taskId, data) => apiClient.post(`/timelogs/${taskId}`, data),
  updateTimeEntry: (timelogId, data) => apiClient.put(`/timelogs/${timelogId}`, data),
  deleteTimeEntry: (timelogId) => apiClient.delete(`/timelogs/${timelogId}`),
  
  // Time logs retrieval
  getTaskTimeLogs: (taskId) => apiClient.get(`/timelogs/task/${taskId}`),
  getUserTimeLogs: (userId) => apiClient.get(`/timelogs/user/${userId}`),
  getProjectTimeLogs: (projectId) => apiClient.get(`/timelogs/project/${projectId}`),
  
  // Time tracking reports
  getTimeReport: (filters) => apiClient.get('/timelogs/report', { params: filters }),
  getUserTimesheet: (userId, startDate, endDate) => 
    apiClient.get('/timelogs/timesheet', { params: { userId, startDate, endDate } }),
  getProjectTimeReport: (projectId, startDate, endDate) => 
    apiClient.get(`/timelogs/project/${projectId}/report`, { params: { startDate, endDate } }),
  
  // Time tracking analytics
  getTimeTrackingStats: (userId) => apiClient.get(`/timelogs/stats/${userId}`),
  getWeeklyReport: (userId, weekStart) => 
    apiClient.get('/timelogs/weekly-report', { params: { userId, weekStart } }),
  getMonthlyReport: (userId, monthYear) => 
    apiClient.get('/timelogs/monthly-report', { params: { userId, monthYear } })
};

export default timelogService;