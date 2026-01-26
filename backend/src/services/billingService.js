import Stripe from 'stripe';
import logger from '../utils/logger.js';

// Initialize Stripe if key is present
const stripe = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('test_your_stripe')
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * Check if Stripe is configured
 */
export const isStripeConfigured = () => {
  return !!stripe;
};

/**
 * Create a Stripe customer
 */
export const createCustomer = async (email, name, metadata) => {
  if (!stripe) {
    logger.info('Mocking Stripe createCustomer');
    return { id: `cus_mock_${Date.now()}` };
  }

  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata,
    });
    return customer;
  } catch (error) {
    logger.error(`Stripe createCustomer error: ${error.message}`);
    throw error;
  }
};

/**
 * Create a checkout session for subscription
 */
export const createCheckoutSession = async ({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
  metadata,
}) => {
  if (!stripe) {
    logger.info('Mocking Stripe createCheckoutSession');
    return {
      id: `cs_mock_${Date.now()}`,
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing/success?session_id=mock_session`,
    };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
    return session;
  } catch (error) {
    logger.error(`Stripe createCheckoutSession error: ${error.message}`);
    throw error;
  }
};

/**
 * Create a billing portal session
 */
export const createPortalSession = async (customerId, returnUrl) => {
  if (!stripe) {
    logger.info('Mocking Stripe createPortalSession');
    return {
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing`,
    };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session;
  } catch (error) {
    logger.error(`Stripe createPortalSession error: ${error.message}`);
    throw error;
  }
};

/**
 * Construct webhook event
 */
export const constructWebhookEvent = (payload, signature) => {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    logger.error(`Stripe webhook signature error: ${error.message}`);
    throw error;
  }
};
