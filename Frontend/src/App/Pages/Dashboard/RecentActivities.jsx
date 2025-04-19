import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProject } from '../../Context/ProjectContext';
import { useTask } from '../../Context/TaskContext';
import { useUser } from '../../Context/UserContext';

const RecentActivities = () => {
  const { projects, fetchProjectActivities } = useProject();
  const { fetchTaskActivities } = useTask();
  const { currentUser } = useUser();
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadActivities = async () => {
      try {
        setLoading(true);
        
        // Fetch both project and task activities
        const [projectActivities, taskActivities] = await Promise.all([
          fetchProjectActivities(),
          fetchTaskActivities()
        ]);
        
        // Combine and sort all activities by date
        const allActivities = [
          ...(projectActivities || []).map(activity => ({
            ...activity,
            type: 'project'
          })),
          ...(taskActivities || []).map(activity => ({
            ...activity,
            type: 'task'
          }))
        ];
        
        // Sort by most recent first
        allActivities.sort((a, b) => 
          new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)
        );
        
        setActivities(allActivities.slice(0, 10)); // Limit to 10 most recent
        setLoading(false);
      } catch (error) {
        console.error("Error loading activities:", error);
        setLoading(false);
      }
    };
    
    loadActivities();
  }, [fetchProjectActivities, fetchTaskActivities]);
  
  // Function to format activity message
  const formatActivityMessage = (activity) => {
    const userName = activity.user?.name || 'Someone';
    const isCurrentUser = activity.user?._id === currentUser?._id;
    const userText = isCurrentUser ? 'You' : userName;
    
    if (activity.type === 'project') {
      switch (activity.action) {
        case 'create':
          return `${userText} created project "${activity.project?.title}"`;
        case 'update':
          return `${userText} updated project "${activity.project?.title}"`;
        case 'complete':
          return `${userText} marked project "${activity.project?.title}" as complete`;
        case 'add_member':
          return `${userText} added ${activity.targetUser?.name || 'a user'} to project "${activity.project?.title}"`;
        default:
          return `${userText} ${activity.action} project "${activity.project?.title}"`;
      }
    } else if (activity.type === 'task') {
      switch (activity.action) {
        case 'create':
          return `${userText} created task "${activity.task?.title}"`;
        case 'update':
          return `${userText} updated task "${activity.task?.title}"`;
        case 'complete':
          return `${userText} completed task "${activity.task?.title}"`;
        case 'assign':
          return `${userText} assigned task "${activity.task?.title}" to ${activity.targetUser?.name || 'someone'}`;
        case 'comment':
          return `${userText} commented on task "${activity.task?.title}"`;
        default:
          return `${userText} ${activity.action} task "${activity.task?.title}"`;
      }
    }
    
    return `${userText} performed an action`;
  };
  
  // Function to format relative time (e.g., "2 hours ago")
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - activityTime) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    return activityTime.toLocaleDateString();
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No recent activities to display
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity._id || index} className="flex space-x-3">
          {/* User avatar */}
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm overflow-hidden">
              {activity.user?.avatar ? (
                <img 
                  src={activity.user.avatar} 
                  alt={activity.user.name} 
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                (activity.user?.name || 'U').substring(0, 1)
              )}
            </div>
          </div>
          
          {/* Activity content */}
          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-800">
              {formatActivityMessage(activity)}
            </p>
            <div className="mt-1 flex items-center text-xs text-gray-500">
              <span>{getRelativeTime(activity.timestamp || activity.createdAt)}</span>
              
              {/* Link to project or task if available */}
              {activity.type === 'project' && activity.project?._id && (
                <>
                  <span className="mx-1">•</span>
                  <Link 
                    to={`/projects/${activity.project._id}`} 
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View project
                  </Link>
                </>
              )}
              
              {activity.type === 'task' && activity.task?._id && (
                <>
                  <span className="mx-1">•</span>
                  <Link 
                    to={`/tasks/${activity.task._id}`} 
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    View task
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivities;