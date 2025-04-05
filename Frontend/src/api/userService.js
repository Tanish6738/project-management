import apiClient from './axios.config';

const userService = {
  // Auth operations
  register: (userData) => apiClient.post('/users/register', userData),
  login: (credentials) => apiClient.post('/users/login', credentials),
  logout: () => apiClient.post('/users/logout'),
  refreshToken: () => apiClient.post('/users/refresh-token'),
  verifyEmail: (token) => apiClient.get(`/users/verify-email/${token}`),
  forgotPassword: (email) => apiClient.post('/users/forgot-password', { email }),
  resetPassword: (token, password) => apiClient.post(`/users/reset-password/${token}`, { password }),
  
  // Profile management
  getProfile: () => apiClient.get('/users/me'),
  updateProfile: (userData) => apiClient.put('/users/me', userData),
  changePassword: (passwordData) => apiClient.put('/users/change-password', passwordData),
  uploadAvatar: (formData) => apiClient.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // User preferences
  updatePreferences: (preferences) => apiClient.put('/users/preferences', preferences),
  getNotificationSettings: () => apiClient.get('/users/notifications/settings'),
  updateNotificationSettings: (settings) => apiClient.put('/users/notifications/settings', settings),
  
  // User teams and projects
  getUserTeams: () => apiClient.get('/users/teams'),
  getUserProjects: () => apiClient.get('/users/projects'),
  
  // User search and management
  searchUsers: (query) => apiClient.get('/users/search', { params: { query } }),
  getUserById: (userId) => apiClient.get(`/users/${userId}`),
  getUsers: (options = {}) => apiClient.get('/users', { params: options }),
  
  // Activity and notifications
  getUserActivity: () => apiClient.get('/users/activity'),
  getNotifications: () => apiClient.get('/users/notifications'),
  markNotificationRead: (notificationId) => 
    apiClient.put(`/users/notifications/${notificationId}/read`),
  markAllNotificationsRead: () => apiClient.put('/users/notifications/read-all'),
  
  // Work hours and availability
  setWorkHours: (workHours) => apiClient.post('/users/work-hours', workHours),
  getWorkHours: () => apiClient.get('/users/work-hours'),
  setAvailability: (availability) => apiClient.post('/users/availability', availability),
  getAvailability: () => apiClient.get('/users/availability'),

  // User dashboard
  getDashboardStats: () => apiClient.get('/users/dashboard'),
  getWorkloadStats: () => apiClient.get('/users/workload')
};

export default userService;