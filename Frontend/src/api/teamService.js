import apiClient from './axios.config';

const teamService = {
  // Team CRUD operations
  createTeam: (data) => apiClient.post('/teams', data),
  getAllTeams: () => apiClient.get('/teams'),
  getTeamById: (teamId) => apiClient.get(`/teams/${teamId}`),
  updateTeam: (teamId, data) => apiClient.put(`/teams/${teamId}`, data),
  deleteTeam: (teamId) => apiClient.delete(`/teams/${teamId}`),

  // Team member management
  getTeamMembers: (teamId) => apiClient.get(`/teams/${teamId}/members`),
  addTeamMember: (teamId, data) => apiClient.post(`/teams/${teamId}/members`, data),
  removeTeamMember: (teamId, userId) => apiClient.delete(`/teams/${teamId}/members/${userId}`),
  updateMemberRole: (teamId, userId, data) => 
    apiClient.patch(`/teams/${teamId}/members/${userId}/role`, data),
  getTeamInvitations: (teamId) => apiClient.get(`/teams/${teamId}/invitations`),
  sendTeamInvitation: (teamId, data) => apiClient.post(`/teams/${teamId}/invitations`, data),
  cancelTeamInvitation: (teamId, invitationId) => apiClient.delete(`/teams/${teamId}/invitations/${invitationId}`),

  // Team projects
  getTeamProjects: (teamId) => apiClient.get(`/teams/${teamId}/projects`),
  addTeamProject: (teamId, projectId) => apiClient.post(`/teams/${teamId}/projects`, { projectId }),
  removeTeamProject: (teamId, projectId) => apiClient.delete(`/teams/${teamId}/projects/${projectId}`),

  // Team analytics
  getTeamStats: (teamId) => apiClient.get(`/teams/${teamId}/stats`),
  getTeamActivity: (teamId) => apiClient.get(`/teams/${teamId}/activity`),
  getTeamTaskMetrics: (teamId) => apiClient.get(`/teams/${teamId}/task-metrics`),
  getTeamTimelogs: (teamId, params) => apiClient.get(`/teams/${teamId}/timelogs`, { params }),
  getTeamPerformance: (teamId) => apiClient.get(`/teams/${teamId}/performance`),

  // Team settings
  updateTeamSettings: (teamId, settings) => apiClient.put(`/teams/${teamId}/settings`, settings),
  getTeamPermissions: (teamId) => apiClient.get(`/teams/${teamId}/permissions`),
  updateTeamPermissions: (teamId, permissions) => apiClient.put(`/teams/${teamId}/permissions`, permissions)
};

export default teamService;