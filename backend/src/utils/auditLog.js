import AuditLog from '../models/AuditLog.js';
import logger from './logger.js';

/**
 * Create an audit log entry. Use from controllers after successful actions.
 * @param {object} req - Express request (for ip, userAgent, and optional req.tenant / req.user)
 * @param {object} options - { action, resource, resourceId?, details?, userId? }
 * @param {string} options.action - One of the AuditLog action enum values
 * @param {string} options.resource - One of: auth, invitation, project, task, billing
 * @param {string} [options.resourceId] - ID of the affected resource
 * @param {object|string} [options.details] - Extra context (e.g. { email }, "Project X")
 * @param {string} [options.userId] - Override user ID (default: req.user?._id)
 * @param {string} [options.tenantId] - Override tenant (e.g. from user for login)
 * @param {string} [options.organizationId] - Override organization (e.g. from user for login)
 */
export const createAuditLog = async (req, options) => {
  try {
    const userId = options.userId ?? req.user?._id;
    // userId can be null for login_failure (no user identified)
    if (userId === undefined && options.action !== 'login_failure') {
      logger.warn('createAuditLog called without userId');
      return;
    }

    const tenant = req.tenant || {};
    await AuditLog.create({
      userId,
      tenantId: options.tenantId ?? tenant.tenantId ?? req.user?.tenantId ?? null,
      organizationId: options.organizationId ?? tenant.organizationId ?? req.user?.organizationId ?? null,
      action: options.action,
      resource: options.resource,
      resourceId: options.resourceId ?? null,
      details: options.details ?? null,
      ip: req.ip ?? req.get?.('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: req.get?.('user-agent') ?? null,
    });
  } catch (err) {
    logger.error(`Audit log failed: ${err.message}`);
    // Do not throw - audit failure should not break the request
  }
};
