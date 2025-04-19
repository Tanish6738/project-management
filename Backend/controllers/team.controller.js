import Team from '../models/Team.modal.js';
import User from '../models/User.modal.js';

export const createTeam = async (req, res) => {
    try {
        const team = new Team({
            ...req.body,
            owner: req.user._id,
            members: [{ 
                user: req.user._id, 
                role: 'admin',
                status: 'active',
                permissions: {
                    canAddProjects: true,
                    canRemoveProjects: true,
                    canViewAllProjects: true
                }
            }]
        });
        await team.save();
        await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { teams: team._id } },
            { new: true }
        );
        // Populate owner and members for response
        await team.populate('owner', 'name email');
        await team.populate('members.user', 'name email');
        res.status(201).json({
            _id: team._id,
            name: team.name,
            description: team.description,
            teamType: team.teamType,
            owner: team.owner._id,
            maxMembers: team.maxMembers,
            members: team.members.map(m => ({
                user: m.user._id,
                role: m.role,
                status: m.status,
                permissions: m.permissions,
                invitedBy: m.invitedBy,
                _id: m._id
            })),
            isActive: team.isActive,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find({
            $or: [
                { owner: req.user._id },
                { 'members.user': req.user._id }
            ]
        })
        .populate('owner', 'name email')
        .populate('members.user', 'name email avatar');
        res.json(teams.map(team => ({
            _id: team._id,
            name: team.name,
            description: team.description,
            teamType: team.teamType,
            owner: team.owner ? {
                _id: team.owner._id,
                name: team.owner.name,
                email: team.owner.email
            } : null,
            maxMembers: team.maxMembers,
            members: team.members.map(m => ({
                user: m.user ? {
                    _id: m.user._id,
                    name: m.user.name,
                    email: m.user.email,
                    avatar: m.user.avatar || null
                } : null,
                role: m.role,
                status: m.status,
                permissions: m.permissions,
                invitedBy: m.invitedBy,
                _id: m._id
            })),
            isActive: team.isActive,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTeamDetails = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId)
            .populate('owner', 'name email')
            .populate('members.user', 'name email email avatar')
            .populate('projects.project', 'title');
        
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json({
            _id: team._id,
            name: team.name,
            description: team.description,
            teamType: team.teamType,
            owner: team.owner ? {
                _id: team.owner._id,
                name: team.owner.name,
                email: team.owner.email
            } : null,
            maxMembers: team.maxMembers,
            members: team.members.map(m => ({
                user: m.user ? {
                    _id: m.user._id,
                    name: m.user.name,
                    email: m.user.email,
                    avatar: m.user.avatar || null
                } : null,
                role: m.role,
                status: m.status,
                permissions: m.permissions,
                invitedBy: m.invitedBy,
                _id: m._id
            })),
            projects: team.projects.map(p => p.project ? {
                _id: p.project._id,
                title: p.project.title
            } : null),
            isActive: team.isActive,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTeam = async (req, res) => {
    try {
        const team = await Team.findOne({
            _id: req.params.teamId,
            owner: req.user._id
        })
        .populate('owner', 'name email')
        .populate('members.user', 'name email avatar');

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const updates = Object.keys(req.body);
        updates.forEach(update => team[update] = req.body[update]);
        await team.save();
        res.json({
            _id: team._id,
            name: team.name,
            description: team.description,
            teamType: team.teamType,
            owner: team.owner._id,
            maxMembers: team.maxMembers,
            members: team.members.map(m => ({
                user: m.user._id,
                role: m.role,
                status: m.status,
                permissions: m.permissions,
                invitedBy: m.invitedBy,
                _id: m._id
            })),
            isActive: team.isActive,
            createdAt: team.createdAt,
            updatedAt: team.updatedAt
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findOneAndDelete({
            _id: req.params.teamId,
            owner: req.user._id
        });

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json({ message: 'Team deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addTeamMember = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId)
            .populate('owner', 'name email')
            .populate('members.user', 'name email email avatar');
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if user is owner or admin
        const isAuthorized = team.owner._id.equals(req.user._id) || 
            team.members.some(member => 
                member.user._id.equals(req.user._id) && member.role === 'admin'
            );

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Not authorized to add members' });
        }

        // Check if member already exists
        if (team.members.some(member => member.user._id.equals(req.body.userId))) {
            return res.status(400).json({ error: 'User is already a team member' });
        }

        team.members.push({
            user: req.body.userId,
            role: req.body.role || 'member',
            status: 'active',
            permissions: req.body.permissions || {
                canAddProjects: true,
                canRemoveProjects: false,
                canViewAllProjects: true
            },
            invitedBy: req.user._id
        });

        await team.save();
        await team.populate('members.user', 'name email avatar');
        res.json({
            _id: team._id,
            name: team.name,
            description: team.description,
            teamType: team.teamType,
            owner: team.owner._id,
            maxMembers: team.maxMembers,
            members: team.members.map(m => ({
                user: m.user._id,
                role: m.role,
                status: m.status,
                permissions: m.permissions,
                invitedBy: m.invitedBy,
                _id: m._id
            })),
            isActive: team.isActive,
            updatedAt: team.updatedAt
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const removeTeamMember = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId)
            .populate('owner', 'name email')
            .populate('members.user', 'name email avatar');
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if user is owner or admin
        const isAuthorized = team.owner._id.equals(req.user._id) || 
            team.members.some(member => 
                member.user._id.equals(req.user._id) && member.role === 'admin'
            );

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Not authorized to remove members' });
        }

        team.members = team.members.filter(
            member => !member.user._id.equals(req.params.userId)
        );

        await team.save();
        await team.populate('members.user', 'name email avatar');
        res.json({
            _id: team._id,
            name: team.name,
            members: team.members.map(m => ({
                user: m.user._id,
                role: m.role,
                status: m.status,
                permissions: m.permissions,
                invitedBy: m.invitedBy,
                _id: m._id
            })),
            isActive: team.isActive,
            updatedAt: team.updatedAt
        });
    } catch (error) {
        res.status (400).json({ error: error.message });
    }
};

export const getTeamMembers = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId)
            .populate('members.user', 'name email avatar');
            
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(team.members.map(m => ({
            user: m.user ? {
                _id: m.user._id,
                name: m.user.name,
                email: m.user.email,
                avatar: m.user.avatar || null
            } : null,
            role: m.role,
            status: m.status,
            permissions: m.permissions,
            invitedBy: m.invitedBy,
            _id: m._id
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTeamMemberRole = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId)
            .populate('owner', 'name email')
            .populate('members.user', 'name email avatar');
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Only owner can update roles
        if (!team.owner._id.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only team owner can update roles' });
        }

        const memberIndex = team.members.findIndex(
            member => member.user._id.equals(req.params.userId)
        );

        if (memberIndex === -1) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        team.members[memberIndex].role = req.body.role;
        await team.save();
        await team.populate('members.user', 'name email avatar');
        res.json({
            _id: team._id,
            name: team.name,
            description: team.description,
            teamType: team.teamType,
            owner: team.owner._id,
            maxMembers: team.maxMembers,
            members: team.members.map(m => ({
                user: m.user._id,
                role: m.role,
                status: m.status,
                permissions: m.permissions,
                invitedBy: m.invitedBy,
                _id: m._id
            })),
            isActive: team.isActive,
            updatedAt: team.updatedAt
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateTeamTaskStats = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        await team.updateTaskStats();

        res.json({
            taskStats: team.taskStats,
            message: 'Team task statistics updated successfully'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const addProjectToTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if user has permission to add projects
        const member = team.members.find(m => m.user.equals(req.user._id));
        if (!member?.permissions.canAddProjects) {
            return res.status(403).json({ error: 'Not authorized to add projects' });
        }

        // Check if project exists and isn't already in team
        const project = await Project.findById(req.body.projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        if (team.projects.some(p => p.project.equals(req.body.projectId))) {
            return res.status(400).json({ error: 'Project already in team' });
        }

        team.projects.push({
            project: req.body.projectId,
            addedBy: req.user._id
        });

        await team.save();
        res.json({ 
            message: 'Project added to team successfully',
            team: await team.populate('projects.project')
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const getTeamPermissions = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if user has access to this team
        const isMember = team.owner.equals(req.user._id) || 
            team.members.some(member => member.user.equals(req.user._id));
        
        if (!isMember) {
            return res.status(403).json({ error: 'Not authorized to access this team' });
        }

        // Return default team permissions structure
        const teamPermissions = {
            memberInvites: {
                adminOnly: true,
                allowMembers: false
            },
            projectManagement: {
                adminOnly: true,
                allowMembers: false
            },
            memberRemoval: {
                adminOnly: true,
                allowMembers: false
            },
            viewStats: {
                adminOnly: false,
                allowMembers: true,
                allowViewers: true
            }
        };

        res.json(teamPermissions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTeamPermissions = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Only owner can update team permissions
        if (!team.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only team owner can update permissions' });
        }

        // In a real implementation, you might store these in the team document
        // For now, we'll just return the updated permissions
        res.json(req.body);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};