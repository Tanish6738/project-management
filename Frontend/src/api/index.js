import apiClient from './axios.config';
import taskService from './taskService';
import commentService from './commentService';
import attachmentService from './attachmentService';
import timelogService from './timelogService';
import teamService from './teamService';
import projectService from './projectService';

// User Service
const userService = {
  register: (data) => apiClient.post('/users/register', data),
  login: (data) => apiClient.post('/users/login', data),
  logout: () => apiClient.post('/users/logout'),
  refreshToken: () => apiClient.post('/users/refresh-token'),
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (data) => apiClient.put('/users/me', data),
  updatePreferences: (data) => apiClient.put('/users/preferences', data),
  updateTimeSettings: (data) => apiClient.put('/users/time-settings', data),
};

export {
  userService,
  projectService,
  taskService,
  teamService,
  commentService,
  attachmentService,
  timelogService
};