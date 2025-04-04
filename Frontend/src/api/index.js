import apiClient from './axios.config';

// User Service
export const userService = {
  register: (data) => apiClient.post('/users/register', data),
  login: (data) => apiClient.post('/users/login', data),
  logout: () => apiClient.post('/users/logout'),
  refreshToken: () => apiClient.post('/users/refresh-token'),
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (data) => apiClient.put('/users/me', data),
  updatePreferences: (data) => apiClient.put('/users/preferences', data),
  updateTimeSettings: (data) => apiClient.put('/users/time-settings', data),
};

// Project Service
export const projectService = {
  createProject: (data) => apiClient.post('/projects', data),
  getAllProjects: () => apiClient.get('/projects'),
  getProjectById: (id) => apiClient.get(`/projects/${id}`),
  updateProject: (id, data) => apiClient.put(`/projects/${id}`, data),
  deleteProject: (id) => apiClient.delete(`/projects/${id}`),
  addMember: (projectId, data) => apiClient.post(`/projects/${projectId}/members`, data),
  removeMember: (projectId, userId) => apiClient.delete(`/projects/${projectId}/members/${userId}`),
  updateMemberRole: (projectId, userId, data) => apiClient.put(`/projects/${projectId}/members/${userId}/role`, data),
};

// Task Service
export const taskService = {
  createTask: (data) => apiClient.post('/tasks', data),
  getProjectTasks: (projectId) => apiClient.get(`/tasks/project/${projectId}`),
  getUserTasks: () => apiClient.get('/tasks/user'),
  updateTask: (id, data) => apiClient.put(`/tasks/${id}`, data),
  deleteTask: (id) => apiClient.delete(`/tasks/${id}`),
  updateTaskStatus: (id, status) => apiClient.patch(`/tasks/${id}/status`, { status }),
  addComment: (taskId, data) => apiClient.post(`/tasks/${taskId}/comments`, data),
  getTaskComments: (taskId) => apiClient.get(`/tasks/${taskId}/comments`),
};

// Team Service
export const teamService = {
  createTeam: (data) => apiClient.post('/teams', data),
  getAllTeams: () => apiClient.get('/teams'),
  getTeamById: (id) => apiClient.get(`/teams/${id}`),
  updateTeam: (id, data) => apiClient.put(`/teams/${id}`, data),
  deleteTeam: (id) => apiClient.delete(`/teams/${id}`),
  addMember: (teamId, data) => apiClient.post(`/teams/${teamId}/members`, data),
  removeMember: (teamId, userId) => apiClient.delete(`/teams/${teamId}/members/${userId}`),
  updateMemberRole: (teamId, userId, data) => apiClient.put(`/teams/${teamId}/members/${userId}/role`, data),
};

// Comment Service
export const commentService = {
  createComment: (taskId, data) => apiClient.post(`/comments/${taskId}`, data),
  getTaskComments: (taskId) => apiClient.get(`/comments/${taskId}`),
  updateComment: (commentId, data) => apiClient.put(`/comments/${commentId}`, data),
  deleteComment: (commentId) => apiClient.delete(`/comments/${commentId}`),
  addReply: (commentId, data) => apiClient.post(`/comments/${commentId}/replies`, data),
  getReplies: (commentId) => apiClient.get(`/comments/${commentId}/replies`),
};

// TimeLog Service
export const timelogService = {
  startTimer: (taskId) => apiClient.post(`/timelogs/${taskId}/start`),
  stopTimer: (taskId) => apiClient.post(`/timelogs/${taskId}/stop`),
  getTaskTimeLogs: (taskId) => apiClient.get(`/timelogs/${taskId}`),
  getUserTimeLogs: () => apiClient.get('/timelogs/user'),
  updateTimeLog: (id, data) => apiClient.put(`/timelogs/${id}`, data),
  deleteTimeLog: (id) => apiClient.delete(`/timelogs/${id}`),
};