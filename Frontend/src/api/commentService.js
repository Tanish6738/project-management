import apiClient from './axios.config';

const commentService = {
  // Comment CRUD operations
  createComment: (taskId, data) => apiClient.post(`/tasks/${taskId}/comments`, data),
  getTaskComments: (taskId) => apiClient.get(`/tasks/${taskId}/comments`),
  updateComment: (commentId, data) => apiClient.put(`/comments/${commentId}`, data),
  deleteComment: (commentId) => apiClient.delete(`/comments/${commentId}`),

  // Comment reply operations
  addReply: (commentId, data) => apiClient.post(`/comments/${commentId}/replies`, data),
  getReplies: (commentId) => apiClient.get(`/comments/${commentId}/replies`),
  updateReply: (commentId, replyId, data) => apiClient.put(`/comments/${commentId}/replies/${replyId}`, data),
  deleteReply: (commentId, replyId) => apiClient.delete(`/comments/${commentId}/replies/${replyId}`),

  // Comment reactions
  addReaction: (commentId, reaction) => apiClient.post(`/comments/${commentId}/reactions`, { reaction }),
  removeReaction: (commentId, reactionId) => apiClient.delete(`/comments/${commentId}/reactions/${reactionId}`),
  getReactions: (commentId) => apiClient.get(`/comments/${commentId}/reactions`),

  // Comment mentions and notifications
  getMentions: () => apiClient.get('/comments/mentions'),
  markAsRead: (commentId) => apiClient.patch(`/comments/${commentId}/read`),
  
  // Comment threads
  getCommentThread: (threadId) => apiClient.get(`/comments/threads/${threadId}`),
  resolveThread: (threadId) => apiClient.patch(`/comments/threads/${threadId}/resolve`),
  reopenThread: (threadId) => apiClient.patch(`/comments/threads/${threadId}/reopen`)
};

export default commentService;