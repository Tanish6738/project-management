import { createContext, useContext, useState, useCallback, useReducer } from 'react';
import PropTypes from 'prop-types';
import toast from 'react-hot-toast';
import { teamService } from '../../api';

// Create Team Context
const TeamContext = createContext();

// Team reducer for managing complex state
const teamReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TEAMS':
      return { ...state, teams: action.payload, loading: false, error: null };
    case 'SET_CURRENT_TEAM':
      return { ...state, currentTeam: action.payload, loading: false, error: null };
    case 'SET_TEAM_MEMBERS':
      return { ...state, teamMembers: action.payload, loading: false, error: null };
    case 'SET_TEAM_PERMISSIONS':
      return { ...state, teamPermissions: action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_TEAM':
      return { ...state, teams: [...state.teams, action.payload], loading: false, error: null };
    case 'UPDATE_TEAM':
      return { 
        ...state, 
        teams: state.teams.map(team => team._id === action.payload._id ? action.payload : team),
        currentTeam: state.currentTeam && state.currentTeam._id === action.payload._id ? action.payload : state.currentTeam,
        loading: false, 
        error: null 
      };
    case 'DELETE_TEAM':
      return { 
        ...state, 
        teams: state.teams.filter(team => team._id !== action.payload),
        currentTeam: null,
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
    case 'UPDATE_TEAM_MEMBER':
      return { 
        ...state, 
        teamMembers: state.teamMembers.map(member => 
          member._id === action.payload._id ? action.payload : member
        ),
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

// Initial state
const initialState = {
  teams: [],
  currentTeam: null,
  teamMembers: [],
  teamPermissions: null,
  loading: false,
  error: null
};

// Provider component
export const TeamProvider = ({ children }) => {
  const [state, dispatch] = useReducer(teamReducer, initialState);

  // Fetch all teams
  const fetchTeams = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.getAllTeams();
      dispatch({ type: 'SET_TEAMS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch teams' });
      toast.error('Failed to load teams');
    }
  }, []);

  // Fetch team by ID
  const fetchTeamById = useCallback(async (teamId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.getTeamById(teamId);
      dispatch({ type: 'SET_CURRENT_TEAM', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || `Failed to fetch team with ID: ${teamId}` });
      toast.error('Failed to load team details');
    }
  }, []);

  // Fetch team members
  const fetchTeamMembers = useCallback(async (teamId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.getTeamMembers(teamId);
      dispatch({ type: 'SET_TEAM_MEMBERS', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch team members' });
      toast.error('Failed to load team members');
    }
  }, []);

  // Create a new team
  const createTeam = useCallback(async (teamData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.createTeam(teamData);
      dispatch({ type: 'ADD_TEAM', payload: response.data });
      toast.success('Team created successfully');
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to create team' });
      toast.error('Failed to create team');
      throw error;
    }
  }, []);

  // Update a team
  const updateTeam = useCallback(async (teamId, teamData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.updateTeam(teamId, teamData);
      dispatch({ type: 'UPDATE_TEAM', payload: response.data });
      toast.success('Team updated successfully');
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to update team' });
      toast.error('Failed to update team');
      throw error;
    }
  }, []);

  // Delete a team
  const deleteTeam = useCallback(async (teamId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await teamService.deleteTeam(teamId);
      dispatch({ type: 'DELETE_TEAM', payload: teamId });
      toast.success('Team deleted successfully');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to delete team' });
      toast.error('Failed to delete team');
      throw error;
    }
  }, []);

  // Add a team member
  const addTeamMember = useCallback(async (teamId, memberData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.addTeamMember(teamId, memberData);
      dispatch({ type: 'ADD_TEAM_MEMBER', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to add team member' });
      throw error;
    }
  }, []);

  // Remove a team member
  const removeTeamMember = useCallback(async (teamId, userId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await teamService.removeTeamMember(teamId, userId);
      dispatch({ type: 'REMOVE_TEAM_MEMBER', payload: userId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to remove team member' });
      throw error;
    }
  }, []);

  // Update a team member's role
  const updateMemberRole = useCallback(async (teamId, userId, roleData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.updateMemberRole(teamId, userId, roleData);
      dispatch({ type: 'UPDATE_TEAM_MEMBER', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to update member role' });
      throw error;
    }
  }, []);

  // Get team permissions
  const fetchTeamPermissions = useCallback(async (teamId) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.getTeamPermissions(teamId);
      dispatch({ type: 'SET_TEAM_PERMISSIONS', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to fetch team permissions' });
      throw error;
    }
  }, []);

  // Update team permissions
  const updateTeamPermissions = useCallback(async (teamId, permissionsData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await teamService.updateTeamPermissions(teamId, permissionsData);
      dispatch({ type: 'SET_TEAM_PERMISSIONS', payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.response?.data?.message || 'Failed to update team permissions' });
      throw error;
    }
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Create context value
  const value = {
    ...state,
    fetchTeams,
    fetchTeamById,
    fetchTeamMembers,
    createTeam,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    updateMemberRole,
    fetchTeamPermissions,
    updateTeamPermissions,
    clearError
  };

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
};

TeamProvider.propTypes = {
  children: PropTypes.node.isRequired
};

// Custom hook to use the team context
export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};

export default TeamContext;