import Subscription from '../models/Subscription.js';
import Organization from '../models/Organization.js';
import {
  createCustomer,
  createCheckoutSession,
  createPortalSession,
  constructWebhookEvent,
  isStripeConfigured,
} from '../services/billingService.js';
import logger from '../utils/logger.js';

// Plan definitions (would typically be in config or DB)
const PLANS = {
  free: {
    name: 'Free',
    priceId: null,
    limits: { maxUsers: 5, maxProjects: 3, maxStorage: 104857600 },
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRICE_ID_PRO || 'price_mock_pro',
    limits: { maxUsers: 50, maxProjects: 100, maxStorage: 10737418240 },
  },
};

/**
 * @desc    Get current subscription
 * @route   GET /api/billing/current
 * @access  Private (Owner/Admin)
 */
export const getCurrentSubscription = async (req, res, next) => {
  try {
    let subscription = await Subscription.findOne({
      organizationId: req.tenant.organizationId,
    });

    // If no subscription exists, create a default free one
    if (!subscription) {
      subscription = await Subscription.create({
        organizationId: req.tenant.organizationId,
        tenantId: req.tenant.tenantId,
        plan: 'free',
        status: 'active',
        limits: PLANS.free.limits,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        subscription,
        plans: PLANS,
      },
    });
  } catch (error) {
    logger.error(`Get subscription error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Create checkout session for subscription
 * @route   POST /api/billing/subscribe
 * @access  Private (Owner)
 */
export const createSubscription = async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!PLANS[plan]) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid plan selected' },
      });
    }

    if (plan === 'free') {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot subscribe to free plan via checkout' },
      });
    }

    let subscription = await Subscription.findOne({
      organizationId: req.tenant.organizationId,
    });

    if (!subscription) {
      subscription = await Subscription.create({
        organizationId: req.tenant.organizationId,
        tenantId: req.tenant.tenantId,
        plan: 'free',
        limits: PLANS.free.limits,
      });
    }

    // Create Stripe customer if not exists
    if (!subscription.stripeCustomerId) {
      const organization = await Organization.findById(req.tenant.organizationId);
      const customer = await createCustomer(
        req.user.email,
        organization.name,
        {
          organizationId: req.tenant.organizationId.toString(),
          tenantId: req.tenant.tenantId,
        }
      );
      
      subscription.stripeCustomerId = customer.id;
      await subscription.save();
    }

    // Create checkout session
    const session = await createCheckoutSession({
      customerId: subscription.stripeCustomerId,
      priceId: PLANS[plan].priceId,
      successUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing`,
      metadata: {
        organizationId: req.tenant.organizationId.toString(),
        plan,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        url: session.url,
      },
    });
  } catch (error) {
    logger.error(`Create subscription error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Get customer portal URL
 * @route   GET /api/billing/portal
 * @access  Private (Owner)
 */
export const getBillingPortal = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      organizationId: req.tenant.organizationId,
    });

    if (!subscription || !subscription.stripeCustomerId) {
      return res.status(400).json({
        success: false,
        error: { message: 'No billing account found' },
      });
    }

    const session = await createPortalSession(
      subscription.stripeCustomerId,
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing`
    );

    res.status(200).json({
      success: true,
      data: {
        url: session.url,
      },
    });
  } catch (error) {
    logger.error(`Get billing portal error: ${error.message}`);
    next(error);
  }
};

/**
 * @desc    Stripe Webhook Handler
 * @route   POST /api/billing/webhook
 * @access  Public
 */
export const handleWebhook = async (req, res) => {
  if (!isStripeConfigured()) {
    // If mocking, we might want a manual way to trigger updates, but for now ignore real webhooks
    return res.status(200).json({ received: true, mock: true });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = constructWebhookEvent(req.body, sig);
  } catch (err) {
    logger.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      default:
        // logger.info(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error(`Webhook handler error: ${error.message}`);
    res.status(500).send('Webhook handler error');
  }
};

// --- Webhook Helpers ---

const handleCheckoutCompleted = async (session) => {
  const { organizationId, plan } = session.metadata;
  
  if (!organizationId) return;

  await Subscription.findOneAndUpdate(
    { organizationId },
    {
      stripeSubscriptionId: session.subscription,
      stripeCustomerId: session.customer,
      plan: plan,
      status: 'active',
      limits: PLANS[plan].limits,
    }
  );
  
  logger.info(`Subscription activated for org ${organizationId}`);
};

const handleSubscriptionUpdated = async (subscription) => {
  // Find subscription by stripe ID
  const dbSub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
  if (!dbSub) return;

  dbSub.status = subscription.status;
  dbSub.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  dbSub.cancelAtPeriodEnd = subscription.cancel_at_period_end;
  
  await dbSub.save();
  logger.info(`Subscription updated for org ${dbSub.organizationId}`);
};

const handleSubscriptionDeleted = async (subscription) => {
  const dbSub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
  if (!dbSub) return;

  dbSub.status = 'canceled';
  dbSub.plan = 'free';
  dbSub.limits = PLANS.free.limits;
  
  await dbSub.save();
  logger.info(`Subscription canceled for org ${dbSub.organizationId}`);
};
