import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Organization name is required'],
      trim: true,
      maxlength: [100, 'Organization name cannot exceed 100 characters'],
    },
    tenantId: {
      type: String,
      unique: true,
      index: true,
      sparse: true, // Allow null/undefined but enforce uniqueness when present
    },
    subscriptionPlan: {
      type: String,
      enum: ['free', 'pro'],
      default: 'free',
    },
    settings: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique tenantId before saving (runs before validation)
organizationSchema.pre('save', async function (next) {
  if (!this.tenantId) {
    // Generate a unique tenantId using timestamp and random string
    // Collision probability is extremely low
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 10);
    this.tenantId = `${timestamp}-${randomStr}`;
  }
  next();
});

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
