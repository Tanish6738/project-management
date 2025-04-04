import apiClient from './axios.config';

const projectService = {
  // Project CRUD operations
  getAllProjects: () => apiClient.get('/projects'),
  getProjectById: (projectId) => apiClient.get(`/projects/${projectId}`),
  createProject: (projectData) => apiClient.post('/projects', projectData),
  updateProject: (projectId, projectData) => apiClient.put(`/projects/${projectId}`, projectData),
  deleteProject: (projectId) => apiClient.delete(`/projects/${projectId}`),
  
  // Project team management
  getProjectMembers: (projectId) => apiClient.get(`/projects/${projectId}/members`),
  addProjectMember: (projectId, userData) => apiClient.post(`/projects/${projectId}/members`, userData),
  removeProjectMember: (projectId, userId) => apiClient.delete(`/projects/${projectId}/members/${userId}`),
  
  // Project statistics
  getProjectStats: (projectId) => apiClient.get(`/projects/${projectId}/stats`),
};

export default projectService;