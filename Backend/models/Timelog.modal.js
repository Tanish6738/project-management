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
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('TimeLog', TimeLogSchema);
