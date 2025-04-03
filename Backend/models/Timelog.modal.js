import mongoose from 'mongoose';
const { Schema } = mongoose;

const TimeLogSchema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Time spent in minutes (or hours, as preferred)
    timeSpent: {
      type: Number,
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    description: String,
    billable: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'completed'],
      default: 'completed'
    }
  },
  { timestamps: true }
);

// Add indexes for performance
TimeLogSchema.index({ task: 1 });
TimeLogSchema.index({ user: 1 });
TimeLogSchema.index({ startTime: 1 });

const TimeLog = mongoose.model('TimeLog', TimeLogSchema);
export default TimeLog;
