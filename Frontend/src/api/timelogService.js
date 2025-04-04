import apiClient from './axios.config';

const timelogService = {
  // Timelog CRUD operations
  getTaskTimelogs: (taskId) => apiClient.get(`/tasks/${taskId}/timelogs`),
  getUserTimelogs: () => apiClient.get('/timelogs/me'),
  createTimelog: (timelogData) => apiClient.post('/timelogs', timelogData),
  updateTimelog: (timelogId, timelogData) => apiClient.put(`/timelogs/${timelogId}`, timelogData),
  deleteTimelog: (timelogId) => apiClient.delete(`/timelogs/${timelogId}`),
  
  // Time tracking actions
  startTimer: (taskId) => apiClient.post(`/timelogs/start`, { taskId }),
  stopTimer: () => apiClient.post(`/timelogs/stop`),
  
  // Reports and statistics
  getTimelogStats: (filters) => apiClient.get('/timelogs/stats', { params: filters }),
};

export default timelogService;