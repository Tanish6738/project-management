import mongoose from 'mongoose';
const { Schema } = mongoose;

const FormTemplateSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  fields: [{
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    options: [String],
    required: { type: Boolean, default: false }
  }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

FormTemplateSchema.index({ organizationId: 1 });

export default mongoose.model('FormTemplate', FormTemplateSchema);
