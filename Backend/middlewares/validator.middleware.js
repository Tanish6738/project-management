import { body, validationResult } from 'express-validator';

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
        .withMessage('Invalid team type')
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
        .withMessage('User ID is required'),
    body('role')
        .optional()
        .isIn(['admin', 'member', 'viewer'])
        .withMessage('Invalid role specified')
];

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
        .withMessage('Invalid due date format')
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

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
