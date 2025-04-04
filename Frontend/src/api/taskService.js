import apiClient from './axios.config';

const taskService = {
  // Task CRUD operations
  getAllTasks: () => apiClient.get('/tasks'),
  getProjectTasks: (projectId) => apiClient.get(`/projects/${projectId}/tasks`),
  getTaskById: (taskId) => apiClient.get(`/tasks/${taskId}`),
  createTask: (taskData) => apiClient.post('/tasks', taskData),
  updateTask: (taskId, taskData) => apiClient.put(`/tasks/${taskId}`, taskData),
  deleteTask: (taskId) => apiClient.delete(`/tasks/${taskId}`),
  
  // Task assignment
  assignTask: (taskId, userId) => apiClient.post(`/tasks/${taskId}/assign`, { userId }),
  unassignTask: (taskId) => apiClient.post(`/tasks/${taskId}/unassign`),
  
  // Task status
  updateTaskStatus: (taskId, status) => apiClient.patch(`/tasks/${taskId}/status`, { status }),
  
  // User tasks
  getUserTasks: () => apiClient.get('/tasks/me'),
};

export default taskService;