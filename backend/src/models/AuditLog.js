import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    tenantId: {
      type: String,
      default: null,
      index: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'login_success',
        'login_failure',
        'logout',
        'signup',
        'password_reset_request',
        'password_reset_success',
        'invitation_sent',
        'invitation_accepted',
        'invitation_rejected',
        'invitation_cancelled',
        'project_create',
        'project_update',
        'project_delete',
        'task_create',
        'task_update',
        'task_delete',
        'billing_checkout_started',
        'billing_portal_accessed',
      ],
      index: true,
    },
    resource: {
      type: String,
      enum: ['auth', 'invitation', 'project', 'task', 'billing'],
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ tenantId: 1, createdAt: -1 });
auditLogSchema.index({ organizationId: 1, createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
