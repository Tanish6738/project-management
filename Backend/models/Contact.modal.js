import mongoose from 'mongoose';
const { Schema } = mongoose;

const ContactSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  company: { type: String },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
  source: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ContactSchema.index({ organizationId: 1 });

export default mongoose.model('Contact', ContactSchema);
