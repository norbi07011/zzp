// ===================================
// PAYMENT TYPES - Dutch Market
// ===================================

import type { Stripe } from '@stripe/stripe-js';

// ===================================
// SUBSCRIPTION TYPES
// ===================================

export type SubscriptionTier = 'basic' | 'premium' | 'enterprise';

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name_nl: string;
  name_en: string;
  price_monthly_excl_btw: number; // Prijs exclusief BTW
  price_yearly_excl_btw: number;
  btw_percentage: number; // Standard 21% in Netherlands
  price_monthly_incl_btw: number; // Berekend automatisch
  price_yearly_incl_btw: number;
  stripe_price_id_monthly?: string;
  stripe_price_id_yearly?: string;
  features: {
    max_job_posts: number;
    max_applications: number;
    featured_listings: number;
    analytics: boolean;
    priority_support: boolean;
    api_access: boolean;
    custom_branding: boolean;
    dedicated_account_manager: boolean;
  };
  recommended?: boolean;
}

export interface Subscription {
  id: string;
  company_id: string;
  plan_id: string;
  stripe_subscription_id: string;
  stripe_customer_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: Date;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  created_at: Date;
  updated_at: Date;
  trial_end?: Date;
  canceled_at?: Date;
}

// ===================================
// TRANSACTION TYPES (Worker Payments)
// ===================================

export interface Transaction {
  id: string;
  job_id: string;
  company_id: string;
  worker_id: string;
  amount_excl_btw: number;
  btw_amount: number;
  amount_incl_btw: number;
  platform_fee_percentage: number; // e.g., 5%
  platform_fee_amount: number;
  worker_receives: number; // Amount after platform fee
  stripe_payment_intent_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method: 'ideal' | 'credit_card' | 'sepa_debit' | 'bancontact';
  invoice_id?: string;
  created_at: Date;
  completed_at?: Date;
  refunded_at?: Date;
  metadata?: Record<string, unknown>;
}

// ===================================
// INVOICE TYPES (Dutch Factuur)
// ===================================

export interface Invoice {
  id: string;
  invoice_number: string; // Format: 2025-0001
  company_id: string;
  company_name: string;
  company_kvk: string;
  company_btw: string; // BTW nummer
  company_address: string;
  worker_id?: string;
  worker_name?: string;
  worker_kvk?: string;
  worker_btw?: string;
  invoice_date: Date;
  due_date: Date;
  payment_date?: Date;
  items: InvoiceItem[];
  subtotal_excl_btw: number;
  btw_amount: number;
  total_incl_btw: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
  payment_terms_days: number; // Usually 14 or 30 days
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price_excl_btw: number;
  btw_percentage: number;
  total_excl_btw: number;
  btw_amount: number;
  total_incl_btw: number;
}

// ===================================
// PAYMENT METHOD TYPES
// ===================================

export interface PaymentMethod {
  id: string;
  company_id: string;
  stripe_payment_method_id: string;
  type: 'ideal' | 'credit_card' | 'sepa_debit' | 'bancontact';
  is_default: boolean;
  last_four?: string;
  bank_name?: string; // For iDEAL
  card_brand?: string; // For credit cards
  expiry_month?: number;
  expiry_year?: number;
  created_at: Date;
}

// ===================================
// PAYOUT TYPES (Worker Payouts)
// ===================================

export interface Payout {
  id: string;
  worker_id: string;
  amount: number;
  stripe_payout_id?: string;
  iban: string;
  status: 'pending' | 'in_transit' | 'paid' | 'failed' | 'canceled';
  arrival_date?: Date;
  created_at: Date;
  completed_at?: Date;
  failure_reason?: string;
}

// ===================================
// STRIPE WEBHOOK TYPES
// ===================================

export interface StripeWebhookEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}

// ===================================
// BTW (VAT) CALCULATION HELPERS
// ===================================

export interface BTWCalculation {
  amount_excl_btw: number;
  btw_percentage: number;
  btw_amount: number;
  amount_incl_btw: number;
}

export const calculateBTW = (
  amountExclBTW: number,
  btwPercentage: number = 21
): BTWCalculation => {
  const btw_amount = Math.round((amountExclBTW * btwPercentage) / 100);
  return {
    amount_excl_btw: amountExclBTW,
    btw_percentage: btwPercentage,
    btw_amount,
    amount_incl_btw: amountExclBTW + btw_amount,
  };
};

export const calculateFromInclBTW = (
  amountInclBTW: number,
  btwPercentage: number = 21
): BTWCalculation => {
  const amount_excl_btw = Math.round(
    (amountInclBTW * 100) / (100 + btwPercentage)
  );
  const btw_amount = amountInclBTW - amount_excl_btw;
  return {
    amount_excl_btw,
    btw_percentage: btwPercentage,
    btw_amount,
    amount_incl_btw: amountInclBTW,
  };
};

// ===================================
// PAYMENT SERVICE RESPONSES
// ===================================

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export interface SubscriptionCheckoutResponse {
  sessionId: string;
  url: string;
}

export interface PaymentError {
  code: string;
  message: string;
  type: 'validation_error' | 'api_error' | 'authentication_error';
}
