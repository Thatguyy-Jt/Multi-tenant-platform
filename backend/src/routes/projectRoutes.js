import express from 'express';
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';
import { attachTenant } from '../middleware/tenant.js';
import { requireAdmin, requireOwner } from '../middleware/rbac.js';
import { body } from 'express-validator';
import { handleValidationErrors } from '../utils/validators.js';

const router = express.Router();

// Validation
const validateProject = [
  body('name').trim().notEmpty().withMessage('Project name is required'),
  handleValidationErrors,
];

// Auth & Tenant Middleware
router.use(protect);
router.use(attachTenant);

// Routes
router.get('/', getProjects); // All members
router.get('/:id', getProject); // All members

// Admin/Owner only
router.post('/', requireAdmin, validateProject, createProject);
router.put('/:id', requireAdmin, updateProject);

// Owner only
router.delete('/:id', requireOwner, deleteProject);

export default router;
