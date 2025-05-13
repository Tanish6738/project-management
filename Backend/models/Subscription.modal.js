import mongoose from 'mongoose';
const { Schema } = mongoose;

const SubscriptionPlanSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  pricePerUser: { type: Number, required: true },
  features: [String],
  maxUsers: Number,
  storageLimitMB: Number,
  isActive: { type: Boolean, default: true },
  isEnterprise: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const SubscriptionSchema = new Schema({
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  plan: { type: Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  status: { type: String, enum: ['active', 'trial', 'canceled', 'past_due'], default: 'active' },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  nextBillingDate: Date,
  paymentMethod: { type: String, enum: ['stripe', 'paypal', 'manual'] },
  lastPaymentStatus: { type: String, enum: ['paid', 'failed', 'pending'] },
  invoiceId: String,
  createdAt: { type: Date, default: Date.now }
});

export const SubscriptionPlan = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);
export default mongoose.model('Subscription', SubscriptionSchema);
