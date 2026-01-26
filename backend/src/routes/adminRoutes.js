import express from 'express';
import { getPlatformStats, getTenants } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { ROLES } from '../config/permissions.js';

const router = express.Router();

router.use(protect);

// Middleware to ensure Super Admin
// Note: We don't use attachTenant here necessarily because Super Admin looks across tenants
// But our middleware stack might require it if we want to read req.user role properly
// actually auth middleware attaches req.user, so we can check req.user.role directly

const requireSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === ROLES.SUPER_ADMIN) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      error: { message: 'Access denied: Super Admin only' }
    });
  }
};

router.use(requireSuperAdmin);

router.get('/stats', getPlatformStats);
router.get('/tenants', getTenants);

export default router;
