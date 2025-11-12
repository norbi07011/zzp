// @ts-nocheck
/**
 * Payment Service
 * Managing subscriptions, transactions, invoices
 *
 * TIER 1 FIX: Integrated with invoice_invoices and workers tables
 * Database: invoice_invoices (faktury €100-€666), workers (subscriptions €13-€25/month)
 */

import { supabase } from "@/lib/supabase";

export interface Subscription {
  id: string;
  worker_id: string;
  worker_name: string;
  monthly_fee: number;
  subscription_tier: "basic" | "premium";
  subscription_status: "active" | "cancelled" | "expired" | "trial";
  subscription_start_date: string;
  subscription_end_date?: string;
  last_payment_date?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}

export interface Transaction {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total_gross: number; // €100-€666
  total_net: number;
  total_vat: number;
  status: "unpaid" | "partial" | "paid" | "cancelled";
  payment_date?: string;
  client_name?: string;
  user_name?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  client_id: string;
  client_snapshot: any;
  language: "pl" | "nl" | "en";
  status: "unpaid" | "partial" | "paid" | "cancelled";
  total_net: number;
  total_vat: number;
  total_gross: number;
  paid_amount: number;
  payment_date?: string;
  payment_reference?: string;
  is_reverse_charge: boolean;
  notes?: string;
  footer_text?: string;
  template_name?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  btw_rate: number;
  total: number;
}

export interface PaymentFilters {
  status?: string[];
  date_from?: string;
  date_to?: string;
  company_id?: string;
  worker_id?: string;
  min_amount?: number;
  max_amount?: number;
}
/**
 * Get all worker subscriptions
 * Database: workers table (monthly_fee €13-€25)
 */
export async function getSubscriptions(
  filters?: PaymentFilters
): Promise<Subscription[]> {
  let query = supabase
    .from("workers")
    .select(
      `
      id,
      profile_id,
      monthly_fee,
      subscription_tier,
      subscription_status,
      subscription_start_date,
      subscription_end_date,
      last_payment_date,
      stripe_subscription_id,
      stripe_customer_id,
      profiles!workers_profile_id_fkey(full_name)
    `
    )
    .order("subscription_start_date", { ascending: false });

  if (filters?.status && filters.status.length > 0) {
    query = query.in("subscription_status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ Error loading subscriptions:", error);
    throw error;
  }

  const subscriptions: Subscription[] = (data || []).map((worker) => ({
    id: worker.id,
    worker_id: worker.profile_id,
    worker_name: worker.profiles?.full_name || "Unknown",
    monthly_fee: parseFloat(worker.monthly_fee || "13"),
    subscription_tier: worker.subscription_tier,
    subscription_status: worker.subscription_status,
    subscription_start_date: worker.subscription_start_date,
    subscription_end_date: worker.subscription_end_date,
    last_payment_date: worker.last_payment_date,
    stripe_subscription_id: worker.stripe_subscription_id,
    stripe_customer_id: worker.stripe_customer_id,
  }));

  console.log("💳 SUBSCRIPTIONS DEBUG:", {
    count: subscriptions.length,
    subscriptions,
  });
  return subscriptions;
}

/**
 * Update worker subscription status
 */
export async function updateSubscriptionStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from("workers")
    .update({
      subscription_status: status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cancel worker subscription
 */
export async function cancelSubscription(
  id: string,
  immediately: boolean = false
) {
  const updateData: any = {
    subscription_status: immediately ? "cancelled" : "active",
    updated_at: new Date().toISOString(),
  };

  if (immediately) {
    updateData.subscription_end_date = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("workers")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all transactions (invoices)
 * Database: invoice_invoices table (€100-€666 transactions)
 */
export async function getTransactions(
  filters?: PaymentFilters
): Promise<Transaction[]> {
  let query = supabase
    .from("invoice_invoices")
    .select(
      `
      id,
      invoice_number,
      invoice_date,
      due_date,
      total_gross,
      total_net,
      total_vat,
      status,
      payment_date,
      client_id,
      user_id,
      client_snapshot,
      profiles!invoice_invoices_user_id_fkey(full_name)
    `
    )
    .order("invoice_date", { ascending: false });

  if (filters?.status && filters.status.length > 0) {
    query = query.in("status", filters.status);
  }

  if (filters?.date_from) {
    query = query.gte("invoice_date", filters.date_from);
  }

  if (filters?.date_to) {
    query = query.lte("invoice_date", filters.date_to);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ Error loading transactions:", error);
    throw error;
  }

  const transactions: Transaction[] = (data || []).map((invoice) => ({
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    invoice_date: invoice.invoice_date,
    due_date: invoice.due_date,
    total_gross: parseFloat(invoice.total_gross),
    total_net: parseFloat(invoice.total_net),
    total_vat: parseFloat(invoice.total_vat),
    status: invoice.status,
    payment_date: invoice.payment_date,
    client_name: invoice.client_snapshot?.name || "Unknown",
    user_name: invoice.profiles?.full_name || "Unknown",
  }));

  console.log("💸 TRANSACTIONS DEBUG:", {
    count: transactions.length,
    totalAmount: transactions
      .reduce((sum, t) => sum + t.total_gross, 0)
      .toFixed(2),
  });
  return transactions;
}

/**
 * Get transaction by ID (invoice details)
 */
export async function getTransactionById(
  id: string
): Promise<Transaction | null> {
  const { data, error } = await supabase
    .from("invoice_invoices")
    .select(
      `
      id,
      invoice_number,
      invoice_date,
      due_date,
      total_gross,
      total_net,
      total_vat,
      status,
      payment_date,
      client_snapshot,
      profiles!invoice_invoices_user_id_fkey(full_name)
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("❌ Error loading transaction:", error);
    return null;
  }

  return {
    id: data.id,
    invoice_number: data.invoice_number,
    invoice_date: data.invoice_date,
    due_date: data.due_date,
    total_gross: parseFloat(data.total_gross),
    total_net: parseFloat(data.total_net),
    total_vat: parseFloat(data.total_vat),
    status: data.status,
    payment_date: data.payment_date,
    client_name: data.client_snapshot?.name || "Unknown",
    user_name: data.profiles?.full_name || "Unknown",
  };
}

/**
 * Update transaction (invoice) status
 */
export async function updateTransactionStatus(id: string, status: string) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "paid") {
    updateData.payment_date = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("invoice_invoices")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get payment statistics from invoices and subscriptions
 */
export async function getPaymentStats(
  period: "today" | "week" | "month" | "year" = "month"
) {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case "week":
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case "month":
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case "year":
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
  }

  // Get invoice stats (€100-€666 transactions)
  const { data: invoices, error: invoiceError } = await supabase
    .from("invoice_invoices")
    .select("total_gross, status, invoice_date")
    .gte("invoice_date", startDate.toISOString());

  if (invoiceError) {
    console.error("❌ Error loading invoice stats:", invoiceError);
  }

  // Get subscription stats (€13-€25 monthly)
  const { data: subscriptions, error: subError } = await supabase
    .from("workers")
    .select("monthly_fee, subscription_status")
    .eq("subscription_status", "active");

  if (subError) {
    console.error("❌ Error loading subscription stats:", subError);
  }

  const stats = {
    total_revenue: 0,
    paid_invoices: 0,
    unpaid_invoices: 0,
    cancelled_invoices: 0,
    total_invoices: invoices?.length || 0,
    active_subscriptions: subscriptions?.length || 0,
    monthly_recurring_revenue: 0,
    total_transactions: (invoices?.length || 0) + (subscriptions?.length || 0),
  };

  // Calculate invoice stats
  invoices?.forEach((invoice: any) => {
    const amount = parseFloat(invoice.total_gross);
    if (invoice.status === "paid") {
      stats.total_revenue += amount;
      stats.paid_invoices++;
    } else if (invoice.status === "unpaid" || invoice.status === "partial") {
      stats.unpaid_invoices++;
    } else if (invoice.status === "cancelled") {
      stats.cancelled_invoices++;
    }
  });

  // Calculate MRR from active subscriptions
  subscriptions?.forEach((sub: any) => {
    stats.monthly_recurring_revenue += parseFloat(sub.monthly_fee || "13");
  });

  console.log("📊 PAYMENT STATS DEBUG:", stats);
  return stats;
}

/**
 * Get all invoices
 */
export async function getInvoices(filters?: {
  status?: string;
  company_id?: string;
}) {
  let query = supabase
    .from("invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.company_id) {
    query = query.eq("company_id", filters.company_id);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Invoice[];
}

/**
 * Get invoice by ID
 */
export async function getInvoiceById(id: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Invoice;
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(
  id: string,
  status: Invoice["status"]
) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "paid") {
    updateData.payment_date = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("invoices")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Format amount as currency (€ 13,00)
 */
export function formatAmount(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: currency,
  }).format(amount);
}

/**
 * Calculate BTW (21%)
 */
export function calculateBTW(amountExclBTW: number): number {
  return Math.round(amountExclBTW * 0.21);
}
