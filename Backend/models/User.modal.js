import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
  // Basic Info
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't return password in queries by default
  },

  // Profile
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  bio: String,
  location: String,
  timezone: String,

  // Role & Permissions
  role: {
    type: String,
    enum: ['admin', 'manager', 'member', 'viewer'],
    default: 'member'
  },
  permissions: [{
    type: String,
    enum: ['create_project', 'delete_project', 'invite_users', 'manage_users', 'view_reports']
  }],
  
  // Projects & Teams
  projects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }],
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }],
  projectInvites: [{
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  }],
  teamInvites: [{
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team'
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    invitedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Notifications
  notifications: [{
    type: {
      type: String,
      enum: ['task_assigned', 'task_updated', 'task_completed', 'comment_added', 'project_created', 'team_update', 'mention', 'reminder', 'system'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    linkTo: String,
    read: {
      type: Boolean,
      default: false
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'notifications.entityType'
    },
    entityType: {
      type: String,
      enum: ['Task', 'Project', 'Team', 'Comment', 'User']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      taskAssigned: { type: Boolean, default: true },
      taskUpdated: { type: Boolean, default: true },
      taskCompleted: { type: Boolean, default: true },
      commentAdded: { type: Boolean, default: true },
      projectCreated: { type: Boolean, default: true },
      teamUpdates: { type: Boolean, default: true },
      dailyDigest: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true }
    },
    theme: { type: String, default: 'light' },
    language: { type: String, default: 'en' }
  },

  // Security
  isEmailVerified: { type: Boolean, default: false },
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastPasswordChange: Date,
  
  // Session Management
  tokens: [{
    token: {
      type: String,
      required: true
    },
    device: String,
    lastUsed: Date
  }],

  // Time Tracking
  timeZone: String,
  workingHours: {
    start: String,
    end: String
  },
  workHours: {
    monday: { 
      enabled: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    tuesday: { 
      enabled: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    wednesday: { 
      enabled: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    thursday: { 
      enabled: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    friday: { 
      enabled: { type: Boolean, default: true },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    saturday: { 
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    sunday: { 
      enabled: { type: Boolean, default: false },
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    }
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastActive: Date,
  
  // Audit
  loginHistory: [{
    timestamp: Date,
    ip: String,
    device: String
  }],

  // Task Management
  assignedTasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  
  watchingTasks: [{
    type: Schema.Types.ObjectId,
    ref: 'Task'
  }],
  
  taskStats: {
    completed: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    overdue: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for faster queries (removed duplicate email index)
UserSchema.index({ 'tokens.token': 1 });
UserSchema.index({ 'projectInvites.status': 1 });
UserSchema.index({ 'teamInvites.status': 1 });

// Pre-save middleware to hash password
UserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.lastPasswordChange = Date.now();
  }
  next();
});

// Instance methods
UserSchema.methods = {
  comparePassword: async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  },

  generateAuthToken: async function() {
    const token = jwt.sign(
      { _id: this._id.toString(), role: this.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    this.tokens.push({ token, device: 'web', lastUsed: new Date() });
    await this.save();
    return token;
  },

  toJSON: function() {
    const user = this.toObject();
    delete user.password;
    delete user.tokens;
    return user;
  },

  updateTaskStats: async function() {
    const Task = mongoose.model('Task');
    const now = new Date();
    
    const [completed, inProgress, overdue] = await Promise.all([
      Task.countDocuments({ assignedTo: this._id, status: 'completed' }),
      Task.countDocuments({ assignedTo: this._id, status: 'in-progress' }),
      Task.countDocuments({ 
        assignedTo: this._id, 
        status: { $ne: 'completed' },
        deadline: { $lt: now }
      })
    ]);
  
    this.taskStats = { completed, inProgress, overdue };
    await this.save();
  }
};

const User = mongoose.model('User', UserSchema);

export default User;