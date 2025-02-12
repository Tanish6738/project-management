import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import {
    createTask,
    getAllTasks,
    getTaskDetails,
    updateTask,
    deleteTask,
    createSubtask,
    getAllSubtasks,
    updateSubtask,
    deleteSubtask,
    reorderSubtasks,
    updateTimeTracking,
    addTaskWatcher,
    getProjectTasksTree,
    getProjectTasksByStatus,
    getProjectTasksWithDetails
} from '../controllers/task.controller.js';
import { 
    validateTaskCreation, 
    validateTaskUpdate, 
    validate 
} from '../middlewares/validator.middleware.js';

const TaskRouter = express.Router();

// Task management routes
TaskRouter.post('/', auth, validateTaskCreation, validate, createTask);
TaskRouter.get('/', auth, getAllTasks);
TaskRouter.get('/:taskId', auth, getTaskDetails);
TaskRouter.put('/:taskId', auth, validateTaskUpdate, validate, updateTask);
TaskRouter.delete('/:taskId', auth, deleteTask);

// Subtask management routes
TaskRouter.get('/:taskId/subtasks', auth, getAllSubtasks);
TaskRouter.post('/:taskId/subtasks', auth, validateTaskCreation, validate, createSubtask);
TaskRouter.put('/:taskId/subtasks/:subtaskId', auth, validateTaskUpdate, validate, updateSubtask);
TaskRouter.delete('/:taskId/subtasks/:subtaskId', auth, deleteSubtask);
TaskRouter.put('/:taskId/subtasks-order', auth, reorderSubtasks);

// Time tracking routes
TaskRouter.post('/:taskId/time', auth, updateTimeTracking);

// Task watcher routes
TaskRouter.post('/:taskId/watchers', auth, addTaskWatcher);

// Add new routes for tree view and status-grouped view
TaskRouter.get('/tree', auth, getProjectTasksTree);
TaskRouter.get('/by-status', auth, getProjectTasksByStatus);

// Add this new route before export
TaskRouter.get('/project/:projectId/details', auth, getProjectTasksWithDetails);

export default TaskRouter;