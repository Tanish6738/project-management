import mongoose from 'mongoose';
const { Schema } = mongoose;

const SubtaskSchema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Add index
SubtaskSchema.index({ task: 1 });

const Subtask = mongoose.model('Subtask', SubtaskSchema);
export default Subtask;
