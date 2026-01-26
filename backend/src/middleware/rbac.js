import { ROLES } from '../config/permissions.js';
import logger from '../utils/logger.js';

/**
 * Check if user has specific role
 * @param {string|Array} roles - Role or array of roles allowed
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    try {
      if (!req.tenant || !req.tenant.role) {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied: No role found',
          },
        });
      }

      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      const userRole = req.tenant.role;

      if (!allowedRoles.includes(userRole)) {
        logger.warn(`Access denied: User ${req.tenant.userId} with role ${userRole} attempted to access route allowed for ${allowedRoles.join(', ')}`);
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied: Insufficient permissions',
          },
        });
      }

      next();
    } catch (error) {
      logger.error(`RBAC middleware error: ${error.message}`);
      return res.status(500).json({
        success: false,
        error: {
          message: 'Server error',
        },
      });
    }
  };
};

/**
 * Check if user is an Owner
 */
export const requireOwner = requireRole(ROLES.OWNER);

/**
 * Check if user is an Admin or Owner
 */
export const requireAdmin = requireRole([ROLES.OWNER, ROLES.ADMIN]);
