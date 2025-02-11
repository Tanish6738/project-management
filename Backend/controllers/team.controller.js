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
        
        // Update the user's teams array
        await User.findByIdAndUpdate(
            req.user._id,
            { $addToSet: { teams: team._id } },
            { new: true }
        );

        res.status(201).json(team);
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
        }).populate('owner', 'name email');
        res.json(teams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getTeamDetails = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId)
            .populate('owner', 'name email')
            .populate('members.user', 'name email')
            .populate('projects.project');
        
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(team);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTeam = async (req, res) => {
    try {
        const team = await Team.findOne({
            _id: req.params.teamId,
            owner: req.user._id
        });

        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        const updates = Object.keys(req.body);
        updates.forEach(update => team[update] = req.body[update]);
        await team.save();
        res.json(team);
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
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if user is owner or admin
        const isAuthorized = team.owner.equals(req.user._id) || 
            team.members.some(member => 
                member.user.equals(req.user._id) && member.role === 'admin'
            );

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Not authorized to add members' });
        }

        // Check if member already exists
        if (team.members.some(member => member.user.equals(req.body.userId))) {
            return res.status(400).json({ error: 'User is already a team member' });
        }

        team.members.push({
            user: req.body.userId,
            role: req.body.role || 'member',
            status: 'active',
            invitedBy: req.user._id
        });

        await team.save();
        res.json(team);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const removeTeamMember = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Check if user is owner or admin
        const isAuthorized = team.owner.equals(req.user._id) || 
            team.members.some(member => 
                member.user.equals(req.user._id) && member.role === 'admin'
            );

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Not authorized to remove members' });
        }

        team.members = team.members.filter(
            member => !member.user.equals(req.params.userId)
        );

        await team.save();
        res.json(team);
    } catch (error) {
        res.status (400).json({ error: error.message });
    }
};

export const getTeamMembers = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId)
            .populate('members.user', 'name email avatar')
            .select('members');
            
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(team.members);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateTeamMemberRole = async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }

        // Only owner can update roles
        if (!team.owner.equals(req.user._id)) {
            return res.status(403).json({ error: 'Only team owner can update roles' });
        }

        const memberIndex = team.members.findIndex(
            member => member.user.equals(req.params.userId)
        );

        if (memberIndex === -1) {
            return res.status(404).json({ error: 'Team member not found' });
        }

        team.members[memberIndex].role = req.body.role;
        await team.save();
        res.json(team);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};