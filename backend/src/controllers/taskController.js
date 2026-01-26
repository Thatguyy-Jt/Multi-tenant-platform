import Task from '../models/Task.js';
import Project from '../models/Project.js';
import logger from '../utils/logger.js';

/**
 * @desc    Create new task
 * @route   POST /api/tasks
 * @access  Private (All members)
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, projectId, assigneeId } = req.body;

    // Verify project exists and belongs to tenant
    const project = await Project.findOne({
      _id: projectId,
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

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      projectId,
      assigneeId,
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
      createdBy: req.tenant.userId,
    });

    logger.info(`Task created: ${task._id} by ${req.tenant.userId}`);

    res.status(201).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    logger.error(`Create task error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all tasks (with filters)
 * @route   GET /api/tasks
 * @access  Private (All members)
 */
export const getTasks = async (req, res, next) => {
  try {
    const { projectId, assigneeId, status, priority } = req.query;

    // Build query
    const query = {
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    };

    if (projectId) query.projectId = projectId;
    if (assigneeId) query.assigneeId = assigneeId;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const tasks = await Task.find(query)
      .populate('assigneeId', 'email')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        tasks,
        count: tasks.length,
      },
    });
  } catch (error) {
    logger.error(`Get tasks error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get single task
 * @route   GET /api/tasks/:id
 * @access  Private (All members)
 */
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    })
      .populate('assigneeId', 'email')
      .populate('projectId', 'name')
      .populate('createdBy', 'email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Task not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    logger.error(`Get task error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update task
 * @route   PUT /api/tasks/:id
 * @access  Private (All members)
 */
export const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Task not found',
        },
      });
    }

    // TODO: Optional - Restrict who can update (e.g. only assignee or admin)
    // For now, all members can update tasks

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assigneeId', 'email')
      .populate('projectId', 'name');

    logger.info(`Task updated: ${task._id} by ${req.tenant.userId}`);

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    logger.error(`Update task error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Delete task
 * @route   DELETE /api/tasks/:id
 * @access  Private (Admin/Owner)
 */
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Task not found',
        },
      });
    }

    // Handled by route middleware `requireAdmin`

    await task.deleteOne();

    logger.info(`Task deleted: ${req.params.id} by ${req.tenant.userId}`);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    logger.error(`Delete task error: ${error.message}`);
    next(error);
  }
};
