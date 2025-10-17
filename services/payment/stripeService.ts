// ===================================
// STRIPE SERVICE - Dutch Market Integration
// ===================================

import { loadStripe, Stripe } from '@stripe/stripe-js';
import type {
  SubscriptionPlan,
  Transaction,
  PaymentIntentResponse,
  SubscriptionCheckoutResponse,
  BTWCalculation,
} from '@/types/payment';
import { calculateBTW } from '@/types/payment';

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;

const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('❌ Stripe publishable key not found');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// ===================================
// SUBSCRIPTION PLANS (Dutch Market)
// ===================================

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    tier: 'basic',
    name_nl: 'Basis',
    name_en: 'Basic',
    price_monthly_excl_btw: 1300, // €13 excl. BTW
    price_yearly_excl_btw: 13000, // €130 excl. BTW (10 months price)
    btw_percentage: 21,
    price_monthly_incl_btw: 1573, // €15.73 incl. BTW
    price_yearly_incl_btw: 15730, // €157.30 incl. BTW
    features: {
      max_job_posts: 5,
      max_applications: 50,
      featured_listings: 0,
      analytics: false,
      priority_support: false,
      api_access: false,
      custom_branding: false,
      dedicated_account_manager: false,
    },
  },
  {
    id: 'premium',
    tier: 'premium',
    name_nl: 'Premium',
    name_en: 'Premium',
    price_monthly_excl_btw: 2500, // €25 excl. BTW
    price_yearly_excl_btw: 25000, // €250 excl. BTW (10 months price)
    btw_percentage: 21,
    price_monthly_incl_btw: 3025, // €30.25 incl. BTW
    price_yearly_incl_btw: 30250, // €302.50 incl. BTW
    features: {
      max_job_posts: 20,
      max_applications: 200,
      featured_listings: 5,
      analytics: true,
      priority_support: true,
      api_access: false,
      custom_branding: false,
      dedicated_account_manager: false,
    },
    recommended: true,
  },
];

// ===================================
// SUBSCRIPTION METHODS
// ===================================

export class StripeService {
  private stripe: Stripe | null = null;

  async initialize() {
    this.stripe = await getStripe();
    return this.stripe !== null;
  }

  /**
   * Create Stripe Checkout Session for Subscription
   */
  async createSubscriptionCheckout(
    planId: string,
    billingCycle: 'monthly' | 'yearly',
    companyId: string,
    companyEmail: string
  ): Promise<SubscriptionCheckoutResponse> {
    try {
      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
      if (!plan) {
        throw new Error('Invalid plan selected');
      }

      // Call your backend API to create Stripe Checkout Session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
          companyId,
          companyEmail,
          priceId:
            billingCycle === 'monthly'
              ? plan.stripe_price_id_monthly
              : plan.stripe_price_id_yearly,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Subscription checkout error:', error);
      throw error;
    }
  }

  /**
   * Redirect to Stripe Checkout (using window.location for modern Stripe)
   */
  async redirectToCheckout(sessionUrl: string): Promise<void> {
    // Modern Stripe uses direct URL redirect from Checkout Session
    window.location.href = sessionUrl;
  }

  /**
   * Create Payment Intent for Worker Payment
   */
  async createWorkerPaymentIntent(
    jobId: string,
    companyId: string,
    workerId: string,
    amountExclBTW: number,
    platformFeePercentage: number = 5
  ): Promise<PaymentIntentResponse> {
    try {
      // Calculate BTW
      const btwCalc = calculateBTW(amountExclBTW);

      // Calculate platform fee
      const platformFeeAmount = Math.round(
        (btwCalc.amount_incl_btw * platformFeePercentage) / 100
      );

      const response = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          companyId,
          workerId,
          amount: btwCalc.amount_incl_btw,
          platformFee: platformFeeAmount,
          currency: 'eur',
          paymentMethodTypes: ['ideal', 'card', 'sepa_debit'],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Payment intent error:', error);
      throw error;
    }
  }

  /**
   * Confirm Card Payment
   */
  async confirmCardPayment(
    clientSecret: string,
    paymentMethodId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe) {
      await this.initialize();
    }

    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    try {
      const result = await this.stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId,
      });

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Card payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Setup iDEAL Payment (Dutch payment method)
   */
  async setupIdealPayment(
    clientSecret: string,
    bank: string,
    returnUrl: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.stripe) {
      await this.initialize();
    }

    if (!this.stripe) {
      throw new Error('Stripe not initialized');
    }

    try {
      const result = await this.stripe.confirmIdealPayment(clientSecret, {
        payment_method: {
          ideal: {
            bank,
          },
        },
        return_url: returnUrl,
      });

      if (result.error) {
        return { success: false, error: result.error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('❌ iDEAL payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get Customer Portal URL
   */
  async getCustomerPortalUrl(customerId: string): Promise<string> {
    try {
      const response = await fetch('/api/stripe/customer-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      });

      if (!response.ok) {
        throw new Error('Failed to get portal URL');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('❌ Customer portal error:', error);
      throw error;
    }
  }

  /**
   * Cancel Subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<void> {
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, cancelAtPeriodEnd }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('❌ Cancel subscription error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const stripeService = new StripeService();

// Export utility functions
export { calculateBTW };
export type { SubscriptionPlan, Transaction };
