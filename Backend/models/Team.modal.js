import mongoose from 'mongoose';
const { Schema } = mongoose;

// Optional: A sub-schema for team members, including a role field.
const TeamMemberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'member', 'viewer'],
    default: 'member',
  },
  permissions: {
    canAddProjects: {
      type: Boolean,
      default: false
    },
    canRemoveProjects: {
      type: Boolean,
      default: false
    },
    canViewAllProjects: {
      type: Boolean,
      default: true
    }
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'rejected'],
    default: 'pending'
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  invitedAt: {
    type: Date,
    default: Date.now
  }
});

const TeamSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Array of team members with specific roles
    members: [TeamMemberSchema],
    // Projects associated with this team
    projects: [
      {
        project: {
          type: Schema.Types.ObjectId,
          ref: 'Project'
        },
        addedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        addedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    teamType: {
      type: String,
      enum: ['department', 'project', 'custom'],
      default: 'custom'
    },
    maxMembers: {
      type: Number,
      default: 50
    },
    isActive: {
      type: Boolean,
      default: true
    },
    taskStats: {
      total: { type: Number, default: 0 },
      completed: { type: Number, default: 0 },
      inProgress: { type: Number, default: 0 },
      overdue: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

// Add indexes for better query performance
TeamSchema.index({ name: 1 });
TeamSchema.index({ 'members.user': 1 });
TeamSchema.index({ 'projects.project': 1 });

// Add validation for maximum team members
TeamSchema.pre('save', function(next) {
  if (this.members.length > this.maxMembers) {
    next(new Error(`Team cannot have more than ${this.maxMembers} members`));
  }
  next();
});

// Add post-save hook
TeamSchema.post('save', async function(doc) {
    try {
        const User = mongoose.model('User');
        // Update team members' teams array
        await User.updateMany(
            { _id: { $in: doc.members.map(member => member.user) } },
            { $addToSet: { teams: doc._id } }
        );
    } catch (error) {
        console.error('Error updating user teams:', error);
    }
});

// Add pre-remove hook to clean up user references when team is deleted
TeamSchema.pre('remove', async function(next) {
    try {
        const User = mongoose.model('User');
        await User.updateMany(
            { teams: this._id },
            { $pull: { teams: this._id } }
        );
        next();
    } catch (error) {
        next(error);
    }
});

// Add method to update team task stats
TeamSchema.methods.updateTaskStats = async function() {
  const Project = mongoose.model('Project');
  const Task = mongoose.model('Task');
  
  const teamProjects = await Project.find({ team: this._id });
  const projectIds = teamProjects.map(p => p._id);
  
  const now = new Date();
  
  const [total, completed, inProgress, overdue] = await Promise.all([
    Task.countDocuments({ project: { $in: projectIds } }),
    Task.countDocuments({ project: { $in: projectIds }, status: 'completed' }),
    Task.countDocuments({ project: { $in: projectIds }, status: 'in-progress' }),
    Task.countDocuments({ 
      project: { $in: projectIds }, 
      status: { $ne: 'completed' },
      deadline: { $lt: now }
    })
  ]);

  this.taskStats = { total, completed, inProgress, overdue };
  await this.save();
};

// Create and export the model instead of just the schema
const Team = mongoose.model('Team', TeamSchema);
export default Team;
