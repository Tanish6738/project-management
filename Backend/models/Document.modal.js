import mongoose from 'mongoose';
const { Schema } = mongoose;

const DocumentSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String },
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  isLocked: { type: Boolean, default: false },
  lastEditedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  lastEditedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Document', DocumentSchema);
