import mongoose from 'mongoose';
const { Schema } = mongoose;

const AttachmentSchema = new Schema(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    filepath: {
      type: String,
      required: true,
    },
    fileType: String, // e.g., 'image/png', 'application/pdf'
    fileSize: {
      type: Number,  // Size in bytes
      default: 0
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

// Add indexes for better performance
AttachmentSchema.index({ task: 1 });
AttachmentSchema.index({ uploadedBy: 1 });

const Attachment = mongoose.model('Attachment', AttachmentSchema);
export default Attachment;
