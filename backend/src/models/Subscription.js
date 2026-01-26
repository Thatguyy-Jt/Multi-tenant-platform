import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      unique: true,
      index: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['free', 'pro', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['active', 'past_due', 'canceled', 'incomplete', 'trialing'],
      default: 'active',
    },
    stripeCustomerId: {
      type: String,
    },
    stripeSubscriptionId: {
      type: String,
    },
    currentPeriodStart: {
      type: Date,
    },
    currentPeriodEnd: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
    // Denormalized limits for quick access
    limits: {
      maxUsers: { type: Number, default: 5 },
      maxProjects: { type: Number, default: 3 },
      maxStorage: { type: Number, default: 1024 * 1024 * 100 }, // 100MB
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns
subscriptionSchema.index({ tenantId: 1, organizationId: 1 }); // For tenant isolation
subscriptionSchema.index({ tenantId: 1, status: 1 }); // For filtering by status
subscriptionSchema.index({ stripeCustomerId: 1 }); // For Stripe webhook lookups
subscriptionSchema.index({ stripeSubscriptionId: 1 }); // For Stripe webhook lookups
subscriptionSchema.index({ organizationId: 1, plan: 1 }); // For plan-based queries

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
