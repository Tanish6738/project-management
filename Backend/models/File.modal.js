import mongoose from 'mongoose';
const { Schema } = mongoose;

const FileVersionSchema = new Schema({
  versionNumber: { type: Number, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  url: { type: String, required: true },
  uploadDate: { type: Date, default: Date.now }
});

const FileSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  filename: { type: String, required: true },
  mimeType: { type: String },
  currentVersion: { type: Number, default: 1 },
  versions: [FileVersionSchema],
  createdAt: { type: Date, default: Date.now }
});

FileSchema.index({ projectId: 1, taskId: 1 });

export default mongoose.model('File', FileSchema);
