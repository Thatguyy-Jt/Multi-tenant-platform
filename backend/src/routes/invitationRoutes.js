import express from 'express';
import {
  createInvitation,
  getInvitations,
  acceptInvitation,
  rejectInvitation,
  cancelInvitation,
} from '../controllers/invitationController.js';
import { protect } from '../middleware/auth.js';
import { attachTenant } from '../middleware/tenant.js';
import { requireAdmin } from '../middleware/rbac.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

// Validation rules
const validateCreateInvitation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('role')
    .isIn(['admin', 'member'])
    .withMessage('Role must be either admin or member'),
  handleValidationErrors,
];

const validateAcceptInvitation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .optional(), // Optional if user already exists
  handleValidationErrors,
];

// Public routes (no auth required)
router.post('/:token/accept', validateAcceptInvitation, acceptInvitation);
router.post('/:token/reject', rejectInvitation);

// Protected routes (require auth and tenant context)
router.use(protect);
router.use(attachTenant);

// All invitation management routes require Admin/Owner role
router.use(requireAdmin);

// Routes
router.post('/', validateCreateInvitation, createInvitation);
router.get('/', getInvitations);
router.delete('/:id', cancelInvitation);

export default router;
