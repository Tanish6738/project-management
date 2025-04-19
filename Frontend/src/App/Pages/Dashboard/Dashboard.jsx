import { useState, useEffect } from 'react';
import { useUser } from '../../Context/UserContext';
import { useProject } from '../../Context/ProjectContext';
import { useTask } from '../../Context/TaskContext';
import { useTeam } from '../../Context/TeamContext';
import TaskList from './TaskList';
import ProjectSummary from './ProjectSummary';
import TimeTrackingWidget from './TimeTrackingWidget';
import UpcomingDeadlines from './UpcomingDeadlines';
import RecentActivities from './RecentActivities';
import NotificationsWidget from './NotificationsWidget';
import TeamWorkload from './TeamWorkload';
import ProjectProgress from './ProjectProgress';

const Dashboard = () => {
  const { currentUser } = useUser();
  const { projects, fetchProjects, getProjectStats } = useProject();
  const { userTasks, fetchUserTasks, getTaskStats } = useTask();
  const { teams, fetchTeams } = useTeam();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    upcomingDeadlines: [],
    weeklyTimeTracking: {},
    recentActivities: []
  });

  // Fetch all required data when the component mounts
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load all required data in parallel for better performance
        await Promise.all([
          fetchTeams(),
          fetchProjects(),
          fetchUserTasks()
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchTeams, fetchProjects, fetchUserTasks]);

  // Calculate dashboard statistics whenever projects or tasks change
  useEffect(() => {
    if (projects && userTasks) {
      // Project statistics
      const activeProjects = projects.filter(p => p.status === 'active').length;
      const completedProjects = projects.filter(p => p.status === 'completed').length;
      
      // Task statistics
      const completedTasks = userTasks.filter(t => 
        t.status === 'completed' || t.status === 'Done').length;
      const overdueTasks = userTasks.filter(t => {
        if (!t.deadline) return false;
        const dueDate = new Date(t.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return dueDate < today && t.status !== 'completed' && t.status !== 'Done';
      }).length;
      
      // Upcoming deadlines (tasks due in the next 7 days)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const upcomingDeadlines = userTasks
        .filter(t => {
          if (!t.deadline) return false;
          const dueDate = new Date(t.deadline);
          return dueDate >= today && dueDate <= nextWeek && 
            t.status !== 'completed' && t.status !== 'Done';
        })
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5); // Get top 5 closest deadlines
      
      // Update statistics state
      setStats({
        totalProjects: projects.length,
        activeProjects,
        completedProjects,
        totalTasks: userTasks.length,
        completedTasks,
        overdueTasks,
        upcomingDeadlines,
        weeklyTimeTracking: {}, // Will be populated by TimeTrackingWidget
        recentActivities: [] // Will be populated by RecentActivities
      });
    }
  }, [projects, userTasks]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {currentUser?.name || 'User'}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your projects today.
        </p>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Projects
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.totalProjects}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <span>{stats.activeProjects} active</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Tasks Completed
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.completedTasks}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <span>of {stats.totalTasks}</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Overdue Tasks
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stats.overdueTasks}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-red-600">
                      <span>requiring attention</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Teams
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {teams ? teams.length : 0}
                    </div>
                    <div className="ml-2 flex items-baseline text-sm font-semibold text-yellow-600">
                      <span>collaborations</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column: Projects & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Progress */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Project Progress</h2>
            <ProjectProgress projects={projects ? projects.slice(0, 5) : []} />
          </div>
          
          {/* My Tasks */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">My Tasks</h2>
              <a href="/tasks" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                View all
              </a>
            </div>
            <TaskList />
          </div>
          
          {/* Team Workload - Display only if teams exist */}
          {teams && teams.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Team Workload</h2>
              <TeamWorkload teams={teams} />
            </div>
          )}
        </div>
        
        {/* Side Column: Time Tracking, Deadlines, etc. */}
        <div className="space-y-6">
          {/* Time Tracking */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Time Tracking</h2>
            <TimeTrackingWidget />
          </div>
          
          {/* Upcoming Deadlines */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upcoming Deadlines</h2>
            <UpcomingDeadlines tasks={stats.upcomingDeadlines} />
          </div>
          
          {/* Notifications */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
            <NotificationsWidget />
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <RecentActivities />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;