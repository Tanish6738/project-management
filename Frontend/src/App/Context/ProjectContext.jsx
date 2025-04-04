import { createContext, useContext, useReducer, useCallback } from 'react';
import { projectService } from '../../api';
import { handleApiError } from '../../lib/utils';

const ProjectContext = createContext(null);

const initialState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
};

const projectReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PROJECTS':
      return { ...state, projects: action.payload, loading: false, error: null };
    case 'SET_CURRENT_PROJECT':
      return { ...state, currentProject: action.payload, loading: false, error: null };
    case 'ADD_PROJECT':
      return { 
        ...state, 
        projects: [...state.projects, action.payload],
        loading: false,
        error: null 
      };
    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        ),
        currentProject: state.currentProject?._id === action.payload._id ? 
          action.payload : state.currentProject,
        loading: false,
        error: null
      };
    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project._id !== action.payload),
        currentProject: state.currentProject?._id === action.payload ? null : state.currentProject,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const ProjectProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectReducer, initialState);

  const fetchProjects = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.getAllProjects();
      dispatch({ type: 'SET_PROJECTS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleApiError(error) });
    }
  }, []);

  const fetchProjectById = useCallback(async (projectId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.getProjectById(projectId);
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleApiError(error) });
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.createProject(projectData);
      dispatch({ type: 'ADD_PROJECT', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleApiError(error) });
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (projectId, projectData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.updateProject(projectId, projectData);
      dispatch({ type: 'UPDATE_PROJECT', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleApiError(error) });
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await projectService.deleteProject(projectId);
      dispatch({ type: 'DELETE_PROJECT', payload: projectId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: handleApiError(error) });
      throw error;
    }
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    fetchProjects,
    fetchProjectById,
    createProject,
    updateProject,
    deleteProject,
    clearError,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};