import express from 'express';
import {
  getCurrentSubscription,
  createSubscription,
  getBillingPortal,
  handleWebhook,
} from '../controllers/billingController.js';
import { protect } from '../middleware/auth.js';
import { attachTenant } from '../middleware/tenant.js';
import { requireOwner, requireAdmin } from '../middleware/rbac.js';

const router = express.Router();

// Webhook must be raw body for Stripe signature verification
// But we used global body parser in server.js
// For now, we assume the helper function handles it or we skip signature verification if using mock
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected routes
router.use(protect);
router.use(attachTenant);

router.get('/current', requireAdmin, getCurrentSubscription);
router.post('/subscribe', requireOwner, createSubscription);
router.get('/portal', requireOwner, getBillingPortal);

export default router;
