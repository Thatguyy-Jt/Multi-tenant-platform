import logger from '../utils/logger.js';

/**
 * Tenant middleware
 * Extracts tenantId and organizationId from authenticated user
 * and attaches them to request object for use in controllers
 * 
 * This ensures all data queries are scoped to the correct tenant
 */
export const attachTenant = (req, res, next) => {
  try {
    // User should be attached by auth middleware
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
        },
      });
    }

    // Super Admin with no organization: platform-only, cannot access tenant-scoped routes
    const isPlatformAdmin = req.user.role === 'super_admin' && (req.user.organizationId == null || req.user.tenantId == null);
    if (isPlatformAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Platform admin has no organization context. Use the Admin dashboard only.',
        },
      });
    }

    // Attach tenant information to request
    req.tenant = {
      tenantId: req.user.tenantId,
      organizationId: req.user.organizationId,
      userId: req.user._id,
      role: req.user.role,
    };

    logger.debug({
      message: 'Tenant attached to request',
      tenantId: req.tenant.tenantId,
      organizationId: req.tenant.organizationId,
      userId: req.tenant.userId,
    });

    next();
  } catch (error) {
    logger.error(`Tenant middleware error: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Server error',
      },
    });
  }
};

/**
 * Helper function to ensure queries are scoped to tenant
 * Use this in controllers to add tenantId to query filters
 */
export const scopeToTenant = (query, tenantId) => {
  return {
    ...query,
    tenantId,
  };
};
