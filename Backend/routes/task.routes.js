import express from 'express';
import { auth, projectAuth } from '../middlewares/auth.middleware.js';
import { 
    validateTaskCreation, 
    validateTaskUpdate, 
    validateSubtaskCreation,
    validateSubtaskOrder,
    validateTimeTracking,
    validateTaskFilters,
    validate 
} from '../middlewares/validator.middleware.js';
import {
    createTask,
    getAllTasks,
    getTaskDetails,
    updateTask,
    deleteTask,
    getTasksByProject,
    createSubtask,
    getSubtasks,
    updateSubtask,
    deleteSubtask,
    reorderSubtasks,
    addTimeToTask,
    addTaskWatcher,
    removeTaskWatcher,
    getTaskTreeView,
    getTasksByStatus,
    getProjectTasksDetails,
    getUserTasks,
    getTeamTaskStats,
    getTaskAuditLog,
    getAllTaskActivities
} from '../controllers/task.controller.js';

const TaskRouter = express.Router();

// Basic task operations
TaskRouter.post('/', auth, validateTaskCreation, validate, createTask);
TaskRouter.get('/', auth, validateTaskFilters, getAllTasks);

// User-specific tasks
TaskRouter.get('/assigned-to-me', auth, getUserTasks);

// Team-specific tasks
TaskRouter.get('/team-stats/:teamId', auth, getTeamTaskStats);

// Task activities (must be before /:taskId routes to avoid conflict)
TaskRouter.get('/activities', auth, getAllTaskActivities);

// Advanced task views
TaskRouter.get('/tree', auth, getTaskTreeView);
TaskRouter.get('/by-status', auth, getTasksByStatus);

// Routes with path parameters
TaskRouter.get('/:taskId', auth, getTaskDetails);
TaskRouter.put('/:taskId', auth, validateTaskUpdate, validate, updateTask);
TaskRouter.delete('/:taskId', auth, deleteTask);
TaskRouter.get('/:taskId/audit-log', auth, getTaskAuditLog);

// Project-specific task operations
TaskRouter.get('/project/:projectId', auth, getTasksByProject);
TaskRouter.get('/project/:projectId/details', auth, getProjectTasksDetails);

// Subtask operations
TaskRouter.get('/:taskId/subtasks', auth, getSubtasks);
TaskRouter.post('/:taskId/subtasks', auth, validateSubtaskCreation, validate, createSubtask);
TaskRouter.put('/:taskId/subtasks/:subtaskId', auth, validateTaskUpdate, validate, updateSubtask);
TaskRouter.delete('/:taskId/subtasks/:subtaskId', auth, deleteSubtask);
TaskRouter.put('/:taskId/subtasks-order', auth, validateSubtaskOrder, validate, reorderSubtasks);

// Time tracking
TaskRouter.post('/:taskId/time', auth, validateTimeTracking, validate, addTimeToTask);

// Task watchers
TaskRouter.post('/:taskId/watchers', auth, addTaskWatcher);
TaskRouter.delete('/:taskId/watchers', auth, removeTaskWatcher);

export default TaskRouter;