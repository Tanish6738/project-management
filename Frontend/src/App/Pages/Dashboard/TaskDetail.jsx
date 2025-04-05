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
    startTimelog, 
    stopTimelog, 
    addTimelog 
  } = useTimelog();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showTimelogForm, setShowTimelogForm] = useState(false);
  const [newTimelog, setNewTimelog] = useState({
    date: new Date().toISOString().split('T')[0],
    hours: 1,
    description: ''
  });
  const [isTimeTracking, setIsTimeTracking] = useState(false);
  const [trackingStartTime, setTrackingStartTime] = useState(null);
  const [activeTimelogId, setActiveTimelogId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Fetch task details and related data
  useEffect(() => {
    if (taskId) {
      fetchTaskById(taskId);
      fetchTaskComments(taskId);
      fetchTaskAttachments(taskId);
      fetchTaskTimelogs(taskId);
      fetchUsers();
      fetchProjects();
    }
  }, [taskId, fetchTaskById, fetchTaskComments, fetchTaskAttachments, fetchTaskTimelogs, fetchUsers, fetchProjects]);

  // Update editedTask when currentTask changes
  useEffect(() => {
    if (currentTask) {
      setEditedTask({
        title: currentTask.title,
        description: currentTask.description || '',
        dueDate: currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().split('T')[0] : '',
        status: currentTask.status,
        priority: currentTask.priority,
        projectId: currentTask.projectId?._id || currentTask.projectId
      });
    }
  }, [currentTask]);

  // Check for active timelogs
  useEffect(() => {
    if (timelogs && timelogs.length > 0) {
      const activeLog = timelogs.find(log => log.endTime === null);
      if (activeLog) {
        setIsTimeTracking(true);
        setTrackingStartTime(new Date(activeLog.startTime));
        setActiveTimelogId(activeLog._id);
      }
    }
  }, [timelogs]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTimelogInputChange = (e) => {
    const { name, value } = e.target;
    setNewTimelog(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await updateTask(taskId, editedTask);
      setIsEditing(false);
      toast.success('Task updated successfully');
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        await deleteTask(taskId);
        navigate('/tasks');
        toast.success('Task deleted successfully');
      } catch (err) {
        setIsDeleting(false);
        toast.error('Failed to delete task');
      }
    }
  };

  const handleCompleteTask = async () => {
    try {
      await completeTask(taskId);
      toast.success('Task marked as complete');
    } catch (err) {
      toast.error('Failed to mark task as complete');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await addComment(taskId, { content: newComment });
      setNewComment('');
      setShowCommentForm(false);
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleTimelogSubmit = async (e) => {
    e.preventDefault();
    try {
      await addTimelog(taskId, newTimelog);
      setNewTimelog({
        date: new Date().toISOString().split('T')[0],
        hours: 1,
        description: ''
      });
      setShowTimelogForm(false);
      toast.success('Time log added');
    } catch (err) {
      toast.error('Failed to add time log');
    }
  };

  const handleStartTracking = async () => {
    try {
      const response = await startTimelog(taskId);
      setIsTimeTracking(true);
      setTrackingStartTime(new Date());
      setActiveTimelogId(response._id);
      toast.success('Time tracking started');
    } catch (err) {
      toast.error('Failed to start time tracking');
    }
  };

  const handleStopTracking = async () => {
    try {
      await stopTimelog(activeTimelogId);
      setIsTimeTracking(false);
      setTrackingStartTime(null);
      setActiveTimelogId(null);
      toast.success('Time tracking stopped');
      fetchTaskTimelogs(taskId);
    } catch (err) {
      toast.error('Failed to stop time tracking');
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      await uploadAttachment(taskId, formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      
      setSelectedFile(null);
      setUploadProgress(0);
      toast.success('File uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload file');
      setUploadProgress(0);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (window.confirm('Are you sure you want to delete this attachment?')) {
      try {
        await deleteAttachment(attachmentId);
        toast.success('Attachment deleted');
      } catch (err) {
        toast.error('Failed to delete attachment');
      }
    }
  };

  const handleAssignToUser = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    try {
      await assignTaskToUser(taskId, selectedUserId);
      setShowAssignForm(false);
      setSelectedUserId('');
      toast.success('Task assigned successfully');
    } catch (err) {
      toast.error('Failed to assign task');
    }
  };

  const formatDuration = (startDate) => {
    if (!startDate) return '00:00:00';
    
    const start = new Date(startDate);
    const now = new Date();
    const diff = Math.abs(now - start);
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString();
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'review':
        return 'bg-yellow-100 text-yellow-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !currentTask) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            className="mt-2 text-indigo-600 underline" 
            onClick={() => navigate('/tasks')}
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  if (!currentTask) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Task not found</p>
          <button 
            className="mt-2 text-indigo-600 underline" 
            onClick={() => navigate('/tasks')}
          >
            Back to Tasks
          </button>
        </div>
      </div>
    );
  }

  const totalLoggedTime = timelogs.reduce((total, log) => {
    if (log.endTime) {
      const start = new Date(log.startTime);
      const end = new Date(log.endTime);
      return total + (end - start) / (1000 * 60 * 60); // Convert to hours
    } else if (log.hours) {
      return total + log.hours;
    }
    return total;
  }, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/tasks')}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tasks
        </button>
      </div>

      {/* Task Details */}
      <div className="bg-white shadow-md rounded-md overflow-hidden mb-6">
        <div className="p-6">
          {!isEditing ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{currentTask.title}</h1>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`${getStatusClass(currentTask.status)} px-2 py-1 text-sm font-semibold rounded-full`}>
                      {currentTask.status}
                    </span>
                    <span className={`${getPriorityClass(currentTask.priority)} px-2 py-1 text-sm font-semibold rounded-full`}>
                      {currentTask.priority}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Edit Task
                  </button>
                  <button
                    onClick={handleDeleteTask}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Task'}
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4">{currentTask.description || 'No description provided'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Project:</span>
                      <span>
                        {currentTask.projectId ? (
                          <a 
                            href={`/projects/${currentTask.projectId._id || currentTask.projectId}`}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {currentTask.projectId.title || 'View Project'}
                          </a>
                        ) : 'Not assigned'}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Assigned to:</span>
                      <div className="flex items-center">
                        <span>{currentTask.assignedTo?.name || 'Unassigned'}</span>
                        <button
                          onClick={() => setShowAssignForm(!showAssignForm)}
                          className="ml-2 text-indigo-600 hover:text-indigo-800 text-xs"
                        >
                          {showAssignForm ? 'Cancel' : 'Change'}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Due Date:</span>
                      <span>{currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : 'Not set'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Created:</span>
                      <span>{formatDate(currentTask.createdAt)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Last Updated:</span>
                      <span>{formatDate(currentTask.updatedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Time Logged:</span>
                      <span>{totalLoggedTime.toFixed(2)} hours</span>
                    </div>
                  </div>
                </div>
              </div>

              {showAssignForm && (
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Assign Task</h3>
                  <div className="flex space-x-2">
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2"
                    >
                      <option value="">-- Select User --</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAssignToUser}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              )}

              {currentTask.status !== 'Done' && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleCompleteTask}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Mark as Complete
                  </button>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleUpdateTask}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Task Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editedTask.title}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={editedTask.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={editedTask.dueDate}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectId">
                    Project
                  </label>
                  <select
                    id="projectId"
                    name="projectId"
                    value={editedTask.projectId || ''}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">No Project</option>
                    {projects.map(project => (
                      <option key={project._id} value={project._id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={editedTask.status}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={editedTask.priority}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Time Tracking Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Time Tracking</h2>
          <div className="flex space-x-2">
            {!isTimeTracking ? (
              <button
                onClick={handleStartTracking}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Start Timer
              </button>
            ) : (
              <button
                onClick={handleStopTracking}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Stop Timer
              </button>
            )}
            <button
              onClick={() => setShowTimelogForm(!showTimelogForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
            >
              {showTimelogForm ? 'Cancel' : 'Add Time Manually'}
            </button>
          </div>
        </div>

        {isTimeTracking && (
          <div className="bg-blue-50 p-4 rounded-md mb-4 flex items-center justify-between">
            <div>
              <span className="font-medium">Timer Running:</span>
              <span className="text-2xl font-bold ml-2" id="timer">
                {formatDuration(trackingStartTime)}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Started at {formatTime(trackingStartTime)}
            </span>
          </div>
        )}

        {showTimelogForm && (
          <div className="bg-white shadow-md rounded-md p-6 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Time Log</h3>
            <form onSubmit={handleTimelogSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={newTimelog.date}
                    onChange={handleTimelogInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="hours">
                    Hours
                  </label>
                  <input
                    type="number"
                    id="hours"
                    name="hours"
                    value={newTimelog.hours}
                    onChange={handleTimelogInputChange}
                    min="0.25"
                    step="0.25"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={newTimelog.description}
                    onChange={handleTimelogInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="What did you work on?"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add Time Log'}
                </button>
              </div>
            </form>
          </div>
        )}

        {timelogsLoading ? (
          <div className="flex justify-center items-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : timelogs.length === 0 ? (
          <div className="bg-white shadow-md rounded-md p-6 text-center text-gray-500">
            No time logs recorded yet.
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {timelogs.map((log) => (
                <li key={log._id} className="p-4">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-indigo-600">
                        {log.description || 'No description'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.user?.name || 'Unknown user'} · {formatDate(log.date || log.startTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {log.endTime ? (
                          ((new Date(log.endTime) - new Date(log.startTime)) / (1000 * 60 * 60)).toFixed(2)
                        ) : log.hours ? (
                          log.hours
                        ) : (
                          <span className="text-blue-600">In progress</span>
                        )}
                        {(log.endTime || log.hours) && ' hours'}
                      </p>
                      {log.startTime && log.endTime && (
                        <p className="text-xs text-gray-500">
                          {formatTime(log.startTime)} - {formatTime(log.endTime)}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Attachments Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Attachments</h2>
        </div>

        <div className="bg-white shadow-md rounded-md p-6 mb-4">
          <form onSubmit={handleFileUpload} className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-indigo-50 file:text-indigo-700
                  hover:file:bg-indigo-100"
              />
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={attachmentsLoading || !selectedFile}
            >
              {attachmentsLoading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>

        {attachmentsLoading && !uploadProgress ? (
          <div className="flex justify-center items-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : attachments.length === 0 ? (
          <div className="bg-white shadow-md rounded-md p-6 text-center text-gray-500">
            No attachments added yet.
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {attachments.map((attachment) => (
                <li key={attachment._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {attachment.originalname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {attachment.mimetype} · {formatDate(attachment.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={attachment.path}
                      download
                      className="text-indigo-600 hover:text-indigo-900"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </a>
                    <button
                      onClick={() => handleDeleteAttachment(attachment._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Comments</h2>
          <button
            onClick={() => setShowCommentForm(!showCommentForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {showCommentForm ? 'Cancel' : 'Add Comment'}
          </button>
        </div>

        {showCommentForm && (
          <div className="bg-white shadow-md rounded-md p-6 mb-4">
            <form onSubmit={handleCommentSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="comment">
                  Your Comment
                </label>
                <textarea
                  id="comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={commentsLoading}
                >
                  {commentsLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {commentsLoading ? (
          <div className="flex justify-center items-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="bg-white shadow-md rounded-md p-6 text-center text-gray-500">
            No comments yet. Be the first to add one!
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {comments.map((comment) => (
                <li key={comment._id} className="p-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-indigo-200 flex items-center justify-center">
                        <span className="text-indigo-600 font-bold">
                          {comment.user?.name ? comment.user.name[0] : 'U'}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold">{comment.user?.name || 'Unknown user'}</h4>
                        <p className="text-xs text-gray-500">{formatDate(comment.createdAt)} at {formatTime(comment.createdAt)}</p>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;