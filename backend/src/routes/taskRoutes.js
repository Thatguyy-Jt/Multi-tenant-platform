import express from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { attachTenant } from '../middleware/tenant.js';
import { requireAdmin } from '../middleware/rbac.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

// Validation
const validateTask = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
  handleValidationErrors,
];

// Auth & Tenant Middleware
router.use(protect);
router.use(attachTenant);

// Routes
router.get('/', getTasks); // All members
router.get('/:id', getTask); // All members
router.post('/', validateTask, createTask); // All members
router.put('/:id', updateTask); // All members

// Admin/Owner only
router.delete('/:id', requireAdmin, deleteTask);

export default router;
