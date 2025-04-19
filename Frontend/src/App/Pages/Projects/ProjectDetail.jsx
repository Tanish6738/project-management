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
    getProjectStats,
    updateProjectSettings,
    updateProjectWorkflow,
    manageProjectTags
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
  const [showSettingsForm, setShowSettingsForm] = useState(false);
  const [showWorkflowForm, setShowWorkflowForm] = useState(false);
  const [editedSettings, setEditedSettings] = useState(null);
  const [editedWorkflow, setEditedWorkflow] = useState([]);
  const [newWorkflowStep, setNewWorkflowStep] = useState('');
  const [showTagsForm, setShowTagsForm] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'To Do'
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
        dueDate: currentProject.dueDate ? new Date(currentProject.dueDate).toISOString().split('T')[0] : '',
        status: currentProject.status || 'active',
        priority: currentProject.priority || 'medium'
      });

      setEditedSettings(currentProject.settings || {
        visibility: 'private',
        allowComments: true,
        allowGuestAccess: false,
        notifications: {
          enabled: true,
          frequency: 'daily'
        }
      });

      setEditedWorkflow(currentProject.workflow || ['To Do', 'In Progress', 'Review', 'Done']);
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
      // If project is team type and has a team, filter out that team
      const teamId = currentProject.team?._id || currentProject.team;
      const filteredTeams = teams.filter(team => team._id !== teamId);
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

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., notifications.enabled)
      const [parent, child] = name.split('.');
      setEditedSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setEditedSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleAddWorkflowStep = () => {
    if (newWorkflowStep.trim() && !editedWorkflow.includes(newWorkflowStep)) {
      setEditedWorkflow([...editedWorkflow, newWorkflowStep]);
      setNewWorkflowStep('');
    }
  };

  const handleRemoveWorkflowStep = (step) => {
    setEditedWorkflow(editedWorkflow.filter(s => s !== step));
  };

  const handleWorkflowChange = (oldStep, newStep) => {
    if (newStep.trim() && !editedWorkflow.includes(newStep)) {
      setEditedWorkflow(editedWorkflow.map(step => 
        step === oldStep ? newStep : step
      ));
    }
  };

  const handleMoveWorkflowStep = (index, direction) => {
    if (
      (direction === 'up' && index > 0) || 
      (direction === 'down' && index < editedWorkflow.length - 1)
    ) {
      const newWorkflow = [...editedWorkflow];
      const currentStep = newWorkflow[index];
      
      if (direction === 'up') {
        newWorkflow[index] = newWorkflow[index - 1];
        newWorkflow[index - 1] = currentStep;
      } else {
        newWorkflow[index] = newWorkflow[index + 1];
        newWorkflow[index + 1] = currentStep;
      }
      
      setEditedWorkflow(newWorkflow);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && (!currentProject.tags || !currentProject.tags.includes(newTag))) {
      manageProjectTags(projectId, { action: 'add', tags: [newTag] })
        .then(() => {
          setNewTag('');
          toast.success('Tag added successfully');
        })
        .catch(() => {
          toast.error('Failed to add tag');
        });
    }
  };

  const handleRemoveTag = (tag) => {
    manageProjectTags(projectId, { action: 'remove', tags: [tag] })
      .then(() => {
        toast.success('Tag removed successfully');
      })
      .catch(() => {
        toast.error('Failed to remove tag');
      });
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
      toast.success('Project updated successfully');
    } catch (err) {
      toast.error('Failed to update project');
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    try {
      await updateProjectSettings(projectId, editedSettings);
      setShowSettingsForm(false);
      toast.success('Project settings updated successfully');
    } catch (err) {
      toast.error('Failed to update project settings');
    }
  };

  const handleUpdateWorkflow = async (e) => {
    e.preventDefault();
    try {
      await updateProjectWorkflow(projectId, { workflow: editedWorkflow });
      setShowWorkflowForm(false);
      toast.success('Project workflow updated successfully');
    } catch (err) {
      toast.error('Failed to update project workflow');
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
      toast.success('Team added to project');
    } catch (err) {
      toast.error('Failed to add team to project');
    }
  };

  const handleRemoveTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to remove this team from the project?')) {
      try {
        await removeTeamFromProject(projectId, teamId);
        toast.success('Team removed from project');
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
        project: projectId
      };
      await createTask(taskData);
      setNewTask({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'To Do'
      });
      setShowAddTaskForm(false);
      // Refresh tasks after creating a new one
      fetchProjectTasks(projectId);
      toast.success('Task created successfully');
    } catch (err) {
      toast.error('Failed to create task');
    }
  };

  const getStatusClass = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status.toLowerCase()) {
      case 'planning':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'in progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'on hold':
      case 'archived':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityClass = (priority) => {
    if (!priority) return 'bg-gray-100 text-gray-800';
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
                  {currentProject.status || 'active'}
                </span>
                <span className={`${getPriorityClass(currentProject.priority)} px-2 py-1 text-sm font-semibold rounded-full`}>
                  {currentProject.priority || 'medium'}
                </span>
                <span className="bg-gray-100 text-gray-800 px-2 py-1 text-sm font-semibold rounded-full">
                  {currentProject.projectType === 'team' ? 'Team Project' : 'Personal Project'}
                </span>
              </div>

              {currentProject.tags && currentProject.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {currentProject.tags.map(tag => (
                    <span 
                      key={tag} 
                      className="bg-indigo-100 text-indigo-800 px-2 py-1 text-xs rounded-full flex items-center"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </span>
                  ))}
                  <button
                    onClick={() => setShowTagsForm(!showTagsForm)}
                    className="bg-white border border-indigo-300 text-indigo-600 px-2 py-1 text-xs rounded-full hover:bg-indigo-50"
                  >
                    + Add Tag
                  </button>
                </div>
              )}

              {showTagsForm && (
                <div className="mb-4 flex items-center">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Enter tag"
                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                  />
                  <button
                    onClick={handleAddTag}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowTagsForm(false)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
              
              <p className="text-gray-600 mb-4">{currentProject.description || 'No description provided'}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium text-gray-700 mb-2">Project Details</h4>
                  <div className="text-sm text-gray-500">
                    <div className="flex justify-between mb-2">
                      <span>Owner:</span>
                      <span>{currentProject.owner?.name || 'Not set'}</span>
                    </div>
                    {currentProject.team && (
                      <div className="flex justify-between mb-2">
                        <span>Team:</span>
                        <span>{currentProject.team?.name || 'Not set'}</span>
                      </div>
                    )}
                    <div className="flex justify-between mb-2">
                      <span>Due Date:</span>
                      <span>{currentProject.dueDate ? new Date(currentProject.dueDate).toLocaleDateString() : 'Not set'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Created:</span>
                      <span>{currentProject.createdAt ? new Date(currentProject.createdAt).toLocaleDateString() : 'Not set'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium text-gray-700">Settings</h4>
                    <button
                      onClick={() => setShowSettingsForm(!showSettingsForm)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs"
                    >
                      Edit Settings
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentProject.settings ? (
                      <>
                        <div className="flex justify-between mb-2">
                          <span>Visibility:</span>
                          <span className="capitalize">{currentProject.settings.visibility || 'private'}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Allow Comments:</span>
                          <span>{currentProject.settings.allowComments ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span>Guest Access:</span>
                          <span>{currentProject.settings.allowGuestAccess ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Notifications:</span>
                          <span>{currentProject.settings.notifications?.enabled ? 
                            currentProject.settings.notifications.frequency : 'Disabled'}</span>
                        </div>
                      </>
                    ) : (
                      <p>No settings configured</p>
                    )}
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium text-gray-700">Workflow</h4>
                    <button
                      onClick={() => setShowWorkflowForm(!showWorkflowForm)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs"
                    >
                      Edit Workflow
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    {currentProject.workflow && currentProject.workflow.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {currentProject.workflow.map((step, i) => (
                          <span key={i} className="bg-white border border-gray-200 rounded px-2 py-1 text-xs">
                            {step}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p>No workflow defined</p>
                    )}
                  </div>
                </div>
              </div>

              {showSettingsForm && (
                <div className="mt-4 mb-6 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Edit Project Settings</h3>
                  <form onSubmit={handleUpdateSettings}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="visibility">
                        Visibility
                      </label>
                      <select
                        id="visibility"
                        name="visibility"
                        value={editedSettings.visibility || 'private'}
                        onChange={handleSettingsChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="private">Private</option>
                        <option value="public">Public</option>
                        <option value="team">Team Only</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <input
                          id="allowComments"
                          name="allowComments"
                          type="checkbox"
                          checked={editedSettings.allowComments}
                          onChange={handleSettingsChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="allowComments" className="ml-2 block text-sm text-gray-700">
                          Allow Comments
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          id="allowGuestAccess"
                          name="allowGuestAccess"
                          type="checkbox"
                          checked={editedSettings.allowGuestAccess}
                          onChange={handleSettingsChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="allowGuestAccess" className="ml-2 block text-sm text-gray-700">
                          Allow Guest Access
                        </label>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-bold text-gray-700 mb-2">Notifications</h4>
                      
                      <div className="flex items-center mb-2">
                        <input
                          id="notificationsEnabled"
                          name="notifications.enabled"
                          type="checkbox"
                          checked={editedSettings.notifications?.enabled}
                          onChange={handleSettingsChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="notificationsEnabled" className="ml-2 block text-sm text-gray-700">
                          Enable Notifications
                        </label>
                      </div>

                      {editedSettings.notifications?.enabled && (
                        <div className="mt-2">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notificationsFrequency">
                            Notification Frequency
                          </label>
                          <select
                            id="notificationsFrequency"
                            name="notifications.frequency"
                            value={editedSettings.notifications.frequency || 'daily'}
                            onChange={handleSettingsChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          >
                            <option value="instant">Instant</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => setShowSettingsForm(false)}
                        className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Save Settings
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {showWorkflowForm && (
                <div className="mt-4 mb-6 bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Edit Project Workflow</h3>
                  <form onSubmit={handleUpdateWorkflow}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Workflow Steps
                      </label>
                      <ul className="mb-4">
                        {editedWorkflow.map((step, index) => (
                          <li key={index} className="flex items-center mb-2">
                            <input
                              type="text"
                              value={step}
                              onChange={(e) => handleWorkflowChange(step, e.target.value)}
                              className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2 flex-grow"
                            />
                            <div className="flex space-x-1">
                              <button
                                type="button"
                                onClick={() => handleMoveWorkflowStep(index, 'up')}
                                disabled={index === 0}
                                className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveWorkflowStep(index, 'down')}
                                disabled={index === editedWorkflow.length - 1}
                                className={`p-1 rounded ${index === editedWorkflow.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-200'}`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveWorkflowStep(step)}
                                className="p-1 rounded text-red-500 hover:bg-red-100"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="flex items-center">
                        <input
                          type="text"
                          value={newWorkflowStep}
                          onChange={(e) => setNewWorkflowStep(e.target.value)}
                          placeholder="New workflow step"
                          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                        />
                        <button
                          type="button"
                          onClick={handleAddWorkflowStep}
                          className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
                        >
                          Add Step
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => setShowWorkflowForm(false)}
                        className="mr-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      >
                        Save Workflow
                      </button>
                    </div>
                  </form>
                </div>
              )}

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
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    name="dueDate"
                    value={editedProject.dueDate}
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
                    value={editedProject.priority}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
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
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                    <option value="completed">Completed</option>
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

      {/* Members Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Project Members</h2>
        </div>

        {!currentProject.members || currentProject.members.length === 0 ? (
          <div className="bg-white shadow-md rounded-md p-6 text-center text-gray-500">
            No members assigned to this project.
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {currentProject.members.map((member) => (
                <li key={member._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    {member.user?.avatar ? (
                      <img src={member.user.avatar} alt={member.user.name} className="h-8 w-8 rounded-full mr-3" />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <span className="text-indigo-800 font-medium text-sm">
                          {member.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{member.user?.name || 'Unknown User'}</p>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 capitalize">{member.role}</span>
                        {member.addedBy && member.addedBy !== member.user?._id && (
                          <span className="text-xs text-gray-400 ml-2">
                            Added by {currentProject.members.find(m => m.user?._id === member.addedBy)?.user?.name || 'Unknown'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {member.role !== 'admin' && (
                      <button className="text-red-600 hover:text-red-800 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
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
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
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
                    {(currentProject.workflow || ['To Do', 'In Progress', 'Review', 'Done']).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
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