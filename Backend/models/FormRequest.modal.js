import mongoose from 'mongoose';
const { Schema } = mongoose;

const FormRequestSchema = new Schema({
  templateId: { type: Schema.Types.ObjectId, ref: 'FormTemplate', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  data: { type: Object, required: true },
  status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

FormRequestSchema.index({ organizationId: 1, templateId: 1 });

export default mongoose.model('FormRequest', FormRequestSchema);
