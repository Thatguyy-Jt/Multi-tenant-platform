import User from '../models/User.js';
import Organization from '../models/Organization.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get platform-wide statistics
 * @route   GET /api/admin/stats
 * @access  Private (Super Admin only)
 */
export const getPlatformStats = async (req, res, next) => {
  try {
    const [totalUsers, totalOrgs, recentOrgs] = await Promise.all([
      User.countDocuments({}),
      Organization.countDocuments({}),
      Organization.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name tenantId subscriptionPlan createdAt'),
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: totalUsers,
          organizations: totalOrgs,
        },
        recentOrganizations: recentOrgs,
      },
    });
  } catch (error) {
    logger.error(`Get platform stats error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    List all tenants
 * @route   GET /api/admin/tenants
 * @access  Private (Super Admin only)
 */
export const getTenants = async (req, res, next) => {
  try {
    const tenants = await Organization.find({}).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        tenants,
        count: tenants.length,
      },
    });
  } catch (error) {
    logger.error(`Get tenants error: ${error.message}`);
    next(error);
  }
};
