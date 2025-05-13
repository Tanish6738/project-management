import mongoose from 'mongoose';
const { Schema } = mongoose;

const STATUS_ENUM = ['pending', 'in-progress', 'completed'];
const PRIORITY_ENUM = ['low', 'medium', 'high'];

const TaskSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxLength: [200, 'Title cannot exceed 200 characters'],
    },
    description: String,
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: {
        values: STATUS_ENUM,
        message: '{VALUE} is not a valid status',
      },
      default: 'pending',
    },
    priority: {
      type: String,
      enum: {
        values: PRIORITY_ENUM,
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
    },
    deadline: {
      type: Date,
      validate: {
        validator: function(v) {
          return v > new Date();
        },
        message: 'Deadline must be a future date',
      },
    },
    dependencies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    subtasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    isSubtask: {
      type: Boolean,
      default: false,
      immutable: true,
    },
    parentTask: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    watchers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    timeTracking: {
      estimated: Number, // in minutes
      actual: Number,    // in minutes
      timeSpent: [{
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        duration: Number,
        date: {
          type: Date,
          default: Date.now
        }
      }]
    },
    notifications: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      message: String,
      action: String,
      actorUser: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      isRead: {
        type: Boolean,
        default: false
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: 'Task'
    },
    ancestors: [{
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }],
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    dependsOn: [{
      type: Schema.Types.ObjectId,
      ref: 'Task'
    }],
    budget: {
      type: Schema.Types.Decimal128,
      default: 0
    },
    customFields: {
      type: Map,
      of: Schema.Types.Mixed
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for progress
TaskSchema.virtual('progress').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'pending') return 0;
  return 50;
});

// Pre-save middleware
TaskSchema.pre('save', async function(next) {
  if (this.isSubtask && !this.parentTask) {
    throw new Error('Subtask must have a parent task');
  }
  if (this.parentTask) {
    this.isSubtask = true;
  }
  next();
});

// Add indexes
TaskSchema.index({ project: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ parentTask: 1 });
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ parentId: 1 });
TaskSchema.index({ assigneeId: 1 });
TaskSchema.index({ 'customFields.key': 1 });

// Add methods to TaskSchema
TaskSchema.methods = {
  async notifyWatchers(action, actorUserId = null) {
    try {
      // Skip if no watchers
      if (!this.watchers || this.watchers.length === 0) {
        return;
      }

      const User = mongoose.model('User');
      const AuditLog = mongoose.model('AuditLog');
      
      // Get action message based on the action type
      let message = '';
      switch (action) {
        case 'create':
          message = `Task "${this.title}" was created`;
          break;
        case 'update':
          message = `Task "${this.title}" was updated`;
          break;
        case 'comment':
          message = `New comment on task "${this.title}"`;
          break;
        case 'attachment':
          message = `New attachment added to task "${this.title}"`;
          break;
        case 'status':
          message = `Task "${this.title}" status changed to ${this.status}`;
          break;
        case 'assignment':
          message = `Task "${this.title}" was assigned`;
          break;
        case 'deadline':
          message = `Deadline for task "${this.title}" was updated`;
          break;
        default:
          message = `Task "${this.title}" was modified`;
      }
      
      // Create notification for each watcher
      const notifications = this.watchers.map(watcherId => ({
        user: watcherId,
        message,
        action,
        actorUser: actorUserId,
        isRead: false,
        createdAt: new Date()
      }));
      
      // Add notifications to the task
      if (!this.notifications) {
        this.notifications = [];
      }
      
      this.notifications.push(...notifications);
      await this.save();
      
      // Log the notification action
      await AuditLog.create({
        user: actorUserId,
        action: 'notify_watchers',
        targetModel: 'Task',
        targetId: this._id,
        details: {
          taskId: this._id,
          action,
          watchersCount: this.watchers.length
        }
      });
      
      // You could also implement email notifications here
      // For now, we'll just update the users' notification settings
      
      // Return notification count
      return notifications.length;
    } catch (error) {
      console.error('Error sending notifications:', error);
      return 0;
    }
  },
  
  async updateProjectMetrics() {
    if (this.project) {
      const Project = mongoose.model('Project');
      await Project.updateTaskMetrics(this.project);
    }
  }
};

// Add pre/post hooks
TaskSchema.post('save', async function(doc) {
  await doc.updateProjectMetrics();
});

TaskSchema.pre('remove', async function(next) {
  // Clean up subtasks when parent is removed
  if (this.subtasks && this.subtasks.length > 0) {
    await Task.deleteMany({ _id: { $in: this.subtasks } });
  }
  next();
});

const Task = mongoose.model('Task', TaskSchema);
export default Task;
