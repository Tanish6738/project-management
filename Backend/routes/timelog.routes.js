import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import {
    createTimeLog,
    getTaskTimeLogs,
    getUserTimeLogs,
    updateTimeLog,
    deleteTimeLog,
    getProjectTimeReport
} from '../controllers/timelog.controller.js';

const TimeLogRouter = express.Router();

// Task time log routes
TimeLogRouter.post('/task/:taskId', auth, createTimeLog);
TimeLogRouter.get('/task/:taskId', auth, getTaskTimeLogs);

// User time log routes
TimeLogRouter.get('/user', auth, getUserTimeLogs);

// Project time reports
TimeLogRouter.get('/project/:projectId/report', auth, getProjectTimeReport);

// Individual time log operations
TimeLogRouter.put('/:timeLogId', auth, updateTimeLog);
TimeLogRouter.delete('/:timeLogId', auth, deleteTimeLog);

export default TimeLogRouter;