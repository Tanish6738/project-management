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
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
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
CommentSchema.index({ organizationId: 1 });

const Comment = mongoose.model('Comment', CommentSchema);
export default Comment;

// Updated Comment schema for multi-tenancy
// - Added organizationId field to associate comments with an organization
// - Added index on organizationId for better query performance
// - Ensured timestamps are present for tracking comment creation and updates
