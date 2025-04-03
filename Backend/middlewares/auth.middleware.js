import jwt from 'jsonwebtoken';
import User from '../models/User.modal.js';

export const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            throw new Error('Authentication required');
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    error: 'Token expired',
                    refreshRequired: true
                });
            }
            throw error;
        }

        const user = await User.findOne({ 
            _id: decoded._id,
            'tokens.token': token 
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Update last active timestamp
        user.lastActive = new Date();
        await user.save();

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const oldToken = req.header('Authorization')?.replace('Bearer ', '');
        if (!oldToken) {
            return res.status(400).json({ error: 'Old token required' });
        }

        // Verify the token without checking expiration
        const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
        const user = await User.findOne({ _id: decoded._id }).select('+password');
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove the old token
        user.tokens = user.tokens.filter(tokenObj => tokenObj.token !== oldToken);
        
        // Generate new token
        const newToken = await user.generateAuthToken();
        
        res.json({ token: newToken, user: user.toJSON() });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const authRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Access denied. Required role: ' + roles.join(' or ') });
        }
        next();
    };
};

// Permission-based middleware
export const hasPermission = (permission) => {
    return (req, res, next) => {
        if (req.user.role === 'admin') {
            // Admin bypasses permission checks
            return next();
        }
        
        if (!req.user.permissions.includes(permission)) {
            return res.status(403).json({ 
                error: `Permission denied. Required permission: ${permission}` 
            });
        }
        next();
    };
};

// Project-specific permission checks
export const projectAuth = (requiredRole) => {
    return async (req, res, next) => {
        try {
            const projectId = req.params.projectId;
            const userId = req.user._id;
            
            // Find this user's role in the project
            const project = await req.app.get('Project').findOne({
                _id: projectId,
                'members.user': userId
            });
            
            if (!project) {
                return res.status(404).json({ error: 'Project not found or user not a member' });
            }
            
            const member = project.members.find(m => m.user.toString() === userId.toString());
            
            if (!member) {
                return res.status(403).json({ error: 'Not a member of this project' });
            }
            
            // Check if user's role meets the required role
            const roleHierarchy = ['viewer', 'member', 'editor', 'admin'];
            const userRoleIndex = roleHierarchy.indexOf(member.role);
            const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
            
            if (userRoleIndex < requiredRoleIndex && req.user.role !== 'admin') {
                return res.status(403).json({ 
                    error: `Insufficient project permissions. Required role: ${requiredRole}` 
                });
            }
            
            // Add project member info to request
            req.projectMember = member;
            next();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
};

// Team-specific permission checks
export const teamAuth = (requiredRole) => {
    return async (req, res, next) => {
        try {
            const teamId = req.params.teamId;
            const userId = req.user._id;
            
            // Find this user's role in the team
            const team = await req.app.get('Team').findOne({
                _id: teamId,
                'members.user': userId
            });
            
            if (!team) {
                return res.status(404).json({ error: 'Team not found or user not a member' });
            }
            
            const member = team.members.find(m => m.user.toString() === userId.toString());
            
            if (!member) {
                return res.status(403).json({ error: 'Not a member of this team' });
            }
            
            // Check if user's role meets the required role
            const roleHierarchy = ['viewer', 'member', 'admin'];
            const userRoleIndex = roleHierarchy.indexOf(member.role);
            const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
            
            if (userRoleIndex < requiredRoleIndex && req.user.role !== 'admin') {
                return res.status(403).json({ 
                    error: `Insufficient team permissions. Required role: ${requiredRole}` 
                });
            }
            
            // Add team member info to request
            req.teamMember = member;
            next();
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
};
