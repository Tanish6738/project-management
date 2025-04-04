import apiClient from './axios.config';

const commentService = {
  // Comment CRUD operations
  getTaskComments: (taskId) => apiClient.get(`/tasks/${taskId}/comments`),
  createComment: (taskId, commentData) => apiClient.post(`/tasks/${taskId}/comments`, commentData),
  updateComment: (commentId, commentData) => apiClient.put(`/comments/${commentId}`, commentData),
  deleteComment: (commentId) => apiClient.delete(`/comments/${commentId}`),
  
  // Reply to comments
  replyToComment: (commentId, replyData) => apiClient.post(`/comments/${commentId}/replies`, replyData),
};

export default commentService;