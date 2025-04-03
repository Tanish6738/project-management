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

// Add indexes for better performance
CommentSchema.index({ task: 1 });
CommentSchema.index({ user: 1 });

const Comment = mongoose.model('Comment', CommentSchema);
export default Comment;
