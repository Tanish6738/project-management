import mongoose from 'mongoose';
const { Schema } = mongoose;

// Project Member Schema with role and permissions
const ProjectMemberSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'viewer'],
    default: 'editor'
  },
  permissions: {
    canEditTasks: {
      type: Boolean,
      default: true
    },
    canDeleteTasks: {
      type: Boolean,
      default: false
    },
    canInviteMembers: {
      type: Boolean,
      default: false
    }
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const ProjectSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, 'Project title must be at least 3 characters'],
      maxlength: [100, 'Project title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    projectType: {
      type: String,
      enum: ['personal', 'team'],
      required: true
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: function() {
        return this.projectType === 'team';
      }
    },
    members: [ProjectMemberSchema],
    workflow: {
      type: [String],
      default: ['To Do', 'In Progress', 'Review', 'Completed'],
      validate: {
        validator: function(array) {
          return array.length > 0 && array.length <= 10;
        },
        message: 'Workflow must have between 1 and 10 stages'
      }
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'completed'],
      default: 'active'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    dueDate: {
      type: Date
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    settings: {
      visibility: {
        type: String,
        enum: ['public', 'private', 'team'],
        default: 'private'
      },
      allowComments: {
        type: Boolean,
        default: true
      },
      allowGuestAccess: {
        type: Boolean,
        default: false
      },
      notifications: {
        enabled: {
          type: Boolean,
          default: true
        },
        frequency: {
          type: String,
          enum: ['instant', 'daily', 'weekly'],
          default: 'instant'
        }
      }
    },
    tags: [{
      type: String,
      trim: true
    }],
    category: {
      type: String,
      trim: true
    },
    metrics: {
      totalTasks: {
        type: Number,
        default: 0
      },
      completedTasks: {
        type: Number,
        default: 0
      },
      lastActivity: {
        type: Date,
        default: Date.now
      }
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ team: 1 });
ProjectSchema.index({ 'members.user': 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ dueDate: 1 });
ProjectSchema.index({ tags: 1 });

// Virtual for progress calculation
ProjectSchema.virtual('progress').get(function() {
  if (this.metrics.totalTasks === 0) return 0;
  return (this.metrics.completedTasks / this.metrics.totalTasks) * 100;
});

// Update metrics when saving
ProjectSchema.pre('save', function(next) {
  this.metrics.lastActivity = new Date();
  next();
});

// Add validation middleware
ProjectSchema.pre('save', function(next) {
  if (this.projectType === 'team' && !this.team) {
    next(new Error('Team is required for team projects'));
  }
  next();
});

// Create and export the model
const Project = mongoose.model('Project', ProjectSchema);
export default Project;
