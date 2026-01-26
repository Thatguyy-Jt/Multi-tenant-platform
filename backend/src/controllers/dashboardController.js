import User from '../models/User.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get organization statistics
 * @route   GET /api/dashboard/stats
 * @access  Private (Owner/Admin)
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const tenantQuery = {
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    };

    // Parallel execution for performance
    const [userCount, projectCount, taskCount, recentActivity] = await Promise.all([
      User.countDocuments(tenantQuery),
      Project.countDocuments(tenantQuery),
      Task.countDocuments(tenantQuery),
      // Get recent 5 items (projects + tasks mixed would be complex, let's just get recent projects)
      Project.find(tenantQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name status createdAt createdBy')
        .populate('createdBy', 'email'),
    ]);

    // Task breakdown by status
    const taskBreakdown = await Task.aggregate([
      { $match: tenantQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: userCount,
          projects: projectCount,
          tasks: taskCount,
        },
        taskBreakdown: taskBreakdown.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        recentActivity,
      },
    });
  } catch (error) {
    logger.error(`Get dashboard stats error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get personal statistics
 * @route   GET /api/dashboard/my-stats
 * @access  Private (All members)
 */
export const getMyStats = async (req, res, next) => {
  try {
    const myQuery = {
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
      assigneeId: req.tenant.userId,
    };

    const [myTaskCount, myPendingTasks] = await Promise.all([
      Task.countDocuments(myQuery),
      Task.countDocuments({ ...myQuery, status: { $ne: 'done' } }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        tasks: {
          total: myTaskCount,
          pending: myPendingTasks,
          completed: myTaskCount - myPendingTasks,
        },
      },
    });
  } catch (error) {
    logger.error(`Get my stats error: ${error.message}`);
    next(error);
  }
};
