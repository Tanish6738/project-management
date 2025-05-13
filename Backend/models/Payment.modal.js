import mongoose from 'mongoose';
const { Schema } = mongoose;

const PaymentSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  subscriptionId: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['stripe', 'paypal', 'manual'], required: true },
  transactionId: String,
  invoiceUrl: String,
  paidAt: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Payment', PaymentSchema);
