import Project from '../models/Project.js';
import logger from '../utils/logger.js';

/**
 * @desc    Create new project
 * @route   POST /api/projects
 * @access  Private (Owner/Admin)
 */
export const createProject = async (req, res, next) => {
  try {
    const { name, description, status } = req.body;

    const project = await Project.create({
      name,
      description,
      status,
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
      createdBy: req.tenant.userId,
    });

    logger.info(`Project created: ${project._id} by ${req.tenant.userId}`);

    res.status(201).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    logger.error(`Create project error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all projects for organization
 * @route   GET /api/projects
 * @access  Private (All members)
 */
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    })
      .populate('createdBy', 'email')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        projects,
        count: projects.length,
      },
    });
  } catch (error) {
    logger.error(`Get projects error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get single project
 * @route   GET /api/projects/:id
 * @access  Private (All members)
 */
export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    }).populate('createdBy', 'email');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Project not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    logger.error(`Get project error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update project
 * @route   PUT /api/projects/:id
 * @access  Private (Owner/Admin)
 */
export const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findOne({
      _id: req.params.id,
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Project not found',
        },
      });
    }

    // Role check handled by middleware (Owner/Admin)

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    logger.info(`Project updated: ${project._id} by ${req.tenant.userId}`);

    res.status(200).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    logger.error(`Update project error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Delete project
 * @route   DELETE /api/projects/:id
 * @access  Private (Owner)
 */
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Project not found',
        },
      });
    }

    // Check permissions (handled by middleware usually, but DELETE often restricted to OWNER)
    // We will enforce this via route middleware `requireOwner`

    await project.deleteOne();

    logger.info(`Project deleted: ${req.params.id} by ${req.tenant.userId}`);

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete project error: ${error.message}`);
    next(error);
  }
};
