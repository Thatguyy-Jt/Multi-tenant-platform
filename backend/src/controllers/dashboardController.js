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

/**
 * @desc    Export dashboard report as CSV
 * @route   GET /api/dashboard/export
 * @access  Private (Owner/Admin only)
 */
export const exportDashboardReport = async (req, res, next) => {
  try {
    const tenantQuery = {
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    };

    const [userCount, projectCount, taskCount, taskBreakdownArr, recentProjects, recentTasks] = await Promise.all([
      User.countDocuments(tenantQuery),
      Project.countDocuments(tenantQuery),
      Task.countDocuments(tenantQuery),
      Task.aggregate([
        { $match: tenantQuery },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Project.find(tenantQuery).sort({ createdAt: -1 }).limit(10).select('name status createdAt').lean(),
      Task.find(tenantQuery).sort({ createdAt: -1 }).limit(10).select('title status priority createdAt').lean(),
    ]);

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `report-${dateStr}.csv`;

    const rows = [
      ['Metric', 'Value'],
      ['Report Date', dateStr],
      ['Total Users', String(userCount)],
      ['Total Projects', String(projectCount)],
      ['Total Tasks', String(taskCount)],
      [],
      ['Task Status', 'Count'],
      ...taskBreakdownArr.map((r) => [r._id, String(r.count)]),
      [],
      ['Recent Projects', 'Status', 'Created At'],
      ...recentProjects.map((p) => [p.name, p.status, p.createdAt ? new Date(p.createdAt).toISOString() : '']),
      [],
      ['Recent Tasks', 'Status', 'Priority', 'Created At'],
      ...recentTasks.map((t) => [t.title, t.status, t.priority || '', t.createdAt ? new Date(t.createdAt).toISOString() : '']),
    ];

    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const bom = '\uFEFF';
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(bom + csv);
  } catch (error) {
    logger.error(`Export dashboard error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get analytics data for charts (task status over time, tasks per project, activity by day)
 * @route   GET /api/dashboard/analytics
 * @access  Private (Owner/Admin only)
 */
export const getAnalytics = async (req, res, next) => {
  try {
    const tenantQuery = {
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    };

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [tasksByDayAndStatus, tasksPerProject, activityByDay] = await Promise.all([
      Task.aggregate([
        { $match: { ...tenantQuery, createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              status: '$status',
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.date': 1 } },
      ]),
      Task.aggregate([
        { $match: tenantQuery },
        { $group: { _id: '$projectId', count: { $sum: 1 } } },
        { $lookup: { from: 'projects', localField: '_id', foreignField: '_id', as: 'project' } },
        { $unwind: { path: '$project', preserveNullAndEmptyArrays: true } },
        { $project: { projectName: '$project.name', count: 1, _id: 0 } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      Task.aggregate([
        { $match: { ...tenantQuery, createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const taskStatusOverTime = {};
    tasksByDayAndStatus.forEach((r) => {
      const date = r._id.date;
      if (!taskStatusOverTime[date]) taskStatusOverTime[date] = { date, labels: {} };
      taskStatusOverTime[date].labels[r._id.status] = r.count;
    });
    const taskStatusOverTimeArray = Object.values(taskStatusOverTime).sort((a, b) => a.date.localeCompare(b.date));

    const tasksPerProjectArray = tasksPerProject.map((r) => ({
      project: r.projectName || 'No project',
      count: r.count,
    }));

    const activityByDayArray = activityByDay.map((r) => ({
      date: r._id,
      label: new Date(r._id + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: r.count,
    }));

    res.status(200).json({
      success: true,
      data: {
        taskStatusOverTime: taskStatusOverTimeArray,
        tasksPerProject: tasksPerProjectArray,
        activityByDay: activityByDayArray,
      },
    });
  } catch (error) {
    logger.error(`Get analytics error: ${error.message}`);
    next(error);
  }
};
