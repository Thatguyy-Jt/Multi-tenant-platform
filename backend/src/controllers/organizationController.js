import Organization from '../models/Organization.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

/**
 * @desc    Get current user's organization
 * @route   GET /api/organization
 * @access  Private
 */
export const getOrganization = async (req, res, next) => {
  try {
    const organization = await Organization.findById(req.tenant.organizationId).lean();

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Organization not found',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        organization: {
          id: organization._id,
          name: organization.name,
          tenantId: organization.tenantId,
          subscriptionPlan: organization.subscriptionPlan,
          settings: organization.settings,
          createdAt: organization.createdAt,
          updatedAt: organization.updatedAt,
        },
      },
    });
  } catch (error) {
    logger.error(`Get organization error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Update organization
 * @route   PUT /api/organization
 * @access  Private (Owner/Admin only)
 */
export const updateOrganization = async (req, res, next) => {
  try {
    // Role check handled by RBAC middleware
    const { name, settings } = req.body;

    const updateData = {};
    if (name) {
      updateData.name = name;
    }
    if (settings) {
      updateData.settings = settings;
    }

    const organization = await Organization.findByIdAndUpdate(
      req.tenant.organizationId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!organization) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Organization not found',
        },
      });
    }

    logger.info(`Organization updated: ${organization.name} by user ${req.tenant.userId}`);

    res.status(200).json({
      success: true,
      data: {
        organization: {
          id: organization._id,
          name: organization.name,
          tenantId: organization.tenantId,
          subscriptionPlan: organization.subscriptionPlan,
          settings: organization.settings,
          updatedAt: organization.updatedAt,
        },
      },
    });
  } catch (error) {
    logger.error(`Update organization error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all members of organization
 * @route   GET /api/organization/members
 * @access  Private
 */
export const getMembers = async (req, res, next) => {
  try {
    const members = await User.find({
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    })
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        members: members.map((member) => ({
          id: member._id,
          email: member.email,
          role: member.role,
          createdAt: member.createdAt,
        })),
        count: members.length,
      },
    });
  } catch (error) {
    logger.error(`Get members error: ${error.message}`);
    next(error);
  }
};
