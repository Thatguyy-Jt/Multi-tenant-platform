import express from 'express';
import { getAuditLogs } from '../controllers/auditLogController.js';
import { protect } from '../middleware/auth.js';
import { attachTenant } from '../middleware/tenant.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);
router.use(attachTenant);
router.use(requireAdmin);

router.get('/', getAuditLogs);

export default router;
