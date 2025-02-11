import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import { 
    validateProjectCreation,
    validateProjectUpdate,
    validateTeamMemberAddition,
    validate 
} from '../middlewares/validator.middleware.js';
import {
    createProject,
    getAllProjects,
    getProjectDetails,
    updateProject,
    deleteProject,
    addProjectMember,
    removeProjectMember,
    updateProjectMemberRole,
    getProjectMembers,
    updateProjectSettings,
    updateProjectWorkflow,
    manageProjectTags
} from '../controllers/project.controller.js';

const ProjectRouter = express.Router();

// Project management routes
ProjectRouter.post('/', auth, validateProjectCreation, validate, createProject);
ProjectRouter.get('/', auth, getAllProjects);
ProjectRouter.get('/:projectId', auth, getProjectDetails);
ProjectRouter.put('/:projectId', auth, validateProjectUpdate, validate, updateProject);
ProjectRouter.delete('/:projectId', auth, deleteProject);

// Project member management routes
ProjectRouter.get('/:projectId/members', auth, getProjectMembers);
ProjectRouter.post('/:projectId/members', auth, validateTeamMemberAddition, validate, addProjectMember);
ProjectRouter.delete('/:projectId/members/:userId', auth, removeProjectMember);
ProjectRouter.patch('/:projectId/members/:userId/role', auth, validateTeamMemberAddition, validate, updateProjectMemberRole);

// Project settings and configuration routes
ProjectRouter.put('/:projectId/settings', auth, updateProjectSettings);
ProjectRouter.put('/:projectId/workflow', auth, updateProjectWorkflow);
ProjectRouter.post('/:projectId/tags', auth, manageProjectTags);

export default ProjectRouter;
