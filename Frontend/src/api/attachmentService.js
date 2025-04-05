import apiClient from './axios.config';

const attachmentService = {
  // File upload operations
  uploadTaskAttachment: (taskId, formData) => 
    apiClient.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadProjectAttachment: (projectId, formData) => 
    apiClient.post(`/projects/${projectId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // File retrieval operations
  getTaskAttachments: (taskId) => apiClient.get(`/tasks/${taskId}/attachments`),
  getProjectAttachments: (projectId) => apiClient.get(`/projects/${projectId}/attachments`),
  getAttachmentById: (attachmentId) => apiClient.get(`/attachments/${attachmentId}`),
  downloadAttachment: (attachmentId) => apiClient.get(`/attachments/${attachmentId}/download`, {
    responseType: 'blob'
  }),

  // File management operations
  deleteAttachment: (attachmentId) => apiClient.delete(`/attachments/${attachmentId}`),
  updateAttachmentDetails: (attachmentId, data) => apiClient.put(`/attachments/${attachmentId}`, data),
  
  // File preview operations
  getAttachmentPreview: (attachmentId) => apiClient.get(`/attachments/${attachmentId}/preview`),
  getAttachmentThumbnail: (attachmentId) => apiClient.get(`/attachments/${attachmentId}/thumbnail`),

  // Attachment metadata
  getAttachmentMetadata: (attachmentId) => apiClient.get(`/attachments/${attachmentId}/metadata`),
  updateAttachmentMetadata: (attachmentId, metadata) => 
    apiClient.put(`/attachments/${attachmentId}/metadata`, metadata),

  // Bulk operations
  bulkUpload: (taskId, formDataArray) => 
    apiClient.post(`/tasks/${taskId}/attachments/bulk`, formDataArray, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  bulkDelete: (attachmentIds) => apiClient.post('/attachments/bulk-delete', { attachmentIds })
};

export default attachmentService;