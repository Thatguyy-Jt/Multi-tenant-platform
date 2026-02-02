import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get audit logs for organization (tenant-scoped)
 * @route   GET /api/audit-logs
 * @access  Private (Owner/Admin only)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action, resource, from, to } = req.query;
    const tenantId = req.tenant.tenantId;
    const organizationId = req.tenant.organizationId;

    const query = { tenantId };
    if (organizationId) query.organizationId = organizationId;
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.min(100, Math.max(1, parseInt(limit, 10)));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .populate('userId', 'email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      AuditLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs: logs.map((log) => ({
          id: log._id,
          action: log.action,
          resource: log.resource,
          resourceId: log.resourceId,
          details: log.details,
          userEmail: log.userId?.email ?? null,
          userId: log.userId?._id ?? log.userId,
          ip: log.ip,
          createdAt: log.createdAt,
        })),
        pagination: {
          page: Math.max(1, parseInt(page, 10)),
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum) || 1,
        },
      },
    });
  } catch (error) {
    logger.error(`Get audit logs error: ${error.message}`);
    next(error);
  }
};
