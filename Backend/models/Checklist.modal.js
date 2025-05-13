import mongoose from 'mongoose';
const { Schema } = mongoose;

const ChecklistItemSchema = new Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false }
});

const ChecklistSchema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  items: [ChecklistItemSchema],
  createdAt: { type: Date, default: Date.now }
});

ChecklistSchema.index({ taskId: 1 });

export default mongoose.model('Checklist', ChecklistSchema);
