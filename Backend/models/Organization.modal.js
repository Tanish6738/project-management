import mongoose from 'mongoose';
const { Schema } = mongoose;

const OrganizationSchema = new Schema({
  name: { type: String, required: true },
  domain: { type: String },
  createdAt: { type: Date, default: Date.now }
});

OrganizationSchema.index({ name: 1 });

export default mongoose.model('Organization', OrganizationSchema);
