import User from "../models/User.modal.js";

// Auth Controller Functions
export const register = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        // Format user response as in Postman contract
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.tokens;
        res.status(201).json({
            user: {
                _id: userObj._id,
                name: userObj.name,
                email: userObj.email,
                role: userObj.role || 'user',
                createdAt: userObj.createdAt,
                updatedAt: userObj.updatedAt
            },
            token
        });
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
        const userObj = user.toObject();
        delete userObj.password;
        delete userObj.tokens;
        res.json({
            user: {
                _id: userObj._id,
                name: userObj.name,
                email: userObj.email,
                role: userObj.role || 'user',
                createdAt: userObj.createdAt,
                updatedAt: userObj.updatedAt
            },
            token
        });
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
    // Format profile as in Postman contract
    const userObj = req.user.toObject();
    delete userObj.password;
    delete userObj.tokens;
    res.json({
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        role: userObj.role || 'user',
        createdAt: userObj.createdAt,
        updatedAt: userObj.updatedAt,
        preferences: userObj.preferences
    });
};

export const updateProfile = async (req, res) => {
    try {
        // Validation is already done by middleware
        const updates = Object.keys(req.body);
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        // Format response as in Postman contract
        const userObj = req.user.toObject();
        delete userObj.password;
        delete userObj.tokens;
        res.json({
            _id: userObj._id,
            name: userObj.name,
            email: userObj.email,
            bio: userObj.bio,
            location: userObj.location,
            role: userObj.role || 'user',
            createdAt: userObj.createdAt,
            updatedAt: userObj.updatedAt
        });
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
        res.status500.json({ error: error.message });
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

// New functions for notification settings
export const getNotificationSettings = async (req, res) => {
    try {
        // Check if the user has notification settings defined
        if (!req.user.preferences || !req.user.preferences.notifications) {
            return res.json({
                taskAssigned: true,
                taskUpdated: true,
                taskCompleted: true,
                commentAdded: true,
                projectCreated: true,
                teamUpdates: true,
                dailyDigest: true,
                weeklyDigest: true
            });
        }

        // Return the notification settings from user preferences
        // If certain settings don't exist, provide defaults
        const { notifications } = req.user.preferences;
        
        res.json({
            taskAssigned: notifications.taskAssigned !== undefined ? notifications.taskAssigned : true,
            taskUpdated: notifications.taskUpdated !== undefined ? notifications.taskUpdated : true,
            taskCompleted: notifications.taskCompleted !== undefined ? notifications.taskCompleted : true,
            commentAdded: notifications.commentAdded !== undefined ? notifications.commentAdded : true,
            projectCreated: notifications.projectCreated !== undefined ? notifications.projectCreated : true,
            teamUpdates: notifications.teamUpdates !== undefined ? notifications.teamUpdates : true,
            dailyDigest: notifications.dailyDigest !== undefined ? notifications.dailyDigest : true,
            weeklyDigest: notifications.weeklyDigest !== undefined ? notifications.weeklyDigest : true
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateNotificationSettings = async (req, res) => {
    try {
        // Update notification settings in user preferences
        if (!req.user.preferences) {
            req.user.preferences = {};
        }
        
        if (!req.user.preferences.notifications) {
            req.user.preferences.notifications = {};
        }
        
        // Update each notification setting
        const allowedSettings = [
            'taskAssigned', 'taskUpdated', 'taskCompleted', 'commentAdded',
            'projectCreated', 'teamUpdates', 'dailyDigest', 'weeklyDigest'
        ];
        
        allowedSettings.forEach(setting => {
            if (req.body[setting] !== undefined) {
                req.user.preferences.notifications[setting] = req.body[setting];
            }
        });
        
        await req.user.save();
        
        res.json({
            message: 'Notification settings updated successfully',
            settings: req.user.preferences.notifications
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// New functions for work hours
export const getWorkHours = async (req, res) => {
    try {
        // Check if the user has work hours defined
        if (!req.user.workHours) {
            // Return default work hours if none are set
            return res.json({
                monday: { enabled: true, start: '09:00', end: '17:00' },
                tuesday: { enabled: true, start: '09:00', end: '17:00' },
                wednesday: { enabled: true, start: '09:00', end: '17:00' },
                thursday: { enabled: true, start: '09:00', end: '17:00' },
                friday: { enabled: true, start: '09:00', end: '17:00' },
                saturday: { enabled: false, start: '09:00', end: '17:00' },
                sunday: { enabled: false, start: '09:00', end: '17:00' }
            });
        }
        
        res.json(req.user.workHours);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const setWorkHours = async (req, res) => {
    try {
        // Validate work hours format
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const timeFormat = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        
        const workHours = req.body;
        
        // Validate each day's work hours
        for (const day of days) {
            if (!workHours[day]) {
                return res.status(400).json({ error: `Missing work hours for ${day}` });
            }
            
            const { enabled, start, end } = workHours[day];
            
            if (typeof enabled !== 'boolean') {
                return res.status(400).json({ error: `Invalid enabled value for ${day}` });
            }
            
            if (enabled) {
                if (!timeFormat.test(start) || !timeFormat.test(end)) {
                    return res.status(400).json({ error: `Invalid time format for ${day}. Use HH:MM format` });
                }
            }
        }
        
        // Update user's work hours
        req.user.workHours = workHours;
        await req.user.save();
        
        res.json({
            message: 'Work hours updated successfully',
            workHours: req.user.workHours
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const { query } = req.query;
        
        if (!query || query.trim() === '') {
            return res.status(400).json({ error: 'Search query is required' });
        }
        
        // Search users by name or email
        const users = await User.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).select('name email avatar');
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Notifications controller functions
export const getNotifications = async (req, res) => {
    try {
        // Check if the user has notifications field
        if (!req.user.notifications) {
            req.user.notifications = [];
        }

        // Sort notifications by date (newest first)
        const sortedNotifications = [...req.user.notifications].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        res.json({
            notifications: sortedNotifications,
            unreadCount: sortedNotifications.filter(n => !n.read).length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        
        const notification = req.user.notifications.id(notificationId);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        notification.read = true;
        await req.user.save();
        
        res.json({
            message: 'Notification marked as read',
            notification
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const markAllNotificationsRead = async (req, res) => {
    try {
        if (req.user.notifications && req.user.notifications.length > 0) {
            req.user.notifications.forEach(notification => {
                notification.read = true;
            });
            
            await req.user.save();
        }
        
        res.json({
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

