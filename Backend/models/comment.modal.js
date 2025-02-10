import mongoose from 'mongoose';
const { Schema } = mongoose;

const CommentSchema = new Schema(
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
    content: {
      type: String,
      required: true,
    },
    // For threaded replies (optional)
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', CommentSchema);
