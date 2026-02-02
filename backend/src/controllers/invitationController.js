import Invitation from '../models/Invitation.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { sendInvitationEmail } from '../services/emailService.js';
import logger from '../utils/logger.js';
import { createAuditLog } from '../utils/auditLog.js';

/**
 * @desc    Create invitation
 * @route   POST /api/invitations
 * @access  Private (Owner/Admin only)
 */
export const createInvitation = async (req, res, next) => {
  try {
    // Role check handled by RBAC middleware
    const { email, role } = req.body;

    // Validate role (can't invite another owner)
    if (role === 'owner') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot invite users as owner. Owners are created during signup.',
        },
      });
    }

    // Check if user already exists in this organization
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      tenantId: req.tenant.tenantId,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User already exists in this organization',
        },
      });
    }

    // Check for existing pending invitation
    const existingInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      organizationId: req.tenant.organizationId,
      status: 'pending',
    });

    if (existingInvitation) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Pending invitation already exists for this email',
        },
      });
    }

    // Create invitation
    const invitation = await Invitation.createInvitation({
      email: email.toLowerCase(),
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
      role,
      invitedBy: req.tenant.userId,
    });

    // Send invitation email
    try {
      await sendInvitationEmail(invitation.email, invitation.token, req.tenant.organizationId);
    } catch (emailError) {
      logger.warn(`Failed to send invitation email: ${emailError.message}`);
      logger.info(`Manually logging invitation token for testing: ${invitation.token}`);
    }

    logger.info(`Invitation created for ${email} by user ${req.tenant.userId}`);
    await createAuditLog(req, {
      action: 'invitation_sent',
      resource: 'invitation',
      resourceId: invitation._id.toString(),
      details: { email: invitation.email, role: invitation.role },
    });

    res.status(201).json({
      success: true,
      data: {
        invitation: {
          id: invitation._id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          createdAt: invitation.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error(`Create invitation error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get all invitations for organization
 * @route   GET /api/invitations
 * @access  Private (Owner/Admin only)
 */
export const getInvitations = async (req, res, next) => {
  try {
    // Role check handled by RBAC middleware
    const invitations = await Invitation.find({
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    })
      .populate('invitedBy', 'email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        invitations: invitations.map((inv) => ({
          id: inv._id,
          email: inv.email,
          role: inv.role,
          status: inv.status,
          invitedBy: inv.invitedBy ? { email: inv.invitedBy.email } : null,
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt,
        })),
        count: invitations.length,
      },
    });
  } catch (error) {
    logger.error(`Get invitations error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Accept invitation
 * @route   POST /api/invitations/:token/accept
 * @access  Public
 */
export const acceptInvitation = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body; // Password required if creating new account

    // Find invitation by token
    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Invalid invitation token',
        },
      });
    }

    // Check if invitation is valid
    if (!invitation.isValid()) {
      // Mark as expired if past expiry date
      if (invitation.expiresAt < new Date() && invitation.status === 'pending') {
        invitation.status = 'expired';
        await invitation.save();
      }

      return res.status(400).json({
        success: false,
        error: {
          message: 'Invitation has expired or is no longer valid',
        },
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email: invitation.email });

    if (user) {
      // User exists - check if already in this organization
      if (user.tenantId === invitation.tenantId) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'You are already a member of this organization',
          },
        });
      }

      // User exists but in different organization - add to this organization
      // For multi-tenant, we'll create a new user record (or handle differently)
      // For now, we'll return an error as users should be single-tenant
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email already registered. Please use a different email or contact support.',
        },
      });
    }

    // User doesn't exist - password is required
    if (!password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Password is required to create your account',
        },
      });
    }

    // Create new user
    user = await User.create({
      email: invitation.email,
      password,
      role: invitation.role,
      organizationId: invitation.organizationId,
      tenantId: invitation.tenantId,
    });

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    logger.info(`Invitation accepted by ${invitation.email} for organization ${invitation.organizationId}`);
    await createAuditLog(req, {
      action: 'invitation_accepted',
      resource: 'invitation',
      resourceId: invitation._id.toString(),
      userId: user._id,
      tenantId: invitation.tenantId,
      organizationId: invitation.organizationId.toString(),
      details: { email: invitation.email, role: invitation.role },
    });

    // Get organization
    const organization = await Organization.findById(invitation.organizationId);

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          role: user.role,
          organizationId: user.organizationId,
          tenantId: user.tenantId,
        },
        organization: {
          id: organization._id,
          name: organization.name,
          tenantId: organization.tenantId,
        },
      },
    });
  } catch (error) {
    logger.error(`Accept invitation error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Reject invitation
 * @route   POST /api/invitations/:token/reject
 * @access  Public
 */
export const rejectInvitation = async (req, res, next) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Invalid invitation token',
        },
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invitation is no longer pending',
        },
      });
    }

    invitation.status = 'rejected';
    await invitation.save();

    logger.info(`Invitation rejected for ${invitation.email}`);
    await createAuditLog(req, {
      action: 'invitation_rejected',
      resource: 'invitation',
      resourceId: invitation._id.toString(),
      userId: null,
      tenantId: invitation.tenantId,
      organizationId: invitation.organizationId.toString(),
      details: { email: invitation.email },
    });

    res.status(200).json({
      success: true,
      message: 'Invitation rejected',
    });
  } catch (error) {
    logger.error(`Reject invitation error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Cancel/Delete invitation
 * @route   DELETE /api/invitations/:id
 * @access  Private (Owner/Admin only)
 */
export const cancelInvitation = async (req, res, next) => {
  try {
    // Role check handled by RBAC middleware
    const { id } = req.params;

    const invitation = await Invitation.findOne({
      _id: id,
      organizationId: req.tenant.organizationId,
      tenantId: req.tenant.tenantId,
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Invitation not found',
        },
      });
    }

    if (invitation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Can only cancel pending invitations',
        },
      });
    }

    await invitation.deleteOne();

    logger.info(`Invitation cancelled: ${id} by user ${req.tenant.userId}`);
    await createAuditLog(req, {
      action: 'invitation_cancelled',
      resource: 'invitation',
      resourceId: id,
      details: { email: invitation.email },
    });

    res.status(200).json({
      success: true,
      message: 'Invitation cancelled successfully',
    });
  } catch (error) {
    logger.error(`Cancel invitation error: ${error.message}`);
    next(error);
  }
};
