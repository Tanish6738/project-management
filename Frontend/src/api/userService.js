import apiClient from './axios.config';

const userService = {
  // Authentication
  login: (credentials) => apiClient.post('/users/login', credentials),
  register: (userData) => apiClient.post('/users/register', userData),
  logout: () => apiClient.post('/users/logout'),
  
  // User profile
  getCurrentUser: () => apiClient.get('/users/me'),
  updateProfile: (userData) => apiClient.put('/users/me', userData),
  
  // User management (admin functions)
  getAllUsers: () => apiClient.get('/users'),
  getUserById: (userId) => apiClient.get(`/users/${userId}`),
  updateUser: (userId, userData) => apiClient.put(`/users/${userId}`, userData),
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
};

export default userService;