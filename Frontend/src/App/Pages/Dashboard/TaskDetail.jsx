import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '../../Context/TaskContext';
import { useUser } from '../../Context/UserContext';
import { useProject } from '../../Context/ProjectContext';
import { useComment } from '../../Context/CommentContext';
import { useAttachment } from '../../Context/AttachmentContext';
import { useTimelog } from '../../Context/TimelogContext';
import toast from 'react-hot-toast';

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { 
    currentTask, 
    loading, 
    error, 
    fetchTaskById, 
    updateTask, 
    deleteTask,
    completeTask,
    assignTaskToUser
  } = useTask();
  const { users, fetchUsers } = useUser();
  const { projects, fetchProjects } = useProject();
  const { 
    comments, 
    loading: commentsLoading, 
    fetchTaskComments, 
    addComment 
  } = useComment();
  const {
    attachments,
    loading: attachmentsLoading,
    fetchTaskAttachments,
    uploadAttachment,
    deleteAttachment
  } = useAttachment();
  const {
    timelogs,
    loading: timelogsLoading,
    fetchTaskTimelogs,
    addTimeToTask,
    deleteTimelog
  } = useTimelog();

  // Local state for form values
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    deadline: '',
    assignedTo: ''
  });
  const [newComment, setNewComment] = useState('');
  const [newTimeLog, setNewTimeLog] = useState({
    timeSpent: '',
    description: '',
    startTime: '',
    endTime: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtask, setNewSubtask] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  // Fetch task details and related data
  useEffect(() => {
    if (taskId) {
      fetchTaskById(taskId);
      fetchUsers();
      fetchProjects();
      fetchTaskComments(taskId);
      fetchTaskAttachments(taskId);
      fetchTaskTimelogs(taskId);
    }
  }, [taskId, fetchTaskById, fetchUsers, fetchProjects, fetchTaskComments, fetchTaskAttachments, fetchTaskTimelogs]);

  // Update form data when task data changes
  useEffect(() => {
    if (currentTask) {
      setFormData({
        title: currentTask.title || '',
        description: currentTask.description || '',
        status: currentTask.status || '',
        priority: currentTask.priority || '',
        deadline: currentTask.deadline ? new Date(currentTask.deadline).toISOString().split('T')[0] : '',
        assignedTo: currentTask.assignedTo?._id || ''
      });
      
      setSubtasks(currentTask.subtasks || []);
    }
  }, [currentTask]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateTask(taskId, formData);
      setEditMode(false);
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error(`Failed to update task: ${error.message}`);
    }
  };

  // Handle task deletion
  const handleDelete = async () => {
    try {
      await deleteTask(taskId);
      toast.success('Task deleted successfully');
      navigate('/tasks');
    } catch (error) {
      toast.error(`Failed to delete task: ${error.message}`);
    }
  };

  // Handle task completion
  const handleCompleteTask = async () => {
    try {
      await completeTask(taskId);
      toast.success('Task marked as completed');
    } catch (error) {
      toast.error(`Failed to complete task: ${error.message}`);
    }
  };

  // Handle task assignment
  const handleAssign = async (userId) => {
    try {
      await assignTaskToUser(taskId, userId);
      toast.success('Task assigned successfully');
    } catch (error) {
      toast.error(`Failed to assign task: ${error.message}`);
    }
  };

  // Handle comment submission
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment(taskId, { content: newComment });
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error(`Failed to add comment: ${error.message}`);
    }
  };

  // Handle time log submission
  const handleAddTimeLog = async (e) => {
    e.preventDefault();
    
    try {
      await addTimeToTask(taskId, newTimeLog);
      setNewTimeLog({
        timeSpent: '',
        description: '',
        startTime: '',
        endTime: ''
      });
      toast.success('Time log added');
    } catch (error) {
      toast.error(`Failed to add time log: ${error.message}`);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      await uploadAttachment(taskId, formData);
      setSelectedFile(null);
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error(`Failed to upload file: ${error.message}`);
    }
  };

  // Handle subtask creation
  const handleAddSubtask = async (e) => {
    e.preventDefault();
    if (!newSubtask.title.trim()) return;

    try {
      // Assuming API to create subtask for a parent task
      // const createdSubtask = await createSubtask(taskId, newSubtask);
      // setSubtasks(prev => [...prev, createdSubtask]);
      setNewSubtask({
        title: '',
        description: '',
        priority: 'medium'
      });
      toast.success('Subtask added');
    } catch (error) {
      toast.error(`Failed to add subtask: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-gray-600">Task not found</p>
      </div>
    );
  }

  // Determine if the current task is overdue
  const isOverdue = () => {
    if (!currentTask.deadline) return false;
    const deadline = new Date(currentTask.deadline);
    const today = new Date();
    return deadline < today && currentTask.status !== 'completed';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Task Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            {editMode ? (
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="text-2xl font-bold border-b border-gray-300 focus:border-indigo-500 outline-none w-full"
              />
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">{currentTask.title}</h1>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-xs rounded-full ${
                currentTask.priority === 'high' 
                  ? 'bg-red-100 text-red-800' 
                  : currentTask.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {currentTask.priority ? currentTask.priority.charAt(0).toUpperCase() + currentTask.priority.slice(1) : 'No priority'}
              </span>

              <span className={`px-3 py-1 text-xs rounded-full ${
                currentTask.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : currentTask.status === 'in-progress'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {currentTask.status ? currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1) : 'No status'}
              </span>

              {currentTask.deadline && (
                <span className={`px-3 py-1 text-xs rounded-full ${
                  isOverdue()
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  Due: {new Date(currentTask.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          <div className="flex space-x-2">
            {editMode ? (
              <>
                <button
                  onClick={handleSubmit}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditMode(false)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
                >
                  Edit
                </button>
                {currentTask.status !== 'completed' && (
                  <button
                    onClick={handleCompleteTask}
                    className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700"
                  >
                    Complete
                  </button>
                )}
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Project link */}
        {currentTask.project && (
          <div className="mt-3 text-sm">
            <span className="text-gray-600">Project: </span>
            <a 
              href={`/projects/${currentTask.project._id}`}
              className="text-indigo-600 hover:text-indigo-900"
            >
              {currentTask.project.title}
            </a>
          </div>
        )}

        {/* Parent task link (if it's a subtask) */}
        {currentTask.isSubtask && currentTask.parentTask && (
          <div className="mt-1 text-sm">
            <span className="text-gray-600">Parent Task: </span>
            <a 
              href={`/tasks/${currentTask.parentTask._id}`}
              className="text-indigo-600 hover:text-indigo-900"
            >
              {currentTask.parentTask.title}
            </a>
          </div>
        )}
      </div>

      {/* Task Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Task details */}
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Description</h2>
            {editMode ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                className="w-full border rounded-md p-2"
              ></textarea>
            ) : (
              <div className="prose max-w-none">
                {currentTask.description ? (
                  <p className="text-gray-700">{currentTask.description}</p>
                ) : (
                  <p className="text-gray-500 italic">No description provided</p>
                )}
              </div>
            )}
          </div>

          {/* Subtasks */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Subtasks</h2>
            
            {/* Subtask list */}
            {subtasks && subtasks.length > 0 ? (
              <div className="space-y-3 mb-4">
                {subtasks.map((subtask) => (
                  <div key={subtask._id} className="flex items-center p-3 border rounded-md">
                    <div className="flex-1">
                      <a 
                        href={`/tasks/${subtask._id}`}
                        className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                      >
                        {subtask.title}
                      </a>
                      <div className="flex space-x-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          subtask.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : subtask.status === 'in-progress'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {subtask.status ? subtask.status.charAt(0).toUpperCase() + subtask.status.slice(1) : 'No status'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          subtask.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : subtask.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {subtask.priority ? subtask.priority.charAt(0).toUpperCase() + subtask.priority.slice(1) : 'No priority'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-4">No subtasks yet</p>
            )}

            {/* Add subtask form */}
            <form onSubmit={handleAddSubtask} className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Add Subtask</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Subtask title"
                  value={newSubtask.title}
                  onChange={(e) => setNewSubtask({...newSubtask, title: e.target.value})}
                  className="w-full border rounded-md p-2 text-sm"
                  required
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newSubtask.description}
                  onChange={(e) => setNewSubtask({...newSubtask, description: e.target.value})}
                  className="w-full border rounded-md p-2 text-sm"
                  rows="2"
                ></textarea>
                <div className="flex space-x-2">
                  <select
                    value={newSubtask.priority}
                    onChange={(e) => setNewSubtask({...newSubtask, priority: e.target.value})}
                    className="border rounded-md p-2 text-sm"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Comments */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Comments</h2>
            
            {/* Comment list */}
            {commentsLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : comments && comments.length > 0 ? (
              <div className="space-y-4 mb-6">
                {comments.map((comment) => (
                  <div key={comment._id} className="border-l-2 border-indigo-200 pl-4">
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm mr-3 overflow-hidden">
                        {comment.user?.avatar ? (
                          <img 
                            src={comment.user.avatar} 
                            alt={comment.user.name} 
                            className="h-8 w-8 rounded-full object-cover" 
                          />
                        ) : (
                          (comment.user?.name || 'U').substring(0, 1)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-sm font-medium">{comment.user?.name}</h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-6">No comments yet</p>
            )}

            {/* Add comment form */}
            <form onSubmit={handleAddComment} className="border-t pt-4">
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border rounded-md p-2 text-sm"
                rows="3"
                required
              ></textarea>
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Comment
                </button>
              </div>
            </form>
          </div>

          {/* Attachments */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Attachments</h2>
            
            {/* Attachment list */}
            {attachmentsLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : attachments && attachments.length > 0 ? (
              <div className="space-y-3 mb-6">
                {attachments.map((attachment) => (
                  <div key={attachment._id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center">
                      <svg className="h-5 w-5 text-gray-400 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{attachment.filename}</p>
                        <p className="text-xs text-gray-500">
                          {(attachment.fileSize / 1024).toFixed(2)} KB • Added {new Date(attachment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <a href={attachment.filepath} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-900">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </a>
                      <button onClick={() => deleteAttachment(attachment._id)} className="text-red-600 hover:text-red-900">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 mb-6">No attachments yet</p>
            )}

            {/* Upload attachment form */}
            <form onSubmit={handleFileUpload} className="border-t pt-4">
              <div className="flex flex-col space-y-2">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="text-sm"
                  required
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column - Task metadata & actions */}
        <div className="space-y-6">
          {/* Task details/metadata */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Details</h2>

            <div className="space-y-4">
              {/* Status */}
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Status</h3>
                {editMode ? (
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                    currentTask.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : currentTask.status === 'in-progress'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {currentTask.status ? currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1) : 'No status'}
                  </div>
                )}
              </div>

              {/* Priority */}
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Priority</h3>
                {editMode ? (
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                ) : (
                  <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                    currentTask.priority === 'high' 
                      ? 'bg-red-100 text-red-800' 
                      : currentTask.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {currentTask.priority ? currentTask.priority.charAt(0).toUpperCase() + currentTask.priority.slice(1) : 'No priority'}
                  </div>
                )}
              </div>

              {/* Deadline */}
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Deadline</h3>
                {editMode ? (
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 text-sm"
                  />
                ) : (
                  <div className={`text-sm ${isOverdue() ? 'text-red-600 font-medium' : 'text-gray-700'}`}>
                    {currentTask.deadline ? new Date(currentTask.deadline).toLocaleDateString() : 'No deadline'}
                  </div>
                )}
              </div>

              {/* Assignee */}
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Assigned To</h3>
                {editMode ? (
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="">-- Unassigned --</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    {currentTask.assignedTo ? (
                      <div className="flex items-center">
                        <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs mr-2">
                          {currentTask.assignedTo.avatar ? (
                            <img 
                              src={currentTask.assignedTo.avatar} 
                              alt={currentTask.assignedTo.name} 
                              className="h-6 w-6 rounded-full" 
                            />
                          ) : (
                            currentTask.assignedTo.name?.substring(0, 1)
                          )}
                        </div>
                        <span className="text-sm text-gray-700">{currentTask.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </div>
                )}
              </div>

              {/* Created by */}
              {currentTask.createdBy && (
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Created By</h3>
                  <div className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs mr-2">
                      {currentTask.createdBy.avatar ? (
                        <img 
                          src={currentTask.createdBy.avatar} 
                          alt={currentTask.createdBy.name} 
                          className="h-6 w-6 rounded-full" 
                        />
                      ) : (
                        currentTask.createdBy.name?.substring(0, 1)
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{currentTask.createdBy.name}</span>
                  </div>
                </div>
              )}

              {/* Created / Updated dates */}
              <div className="text-xs text-gray-500">
                <p>Created {new Date(currentTask.createdAt).toLocaleString()}</p>
                {currentTask.updatedAt && currentTask.updatedAt !== currentTask.createdAt && (
                  <p>Updated {new Date(currentTask.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          {/* Time tracking */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Time Tracking</h2>

            {/* Time logs */}
            {timelogsLoading ? (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : (
              <>
                {/* Total time spent */}
                <div className="mb-4">
                  <h3 className="text-sm text-gray-500 mb-1">Total Time Spent</h3>
                  <div className="text-2xl font-semibold">
                    {timelogs && timelogs.totalTime ? (
                      `${Math.floor(timelogs.totalTime / 60)}h ${timelogs.totalTime % 60}m`
                    ) : (
                      '0h 0m'
                    )}
                  </div>
                </div>

                {/* Time log entries */}
                {timelogs && timelogs.logs && timelogs.logs.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {timelogs.logs.slice(0, 3).map(log => (
                      <div key={log._id} className="border-l-2 border-indigo-300 pl-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            {Math.floor(log.timeSpent / 60)}h {log.timeSpent % 60}m
                          </span>
                          <button onClick={() => deleteTimelog(log._id)} className="text-red-600 hover:text-red-900">
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-xs text-gray-500">{log.description || 'No description'}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(log.startTime || log.date || log.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}

                    {timelogs.logs.length > 3 && (
                      <div className="text-center">
                        <button className="text-xs text-indigo-600 hover:text-indigo-900">
                          Show all {timelogs.logs.length} entries
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 mb-4">No time logs recorded</p>
                )}

                {/* Add time log form */}
                <form onSubmit={handleAddTimeLog} className="border-t pt-4 space-y-3">
                  <div>
                    <label htmlFor="timeSpent" className="block text-sm text-gray-700 mb-1">
                      Time Spent (minutes)
                    </label>
                    <input
                      id="timeSpent"
                      type="number"
                      min="1"
                      value={newTimeLog.timeSpent}
                      onChange={(e) => setNewTimeLog({...newTimeLog, timeSpent: e.target.value})}
                      className="w-full border rounded-md p-2 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      id="description"
                      type="text"
                      value={newTimeLog.description}
                      onChange={(e) => setNewTimeLog({...newTimeLog, description: e.target.value})}
                      className="w-full border rounded-md p-2 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                  >
                    Log Time
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Watchers */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Watchers</h2>
            {currentTask.watchers && currentTask.watchers.length > 0 ? (
              <div className="space-y-3">
                {currentTask.watchers.map(watcher => (
                  <div key={watcher._id} className="flex items-center">
                    <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs mr-2 overflow-hidden">
                      {watcher.avatar ? (
                        <img 
                          src={watcher.avatar} 
                          alt={watcher.name} 
                          className="h-6 w-6 rounded-full object-cover" 
                        />
                      ) : (
                        watcher.name?.substring(0, 1)
                      )}
                    </div>
                    <span className="text-sm text-gray-700">{watcher.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No watchers</p>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Task</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetail;