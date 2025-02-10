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
    getAllUsers
} from '../controllers/user.controller.js';

const UserRouter = express.Router();

// Auth routes
UserRouter.post('/auth/register', validateRegistration, validate, register);
UserRouter.post('/auth/login', validateLogin, validate, login);
UserRouter.post('/auth/logout', auth, logout);

// User routes
UserRouter.get('/me', auth, getProfile);
UserRouter.put('/me', auth, validateProfileUpdate, validate, updateProfile);
UserRouter.delete('/me', auth, deleteUser);
UserRouter.get('/', auth, authRole(['admin']), getAllUsers);

export default UserRouter;
