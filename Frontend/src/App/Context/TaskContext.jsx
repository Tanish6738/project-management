import { createContext, useContext, useReducer, useCallback } from 'react';
import { taskService } from '../../api';
import { handleApiError } from '../../lib/utils';
import toast from 'react-hot-toast';

const TaskContext = createContext(null);

const initialState = {
  tasks: [],
  currentTask: null,
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
    case 'SET_CURRENT_TASK':
      return { ...state, currentTask: action.payload, loading: false, error: null };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        loading: false,
        error: null
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task._id === action.payload._id ? action.payload : task
        ),
        currentTask: state.currentTask?._id === action.payload._id ?
          action.payload : state.currentTask,
        loading: false,
        error: null
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload),
        currentTask: state.currentTask?._id === action.payload ? null : state.currentTask,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchProjectTasks = useCallback(async (projectId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.getProjectTasks(projectId);
      dispatch({ type: 'SET_TASKS', payload: response.data });
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  }, []);

  const fetchTaskById = useCallback(async (taskId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await taskService.getTaskById(taskId);
      dispatch({ type: 'SET_CURRENT_TASK', payload: response.data });
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
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

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    fetchProjectTasks,
    fetchTaskById,
    createTask,
    updateTask,
    deleteTask,
    clearError,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};