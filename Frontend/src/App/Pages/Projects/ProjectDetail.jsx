import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '../../Context/ProjectContext';
import { useTask } from '../../Context/TaskContext';
import { useTeam } from '../../Context/TeamContext';
import toast from 'react-hot-toast';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { 
    currentProject, 
    loading, 
    error, 
    fetchProjectById, 
    updateProject, 
    deleteProject,
    addTeamToProject,
    removeTeamFromProject,
    getProjectStats
  } = useProject();
  const { projectTasks, fetchProjectTasks, createTask } = useTask();
  const { teams, fetchTeams } = useTeam();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [showAddTeamForm, setShowAddTeamForm] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectStats, setProjectStats] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    status: 'Todo'
  });

  // Fetch project details when component mounts or projectId changes
  useEffect(() => {
    if (projectId) {
      fetchProjectById(projectId);
      fetchProjectTasks(projectId);
      loadProjectStats();
    }
  }, [projectId, fetchProjectById, fetchProjectTasks]);

  // Update editedProject when currentProject changes
  useEffect(() => {
    if (currentProject) {
      setEditedProject({
        title: currentProject.title,
        description: currentProject.description || '',
        startDate: currentProject.startDate ? new Date(currentProject.startDate).toISOString().split('T')[0] : '',
        endDate: currentProject.endDate ? new Date(currentProject.endDate).toISOString().split('T')[0] : '',
        status: currentProject.status,
        priority: currentProject.priority
      });
    }
  }, [currentProject]);

  // Load teams for the team assignment dropdown
  useEffect(() => {
    const loadTeams = async () => {
      await fetchTeams();
    };
    
    loadTeams();
  }, [fetchTeams]);

  // Filter teams to show only those not already assigned to the project
  useEffect(() => {
    if (teams.length > 0 && currentProject) {
      const projectTeamIds = currentProject.teams?.map(team => team._id) || [];
      const filteredTeams = teams.filter(team => !projectTeamIds.includes(team._id));
      setAvailableTeams(filteredTeams);
    }
  }, [teams, currentProject]);

  const loadProjectStats = async () => {
    try {
      const stats = await getProjectStats(projectId);
      setProjectStats(stats);
    } catch (err) {
      console.error('Failed to load project stats:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTaskInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await updateProject(projectId, editedProject);
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        await deleteProject(projectId);
        navigate('/projects');
        toast.success('Project deleted successfully');
      } catch (err) {
        setIsDeleting(false);
        toast.error('Failed to delete project');
      }
    }
  };

  const handleAddTeam = async () => {
    if (!selectedTeamId) {
      toast.error('Please select a team to add');
      return;
    }

    try {
      await addTeamToProject(projectId, selectedTeamId);
      setSelectedTeamId('');
      setShowAddTeamForm(false);
    } catch (err) {
      toast.error('Failed to add team to project');
    }
  };

  const handleRemoveTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to remove this team from the project?')) {
      try {
        await removeTeamFromProject(projectId, teamId);
      } catch (err) {
        toast.error('Failed to remove team from project');
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const taskData = {
        ...newTask,
        projectId
      };
      await createTask(taskData);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
        status: 'Todo'
      });
      setShowAddTaskForm(false);
      // Refresh tasks after creating a new one
      fetchProjectTasks(projectId);
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on hold':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
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

  if (loading && !currentProject) {
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
            onClick={() => navigate('/projects')}
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4" role="alert">
          <p className="font-bold">Project not found</p>
          <button 
            className="mt-2 text-indigo-600 underline" 
            onClick={() => navigate('/projects')}
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/projects')}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </button>
      </div>

      <div className="bg-white shadow-md rounded-md overflow-hidden mb-6">
        <div className="p-6">
          {!isEditing ? (
            <>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{currentProject.title}</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Edit Project
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Project'}
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`${getStatusClass(currentProject.status)} px-2 py-1 text-sm font-semibold rounded-full`}>
                  {currentProject.status}
                </span>
                <span className={`${getPriorityClass(currentProject.priority)} px-2 py-1 text-sm font-semibold rounded-full`}>
                  {currentProject.priority}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{currentProject.description || 'No description provided'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Start Date:</span>
                      <span>{currentProject.startDate ? new Date(currentProject.startDate).toLocaleDateString() : 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">End Date:</span>
                      <span>{currentProject.endDate ? new Date(currentProject.endDate).toLocaleDateString() : 'Not set'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Teams:</span>
                      <span>{currentProject.teams?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tasks:</span>
                      <span>{projectTasks.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {projectStats && (
                <div className="bg-indigo-50 p-4 rounded-md mb-4">
                  <h3 className="text-lg font-medium text-indigo-800 mb-2">Project Statistics</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <div className="text-sm font-medium text-gray-500">Completed Tasks</div>
                      <div className="text-xl font-semibold text-indigo-600">{projectStats.completedTasks} / {projectStats.totalTasks}</div>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <div className="text-sm font-medium text-gray-500">Completion Rate</div>
                      <div className="text-xl font-semibold text-indigo-600">
                        {projectStats.completionRate ? `${projectStats.completionRate}%` : 'N/A'}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <div className="text-sm font-medium text-gray-500">Days Remaining</div>
                      <div className="text-xl font-semibold text-indigo-600">
                        {projectStats.daysRemaining || 'N/A'}
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-md shadow-sm">
                      <div className="text-sm font-medium text-gray-500">Team Members</div>
                      <div className="text-xl font-semibold text-indigo-600">{projectStats.totalTeamMembers || 0}</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleUpdateProject}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Project Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editedProject.title}
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
                  value={editedProject.description}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="startDate">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={editedProject.startDate}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={editedProject.endDate}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  />
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
                    value={editedProject.status}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                    Priority
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    value={editedProject.priority}
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

      {/* Teams Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Teams</h2>
          {availableTeams.length > 0 && (
            <button
              onClick={() => setShowAddTeamForm(!showAddTeamForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {showAddTeamForm ? 'Cancel' : 'Add Team'}
            </button>
          )}
        </div>

        {showAddTeamForm && (
          <div className="bg-white shadow-md rounded-md p-6 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Team to Project</h3>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teamId">
                Select Team
              </label>
              <select
                id="teamId"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="">-- Select a team --</option>
                {availableTeams.map(team => (
                  <option key={team._id} value={team._id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleAddTeam}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={!selectedTeamId || loading}
              >
                {loading ? 'Adding...' : 'Add Team'}
              </button>
            </div>
          </div>
        )}

        {currentProject.teams && currentProject.teams.length === 0 ? (
          <div className="bg-white shadow-md rounded-md p-6 text-center text-gray-500">
            No teams assigned to this project yet.
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {currentProject.teams && currentProject.teams.map((team) => (
                <li key={team._id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{team.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{team.teamType} · {team.members?.length || 0} members</p>
                  </div>
                  <button
                    onClick={() => handleRemoveTeam(team._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
          <button
            onClick={() => setShowAddTaskForm(!showAddTaskForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {showAddTaskForm ? 'Cancel' : 'Add Task'}
          </button>
        </div>

        {showAddTaskForm && (
          <div className="bg-white shadow-md rounded-md p-6 mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Task Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={newTask.title}
                  onChange={handleTaskInputChange}
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
                  value={newTask.description}
                  onChange={handleTaskInputChange}
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
                    value={newTask.dueDate}
                    onChange={handleTaskInputChange}
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
                    value={newTask.priority}
                    onChange={handleTaskInputChange}
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
                    value={newTask.status}
                    onChange={handleTaskInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        )}

        {projectTasks.length === 0 ? (
          <div className="bg-white shadow-md rounded-md p-6 text-center text-gray-500">
            No tasks created for this project yet.
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {projectTasks.map((task) => (
                <li key={task._id}>
                  <div className="block hover:bg-gray-50">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-indigo-600 truncate">{task.title}</p>
                          <div className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(task.status)}`}>
                            {task.status}
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityClass(task.priority)}`}>
                            {task.priority}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {task.description 
                              ? `${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}` 
                              : 'No description'}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span>
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                          </span>
                          <a
                            href={`/tasks/${task._id}`}
                            className="ml-4 text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                          >
                            View Details
                          </a>
                        </div>
                      </div>
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

export default ProjectDetail;