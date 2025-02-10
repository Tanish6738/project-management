import mongoose from 'mongoose';
const { Schema } = mongoose;

const AuditLogSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  targetModel: {
    type: String,
    enum: ['User', 'Project', 'Task', 'Team', 'Subtask', 'Comment', 'Attachment', 'TimeLog'],
    required: true
  },
  targetId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  details: {
    type: Object
  }
}, { timestamps: true });

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;
