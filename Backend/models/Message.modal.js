import mongoose from 'mongoose';
const { Schema } = mongoose;

const MessageSchema = new Schema({
  roomId: { type: Schema.Types.ObjectId, ref: 'ChatRoom', required: true },
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  attachments: [{
    url: { type: String },
    filename: { type: String },
    uploaderId: { type: Schema.Types.ObjectId, ref: 'User' }
  }],
  createdAt: { type: Date, default: Date.now }
});

MessageSchema.index({ roomId: 1, createdAt: 1 });

export default mongoose.model('Message', MessageSchema);
