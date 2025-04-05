import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import { useProject } from '../../Context/ProjectContext';
import { useTask } from '../../Context/TaskContext';
import TaskList from './TaskList';

const Dashboard = () => {
  const { user } = useAuth();
  const { projects, loading: projectsLoading, fetchProjects } = useProject();
  const { userTasks, fetchUserTasks } = useTask();
  const [stats, setStats] = useState({
    totalProjects: 0,
    tasksCompleted: 0,
    pendingTasks: 0,
    upcomingDeadlines: 0
  });

  useEffect(() => {
    fetchProjects();
    fetchUserTasks();
  }, [fetchProjects, fetchUserTasks]);

  useEffect(() => {
    // Calculate dashboard stats from available data
    const totalProjects = projects.length;
    
    const tasksCompleted = userTasks.filter(task => 
      task.status.toLowerCase() === 'done'
    ).length;
    
    const pendingTasks = userTasks.filter(task => 
      task.status.toLowerCase() !== 'done'
    ).length;
    
    // Calculate upcoming deadlines (tasks due in the next 7 days)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    
    const upcomingDeadlines = userTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= nextWeek && task.status.toLowerCase() !== 'done';
    }).length;
    
    setStats({
      totalProjects,
      tasksCompleted,
      pendingTasks,
      upcomingDeadlines
    });
  }, [projects, userTasks]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {user?.name || 'User'}</h1>
        <p className="text-gray-600">Here's an overview of your work</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Active Projects</p>
              <p className="text-2xl font-semibold text-gray-700">{stats.totalProjects}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Tasks Completed</p>
              <p className="text-2xl font-semibold text-gray-700">{stats.tasksCompleted}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Pending Tasks</p>
              <p className="text-2xl font-semibold text-gray-700">{stats.pendingTasks}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Upcoming Deadlines</p>
              <p className="text-2xl font-semibold text-gray-700">{stats.upcomingDeadlines}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/projects" className="bg-indigo-50 hover:bg-indigo-100 transition-colors p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-indigo-700 mb-2">Projects</h3>
          <p className="text-sm text-gray-600">View and manage all your projects</p>
        </Link>
        
        <Link to="/teams" className="bg-green-50 hover:bg-green-100 transition-colors p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-green-700 mb-2">Teams</h3>
          <p className="text-sm text-gray-600">Manage your teams and members</p>
        </Link>
        
        <div className="bg-purple-50 hover:bg-purple-100 transition-colors p-6 rounded-lg shadow-sm cursor-pointer">
          <h3 className="text-lg font-medium text-purple-700 mb-2">Reports</h3>
          <p className="text-sm text-gray-600">View project performance and analytics</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Tasks</h2>
          <TaskList />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Projects</h2>
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {projectsLoading ? (
              <div className="flex justify-center items-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : projects.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {projects.slice(0, 5).map((project) => (
                  <li key={project._id}>
                    <Link to={`/projects/${project._id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-indigo-600 truncate">{project.title}</p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {project.status}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                              </svg>
                              {project.teams?.length || 0} teams
                            </p>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span>
                              {new Date(project.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No projects found.
              </div>
            )}
            
            {projects.length > 0 && (
              <div className="bg-gray-50 px-4 py-3 flex justify-center">
                <Link to="/projects" className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
                  View all projects
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;