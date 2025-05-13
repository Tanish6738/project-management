import mongoose from 'mongoose';
const { Schema } = mongoose;

const IntegrationSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  type: { type: String, required: true },
  credentials: {
    token: { type: String },
    refreshToken: { type: String },
    expiresAt: { type: Date }
  },
  config: { type: Object },
  enabled: { type: Boolean, default: true },
  lastSync: { type: Date }
});

IntegrationSchema.index({ organizationId: 1, type: 1 });

export default mongoose.model('Integration', IntegrationSchema);
