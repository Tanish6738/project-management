import apiClient from './axios.config';

const attachmentService = {
  // Attachment CRUD operations
  getTaskAttachments: (taskId) => apiClient.get(`/tasks/${taskId}/attachments`),
  getAttachmentById: (attachmentId) => apiClient.get(`/attachments/${attachmentId}`),
  deleteAttachment: (attachmentId) => apiClient.delete(`/attachments/${attachmentId}`),
  
  // File upload (using FormData for file uploads)
  uploadAttachment: (taskId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Helper to get download URL for an attachment
  getDownloadUrl: (attachmentId) => `${apiClient.defaults.baseURL}/attachments/${attachmentId}/download`,
};

export default attachmentService;