import mongoose from 'mongoose';
const { Schema } = mongoose;

const TaskSchema = new Schema(
  {
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    deadline: {
      type: Date,
    },
    // Array of IDs for tasks that must be completed first
    dependencies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
    ],
    // Indicates if the task should be visible to everyone after a condition is met
    isPublic: {
      type: Boolean,
      default: false,
    },
    // Tags for easy filtering
    tags: [String],
    // References to subtasks
    subtasks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Subtask',
      },
    ],
    // References to attachments
    attachments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Attachment',
      },
    ],
    // References to comments (in-app chat)
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  { timestamps: true }
);

// Add indexes
TaskSchema.index({ project: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });

const Task = mongoose.model('Task', TaskSchema);
export default Task;
