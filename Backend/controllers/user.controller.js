import User from "../models/User.modal.js";

// Auth Controller Functions
export const register = async (req, res) => {
    try {
        // Validation is already done by middleware
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Invalid login credentials' });
        }
        const token = await user.generateAuthToken();
        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);
        await req.user.save();
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        // Token validation is already done in auth middleware
        const oldToken = req.header('Authorization')?.replace('Bearer ', '');
        if (!oldToken) {
            return res.status(400).json({ error: 'Old token required' });
        }

        // Verify the token without checking expiration
        const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
        const user = await User.findById(decoded._id);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Remove the old token
        user.tokens = user.tokens.filter(tokenObj => tokenObj.token !== oldToken);
        
        // Generate new token
        const token = await user.generateAuthToken();
        
        res.json({ token, user });
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// User Controller Functions
export const getProfile = async (req, res) => {
    res.json(req.user);
};

export const updateProfile = async (req, res) => {
    try {
        // Validation is already done by middleware
        const updates = Object.keys(req.body);
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.json(req.user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        await req.user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePreferences = async (req, res) => {
    try {
        const allowedPreferences = ['notifications', 'theme', 'language'];
        const updates = Object.keys(req.body);
        
        // Validate update fields
        const isValidOperation = updates.every(update => 
            allowedPreferences.includes(update)
        );

        if (!isValidOperation) {
            return res.status(400).json({ 
                error: 'Invalid preferences update' 
            });
        }

        // Update each preference
        updates.forEach(update => {
            req.user.preferences[update] = req.body[update];
        });

        await req.user.save();
        res.json({ 
            preferences: req.user.preferences,
            message: 'Preferences updated successfully' 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const manageInvites = async (req, res) => {
    try {
        const { inviteId, action, type } = req.body;

        if (!['accept', 'reject'].includes(action)) {
            return res.status(400).json({ 
                error: 'Invalid action. Must be accept or reject' 
            });
        }

        if (!['project', 'team'].includes(type)) {
            return res.status(400).json({ 
                error: 'Invalid invite type. Must be project or team' 
            });
        }

        const inviteArrayName = `${type}Invites`;
        const invite = req.user[inviteArrayName].id(inviteId);

        if (!invite) {
            return res.status(404).json({ 
                error: 'Invite not found' 
            });
        }

        invite.status = action === 'accept' ? 'accepted' : 'rejected';
        await req.user.save();

        // If accepted, update corresponding project/team
        if (action === 'accept') {
            const Model = mongoose.model(type.charAt(0).toUpperCase() + type.slice(1));
            await Model.findByIdAndUpdate(
                invite[type],
                { 
                    $push: { 
                        members: {
                            user: req.user._id,
                            role: 'member',
                            addedBy: invite.invitedBy
                        }
                    }
                }
            );
        }

        res.json({ 
            message: `Invite ${action}ed successfully`,
            updatedInvite: invite 
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateTimeSettings = async (req, res) => {
    try {
        const { timeZone, workingHours } = req.body;

        // Validate time zone
        if (timeZone && !Intl.DateTimeFormat().resolvedOptions().timeZones.includes(timeZone)) {
            return res.status(400).json({ 
                error: 'Invalid timezone' 
            });
        }

        // Validate working hours format (HH:mm)
        if (workingHours) {
            const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
            if (!timeFormat.test(workingHours.start) || !timeFormat.test(workingHours.end)) {
                return res.status(400).json({ 
                    error: 'Invalid time format. Use HH:mm format' 
                });
            }
        }

        // Update time settings
        if (timeZone) req.user.timeZone = timeZone;
        if (workingHours) req.user.workingHours = workingHours;

        await req.user.save();
        res.json({
            timeSettings: {
                timeZone: req.user.timeZone,
                workingHours: req.user.workingHours
            },
            message: 'Time settings updated successfully'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

