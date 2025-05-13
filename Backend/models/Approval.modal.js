import mongoose from 'mongoose';
const { Schema } = mongoose;

const ApprovalSchema = new Schema({
  fileId: { type: Schema.Types.ObjectId, ref: 'File', required: true },
  versionNumber: { type: Number, required: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['approved', 'rejected'], required: true },
  comments: { type: String },
  reviewedAt: { type: Date, default: Date.now }
});

ApprovalSchema.index({ fileId: 1, versionNumber: 1, reviewerId: 1 });

export default mongoose.model('Approval', ApprovalSchema);
