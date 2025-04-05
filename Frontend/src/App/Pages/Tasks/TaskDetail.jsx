import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTask } from '../../Context/TaskContext';
import { userService } from '../../../api';
import toast from 'react-hot-toast';

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { currentTask, loading, error, fetchTaskById, updateTask, deleteTask, assignTask, unassignTask } = useTask();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch task details when component mounts or taskId changes
  useEffect(() => {
    if (taskId) {
      fetchTaskById(taskId);
    }
  }, [taskId, fetchTaskById]);

  // Update editedTask when currentTask changes
  useEffect(() => {
    if (currentTask) {
      setEditedTask({
        title: currentTask.title,
        description: currentTask.description || '',
        dueDate: currentTask.dueDate ? new Date(currentTask.dueDate).toISOString().split('T')[0] : '',
        priority: currentTask.priority,
        status: currentTask.status
      });
    }
  }, [currentTask]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await updateTask(taskId, editedTask);
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        await deleteTask(taskId);
        navigate(-1); // Go back to the previous page
        toast.success('Task deleted successfully');
      } catch (err) {
        setIsDeleting(false);
        toast.error('Failed to delete task');
      }
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      const response = await userService.searchUsers(searchQuery);
      setSearchResults(response.data);
      if (response.data.length === 0) {
        toast.info('No users found with that query');
      }
    } catch (err) {
      toast.error('Error searching for users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedUserId) {
      toast.error('Please select a user to assign');
      return;
    }

    try {
      await assignTask(taskId, selectedUserId);
      setShowAssignForm(false);
      setSearchResults([]);
      setSearchQuery('');
      setSelectedUserId('');
    } catch (err) {
      toast.error('Failed to assign task');
    }
  };

  const handleUnassignTask = async () => {
    if (window.confirm('Are you sure you want to unassign this task?')) {
      try {
        await unassignTask(taskId);
      } catch (err) {
        toast.error('Failed to unassign task');
      }
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
            onClick={() => navigate(-1)}
          >
            Go Back
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
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>
      </div>

      <div className="bg-white shadow-md rounded-md overflow-hidden mb-6">
        <div className="p-6">
          {!isEditing ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{currentTask.title}</h1>
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
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`${getStatusClass(currentTask.status)} px-2 py-1 text-sm font-semibold rounded-full`}>
                  {currentTask.status}
                </span>
                <span className={`${getPriorityClass(currentTask.priority)} px-2 py-1 text-sm font-semibold rounded-full`}>
                  {currentTask.priority}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{currentTask.description || 'No description provided'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Created:</span>
                      <span>{new Date(currentTask.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Due Date:</span>
                      <span>{currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : 'No due date'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Project:</span>
                      <span>{currentTask.projectId ? currentTask.projectId.title : 'Not assigned to a project'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Last Updated:</span>
                      <span>{new Date(currentTask.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

      <div className="bg-white shadow-md rounded-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Assignment</h2>
            <div>
              {currentTask.assignedTo ? (
                <button
                  onClick={handleUnassignTask}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  Unassign
                </button>
              ) : (
                <button
                  onClick={() => setShowAssignForm(!showAssignForm)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  {showAssignForm ? 'Cancel' : 'Assign Task'}
                </button>
              )}
            </div>
          </div>

          {currentTask.assignedTo ? (
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-indigo-800 font-semibold">
                  {currentTask.assignedTo.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{currentTask.assignedTo.name}</p>
                <p className="text-xs text-gray-500">{currentTask.assignedTo.email}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">This task is not assigned to anyone.</p>
          )}

          {showAssignForm && (
            <div className="mt-4">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="searchQuery">
                  Search Users
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="searchQuery"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="Search by name or email"
                  />
                  <button
                    type="button"
                    onClick={handleSearchUsers}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r focus:outline-none focus:shadow-outline"
                    disabled={isSearching}
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="selectedUser">
                    Select User
                  </label>
                  <select
                    id="selectedUser"
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="">-- Select a user --</option>
                    {searchResults.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAssignTask}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={!selectedUserId || loading}
                >
                  {loading ? 'Assigning...' : 'Assign Task'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;