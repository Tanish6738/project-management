import mongoose from 'mongoose';
const { Schema } = mongoose;

const FieldDefinitionSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'date', 'dropdown'], required: true },
  options: [String],
  required: { type: Boolean, default: false }
}, { timestamps: true });

FieldDefinitionSchema.index({ organizationId: 1, projectId: 1 });

export default mongoose.model('FieldDefinition', FieldDefinitionSchema);
