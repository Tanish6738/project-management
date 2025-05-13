import mongoose from 'mongoose';
const { Schema } = mongoose;

const ExpenseSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task' },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  currency: { type: String }
});

ExpenseSchema.index({ projectId: 1, taskId: 1 });

export default mongoose.model('Expense', ExpenseSchema);
