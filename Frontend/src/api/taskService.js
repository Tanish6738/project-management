import apiClient from './axios.config';

const taskService = {
  // Task CRUD operations
  getAllTasks: (params) => apiClient.get('/tasks', { params }),
  getProjectTasks: (projectId, params) => apiClient.get(`/tasks/project/${projectId}`, { params }),
  getTaskById: (taskId) => apiClient.get(`/tasks/${taskId}`),
  createTask: (taskData) => apiClient.post('/tasks', taskData),
  updateTask: (taskId, taskData) => apiClient.put(`/tasks/${taskId}`, taskData),
  deleteTask: (taskId) => apiClient.delete(`/tasks/${taskId}`),
  
  // Bulk operations
  bulkCreateTasks: (tasksData) => apiClient.post('/tasks/bulk', tasksData),
  bulkUpdateTasks: (tasksData) => apiClient.put('/tasks/bulk', tasksData),
  bulkDeleteTasks: (taskIds) => apiClient.delete('/tasks/bulk', { data: { taskIds } }),
  
  // User tasks
  getUserTasks: (params) => apiClient.get('/tasks/assigned-to-me', { params }),
  getCreatedByMeTasks: (params) => apiClient.get('/tasks/created-by-me', { params }),
  
  // Task assignment and status
  assignTask: (taskId, userId) => apiClient.post(`/tasks/${taskId}/assign`, { userId }),
  unassignTask: (taskId) => apiClient.post(`/tasks/${taskId}/unassign`),
  updateTaskStatus: (taskId, status) => apiClient.patch(`/tasks/${taskId}/status`, { status }),
  updateTaskPriority: (taskId, priority) => apiClient.patch(`/tasks/${taskId}/priority`, { priority }),
  
  // Task details management
  addTaskLabel: (taskId, label) => apiClient.post(`/tasks/${taskId}/labels`, { label }),
  removeTaskLabel: (taskId, labelId) => apiClient.delete(`/tasks/${taskId}/labels/${labelId}`),
  updateTaskDates: (taskId, dates) => apiClient.patch(`/tasks/${taskId}/dates`, dates),
  
  // Task time tracking
  addTimeEntry: (taskId, data) => apiClient.post(`/tasks/${taskId}/time-entries`, data),
  getTimeEntries: (taskId) => apiClient.get(`/tasks/${taskId}/time-entries`),
  
  // Task relationships
  addDependency: (taskId, dependencyId) => apiClient.post(`/tasks/${taskId}/dependencies`, { dependencyId }),
  removeDependency: (taskId, dependencyId) => apiClient.delete(`/tasks/${taskId}/dependencies/${dependencyId}`),
  getDependencies: (taskId) => apiClient.get(`/tasks/${taskId}/dependencies`),
  getBlockers: (taskId) => apiClient.get(`/tasks/${taskId}/blockers`),
  
  // Task watchers
  addTaskWatcher: (taskId, userId) => apiClient.post(`/tasks/${taskId}/watchers`, { userId }),
  removeTaskWatcher: (taskId, userId) => apiClient.delete(`/tasks/${taskId}/watchers/${userId}`),
  getTaskWatchers: (taskId) => apiClient.get(`/tasks/${taskId}/watchers`),
  
  // Task views
  getTaskTreeView: (projectId) => apiClient.get('/tasks/tree', { params: { projectId } }),
  getTasksByStatus: (projectId) => apiClient.get('/tasks/by-status', { params: { projectId } }),
  getTasksByAssignee: (projectId) => apiClient.get('/tasks/by-assignee', { params: { projectId } }),
  getTaskTimeline: (projectId) => apiClient.get('/tasks/timeline', { params: { projectId } }),
  getTaskKanbanView: (projectId) => apiClient.get('/tasks/kanban', { params: { projectId } }),
  getTaskCalendarView: (projectId) => apiClient.get('/tasks/calendar', { params: { projectId } }),
  
  // Team tasks
  getTeamTaskStats: (teamId) => apiClient.get(`/tasks/team-stats/${teamId}`),
  
  // Task analytics
  getTaskMetrics: (taskId) => apiClient.get(`/tasks/${taskId}/metrics`),
  getTaskHistory: (taskId) => apiClient.get(`/tasks/${taskId}/history`),
  getTaskAuditLog: (taskId) => apiClient.get(`/tasks/${taskId}/audit-log`),
  getAllTaskActivities: () => apiClient.get('/tasks/activities'),
  
  // Subtasks
  createSubtask: (parentTaskId, subtaskData) => apiClient.post(`/tasks/${parentTaskId}/subtasks`, subtaskData),
  getSubtasks: (parentTaskId) => apiClient.get(`/tasks/${parentTaskId}/subtasks`),
  updateSubtaskStatus: (parentTaskId, subtaskId, status) => 
    apiClient.patch(`/tasks/${parentTaskId}/subtasks/${subtaskId}/status`, { status }),
  
  // Task archiving
  archiveTask: (taskId) => apiClient.post(`/tasks/${taskId}/archive`),
  unarchiveTask: (taskId) => apiClient.post(`/tasks/${taskId}/unarchive`),
  getArchivedTasks: (projectId) => apiClient.get('/tasks/archived', { params: { projectId } }),
  
  // Task templates
  saveAsTemplate: (taskId, templateData) => apiClient.post(`/tasks/${taskId}/save-as-template`, templateData),
  getTaskTemplates: () => apiClient.get('/tasks/templates'),
  createFromTemplate: (templateId, taskData) => apiClient.post(`/tasks/templates/${templateId}`, taskData)
};

export default taskService;