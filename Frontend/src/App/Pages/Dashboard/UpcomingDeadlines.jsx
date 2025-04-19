import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import taskService  from '../../../api/taskService';

const UpcomingDeadlines = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      try {
        setLoading(true);
        // Get all tasks assigned to the current user
        const response = await taskService.getUserTasks();
        const userTasks = response.data || [];
        
        // Filter tasks to get upcoming deadlines
        const tasksWithDeadlines = userTasks.filter(task => 
          task.deadline && 
          task.status !== 'completed' && 
          new Date(task.deadline) >= new Date()
        );
        
        // Sort by closest deadline first
        tasksWithDeadlines.sort((a, b) => 
          new Date(a.deadline) - new Date(b.deadline)
        );
        
        // Take only the first 5
        setTasks(tasksWithDeadlines.slice(0, 5));
      } catch (error) {
        console.error('Error fetching upcoming deadlines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingTasks();
  }, []);

  const daysUntilDeadline = (deadlineDate) => {
    const today = new Date();
    const deadline = new Date(deadlineDate);
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const getDeadlineClasses = (deadline) => {
    const days = daysUntilDeadline(deadline);
    if (days <= 1) return 'text-red-500 font-medium';
    if (days <= 3) return 'text-amber-500 font-medium';
    return 'text-gray-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No upcoming deadlines.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div key={task._id} className="border-b border-gray-200 pb-3 last:border-0">
          <Link 
            to={`/tasks/${task._id}`}
            className="text-sm font-medium text-gray-900 hover:text-indigo-600 block"
          >
            {task.title}
          </Link>
          
          <div className="mt-1 flex justify-between items-center">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {task.project?.title || 'No project'}
            </span>
            
            <span className={`text-xs ${getDeadlineClasses(task.deadline)}`}>
              {daysUntilDeadline(task.deadline) === 0 
                ? 'Due today!' 
                : daysUntilDeadline(task.deadline) === 1 
                  ? 'Due tomorrow!' 
                  : `${daysUntilDeadline(task.deadline)} days left`}
            </span>
          </div>
          
          <div className="mt-1 text-xs text-gray-500">
            {task.assignedTo ? (
              <div className="flex items-center">
                <span>Assigned to: {task.assignedTo.name}</span>
              </div>
            ) : (
              <span>Unassigned</span>
            )}
          </div>
        </div>
      ))}
      
      <div className="text-center pt-2">
        <Link 
          to="/tasks"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          View all tasks
        </Link>
      </div>
    </div>
  );
};

export default UpcomingDeadlines;