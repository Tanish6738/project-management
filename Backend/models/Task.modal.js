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

// Add methods to TaskSchema
TaskSchema.methods = {
  async notifyWatchers(action) {
    // Implement notification logic
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
