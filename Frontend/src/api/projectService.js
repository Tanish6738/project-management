import apiClient from './axios.config';

const projectService = {
  // Project CRUD operations
  getAllProjects: (params) => apiClient.get('/projects', { params }),
  getProjectById: (projectId) => apiClient.get(`/projects/${projectId}`),
  createProject: (projectData) => apiClient.post('/projects', projectData),
  updateProject: (projectId, projectData) => apiClient.put(`/projects/${projectId}`, projectData),
  deleteProject: (projectId) => apiClient.delete(`/projects/${projectId}`),
  
  // Project team management
  getProjectMembers: (projectId) => apiClient.get(`/projects/${projectId}/members`),
  addProjectMember: (projectId, memberData) => apiClient.post(`/projects/${projectId}/members`, memberData),
  removeProjectMember: (projectId, userId) => apiClient.delete(`/projects/${projectId}/members/${userId}`),
  updateMemberRole: (projectId, userId, roleData) => 
    apiClient.patch(`/projects/${projectId}/members/${userId}/role`, roleData),
  updateMemberPermissions: (projectId, userId, permissionsData) =>
    apiClient.patch(`/projects/${projectId}/members/${userId}/permissions`, permissionsData),
  
  // Team associations
  addTeamToProject: (projectId, teamId) => apiClient.post(`/projects/${projectId}/team`, { teamId }),
  removeTeamFromProject: (projectId, teamId) => apiClient.delete(`/projects/${projectId}/team/${teamId}`),
  
  // Project invitations
  getProjectInvitations: (projectId) => apiClient.get(`/projects/${projectId}/invitations`),
  sendProjectInvitation: (projectId, inviteData) => apiClient.post(`/projects/${projectId}/invitations`, inviteData),
  cancelProjectInvitation: (projectId, invitationId) => apiClient.delete(`/projects/${projectId}/invitations/${invitationId}`),
  
  // Project configuration
  updateProjectSettings: (projectId, settings) => 
    apiClient.put(`/projects/${projectId}/settings`, settings),
  updateProjectWorkflow: (projectId, workflow) => 
    apiClient.put(`/projects/${projectId}/workflow`, workflow),
  manageProjectTags: (projectId, tagsData) => 
    apiClient.post(`/projects/${projectId}/tags`, tagsData),
  getProjectTags: (projectId) => apiClient.get(`/projects/${projectId}/tags`),
  
  // Project templates
  saveAsTemplate: (projectId, templateData) => apiClient.post(`/projects/${projectId}/save-as-template`, templateData),
  createFromTemplate: (templateId, projectData) => apiClient.post(`/projects/templates/${templateId}`, projectData),
  getProjectTemplates: () => apiClient.get('/projects/templates'),
  
  // Project views
  getProjectKanbanConfig: (projectId) => apiClient.get(`/projects/${projectId}/kanban-config`),
  updateProjectKanbanConfig: (projectId, config) => apiClient.put(`/projects/${projectId}/kanban-config`, config),
  getProjectCalendarConfig: (projectId) => apiClient.get(`/projects/${projectId}/calendar-config`),
  updateProjectCalendarConfig: (projectId, config) => apiClient.put(`/projects/${projectId}/calendar-config`, config),
  
  // Project favorites
  addToFavorites: (projectId) => apiClient.post(`/projects/${projectId}/favorite`),
  removeFromFavorites: (projectId) => apiClient.delete(`/projects/${projectId}/favorite`),
  getFavoriteProjects: () => apiClient.get('/projects/favorites'),
  
  // Project statistics
  getProjectStats: (projectId) => apiClient.get(`/projects/${projectId}/stats`),
  getProjectTimeline: (projectId) => apiClient.get(`/projects/${projectId}/timeline`),
  getProjectActivity: (projectId) => apiClient.get(`/projects/${projectId}/activity`),
  getProjectWorkload: (projectId) => apiClient.get(`/projects/${projectId}/workload`),
  getProjectProgress: (projectId) => apiClient.get(`/projects/${projectId}/progress`),
  
  // Project archiving
  archiveProject: (projectId) => apiClient.post(`/projects/${projectId}/archive`),
  unarchiveProject: (projectId) => apiClient.post(`/projects/${projectId}/unarchive`),
  getArchivedProjects: () => apiClient.get('/projects/archived'),
  
  // Project export/import
  exportProject: (projectId, format) => apiClient.get(`/projects/${projectId}/export`, 
    { params: { format }, responseType: 'blob' }),
  importProject: (formData) => apiClient.post('/projects/import', formData, 
    { headers: { 'Content-Type': 'multipart/form-data' } })
};

export default projectService;