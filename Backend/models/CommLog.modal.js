import mongoose from 'mongoose';
const { Schema } = mongoose;

const CommLogSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
  dealId: { type: Schema.Types.ObjectId, ref: 'Deal' },
  type: { type: String, enum: ['email', 'call', 'meeting'], required: true },
  timestamp: { type: Date, default: Date.now },
  notes: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
});

CommLogSchema.index({ organizationId: 1, contactId: 1, dealId: 1 });

export default mongoose.model('CommLog', CommLogSchema);
