import express from 'express';
import { auth, authRole } from '../middlewares/auth.middleware.js';
import {
    validateRegistration,
    validateLogin,
    validateProfileUpdate,
    validate
} from '../middlewares/validator.middleware.js';
import {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    deleteUser,
    getAllUsers,
    updatePreferences,
    manageInvites,
    updateTimeSettings,
    refreshToken,
    getNotificationSettings,
    updateNotificationSettings,
    getWorkHours,
    setWorkHours
} from '../controllers/user.controller.js';

const UserRouter = express.Router();

// Auth routes
UserRouter.post('/register', validateRegistration, validate, register);
UserRouter.post('/login', validateLogin, validate, login);
UserRouter.post('/logout', auth, logout);
UserRouter.post('/refresh-token', refreshToken);

// User profile routes
UserRouter.get('/me', auth, getProfile);
UserRouter.put('/me', auth, validateProfileUpdate, validate, updateProfile);
UserRouter.delete('/me', auth, deleteUser);

// User preferences and settings
UserRouter.put('/preferences', auth, updatePreferences);
UserRouter.put('/time-settings', auth, updateTimeSettings);

// Notification settings routes
UserRouter.get('/notifications/settings', auth, getNotificationSettings);
UserRouter.put('/notifications/settings', auth, updateNotificationSettings);

// Work hours routes
UserRouter.get('/work-hours', auth, getWorkHours);
UserRouter.post('/work-hours', auth, setWorkHours);

// Invite management
UserRouter.post('/invites', auth, manageInvites);

// Admin routes
UserRouter.get('/', auth, authRole(['admin']), getAllUsers);

export default UserRouter;
