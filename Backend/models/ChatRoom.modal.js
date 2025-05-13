import mongoose from 'mongoose';
const { Schema } = mongoose;

const ChatRoomSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  name: { type: String, required: true },
  memberIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ChatRoomSchema.index({ projectId: 1 });

export default mongoose.model('ChatRoom', ChatRoomSchema);
