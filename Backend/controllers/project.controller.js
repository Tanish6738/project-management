import Project from '../models/Project.modal.js';
import Team from '../models/Team.modal.js';
import User from '../models/User.modal.js';
import mongoose from 'mongoose';

export const createProject = async (req, res) => {
    try {
        const projectData = {
            ...req.body,
            owner: req.user._id,
            members: [{
                user: req.user._id,
                role: 'admin',
                permissions: {
                    canEditTasks: true,
                    canDeleteTasks: true,
                    canInviteMembers: true
                },
                addedBy: req.user._id
            }]
        };

        if (req.body.projectType === 'team') {
            const team = await Team.findById(req.body.team);
            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }
            
            const isMember = team.members.some(member => 
                member.user.equals(req.user._id) && 
                ['admin', 'member'].includes(member.role)
            );
            
            if (!isMember) {
                return res.status(403).json({ error: 'Not authorized to create team projects' });
            }
        }

        const project = new Project(projectData);
        await project.save();

        // Update user's projects array
        await req.user.updateOne({
            $push: { projects: project._id }
        });

        await project.populate('owner', 'name email');
        await project.populate('members.user', 'name email');
        res.status(201).json({
            _id: project._id,
            title: project.title,
            description: project.description,
            projectType: project.projectType,
            team: project.team,
            owner: project.owner._id,
            priority: project.priority,
            dueDate: project.dueDate,
            status: project.status,
            settings: project.settings,
            members: project.members.map(m => ({
                user: m.user._id,
                role: m.role,
                permissions: m.permissions,
                addedBy: m.addedBy,
                _id: m._id
            })),
            workflow: project.workflow,
            tags: project.tags,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [
                { owner: req.user._id },
                { 'members.user': req.user._id }
            ]
        })
        .populate('owner', 'name email')
        .populate('members.user', 'name email avatar');
        res.json(projects.map(project => ({
            _id: project._id,
            title: project.title,
            description: project.description,
            projectType: project.projectType,
            team: project.team,
            owner: project.owner ? {
                _id: project.owner._id,
                name: project.owner.name,
                email: project.owner.email
            } : null,
            priority: project.priority,
            dueDate: project.dueDate,
            status: project.status,
            members: project.members.map(m => ({
                user: m.user ? {
                    _id: m.user._id,
                    name: m.user.name,
                    email: m.user.email,
                    avatar: m.user.avatar || null
                } : null,
                role: m.role,
                permissions: m.permissions,
                addedBy: m.addedBy,
                _id: m._id
            })),
            tags: project.tags,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProjectDetails = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId)
            .populate('owner', 'name email')
            .populate('members.user', 'name email avatar')
            .populate('team', 'name');

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const isMember = project.members.some(member => 
            member.user._id.equals(req.user._id)
        );

        if (!isMember && !project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized to view this project' });
        }

        res.json({
            _id: project._id,
            title: project.title,
            description: project.description,
            projectType: project.projectType,
            team: project.team ? {
                _id: project.team._id,
                name: project.team.name
            } : null,
            owner: project.owner ? {
                _id: project.owner._id,
                name: project.owner.name,
                email: project.owner.email
            } : null,
            priority: project.priority,
            dueDate: project.dueDate,
            status: project.status,
            settings: project.settings,
            members: project.members.map(m => ({
                user: m.user ? {
                    _id: m.user._id,
                    name: m.user.name,
                    email: m.user.email,
                    avatar: m.user.avatar || null
                } : null,
                role: m.role,
                permissions: m.permissions,
                addedBy: m.addedBy,
                _id: m._id
            })),
            workflow: project.workflow,
            tags: project.tags,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateProject = async (req, res) => {
    try {
        const project = await Project.findOne({
            _id: req.params.projectId,
            $or: [
                { owner: req.user._id },
                { 
                    'members.user': req.user._id,
                    'members.role': 'admin'
                }
            ]
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found or unauthorized' });
        }

        const updates = Object.keys(req.body);
        updates.forEach(update => project[update] = req.body[update]);
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({
            _id: req.params.projectId,
            owner: req.user._id
        });

        if (!project) {
            return res.status(404).json({ error: 'Project not found or unauthorized' });
        }

        // Remove project reference from user's projects array
        await req.user.updateOne({
            $pull: { projects: project._id }
        });

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getProjectMembers = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId)
            .populate('members.user', 'name email avatar')
            .select('members');

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const isMember = project.members.some(member => 
            member.user._id.equals(req.user._id)
        );

        if (!isMember) {
            return res.status(403).json({ error: 'Not authorized to view members' });
        }

        res.json(project.members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addProjectMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const isAuthorized = project.owner.equals(req.user._id) || 
            project.members.some(member => 
                member.user.equals(req.user._id) && 
                member.role === 'admin' &&
                member.permissions.canInviteMembers
            );

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Not authorized to add members' });
        }

        // Verify user exists
        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (project.members.some(member => member.user.equals(req.body.userId))) {
            return res.status(400).json({ error: 'User is already a project member' });
        }

        project.members.push({
            user: req.body.userId,
            role: req.body.role || 'editor',
            permissions: {
                canEditTasks: true,
                canDeleteTasks: false,
                canInviteMembers: false
            },
            addedBy: req.user._id
        });

        await project.save();
        res.json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const removeProjectMember = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const isAuthorized = project.owner.equals(req.user._id) || 
            project.members.some(member => 
                member.user.equals(req.user._id) && 
                member.role === 'admin'
            );

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Not authorized to remove members' });
        }

        if (project.owner.equals(req.params.userId)) {
            return res.status(400).json({ error: 'Cannot remove project owner' });
        }

        project.members = project.members.filter(
            member => !member.user.equals(req.params.userId)
        );

        await project.save();
        res.json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateProjectMemberRole = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (!project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only project owner can update roles' });
        }

        const memberIndex = project.members.findIndex(
            member => member.user.equals(req.params.userId)
        );

        if (memberIndex === -1) {
            return res.status(404).json({ error: 'Project member not found' });
        }

        project.members[memberIndex].role = req.body.role;
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateProjectSettings = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Verify user has admin access
        if (!project.owner.equals(req.user._id) && 
            !project.members.some(m => 
                m.user.equals(req.user._id) && m.role === 'admin'
            )) {
            return res.status(403).json({ error: 'Not authorized to update settings' });
        }

        const allowedSettings = ['visibility', 'allowComments', 'allowGuestAccess', 'notifications'];
        const updates = Object.keys(req.body);

        // Validate settings
        const isValidUpdate = updates.every(update => allowedSettings.includes(update));
        if (!isValidUpdate) {
            return res.status(400).json({ error: 'Invalid settings update' });
        }

        // Update settings
        updates.forEach(update => {
            project.settings[update] = req.body[update];
        });

        await project.save();
        res.json({
            settings: project.settings,
            message: 'Project settings updated successfully'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateProjectWorkflow = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Verify user has admin access
        if (!project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only project owner can update workflow' });
        }

        const { workflow } = req.body;
        
        // Validate workflow
        if (!Array.isArray(workflow) || workflow.length === 0 || workflow.length > 10) {
            return res.status(400).json({ 
                error: 'Workflow must be an array with 1-10 stages' 
            });
        }

        project.workflow = workflow;
        await project.save();

        res.json({
            workflow: project.workflow,
            message: 'Project workflow updated successfully'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const manageProjectTags = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        const { action, tags } = req.body;

        if (!['add', 'remove'].includes(action)) {
            return res.status(400).json({ error: 'Invalid action' });
        }

        if (!Array.isArray(tags)) {
            return res.status(400).json({ error: 'Tags must be an array' });
        }

        if (action === 'add') {
            // Add new tags without duplicates
            const uniqueTags = [...new Set([...project.tags, ...tags])];
            project.tags = uniqueTags;
        } else {
            // Remove specified tags
            project.tags = project.tags.filter(tag => !tags.includes(tag));
        }

        await project.save();
        res.json({
            tags: project.tags,
            message: `Tags ${action}ed successfully`
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getProjectStats = async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const project = await Project.findById(projectId);
        
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        // Check user has access to this project
        const isMember = project.members.some(member => 
            member.user.equals(req.user._id)
        );

        if (!isMember && !project.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Not authorized to view project stats' });
        }

        // Get all tasks related to this project
        const Task = mongoose.model('Task');
        const tasks = await Task.find({ project: projectId });
        
        // Calculate stats
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'Done').length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        
        // Calculate days remaining if end date exists
        let daysRemaining = null;
        if (project.endDate) {
            const endDate = new Date(project.endDate);
            const today = new Date();
            const timeDiff = endDate - today;
            daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
            // If project is overdue, show negative days
            if (daysRemaining < 0) {
                daysRemaining = `${Math.abs(daysRemaining)} (overdue)`;
            }
        }

        // Count unique team members
        const teamMembers = new Set();
        project.members.forEach(member => {
            teamMembers.add(member.user.toString());
        });
        
        const totalTeamMembers = teamMembers.size;

        // Calculate task distribution by status
        const taskByStatus = {};
        tasks.forEach(task => {
            if (!taskByStatus[task.status]) {
                taskByStatus[task.status] = 0;
            }
            taskByStatus[task.status]++;
        });

        // Calculate task distribution by priority
        const taskByPriority = {};
        tasks.forEach(task => {
            if (!taskByPriority[task.priority]) {
                taskByPriority[task.priority] = 0;
            }
            taskByPriority[task.priority]++;
        });

        // Return stats
        res.json({
            totalTasks,
            completedTasks,
            completionRate,
            daysRemaining,
            totalTeamMembers,
            taskByStatus,
            taskByPriority
        });
    } catch (error) {
        console.error('Error getting project stats:', error);
        res.status(500).json({ error: error.message });
    }
};