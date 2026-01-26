import express from 'express';
import {
  getOrganization,
  updateOrganization,
  getMembers,
} from '../controllers/organizationController.js';
import { protect } from '../middleware/auth.js';
import { attachTenant } from '../middleware/tenant.js';
import { requireAdmin, requireRole } from '../middleware/rbac.js';
import { ROLES } from '../config/permissions.js';

const router = express.Router();

// All routes require authentication and tenant context
router.use(protect);
router.use(attachTenant);

// Routes
router.get('/', getOrganization); // All members can view organization
router.put('/', requireAdmin, updateOrganization); // Only Admin/Owner can update
router.get('/members', getMembers); // All members can view members

export default router;
