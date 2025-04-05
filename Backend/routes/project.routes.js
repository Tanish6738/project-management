import express from 'express';
import { auth, projectAuth } from '../middlewares/auth.middleware.js';
import { 
    validateProjectCreation, 
    validateProjectUpdate, 
    validateProjectMemberAddition,
    validateProjectMemberRoleUpdate,
    validateProjectSettings,
    validateProjectWorkflow,
    validateProjectTags,
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
    getProjectMembers,
    updateProjectMemberRole,
    updateProjectSettings,
    updateProjectWorkflow,
    manageProjectTags,
    getProjectStats
} from '../controllers/project.controller.js';

const ProjectRouter = express.Router();

// Project management routes
ProjectRouter.post('/', auth, validateProjectCreation, validate, createProject);
ProjectRouter.get('/', auth, getAllProjects);
ProjectRouter.get('/:projectId', auth, getProjectDetails);
ProjectRouter.put('/:projectId', auth, projectAuth('editor'), validateProjectUpdate, validate, updateProject);
ProjectRouter.delete('/:projectId', auth, projectAuth('admin'), deleteProject);

// Project members management
ProjectRouter.get('/:projectId/members', auth, getProjectMembers);
ProjectRouter.post('/:projectId/members', auth, projectAuth('admin'), validateProjectMemberAddition, validate, addProjectMember);
ProjectRouter.delete('/:projectId/members/:userId', auth, projectAuth('admin'), removeProjectMember);
ProjectRouter.patch('/:projectId/members/:userId/role', auth, projectAuth('admin'), validateProjectMemberRoleUpdate, validate, updateProjectMemberRole);

// Project configuration routes
ProjectRouter.put('/:projectId/settings', auth, projectAuth('admin'), validateProjectSettings, validate, updateProjectSettings);
ProjectRouter.put('/:projectId/workflow', auth, projectAuth('admin'), validateProjectWorkflow, validate, updateProjectWorkflow);
ProjectRouter.post('/:projectId/tags', auth, projectAuth('editor'), validateProjectTags, validate, manageProjectTags);

// Project statistics and analytics routes
ProjectRouter.get('/:projectId/stats', auth, getProjectStats);

export default ProjectRouter;
