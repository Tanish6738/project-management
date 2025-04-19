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
    case 'UPDATE_PROJECT_SETTINGS':
      return {
        ...state,
        currentProject: {
          ...state.currentProject,
          settings: action.payload
        },
        loading: false,
        error: null
      };
    case 'UPDATE_PROJECT_WORKFLOW':
      return {
        ...state,
        currentProject: {
          ...state.currentProject,
          workflow: action.payload
        },
        loading: false,
        error: null
      };
    case 'UPDATE_PROJECT_TAGS':
      return {
        ...state,
        currentProject: {
          ...state.currentProject,
          tags: action.payload
        },
        loading: false,
        error: null
      };
    case 'UPDATE_PROJECT_MEMBERS':
      return {
        ...state,
        currentProject: {
          ...state.currentProject,
          members: action.payload
        },
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

  const updateProjectSettings = useCallback(async (projectId, settingsData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.updateProjectSettings(projectId, settingsData);
      
      if (state.currentProject && state.currentProject._id === projectId) {
        dispatch({ 
          type: 'UPDATE_PROJECT_SETTINGS', 
          payload: response.data.settings || settingsData
        });
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, [state.currentProject]);

  const updateProjectWorkflow = useCallback(async (projectId, workflowData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.updateProjectWorkflow(projectId, workflowData);
      
      if (state.currentProject && state.currentProject._id === projectId) {
        dispatch({ 
          type: 'UPDATE_PROJECT_WORKFLOW', 
          payload: response.data.workflow || workflowData.workflow
        });
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, [state.currentProject]);

  const manageProjectTags = useCallback(async (projectId, tagsData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.manageProjectTags(projectId, tagsData);
      
      if (state.currentProject && state.currentProject._id === projectId) {
        dispatch({ 
          type: 'UPDATE_PROJECT_TAGS', 
          payload: response.data.tags || []
        });
      }
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, [state.currentProject]);

  const addProjectMember = useCallback(async (projectId, memberData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.addProjectMember(projectId, memberData);
      
      if (state.currentProject && state.currentProject._id === projectId) {
        dispatch({ 
          type: 'UPDATE_PROJECT_MEMBERS', 
          payload: response.data.members || []
        });
      }
      
      toast.success('Member added to project successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, [state.currentProject]);

  const removeProjectMember = useCallback(async (projectId, memberId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await projectService.removeProjectMember(projectId, memberId);
      
      if (state.currentProject && state.currentProject._id === projectId) {
        dispatch({ 
          type: 'UPDATE_PROJECT_MEMBERS', 
          payload: response.data.members || []
        });
      }
      
      toast.success('Member removed from project successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, [state.currentProject]);

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

  // Add fetchProjectActivities function
  const fetchProjectActivities = useCallback(async (projectId = null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      let response;
      
      if (projectId) {
        // If a specific project ID is provided, get activities for that project
        response = await projectService.getProjectActivity(projectId);
      } else {
        // Otherwise, collect activities from all projects
        const projects = state.projects.length ? state.projects : await fetchProjects();
        
        // Get activities for the first few projects (to limit API calls)
        const projectActivitiesPromises = projects
          .slice(0, 5) // Limit to 5 projects to avoid too many API calls
          .map(project => projectService.getProjectActivity(project._id));
        
        const projectActivitiesResponses = await Promise.all(projectActivitiesPromises);
        
        // Flatten the array of activities
        const allActivities = projectActivitiesResponses.flatMap(res => res.data || []);
        response = { data: allActivities };
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error("Error fetching project activities:", error);
      throw error;
    }
  }, [state.projects, fetchProjects]);

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
        getProjectStats,
        updateProjectSettings,
        updateProjectWorkflow,
        manageProjectTags,
        addProjectMember,
        removeProjectMember,
        fetchProjectActivities
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