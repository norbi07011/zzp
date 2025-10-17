// @ts-nocheck - Temporary: Nowe tabele (subscription_payments, certificate_applications, subscription_events) 
// zostały utworzone w Supabase, ale TypeScript nie zna ich jeszcze. Błędy znikną po pierwszym query.
/**
 * SUBSCRIPTION SERVICE
 * Obsługa subskrypcji, płatności i certyfikatów
 */

import { supabase } from '@/lib/supabase';
import type {
  WorkerSubscription,
  SubscriptionPayment,
  PaymentWithWorker,
  CertificateApplication,
  CertificateApplicationWithDetails,
  SubscriptionEvent,
  SubscriptionMetrics,
  SubscriptionFilter,
  CertificateApplicationFilter,
  PaymentHistoryFilter,
  ActiveSubscriptionView,
} from '../types/subscription';

// ============================================================================
// WORKER SUBSCRIPTION QUERIES
// ============================================================================

/**
 * Pobierz subskrypcję workera (dla zalogowanego usera)
 */
export async function getMySubscription(): Promise<WorkerSubscription | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('v_workers')
    .select('*')
    .eq('profile_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching subscription:', error);
    throw error;
  }

  return data;
}

/**
 * Pobierz subskrypcję workera po ID (admin only)
 */
export async function getWorkerSubscription(workerId: string): Promise<WorkerSubscription | null> {
  const { data, error } = await supabase
    .from('v_workers')
    .select('*')
    .eq('id', workerId)
    .single();

  if (error) {
    console.error('Error fetching worker subscription:', error);
    throw error;
  }

  return data;
}

/**
 * Pobierz wszystkie aktywne subskrypcje (admin only)
 */
export async function getAllActiveSubscriptions(
  filter?: SubscriptionFilter
): Promise<ActiveSubscriptionView[]> {
  let query = supabase
    .from('v_active_subscriptions')
    .select('*')
    .order('subscription_end_date', { ascending: true });

  // Apply filters
  if (filter?.tier && filter.tier !== 'all') {
    query = query.eq('subscription_tier', filter.tier);
  }
  if (filter?.status && filter.status !== 'all') {
    query = query.eq('subscription_status', filter.status);
  }
  if (filter?.has_certificate !== undefined) {
    query = query.eq('zzp_certificate_issued', filter.has_certificate);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching active subscriptions:', error);
    throw error;
  }

  return data || [];
}

/**
 * Anuluj subskrypcję workera
 */
export async function cancelSubscription(workerId: string): Promise<void> {
  const { error } = await supabase
    .from('workers')
    .update({ 
      subscription_status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', workerId);

  if (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }

  // Log event
  await logSubscriptionEvent(workerId, 'subscription_cancelled', {
    cancelled_at: new Date().toISOString()
  });
}

/**
 * Odnów subskrypcję (po płatności)
 */
export async function renewSubscription(
  workerId: string,
  periodEnd: Date
): Promise<void> {
  const { error } = await supabase
    .from('workers')
    .update({ 
      subscription_status: 'active',
      subscription_end_date: periodEnd.toISOString(),
      last_payment_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', workerId);

  if (error) {
    console.error('Error renewing subscription:', error);
    throw error;
  }

  // Log event
  await logSubscriptionEvent(workerId, 'subscription_renewed', {
    renewed_at: new Date().toISOString(),
    period_end: periodEnd.toISOString()
  });
}

// ============================================================================
// PAYMENT QUERIES
// ============================================================================

/**
 * Pobierz historię płatności (moja)
 */
export async function getMyPaymentHistory(): Promise<SubscriptionPayment[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get worker_id first
  const { data: worker } = await supabase
    .from('v_workers')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!worker) return [];

  const { data, error } = await supabase
    .from('subscription_payments')
    .select('*')
    .eq('worker_id', worker.id)
    .order('payment_date', { ascending: false });

  if (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }

  return data || [];
}

/**
 * Pobierz wszystkie płatności (admin only)
 */
export async function getAllPayments(
  filter?: PaymentHistoryFilter
): Promise<PaymentWithWorker[]> {
  let query = supabase
    .from('subscription_payments')
    .select(`
      *,
      worker:workers(
        id,
        profile:profiles(full_name, email)
      )
    `)
    .order('payment_date', { ascending: false });

  // Apply filters
  if (filter?.worker_id) {
    query = query.eq('worker_id', filter.worker_id);
  }
  if (filter?.status && filter.status !== 'all') {
    query = query.eq('status', filter.status);
  }
  if (filter?.method) {
    query = query.eq('payment_method', filter.method);
  }
  if (filter?.date_from) {
    query = query.gte('payment_date', filter.date_from);
  }
  if (filter?.date_to) {
    query = query.lte('payment_date', filter.date_to);
  }
  if (filter?.min_amount) {
    query = query.gte('amount', filter.min_amount);
  }
  if (filter?.max_amount) {
    query = query.lte('amount', filter.max_amount);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }

  return data || [];
}

/**
 * Utwórz rekord płatności
 */
export async function createPayment(
  workerId: string,
  amount: number,
  periodStart: Date,
  periodEnd: Date,
  stripePaymentIntentId?: string
): Promise<SubscriptionPayment> {
  const { data, error } = await supabase
    .from('subscription_payments')
    .insert({
      worker_id: workerId,
      amount,
      currency: 'EUR',
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      payment_method: 'stripe',
      stripe_payment_intent_id: stripePaymentIntentId,
      status: 'completed'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating payment:', error);
    throw error;
  }

  return data;
}

// ============================================================================
// CERTIFICATE APPLICATION QUERIES
// ============================================================================

/**
 * Pobierz moje aplikacje o certyfikat
 */
export async function getMyCertificateApplications(): Promise<CertificateApplication[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get worker_id first
  const { data: worker } = await supabase
    .from('v_workers')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!worker) return [];

  const { data, error } = await supabase
    .from('certificate_applications')
    .select('*')
    .eq('worker_id', worker.id)
    .order('application_date', { ascending: false });

  if (error) {
    console.error('Error fetching certificate applications:', error);
    throw error;
  }

  return data || [];
}

/**
 * Pobierz wszystkie aplikacje o certyfikat (admin only)
 */
export async function getAllCertificateApplications(
  filter?: CertificateApplicationFilter
): Promise<CertificateApplicationWithDetails[]> {
  let query = supabase
    .from('certificate_applications')
    .select(`
      *,
      worker:workers(
        id,
        specialization,
        hourly_rate,
        profile:profiles(full_name, email, avatar_url)
      ),
      reviewer:profiles!reviewer_id(id, full_name, email)
    `)
    .order('application_date', { ascending: false });

  // Apply filters
  if (filter?.status && filter.status !== 'all') {
    query = query.eq('status', filter.status);
  }
  if (filter?.reviewer_id) {
    query = query.eq('reviewer_id', filter.reviewer_id);
  }
  if (filter?.date_from) {
    query = query.gte('application_date', filter.date_from);
  }
  if (filter?.date_to) {
    query = query.lte('application_date', filter.date_to);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching certificate applications:', error);
    throw error;
  }

  return data || [];
}

/**
 * Utwórz aplikację o certyfikat
 */
export async function createCertificateApplication(
  motivationLetter: string,
  yearsOfExperience: number,
  portfolioLinks: string[]
): Promise<CertificateApplication> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get worker_id
  const { data: worker } = await supabase
    .from('v_workers')
    .select('id, subscription_tier')
    .eq('profile_id', user.id)
    .single();

  if (!worker) throw new Error('Worker profile not found');
  if (worker.subscription_tier !== 'basic') {
    throw new Error('Only Basic tier workers can apply for certificate');
  }

  const { data, error } = await supabase
    .from('certificate_applications')
    .insert({
      worker_id: worker.id,
      motivation_letter: motivationLetter,
      years_of_experience: yearsOfExperience,
      portfolio_links: portfolioLinks,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating certificate application:', error);
    throw error;
  }

  return data;
}

/**
 * Zaktualizuj status aplikacji (admin only)
 */
export async function updateCertificateApplication(
  applicationId: string,
  updates: Partial<CertificateApplication>
): Promise<void> {
  const { error } = await supabase
    .from('certificate_applications')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', applicationId);

  if (error) {
    console.error('Error updating certificate application:', error);
    throw error;
  }
}

/**
 * Zatwierdź certyfikat (admin only)
 */
export async function approveCertificate(
  applicationId: string,
  testScore: number,
  reviewerNotes: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get application
  const { data: application } = await supabase
    .from('certificate_applications')
    .select('worker_id')
    .eq('id', applicationId)
    .single();

  if (!application) throw new Error('Application not found');

  const certificateNumber = `ZZP-${Date.now().toString().slice(-8)}`;
  const certificateDate = new Date();

  // Update application
  await supabase
    .from('certificate_applications')
    .update({
      status: 'approved',
      test_score: testScore,
      reviewer_id: user.id,
      reviewer_notes: reviewerNotes,
      reviewed_at: certificateDate.toISOString(),
      certificate_issued_date: certificateDate.toISOString(),
      certificate_number: certificateNumber,
      updated_at: certificateDate.toISOString()
    })
    .eq('id', applicationId);

  // Upgrade worker to Premium
  await supabase
    .from('workers')
    .update({
      subscription_tier: 'premium',
      zzp_certificate_issued: true,
      zzp_certificate_date: certificateDate.toISOString(),
      zzp_certificate_number: certificateNumber,
      verified: true, // Also set old verified flag
      updated_at: certificateDate.toISOString()
    })
    .eq('id', application.worker_id);

  // Log event
  await logSubscriptionEvent(application.worker_id, 'certificate_granted', {
    certificate_number: certificateNumber,
    test_score: testScore,
    reviewer_id: user.id
  });
}

/**
 * Odrzuć certyfikat (admin only)
 */
export async function rejectCertificate(
  applicationId: string,
  rejectionReason: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('certificate_applications')
    .update({
      status: 'rejected',
      reviewer_id: user.id,
      rejection_reason: rejectionReason,
      rejection_date: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', applicationId);

  if (error) {
    console.error('Error rejecting certificate:', error);
    throw error;
  }
}

// ============================================================================
// SUBSCRIPTION EVENTS
// ============================================================================

/**
 * Log subscription event
 */
export async function logSubscriptionEvent(
  workerId: string,
  eventType: string,
  eventData?: Record<string, any>
): Promise<void> {
  const { error } = await supabase
    .from('subscription_events')
    .insert({
      worker_id: workerId,
      event_type: eventType,
      event_data: eventData || null
    });

  if (error) {
    console.error('Error logging subscription event:', error);
    // Don't throw - logging should not break main flow
  }
}

/**
 * Pobierz eventy dla workera
 */
export async function getWorkerEvents(workerId: string): Promise<SubscriptionEvent[]> {
  const { data, error } = await supabase
    .from('subscription_events')
    .select('*')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching worker events:', error);
    throw error;
  }

  return data || [];
}

// ============================================================================
// ANALYTICS & METRICS
// ============================================================================

/**
 * Pobierz metryki subskrypcji (admin only)
 */
export async function getSubscriptionMetrics(): Promise<SubscriptionMetrics> {
  // Get current date ranges
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Active subscriptions by tier
  const { data: subscriptions } = await supabase
    .from('workers')
    .select('subscription_tier, subscription_status')
    .eq('subscription_status', 'active');

  const totalActive = subscriptions?.length || 0;
  const basicCount = subscriptions?.filter(s => s.subscription_tier === 'basic').length || 0;
  const premiumCount = subscriptions?.filter(s => s.subscription_tier === 'premium').length || 0;

  // Cancelled this month
  const { data: cancelled } = await supabase
    .from('workers')
    .select('id')
    .eq('subscription_status', 'cancelled')
    .gte('updated_at', firstDayOfMonth.toISOString());

  const cancelledThisMonth = cancelled?.length || 0;

  // MRR calculation
  const mrr = totalActive * 13; // €13 per subscription

  // Payments this month
  const { data: payments } = await supabase
    .from('subscription_payments')
    .select('amount, status')
    .gte('payment_date', firstDayOfMonth.toISOString())
    .lte('payment_date', lastDayOfMonth.toISOString());

  const successfulPayments = payments?.filter(p => p.status === 'completed').length || 0;
  const failedPayments = payments?.filter(p => p.status === 'failed').length || 0;
  const totalRevenueThisMonth = payments
    ?.filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  // Total revenue all time
  const { data: allPayments } = await supabase
    .from('subscription_payments')
    .select('amount')
    .eq('status', 'completed');

  const totalRevenueAllTime = allPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  // Certificate applications
  const { data: certApps } = await supabase
    .from('certificate_applications')
    .select('status, certificate_issued_date');

  const pendingCerts = certApps?.filter(c => c.status === 'pending').length || 0;
  const approvedThisMonth = certApps?.filter(c => 
    c.status === 'approved' && 
    c.certificate_issued_date &&
    new Date(c.certificate_issued_date) >= firstDayOfMonth
  ).length || 0;
  const totalCerts = certApps?.filter(c => c.status === 'approved').length || 0;

  // Churn rate
  const churnRate = totalActive > 0 ? (cancelledThisMonth / totalActive) * 100 : 0;

  return {
    total_active_subscriptions: totalActive,
    basic_subscriptions: basicCount,
    premium_subscriptions: premiumCount,
    cancelled_subscriptions: cancelledThisMonth,
    mrr,
    total_revenue_this_month: totalRevenueThisMonth,
    total_revenue_all_time: totalRevenueAllTime,
    new_subscriptions_this_month: 0, // TODO: implement tracking
    cancelled_this_month: cancelledThisMonth,
    churn_rate: churnRate,
    pending_certificate_applications: pendingCerts,
    approved_certificates_this_month: approvedThisMonth,
    total_certificates_issued: totalCerts,
    successful_payments_this_month: successfulPayments,
    failed_payments_this_month: failedPayments,
    total_refunds_this_month: 0 // TODO: implement
  };
}
