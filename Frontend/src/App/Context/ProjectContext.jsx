import { createContext, useContext, useReducer, useCallback } from 'react';
import { projectService } from '../../api';
import { handleApiError } from '../../lib/utils';
import toast from 'react-hot-toast';

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
        currentProject: state.currentProject?._id === action.payload._id 
          ? action.payload 
          : state.currentProject,
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
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const fetchProjectById = useCallback(async (projectId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.getProjectById(projectId);
      dispatch({ type: 'SET_CURRENT_PROJECT', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const createProject = useCallback(async (projectData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.createProject(projectData);
      dispatch({ type: 'ADD_PROJECT', payload: response.data });
      toast.success('Project created successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const updateProject = useCallback(async (projectId, projectData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.updateProject(projectId, projectData);
      dispatch({ type: 'UPDATE_PROJECT', payload: response.data });
      toast.success('Project updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const deleteProject = useCallback(async (projectId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await projectService.deleteProject(projectId);
      dispatch({ type: 'DELETE_PROJECT', payload: projectId });
      toast.success('Project deleted successfully');
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const addTeamToProject = useCallback(async (projectId, teamId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.addTeamToProject(projectId, teamId);
      dispatch({ type: 'UPDATE_PROJECT', payload: response.data });
      toast.success('Team added to project successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const removeTeamFromProject = useCallback(async (projectId, teamId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.removeTeamFromProject(projectId, teamId);
      dispatch({ type: 'UPDATE_PROJECT', payload: response.data });
      toast.success('Team removed from project successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const getProjectStats = useCallback(async (projectId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.getProjectStats(projectId);
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
    <ProjectContext.Provider
      value={{
        ...state,
        fetchProjects,
        fetchProjectById,
        createProject,
        updateProject,
        deleteProject,
        addTeamToProject,
        removeTeamFromProject,
        getProjectStats
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};