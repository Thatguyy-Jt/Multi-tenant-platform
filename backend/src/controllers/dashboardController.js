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
    const [userCount, projectCount, taskCount, recentProjects, recentTasks] = await Promise.all([
      User.countDocuments(tenantQuery),
      Project.countDocuments(tenantQuery),
      Task.countDocuments(tenantQuery),
      Project.find(tenantQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name status createdAt createdBy')
        .populate('createdBy', 'email')
        .lean(),
      Task.find(tenantQuery)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title status createdAt createdBy')
        .populate('createdBy', 'email')
        .lean(),
    ]);

    // Task breakdown by status
    const taskBreakdown = await Task.aggregate([
      { $match: tenantQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Organization activity overview: count of tasks + projects created per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [tasksByDay, projectsByDay] = await Promise.all([
      Task.aggregate([
        { $match: { ...tenantQuery, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Project.aggregate([
        { $match: { ...tenantQuery, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const countByDay = {};
    for (let d = 0; d < 30; d++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + d);
      const key = date.toISOString().slice(0, 10);
      countByDay[key] = 0;
    }
    tasksByDay.forEach((row) => { countByDay[row._id] = (countByDay[row._id] || 0) + row.count; });
    projectsByDay.forEach((row) => { countByDay[row._id] = (countByDay[row._id] || 0) + row.count; });

    const activityOverview = Object.entries(countByDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, count]) => ({
        label: new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: count,
        date: dateStr,
      }));

    // Combine recent projects and tasks into one activity list, sorted by date
    const projectActivities = recentProjects.map((p) => ({
      id: p._id.toString(),
      type: 'project',
      name: p.name,
      status: p.status,
      createdAt: p.createdAt,
      createdBy: p.createdBy,
    }));
    const taskActivities = recentTasks.map((t) => ({
      id: t._id.toString(),
      type: 'task',
      name: t.title,
      status: t.status,
      createdAt: t.createdAt,
      createdBy: t.createdBy,
    }));
    const recentActivity = [...projectActivities, ...taskActivities]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

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
        activityOverview,
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
