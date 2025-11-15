// =====================================================
// PAYMENTS SERVICE - Unified Payment Management
// =====================================================
// Handles: worker subscriptions, employer subscriptions,
// worker earnings, invoice payments, refunds

// @ts-nocheck - Temporary: Waiting for Supabase types regeneration
import { supabase } from "../lib/supabase";

// =====================================================
// TYPES
// =====================================================

export type PaymentType =
  | "worker_subscription"
  | "employer_subscription"
  | "worker_earning"
  | "invoice_payment"
  | "refund";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled";

export type PaymentMethod =
  | "stripe_card"
  | "stripe_ideal"
  | "stripe_sepa"
  | "bank_transfer"
  | "cash"
  | "paypal"
  | "other";

export interface Payment {
  id: string;
  user_id: string;
  profile_id?: string;

  // Payment details
  payment_type: PaymentType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: PaymentMethod;

  // Stripe
  stripe_payment_intent_id?: string;
}

export interface PaymentStats {
  total_revenue: number; // Całkowity przychód (completed)
  pending_amount: number; // Oczekujące
  refunded_amount: number; // Zwroty
  total_count: number; // Wszystkie płatności

  // Breakdown by type
  worker_subscriptions: number;
  employer_subscriptions: number;
  worker_earnings: number;
  invoice_payments: number;

  // Breakdown by status
  completed_count: number;
  pending_count: number;
  failed_count: number;
  refunded_count: number;

  // Recent trends
  revenue_this_month: number;
  revenue_last_month: number;
  payments_this_month: number;
  payments_last_month: number;
}

// =====================================================
// FETCH OPERATIONS
// =====================================================

/**
 * Fetch all payments (admin only)
 */
export async function fetchAllPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching payments:", error);
    throw new Error(`Błąd pobierania płatności: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch payments by user ID
 */
export async function fetchPaymentsByUser(userId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching user payments:", error);
    throw new Error(`Błąd pobierania płatności użytkownika: ${error.message}`);
  }

  return data || [];
}

/**
 * Fetch payments by company (for employers)
 */
export async function fetchPaymentsByCompany(
  companyId: string
): Promise<Payment[]> {
  // Assuming company_id is stored in metadata
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .contains("metadata", { company_id: companyId })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching company payments:", error);
    throw new Error(`Błąd pobierania płatności firmy: ${error.message}`);
  }

  return data || [];
}

/**
 * Search payments by query (invoice number, user email, description)
 */
export async function searchPayments(query: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .or(
      `invoice_number.ilike.%${query}%,description.ilike.%${query}%,stripe_payment_intent_id.ilike.%${query}%`
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error searching payments:", error);
    throw new Error(`Błąd wyszukiwania płatności: ${error.message}`);
  }

  return data || [];
}

/**
 * Get payment statistics (for admin dashboard)
 */
export async function getPaymentStats(): Promise<PaymentStats> {
  try {
    // Fetch all payments
    const { data: allPayments, error: allError } = await supabase
      .from("payments")
      .select("amount, status, payment_type, created_at, refund_amount");

    if (allError) throw allError;

    const payments = allPayments || [];

    // Calculate totals
    const completedPayments = payments.filter((p) => p.status === "completed");
    const pendingPayments = payments.filter((p) => p.status === "pending");
    const refundedPayments = payments.filter((p) => p.status === "refunded");

    const total_revenue = completedPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const pending_amount = pendingPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const refunded_amount = refundedPayments.reduce(
      (sum, p) => sum + Number(p.refund_amount || 0),
      0
    );

    // Breakdown by type
    const worker_subscriptions = completedPayments
      .filter((p) => p.payment_type === "worker_subscription")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const employer_subscriptions = completedPayments
      .filter((p) => p.payment_type === "employer_subscription")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const worker_earnings = completedPayments
      .filter((p) => p.payment_type === "worker_earning")
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const invoice_payments = completedPayments
      .filter((p) => p.payment_type === "invoice_payment")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // This month vs last month
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonthPayments = completedPayments.filter(
      (p) => new Date(p.created_at) >= thisMonthStart
    );
    const lastMonthPayments = completedPayments.filter(
      (p) =>
        new Date(p.created_at) >= lastMonthStart &&
        new Date(p.created_at) <= lastMonthEnd
    );

    const revenue_this_month = thisMonthPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );
    const revenue_last_month = lastMonthPayments.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    );

    return {
      total_revenue,
      pending_amount,
      refunded_amount,
      total_count: payments.length,

      worker_subscriptions,
      employer_subscriptions,
      worker_earnings,
      invoice_payments,

      completed_count: completedPayments.length,
      pending_count: pendingPayments.length,
      failed_count: payments.filter((p) => p.status === "failed").length,
      refunded_count: refundedPayments.length,

      revenue_this_month,
      revenue_last_month,
      payments_this_month: thisMonthPayments.length,
      payments_last_month: lastMonthPayments.length,
    };
  } catch (error: any) {
    console.error("Error calculating payment stats:", error);
    throw new Error(`Błąd obliczania statystyk: ${error.message}`);
  }
}

// =====================================================
// CREATE / UPDATE OPERATIONS
// =====================================================

/**
 * Create a new payment
 */
export async function createPayment(
  paymentData: Partial<Payment>
): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .insert([
      {
        ...paymentData,
        status: paymentData.status || "pending",
        currency: paymentData.currency || "EUR",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating payment:", error);
    throw new Error(`Błąd tworzenia płatności: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing payment
 */
export async function updatePayment(
  id: string,
  updates: Partial<Payment>
): Promise<Payment> {
  const { data, error } = await supabase
    .from("payments")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating payment:", error);
    throw new Error(`Błąd aktualizacji płatności: ${error.message}`);
  }

  return data;
}

/**
 * Delete a payment
 */
export async function deletePayment(id: string): Promise<void> {
  const { error } = await supabase.from("payments").delete().eq("id", id);

  if (error) {
    console.error("Error deleting payment:", error);
    throw new Error(`Błąd usuwania płatności: ${error.message}`);
  }
}

// =====================================================
// PAYMENT LIFECYCLE OPERATIONS
// =====================================================

/**
 * Mark payment as completed
 */
export async function completePayment(
  id: string,
  transactionId: string
): Promise<Payment> {
  return updatePayment(id, {
    status: "completed",
    stripe_payment_intent_id: transactionId,
    completed_at: new Date().toISOString(),
    payment_date: new Date().toISOString(),
  });
}

/**
 * Mark payment as failed
 */
export async function failPayment(
  id: string,
  reason: string
): Promise<Payment> {
  return updatePayment(id, {
    status: "failed",
    failure_reason: reason,
    failed_at: new Date().toISOString(),
  });
}

/**
 * Process a refund
 */
export async function refundPayment(
  id: string,
  amount: number,
  reason: string
): Promise<Payment> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return updatePayment(id, {
    status: "refunded",
    refund_amount: amount,
    refund_reason: reason,
    refunded_at: new Date().toISOString(),
    refunded_by: user?.id,
  });
}

/**
 * Generate invoice for payment
 */
export async function generateInvoice(id: string): Promise<Payment> {
  // Generate invoice number (simple format: INV-YYYYMMDD-XXXX)
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const invoiceNumber = `INV-${dateStr}-${randomStr}`;

  return updatePayment(id, {
    invoice_generated: true,
    invoice_number: invoiceNumber,
    // invoice_url would be generated by separate invoice service
  });
}

// =====================================================
// EXPORT OPERATIONS
// =====================================================

/**
 * Export payments to CSV
 */
export async function exportPaymentsToCSV(): Promise<Blob> {
  const payments = await fetchAllPayments();

  const headers = [
    "ID",
    "Data",
    "Typ",
    "Kwota",
    "Waluta",
    "Status",
    "Metoda",
    "Opis",
  ];

  const rows = payments.map((p) => [
    p.id,
    new Date(p.created_at).toLocaleString("pl-PL"),
    p.payment_type,
    p.amount.toFixed(2),
    p.currency,
    p.status,
    p.payment_method || "N/A",
    p.description || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
}

// Get top paying customers
export async function getTopPayingCustomers(limit: number = 10) {
  const { data, error } = await supabase
    .from("payments")
    .select("user_id, amount, user:user_id (email, full_name)")
    .eq("status", "completed")
    .order("amount", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Bulk process payments
export async function bulkProcessPayments(
  paymentIds: string[],
  status: PaymentStatus
) {
  const { data, error } = await supabase
    .from("payments")
    .update({ status, payment_date: new Date().toISOString() })
    .in("id", paymentIds)
    .select();

  if (error) throw error;
  return data as Payment[];
}
