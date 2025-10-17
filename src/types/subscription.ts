/**
 * TYPY DLA SYSTEMU ABONAMENTOWEGO
 * Utworzono: 2025-10-10
 * Wersja: 1.0
 */

// ============================================================================
// SUBSCRIPTION TYPES
// ============================================================================

export type SubscriptionTier = 'basic' | 'premium';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export type PaymentMethod = 'stripe' | 'ideal' | 'card' | 'bank_transfer';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface WorkerSubscription {
  // IDs
  id: string;
  profile_id: string;
  
  // Subscription details
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
  last_payment_date: string | null;
  monthly_fee: number;
  
  // Stripe integration
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  
  // Certificate (Premium only)
  zzp_certificate_issued: boolean;
  zzp_certificate_date: string | null;
  zzp_certificate_number: string | null;
  zzp_certificate_expires_at: string | null;
  
  // Existing worker fields
  verified: boolean;
  rating: number | null;
  certifications: string[] | null;
  hourly_rate: number | null;
  specialization: string | null;
  skills: string[] | null;
  portfolio: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// PAYMENT TYPES
// ============================================================================

export interface SubscriptionPayment {
  id: string;
  worker_id: string;
  
  // Payment details
  amount: number;
  currency: string;
  payment_date: string;
  period_start: string;
  period_end: string;
  
  // Payment method
  payment_method: PaymentMethod | null;
  
  // Stripe integration
  stripe_payment_intent_id: string | null;
  stripe_invoice_id: string | null;
  stripe_charge_id: string | null;
  
  // Status
  status: PaymentStatus;
  
  // Metadata
  invoice_url: string | null;
  receipt_url: string | null;
  failure_reason: string | null;
  refund_reason: string | null;
  refunded_at: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PaymentWithWorker extends SubscriptionPayment {
  worker?: {
    id: string;
    profile: {
      full_name: string;
      email: string;
    };
  };
}

// ============================================================================
// CERTIFICATE APPLICATION TYPES
// ============================================================================

export type CertificateApplicationStatus = 
  | 'pending'      // Nowa aplikacja
  | 'scheduled'    // Spotkanie umówione
  | 'testing'      // W trakcie testu
  | 'approved'     // Zatwierdzony
  | 'rejected';    // Odrzucony

export interface CertificateApplication {
  id: string;
  worker_id: string;
  
  // Application status
  status: CertificateApplicationStatus;
  
  // Dates
  application_date: string;
  meeting_scheduled_date: string | null;
  meeting_completed_date: string | null;
  
  // Test results
  test_score: number | null;
  test_completed_date: string | null;
  test_details: Record<string, any> | null;
  
  // Review
  reviewer_id: string | null;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  
  // Certificate
  certificate_issued_date: string | null;
  certificate_number: string | null;
  certificate_pdf_url: string | null;
  
  // Rejection details
  rejection_reason: string | null;
  rejection_date: string | null;
  
  // Worker application details
  motivation_letter: string | null;
  years_of_experience: number | null;
  portfolio_links: string[] | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface CertificateApplicationWithDetails extends CertificateApplication {
  worker?: {
    id: string;
    specialization: string | null;
    hourly_rate: number | null;
    profile: {
      full_name: string;
      email: string;
      avatar_url: string | null;
    };
  };
  reviewer?: {
    id: string;
    full_name: string;
    email: string;
  };
}

// ============================================================================
// SUBSCRIPTION EVENT TYPES
// ============================================================================

export type SubscriptionEventType =
  | 'subscription_created'
  | 'subscription_renewed'
  | 'subscription_cancelled'
  | 'subscription_expired'
  | 'subscription_upgraded'   // Basic → Premium
  | 'subscription_downgraded' // Premium → Basic
  | 'payment_succeeded'
  | 'payment_failed'
  | 'certificate_granted'
  | 'certificate_revoked';

export interface SubscriptionEvent {
  id: string;
  worker_id: string;
  event_type: SubscriptionEventType;
  event_data: Record<string, any> | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

// ============================================================================
// STRIPE TYPES
// ============================================================================

export interface StripeCheckoutSession {
  sessionId: string;
  url: string;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  metadata: {
    worker_id: string;
    profile_id: string;
  };
}

export interface StripeSubscription {
  id: string;
  customer: string;
  status: 'active' | 'canceled' | 'incomplete' | 'past_due' | 'trialing';
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
}

// ============================================================================
// DASHBOARD ANALYTICS TYPES
// ============================================================================

export interface SubscriptionMetrics {
  // Counts
  total_active_subscriptions: number;
  basic_subscriptions: number;
  premium_subscriptions: number;
  cancelled_subscriptions: number;
  
  // Revenue
  mrr: number; // Monthly Recurring Revenue
  total_revenue_this_month: number;
  total_revenue_all_time: number;
  
  // Growth
  new_subscriptions_this_month: number;
  cancelled_this_month: number;
  churn_rate: number; // %
  
  // Certificates
  pending_certificate_applications: number;
  approved_certificates_this_month: number;
  total_certificates_issued: number;
  
  // Payments
  successful_payments_this_month: number;
  failed_payments_this_month: number;
  total_refunds_this_month: number;
}

export interface SubscriptionChartData {
  date: string;
  basic_count: number;
  premium_count: number;
  revenue: number;
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface WorkerRegistrationForm {
  // Auth
  email: string;
  password: string;
  
  // Profile
  full_name: string;
  phone: string;
  
  // Worker details
  specialization: string;
  hourly_rate: number | null;
  years_of_experience: number;
  
  // Payment
  accept_terms: boolean;
  subscribe_newsletter: boolean;
}

export interface CertificateApplicationForm {
  motivation_letter: string;
  years_of_experience: number;
  portfolio_links: string[];
  preferred_meeting_dates: string[];
}

export interface CertificateReviewForm {
  test_score: number;
  reviewer_notes: string;
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============================================================================
// VIEW TYPES
// ============================================================================

export interface ActiveSubscriptionView {
  worker_id: string;
  full_name: string;
  email: string;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  subscription_start_date: string;
  subscription_end_date: string;
  monthly_fee: number;
  zzp_certificate_issued: boolean;
  zzp_certificate_number: string | null;
  days_until_renewal: number;
  total_payments: number;
  total_paid: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SubscriptionFilter = {
  tier?: SubscriptionTier | 'all';
  status?: SubscriptionStatus | 'all';
  has_certificate?: boolean;
  payment_status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
};

export type CertificateApplicationFilter = {
  status?: CertificateApplicationStatus | 'all';
  reviewer_id?: string;
  date_from?: string;
  date_to?: string;
};

export type PaymentHistoryFilter = {
  worker_id?: string;
  status?: PaymentStatus | 'all';
  method?: PaymentMethod;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
};
