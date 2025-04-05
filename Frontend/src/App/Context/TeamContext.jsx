import { createContext, useContext, useReducer, useCallback } from 'react';
import { teamService } from '../../api';
import { handleApiError } from '../../lib/utils';
import toast from 'react-hot-toast';

const TeamContext = createContext(null);

const initialState = {
  teams: [],
  currentTeam: null,
  teamMembers: [],
  loading: false,
  error: null,
};

const teamReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_TEAMS':
      return { ...state, teams: action.payload, loading: false, error: null };
    case 'SET_CURRENT_TEAM':
      return { ...state, currentTeam: action.payload, loading: false, error: null };
    case 'SET_TEAM_MEMBERS':
      return { ...state, teamMembers: action.payload, loading: false, error: null };
    case 'ADD_TEAM':
      return { 
        ...state, 
        teams: [...state.teams, action.payload],
        loading: false,
        error: null 
      };
    case 'UPDATE_TEAM':
      return {
        ...state,
        teams: state.teams.map(team => 
          team._id === action.payload._id ? action.payload : team
        ),
        currentTeam: state.currentTeam?._id === action.payload._id 
          ? action.payload 
          : state.currentTeam,
        loading: false,
        error: null
      };
    case 'DELETE_TEAM':
      return {
        ...state,
        teams: state.teams.filter(team => team._id !== action.payload),
        currentTeam: state.currentTeam?._id === action.payload ? null : state.currentTeam,
        loading: false,
        error: null
      };
    case 'ADD_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: [...state.teamMembers, action.payload],
        loading: false,
        error: null
      };
    case 'REMOVE_TEAM_MEMBER':
      return {
        ...state,
        teamMembers: state.teamMembers.filter(member => member._id !== action.payload),
        loading: false,
        error: null
      };
    default:
      return state;
  }
};

export const TeamProvider = ({ children }) => {
  const [state, dispatch] = useReducer(teamReducer, initialState);
  
  const fetchTeams = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.getAllTeams();
      dispatch({ type: 'SET_TEAMS', payload: response.data });
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  }, []);

  const fetchTeamById = useCallback(async (teamId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.getTeamById(teamId);
      dispatch({ type: 'SET_CURRENT_TEAM', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const createTeam = useCallback(async (teamData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.createTeam(teamData);
      dispatch({ type: 'ADD_TEAM', payload: response.data });
      toast.success('Team created successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const updateTeam = useCallback(async (teamId, teamData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.updateTeam(teamId, teamData);
      dispatch({ type: 'UPDATE_TEAM', payload: response.data });
      toast.success('Team updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const deleteTeam = useCallback(async (teamId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await teamService.deleteTeam(teamId);
      dispatch({ type: 'DELETE_TEAM', payload: teamId });
      toast.success('Team deleted successfully');
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const fetchTeamMembers = useCallback(async (teamId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.getTeamMembers(teamId);
      dispatch({ type: 'SET_TEAM_MEMBERS', payload: response.data });
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const addTeamMember = useCallback(async (teamId, memberData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.addTeamMember(teamId, memberData);
      dispatch({ type: 'ADD_TEAM_MEMBER', payload: response.data });
      toast.success('Team member added successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const removeTeamMember = useCallback(async (teamId, userId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await teamService.removeTeamMember(teamId, userId);
      dispatch({ type: 'REMOVE_TEAM_MEMBER', payload: userId });
      toast.success('Team member removed successfully');
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, []);

  const updateMemberRole = useCallback(async (teamId, userId, roleData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.updateMemberRole(teamId, userId, roleData);
      // Refresh team members to get updated roles
      await fetchTeamMembers(teamId);
      toast.success('Member role updated successfully');
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  }, [fetchTeamMembers]);

  const getTeamStats = useCallback(async (teamId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.getTeamStats(teamId);
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
    <TeamContext.Provider
      value={{
        ...state,
        fetchTeams,
        fetchTeamById,
        createTeam,
        updateTeam,
        deleteTeam,
        fetchTeamMembers,
        addTeamMember,
        removeTeamMember,
        updateMemberRole,
        getTeamStats
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};