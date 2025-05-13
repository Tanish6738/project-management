import mongoose from 'mongoose';
const { Schema } = mongoose;

const DealSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  contactId: { type: Schema.Types.ObjectId, ref: 'Contact', required: true },
  value: { type: Number },
  currency: { type: String },
  stage: { type: String, enum: ['Prospect', 'Negotiation', 'Closed', 'Lost'] },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

DealSchema.index({ organizationId: 1, contactId: 1 });

export default mongoose.model('Deal', DealSchema);
