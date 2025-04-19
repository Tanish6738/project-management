import { createContext, useContext, useReducer, useCallback } from 'react';
import { taskService } from '../../api';
import { handleApiError } from '../../lib/utils';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

const initialState = {
  tasks: [],
  currentTask: null,
  projectTasks: [],
  userTasks: [],
  loading: false,
  error: null,
};

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false, error: null };
    case 'SET_PROJECT_TASKS':
      return { ...state, projectTasks: action.payload, loading: false, error: null };
    case 'SET_USER_TASKS':
      return { ...state, userTasks: action.payload, loading: false, error: null };
    case 'SET_CURRENT_TASK':
      return { ...state, currentTask: action.payload, loading: false, error: null };
    case 'ADD_TASK':
      return { 
        ...state, 
        tasks: [...state.tasks, action.payload],
        projectTasks: state.projectTasks.length > 0 && action.payload.projectId === state.projectTasks[0]?.projectId 
          ? [...state.projectTasks, action.payload] 
          : state.projectTasks,
        loading: false,
        error: null 
      };
    case 'UPDATE_TASK':
      const updatedTask = action.payload;
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        ),
        projectTasks: state.projectTasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        ),
        userTasks: state.userTasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        ),
        currentTask: state.currentTask?._id === updatedTask._id 
          ? updatedTask 
          : state.currentTask,
        loading: false,
        error: null
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload),
        projectTasks: state.projectTasks.filter(task => task._id !== action.payload),
        userTasks: state.userTasks.filter(task => task._id !== action.payload),
        currentTask: state.currentTask?._id === action.payload ? null : state.currentTask,
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  
  const fetchAllTasks = useCallback(async (params) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.getAllTasks(params);
      dispatch({ type: 'SET_TASKS', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const fetchProjectTasks = useCallback(async (projectId, params) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.getProjectTasks(projectId, params);
      dispatch({ type: 'SET_PROJECT_TASKS', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const fetchUserTasks = useCallback(async (params) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.getUserTasks(params);
      dispatch({ type: 'SET_USER_TASKS', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const fetchTaskById = useCallback(async (taskId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.getTaskById(taskId);
      dispatch({ type: 'SET_CURRENT_TASK', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.createTask(taskData);
      dispatch({ type: 'ADD_TASK', payload: response.data });
      toast.success('Task created successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const updateTask = useCallback(async (taskId, taskData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.updateTask(taskId, taskData);
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      toast.success('Task updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await taskService.deleteTask(taskId);
      dispatch({ type: 'DELETE_TASK', payload: taskId });
      toast.success('Task deleted successfully');
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const assignTask = useCallback(async (taskId, userId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.assignTask(taskId, userId);
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      toast.success('Task assigned successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const unassignTask = useCallback(async (taskId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.unassignTask(taskId);
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      toast.success('Task unassigned successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId, status) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.updateTaskStatus(taskId, status);
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      toast.success('Task status updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const updateTaskPriority = useCallback(async (taskId, priority) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.updateTaskPriority(taskId, priority);
      dispatch({ type: 'UPDATE_TASK', payload: response.data });
      toast.success('Task priority updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const getTasksByStatus = useCallback(async (projectId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.getTasksByStatus(projectId);
      dispatch({ type: 'SET_LOADING', payload: false });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const getTasksByAssignee = useCallback(async (projectId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.getTasksByAssignee(projectId);
      dispatch({ type: 'SET_LOADING', payload: false });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const getTaskKanbanView = useCallback(async (projectId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.getTaskKanbanView(projectId);
      dispatch({ type: 'SET_LOADING', payload: false });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const getTeamTaskStats = useCallback(async (teamId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.getTeamTaskStats(teamId);
      dispatch({ type: 'SET_LOADING', payload: false });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  return (
    <TaskContext.Provider
      value={{
        ...state,
        fetchAllTasks,
        fetchProjectTasks,
        fetchUserTasks,
        fetchTaskById,
        createTask,
        updateTask,
        deleteTask,
        assignTask,
        unassignTask,
        updateTaskStatus,
        updateTaskPriority,
        getTasksByStatus,
        getTasksByAssignee,
        getTaskKanbanView,
        getTeamTaskStats
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};