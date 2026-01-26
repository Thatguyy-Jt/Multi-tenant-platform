import mongoose from 'mongoose';
import crypto from 'crypto';

const invitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    tenantId: {
      type: String,
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      required: [true, 'Role is required'],
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired'],
      default: 'pending',
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // MongoDB TTL index
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common query patterns
invitationSchema.index({ tenantId: 1, organizationId: 1 }); // For tenant isolation
invitationSchema.index({ tenantId: 1, status: 1 }); // For filtering by status
// Compound index for email + organizationId to prevent duplicate pending invitations
invitationSchema.index({ email: 1, organizationId: 1, status: 1 });
invitationSchema.index({ organizationId: 1, invitedBy: 1 }); // For invitation history

// Method to generate invitation token
invitationSchema.methods.generateToken = function () {
  return crypto.randomBytes(32).toString('hex');
};

// Static method to create invitation with token
invitationSchema.statics.createInvitation = async function (data) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

  return this.create({
    ...data,
    token,
    expiresAt,
  });
};

// Method to check if invitation is valid
invitationSchema.methods.isValid = function () {
  return (
    this.status === 'pending' &&
    this.expiresAt > new Date()
  );
};

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;
