import mongoose from 'mongoose';
const { Schema } = mongoose;

const AISuggestionSchema = new Schema({
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
});

AISuggestionSchema.index({ taskId: 1, type: 1 });

export default mongoose.model('AISuggestion', AISuggestionSchema);
