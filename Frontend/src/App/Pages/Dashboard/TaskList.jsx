import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTask } from '../../Context/TaskContext';
import { useProject } from '../../Context/ProjectContext';
import { useUser } from '../../Context/UserContext';
import debounce from 'lodash/debounce';

const TaskList = () => {
  const { userTasks, loading, error, fetchUserTasks, updateTaskStatus } = useTask();
  const { projects, fetchProjects } = useProject();
  const { currentUser } = useUser();
  
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    project: '',
    dueDate: '',
    assignee: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'dueDate',
    direction: 'asc'
  });

  // Fetch tasks and projects on component mount
  useEffect(() => {
    fetchUserTasks();
    fetchProjects();
  }, [fetchUserTasks, fetchProjects]);

  // Filter and sort tasks when dependencies change
  useEffect(() => {
    if (userTasks) {
      let filtered = [...userTasks];

      // Apply filters
      if (filters.status) {
        filtered = filtered.filter(task => 
          task.status.toLowerCase() === filters.status.toLowerCase()
        );
      }

      if (filters.priority) {
        filtered = filtered.filter(task => 
          task.priority.toLowerCase() === filters.priority.toLowerCase()
        );
      }
      
      if (filters.project) {
        filtered = filtered.filter(task => 
          task.project?._id === filters.project
        );
      }
      
      if (filters.assignee) {
        if (filters.assignee === 'me') {
          filtered = filtered.filter(task => 
            task.assignedTo?._id === currentUser?._id
          );
        } else if (filters.assignee === 'unassigned') {
          filtered = filtered.filter(task => !task.assignedTo);
        } else {
          filtered = filtered.filter(task => 
            task.assignedTo?._id === filters.assignee
          );
        }
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(task => 
          task.title.toLowerCase().includes(searchLower) || 
          (task.description && task.description.toLowerCase().includes(searchLower))
        );
      }
      
      if (filters.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (filters.dueDate === 'overdue') {
          filtered = filtered.filter(task => {
            if (!task.deadline) return false;
            return new Date(task.deadline) < today;
          });
        } else if (filters.dueDate === 'today') {
          filtered = filtered.filter(task => {
            if (!task.deadline) return false;
            const taskDate = new Date(task.deadline);
            return taskDate.getDate() === today.getDate() &&
                   taskDate.getMonth() === today.getMonth() &&
                   taskDate.getFullYear() === today.getFullYear();
          });
        } else if (filters.dueDate === 'week') {
          const weekLater = new Date(today);
          weekLater.setDate(today.getDate() + 7);
          
          filtered = filtered.filter(task => {
            if (!task.deadline) return false;
            const taskDate = new Date(task.deadline);
            return taskDate >= today && taskDate <= weekLater;
          });
        }
      }
      
      // Apply sorting
      if (sortConfig.key) {
        filtered.sort((a, b) => {
          if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
          if (!a[sortConfig.key]) return 1;
          if (!b[sortConfig.key]) return -1;
          
          let valueA = a[sortConfig.key];
          let valueB = b[sortConfig.key];
          
          // Handle date comparisons
          if (sortConfig.key === 'deadline' || sortConfig.key === 'dueDate') {
            valueA = new Date(valueA);
            valueB = new Date(valueB);
          }
          
          if (valueA < valueB) {
            return sortConfig.direction === 'asc' ? -1 : 1;
          }
          if (valueA > valueB) {
            return sortConfig.direction === 'asc' ? 1 : -1;
          }
          return 0;
        });
      }
      
      setFilteredTasks(filtered);
    }
  }, [userTasks, filters, sortConfig, currentUser]);
  
  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilters(prevFilters => ({ ...prevFilters, search: value }));
    }, 500),
    []
  );
  
  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };
  
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({ ...prevFilters, [filterName]: value }));
  };
  
  const handleSortChange = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        Error loading tasks: {error.message || "Unknown error"}
      </div>
    );
  }
  
  if (!filteredTasks.length) {
    return (
      <div className="p-4 text-center">
        <div className="text-gray-500">No tasks found. Try adjusting your filters.</div>
      </div>
    );
  }
  
  // Show only up to 5 tasks in the dashboard view
  const dashboardTasks = filteredTasks.slice(0, 5);
  
  return (
    <div>
      {/* Simple filter controls for the dashboard */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          className="px-3 py-1 border rounded-md text-sm"
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          className="px-3 py-1 border rounded-md text-sm"
          value={filters.priority}
          onChange={(e) => handleFilterChange('priority', e.target.value)}
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          className="px-3 py-1 border rounded-md text-sm"
          value={filters.dueDate}
          onChange={(e) => handleFilterChange('dueDate', e.target.value)}
        >
          <option value="">All Dates</option>
          <option value="overdue">Overdue</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
        </select>
        <input
          type="text"
          placeholder="Search tasks..."
          className="px-3 py-1 border rounded-md text-sm"
          onChange={handleSearchChange}
        />
      </div>
      
      {/* Task list */}
      <div className="space-y-2">
        {dashboardTasks.map((task) => (
          <div 
            key={task._id} 
            className="p-3 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <Link 
                to={`/tasks/${task._id}`} 
                className="text-sm font-medium text-gray-900 hover:text-indigo-600"
              >
                {task.title}
              </Link>
              
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.priority === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {task.priority}
                </span>
                
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  className={`text-xs px-2 py-1 rounded border ${
                    task.status === 'completed' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : task.status === 'in-progress'
                      ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      : 'bg-gray-100 text-gray-800 border-gray-200'
                  }`}
                >
                  <option value="pending">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            
            <div className="mt-1 text-xs text-gray-500">
              <p>
                {task.project?.title && (
                  <span className="mr-2">Project: {task.project.title}</span>
                )}
                {task.deadline && (
                  <span className={`${
                    new Date(task.deadline) < new Date() && task.status !== 'completed' 
                      ? 'text-red-500 font-medium'
                      : ''
                  }`}>
                    Due: {new Date(task.deadline).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
            
            {task.assignedTo && (
              <div className="mt-2 flex items-center">
                <div className="h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center text-xs mr-1">
                  {task.assignedTo.avatar ? (
                    <img 
                      src={task.assignedTo.avatar} 
                      alt={task.assignedTo.name} 
                      className="h-5 w-5 rounded-full" 
                    />
                  ) : (
                    task.assignedTo.name?.substring(0, 1)
                  )}
                </div>
                <span className="text-xs text-gray-600">{task.assignedTo.name}</span>
              </div>
            )}
            
            {/* Progress bar for subtasks if any */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="mt-2">
                <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-1 bg-indigo-500" 
                    style={{ width: `${task.progress || 0}%` }}
                  ></div>
                </div>
                <div className="mt-1 text-xs text-gray-500 flex justify-between">
                  <span>{task.progress || 0}% complete</span>
                  <span>{task.subtasks.filter(s => s.status === 'completed').length}/{task.subtasks.length}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;