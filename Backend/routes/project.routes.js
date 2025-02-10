import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import { 
    validateProjectCreation,
    validate 
} from '../middlewares/validator.middleware.js';
import {
    createProject,
    getProjectDetails,
    updateProject,
    deleteProject
} from '../controllers/project.controller.js';

const ProjectRouter = express.Router();

ProjectRouter.post('/', auth, validateProjectCreation, validate, createProject);
ProjectRouter.get('/:projectId', auth, getProjectDetails);
ProjectRouter.put('/:projectId', auth, validateProjectCreation, validate, updateProject);
ProjectRouter.delete('/:projectId', auth, deleteProject);

export default ProjectRouter;
