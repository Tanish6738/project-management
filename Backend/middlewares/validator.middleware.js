import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// User Validation
export const validateRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
];

export const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateProfileUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters long'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('bio')
    .optional()
    .trim(),
  body('location')
    .optional()
    .trim(),
];

export const validateUserPreferences = [
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be boolean'),
  body('notifications.push')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be boolean'),
  body('theme')
    .optional()
    .isIn(['light', 'dark', 'system'])
    .withMessage('Invalid theme option'),
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Invalid language code'),
];

export const validateTimeSettings = [
  body('timeZone')
    .optional()
    .isString()
    .withMessage('Time zone must be a string'),
  body('workingHours.start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in format HH:MM'),
  body('workingHours.end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in format HH:MM'),
];

// Team Validation
export const validateTeamCreation = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Team name must be between 2 and 50 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('teamType')
        .optional()
        .isIn(['department', 'project', 'custom'])
        .withMessage('Invalid team type'),
    body('maxMembers')
        .optional()
        .isInt({ min: 2, max: 100 })
        .withMessage('Maximum members must be between 2 and 100')
];

export const validateTeamUpdate = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Team name must be between 2 and 50 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean value')
];

export const validateTeamMemberAddition = [
    body('userId')
        .notEmpty()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('Invalid user ID format'),
    body('role')
        .optional()
        .isIn(['admin', 'member', 'viewer'])
        .withMessage('Invalid role specified'),
    body('permissions')
        .optional()
        .isObject()
        .withMessage('Permissions must be an object')
];

export const validateTeamMemberRoleUpdate = [
    body('role')
        .isIn(['admin', 'member', 'viewer'])
        .withMessage('Invalid role specified')
];

export const validateTeamStats = [
    body('completedTasks')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Completed tasks must be a positive integer'),
    body('pendingTasks')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Pending tasks must be a positive integer')
];

// Project Validation
export const validateProjectCreation = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Project title must be between 3 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('projectType')
        .isIn(['personal', 'team'])
        .withMessage('Invalid project type'),
    body('team')
        .optional()
        .isMongoId()
        .withMessage('Invalid team ID format')
        .custom((value, { req }) => {
            if (req.body.projectType === 'team' && !value) {
                throw new Error('Team ID is required for team projects');
            }
            return true;
        }),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority level'),
    body('dueDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid due date format'),
    body('settings')
        .optional()
        .isObject()
        .withMessage('Settings must be an object')
];

export const validateProjectUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('Project title must be between 3 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description cannot exceed 500 characters'),
    body('status')
        .optional()
        .isIn(['active', 'archived', 'completed'])
        .withMessage('Invalid status'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority level')
];

export const validateProjectMemberAddition = [
    body('userId')
        .notEmpty()
        .withMessage('User ID is required')
        .isMongoId()
        .withMessage('Invalid user ID format'),
    body('role')
        .optional()
        .isIn(['admin', 'editor', 'viewer', 'member'])
        .withMessage('Invalid role specified'),
    body('permissions')
        .optional()
        .isObject()
        .withMessage('Permissions must be an object')
];

export const validateProjectMemberRoleUpdate = [
    body('role')
        .isIn(['admin', 'editor', 'viewer', 'member'])
        .withMessage('Invalid role specified')
];

export const validateProjectSettings = [
    body('visibility')
        .optional()
        .isIn(['public', 'private', 'team'])
        .withMessage('Invalid visibility option'),
    body('allowComments')
        .optional()
        .isBoolean()
        .withMessage('allowComments must be a boolean'),
    body('allowGuestAccess')
        .optional()
        .isBoolean()
        .withMessage('allowGuestAccess must be a boolean'),
    body('notifications.enabled')
        .optional()
        .isBoolean()
        .withMessage('notifications.enabled must be a boolean'),
    body('notifications.frequency')
        .optional()
        .isIn(['instant', 'daily', 'weekly'])
        .withMessage('Invalid notification frequency')
];

export const validateProjectWorkflow = [
    body('workflow')
        .isArray({ min: 1, max: 10 })
        .withMessage('Workflow must have between 1 and 10 stages'),
    body('workflow.*')
        .isString()
        .withMessage('Workflow stages must be strings')
        .isLength({ min: 1, max: 30 })
        .withMessage('Workflow stage names must be between 1 and 30 characters')
];

export const validateProjectTags = [
    body('action')
        .isIn(['add', 'remove'])
        .withMessage('Action must be either "add" or "remove"'),
    body('tags')
        .isArray({ min: 1 })
        .withMessage('Tags must be a non-empty array'),
    body('tags.*')
        .isString()
        .withMessage('Tags must be strings')
        .isLength({ min: 1, max: 20 })
        .withMessage('Tags must be between 1 and 20 characters')
];

// Task Validation
export const validateTaskCreation = [
    body('project')
        .notEmpty()
        .withMessage('Project ID is required')
        .isMongoId()
        .withMessage('Invalid project ID format'),
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    body('assignedTo')
        .optional()
        .isMongoId()
        .withMessage('Invalid user ID format'),
    body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed'])
        .withMessage('Invalid status'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Invalid priority'),
    body('deadline')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format')
        .custom(value => {
            if (new Date(value) <= new Date()) {
                throw new Error('Deadline must be in the future');
            }
            return true;
        }),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('isPublic')
        .optional()
        .isBoolean()
        .withMessage('isPublic must be a boolean')
];

export const validateTaskUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    body('assignedTo')
        .optional()
        .isMongoId()
        .withMessage('Invalid user ID format'),
    body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed'])
        .withMessage('Invalid status'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Invalid priority'),
    body('deadline')
        .optional()
        .isISO8601()
        .withMessage('Invalid date format')
];

export const validateSubtaskCreation = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    body('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    body('assignedTo')
        .optional()
        .isMongoId()
        .withMessage('Invalid user ID format'),
    body('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed'])
        .withMessage('Invalid status'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Invalid priority')
];

export const validateSubtaskOrder = [
    body('order')
        .isArray()
        .withMessage('Order must be an array')
        .custom((value) => {
            if (!value.every(id => mongoose.Types.ObjectId.isValid(id))) {
                throw new Error('Invalid subtask IDs in order array');
            }
            return true;
        })
];

export const validateTimeTracking = [
    body('duration')
        .isInt({ min: 1 })
        .withMessage('Duration must be a positive integer in minutes')
];

// Query parameter validation
export const validateTaskFilters = [
    query('project')
        .optional()
        .isMongoId()
        .withMessage('Invalid project ID format'),
    query('status')
        .optional()
        .isIn(['pending', 'in-progress', 'completed'])
        .withMessage('Invalid status'),
    query('priority')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Invalid priority'),
    query('assignedTo')
        .optional()
        .custom(value => {
            if (value === 'me' || mongoose.Types.ObjectId.isValid(value)) {
                return true;
            }
            throw new Error('assignedTo must be either "me" or a valid user ID');
        })
];

// General validation result handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      status: 'error',
      errors: errors.array() 
    });
  }
  next();
};

// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({ 
      status: 'error',
      message: 'Validation error',
      errors 
    });
  }
  
  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    return res.status(400).json({ 
      status: 'error',
      message: `Invalid ${err.path}: ${err.value}` 
    });
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ 
      status: 'error',
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
    });
  }
  
  // JWT error
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      status: 'error',
      message: 'Invalid token' 
    });
  }
  
  // Token expired error
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      status: 'error',
      message: 'Token expired',
      refreshRequired: true 
    });
  }
  
  // Default error
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal server error'
  });
};
