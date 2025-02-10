import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import { 
    validateTeamCreation, 
    validateTeamMemberAddition,
    validateTeamUpdate,
    validate 
} from '../middlewares/validator.middleware.js';
import {
    createTeam,
    getTeamDetails,
    updateTeam,
    deleteTeam,
    addTeamMember,
    removeTeamMember,
    getAllTeams,
    getTeamMembers,
    updateTeamMemberRole
} from '../controllers/Team.controller.js';

const TeamRouter = express.Router();

// Team management routes
TeamRouter.post('/', auth, validateTeamCreation, validate, createTeam);
TeamRouter.get('/', auth, getAllTeams);
TeamRouter.get('/:teamId', auth, getTeamDetails);
TeamRouter.put('/:teamId', auth, validateTeamUpdate, validate, updateTeam);
TeamRouter.delete('/:teamId', auth, deleteTeam);

// Team member management routes
TeamRouter.get('/:teamId/members', auth, getTeamMembers);
TeamRouter.post('/:teamId/members', auth, validateTeamMemberAddition, validate, addTeamMember);
TeamRouter.delete('/:teamId/members/:userId', auth, removeTeamMember);
TeamRouter.patch('/:teamId/members/:userId/role', auth, validateTeamMemberAddition, validate, updateTeamMemberRole);

export default TeamRouter;