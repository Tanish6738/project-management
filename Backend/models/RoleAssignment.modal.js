import mongoose from 'mongoose';
const { Schema } = mongoose;

const RoleAssignmentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  role: { type: String, enum: ['Admin', 'Editor', 'Viewer', 'organization_admin', 'project_manager', 'member'], required: true },
  createdAt: { type: Date, default: Date.now }
});

RoleAssignmentSchema.index({ userId: 1, organizationId: 1 });

export default mongoose.model('RoleAssignment', RoleAssignmentSchema);
