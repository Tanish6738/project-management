import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProject } from '../../Context/ProjectContext';
import { useTeam } from '../../Context/TeamContext';
import { MagicCard } from '../../Elements/MagicCard';

const ProjectList = () => {
  const { projects, loading, error, fetchProjects, createProject } = useProject();
  const { teams, fetchTeams } = useTeam();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    projectType: 'personal',
    team: '',
    priority: 'medium',
    dueDate: '',
    settings: {
      visibility: 'private',
      allowComments: true,
      allowGuestAccess: false,
      notifications: {
        enabled: true,
        frequency: 'daily'
      }
    }
  });

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, [fetchProjects, fetchTeams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProject(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProject(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        notifications: {
          ...prev.settings.notifications,
          [name]: type === 'checkbox' ? checked : value
        }
      }
    }));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      // Only include team if projectType is 'team'
      const projectData = {
        ...newProject,
        team: newProject.projectType === 'team' ? newProject.team : undefined
      };
      
      await createProject(projectData);
      setNewProject({
        title: '',
        description: '',
        projectType: 'personal',
        team: '',
        priority: 'medium',
        dueDate: '',
        settings: {
          visibility: 'private',
          allowComments: true,
          allowGuestAccess: false,
          notifications: {
            enabled: true,
            frequency: 'daily'
          }
        }
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {showCreateForm ? 'Cancel' : 'Create Project'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {showCreateForm && (
        <div className="bg-white shadow-md rounded-md p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
          <form onSubmit={handleCreateProject}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                Project Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newProject.title}
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
                value={newProject.description}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
              ></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="projectType">
                  Project Type
                </label>
                <select
                  id="projectType"
                  name="projectType"
                  value={newProject.projectType}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="personal">Personal</option>
                  <option value="team">Team</option>
                </select>
              </div>
              {newProject.projectType === 'team' && (
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="team">
                    Team
                  </label>
                  <select
                    id="team"
                    name="team"
                    value={newProject.team}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required={newProject.projectType === 'team'}
                  >
                    <option value="">Select a Team</option>
                    {teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={newProject.priority}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="dueDate">
                  Due Date
                </label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  value={newProject.dueDate}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Project Settings
              </label>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="mb-3">
                  <label className="block text-gray-700 text-sm mb-1" htmlFor="visibility">
                    Visibility
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={newProject.settings.visibility}
                    onChange={handleSettingsChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="team">Team Only</option>
                  </select>
                </div>
                
                <div className="flex items-center mb-2">
                  <input
                    id="allowComments"
                    name="allowComments"
                    type="checkbox"
                    checked={newProject.settings.allowComments}
                    onChange={handleSettingsChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowComments" className="ml-2 block text-sm text-gray-700">
                    Allow Comments
                  </label>
                </div>
                
                <div className="flex items-center mb-3">
                  <input
                    id="allowGuestAccess"
                    name="allowGuestAccess"
                    type="checkbox"
                    checked={newProject.settings.allowGuestAccess}
                    onChange={handleSettingsChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="allowGuestAccess" className="ml-2 block text-sm text-gray-700">
                    Allow Guest Access
                  </label>
                </div>
                
                <div className="mb-2">
                  <div className="flex items-center mb-2">
                    <input
                      id="enabled"
                      name="enabled"
                      type="checkbox"
                      checked={newProject.settings.notifications.enabled}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enabled" className="ml-2 block text-sm text-gray-700">
                      Enable Notifications
                    </label>
                  </div>
                  
                  {newProject.settings.notifications.enabled && (
                    <div className="ml-6">
                      <label className="block text-gray-700 text-sm mb-1" htmlFor="frequency">
                        Notification Frequency
                      </label>
                      <select
                        id="frequency"
                        name="frequency"
                        value={newProject.settings.notifications.frequency}
                        onChange={handleNotificationChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      >
                        <option value="instant">Instant</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showCreateForm ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <MagicCard 
              key={project._id} 
              className="bg-white shadow-md rounded-md overflow-hidden"
              gradientFrom="rgba(79, 70, 229, 0.2)" 
              gradientTo="rgba(129, 140, 248, 0.2)"
              gradientOpacity={0.1}
            >
              <div className="p-6">
                <h3 className="text-lg font-medium text-indigo-600 mb-2">{project.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {project.description || 'No description provided'}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`${getStatusClass(project.status)} px-2 py-1 text-xs font-semibold rounded-full`}>
                    {project.status || 'Active'}
                  </span>
                  <span className={`${getPriorityClass(project.priority)} px-2 py-1 text-xs font-semibold rounded-full`}>
                    {project.priority || 'Medium'}
                  </span>
                  <span className="bg-gray-100 text-gray-800 px-2 py-1 text-xs font-semibold rounded-full">
                    {project.projectType === 'team' ? 'Team' : 'Personal'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500 mb-4">
                  <div className="flex justify-between mb-2">
                    <span>Owner:</span>
                    <span>{project.owner?.name || 'You'}</span>
                  </div>
                  {project.team && (
                    <div className="flex justify-between mb-2">
                      <span>Team:</span>
                      <span>{project.team?.name || 'N/A'}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Due:</span>
                    <span>{formatDate(project.dueDate)}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {(project.members?.length || 1)} members
                  </span>
                  <Link
                    to={`/projects/${project._id}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </MagicCard>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;