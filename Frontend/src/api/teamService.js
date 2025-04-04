import apiClient from './axios.config';

const teamService = {
  // Team CRUD operations
  getAllTeams: () => apiClient.get('/teams'),
  getTeamById: (teamId) => apiClient.get(`/teams/${teamId}`),
  createTeam: (teamData) => apiClient.post('/teams', teamData),
  updateTeam: (teamId, teamData) => apiClient.put(`/teams/${teamId}`, teamData),
  deleteTeam: (teamId) => apiClient.delete(`/teams/${teamId}`),
  
  // Team members management
  getTeamMembers: (teamId) => apiClient.get(`/teams/${teamId}/members`),
  addTeamMember: (teamId, userData) => apiClient.post(`/teams/${teamId}/members`, userData),
  removeTeamMember: (teamId, userId) => apiClient.delete(`/teams/${teamId}/members/${userId}`),
  
  // User teams
  getUserTeams: () => apiClient.get('/teams/me'),
};

export default teamService;