import express from 'express';
import { getDashboardStats, getMyStats } from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';
import { attachTenant } from '../middleware/tenant.js';
import { requireAdmin } from '../middleware/rbac.js';

const router = express.Router();

router.use(protect);
router.use(attachTenant);

// Admin/Owner view
router.get('/stats', requireAdmin, getDashboardStats);

// Member view
router.get('/my-stats', getMyStats);

export default router;
