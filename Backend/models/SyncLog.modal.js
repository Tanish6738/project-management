import mongoose from 'mongoose';
const { Schema } = mongoose;

const SyncLogSchema = new Schema({
  integrationId: { type: Schema.Types.ObjectId, ref: 'Integration', required: true },
  action: { type: String, required: true },
  status: { type: String, enum: ['success', 'fail'], required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String }
});

SyncLogSchema.index({ integrationId: 1, timestamp: 1 });

export default mongoose.model('SyncLog', SyncLogSchema);
