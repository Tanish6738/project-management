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

