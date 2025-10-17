// @ts-nocheck
/**
 * Payment Service
 * Managing subscriptions, transactions, invoices
 */

import { supabase } from '@/lib/supabase';

export interface Subscription {
  id: string;
  company_id: string;
  plan_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id: string;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete' | 'trialing';
  billing_cycle: 'monthly' | 'yearly';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  canceled_at?: string;
  created_at: string;
  updated_at: string;
  company?: {
    id: string;
    name: string;
    kvk_number?: string;
  };
}

export interface Transaction {
  id: string;
  job_id: string;
  company_id: string;
  worker_id: string;
  amount_excl_btw: number;
  btw_amount: number;
  amount_incl_btw: number;
  platform_fee_percentage: number;
  platform_fee_amount: number;
  worker_receives: number;
  stripe_payment_intent_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  payment_method?: string;
  invoice_id?: string;
  metadata?: any;
  created_at: string;
  completed_at?: string;
  refunded_at?: string;
  job?: {
    title: string;
  };
  company?: {
    name: string;
  };
  worker?: {
    first_name: string;
    last_name: string;
  };
}

export interface Invoice {
  id: string;
  invoice_number: string;
  company_id: string;
  company_name: string;
  company_kvk: string;
  company_btw?: string;
  company_address: string;
  worker_id?: string;
  worker_name?: string;
  worker_kvk?: string;
  worker_btw?: string;
  invoice_date: string;
  due_date: string;
  payment_date?: string;
  items: InvoiceItem[];
  subtotal_excl_btw: number;
  btw_amount: number;
  total_incl_btw: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
  payment_terms_days: number;
  notes?: string;
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
 * Get all subscriptions with optional filters
 */
export async function getSubscriptions(filters?: { status?: string; company_id?: string }) {
  let query = supabase
    .from('subscriptions')
    .select(`
      *,
      company:companies!subscriptions_company_id_fkey(id, name, kvk_number)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.company_id) {
    query = query.eq('company_id', filters.company_id);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Subscription[];
}

/**
 * Get subscription by ID
 */
export async function getSubscriptionById(id: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select(`
      *,
      company:companies!subscriptions_company_id_fkey(id, name, kvk_number, email)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Subscription;
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(id: string, status: Subscription['status']) {
  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(id: string, immediately: boolean = false) {
  const updateData: any = {
    cancel_at_period_end: !immediately,
    updated_at: new Date().toISOString()
  };

  if (immediately) {
    updateData.status = 'canceled';
    updateData.canceled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all transactions with filters
 */
export async function getTransactions(filters?: PaymentFilters) {
  let query = supabase
    .from('transactions')
    .select(`
      *,
      job:jobs!transactions_job_id_fkey(title),
      company:companies!transactions_company_id_fkey(name),
      worker:workers!transactions_worker_id_fkey(first_name, last_name)
    `)
    .order('created_at', { ascending: false });

  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }

  if (filters?.date_from) {
    query = query.gte('created_at', filters.date_from);
  }

  if (filters?.date_to) {
    query = query.lte('created_at', filters.date_to);
  }

  if (filters?.company_id) {
    query = query.eq('company_id', filters.company_id);
  }

  if (filters?.worker_id) {
    query = query.eq('worker_id', filters.worker_id);
  }

  if (filters?.min_amount) {
    query = query.gte('amount_incl_btw', filters.min_amount * 100);
  }

  if (filters?.max_amount) {
    query = query.lte('amount_incl_btw', filters.max_amount * 100);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Transaction[];
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(id: string) {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      job:jobs!transactions_job_id_fkey(id, title, description),
      company:companies!transactions_company_id_fkey(id, name, email),
      worker:workers!transactions_worker_id_fkey(id, first_name, last_name, email)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Transaction;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(id: string, status: Transaction['status']) {
  const updateData: any = {
    status
  };

  if (status === 'completed') {
    updateData.completed_at = new Date().toISOString();
  }

  if (status === 'refunded') {
    updateData.refunded_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(period: 'today' | 'week' | 'month' | 'year' = 'month') {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
    case 'year':
      startDate = new Date(now.setFullYear(now.getFullYear() - 1));
      break;
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('amount_incl_btw, status, created_at')
    .gte('created_at', startDate.toISOString());

  if (error) throw error;

  const stats = {
    total_revenue: 0,
    completed_transactions: 0,
    pending_transactions: 0,
    failed_transactions: 0,
    refunded_transactions: 0,
    total_transactions: data?.length || 0
  };

  data?.forEach((transaction: any) => {
    if (transaction.status === 'completed') {
      stats.total_revenue += transaction.amount_incl_btw;
      stats.completed_transactions++;
    } else if (transaction.status === 'pending') {
      stats.pending_transactions++;
    } else if (transaction.status === 'failed') {
      stats.failed_transactions++;
    } else if (transaction.status === 'refunded') {
      stats.refunded_transactions++;
    }
  });

  return stats;
}

/**
 * Get all invoices
 */
export async function getInvoices(filters?: { status?: string; company_id?: string }) {
  let query = supabase
    .from('invoices')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.company_id) {
    query = query.eq('company_id', filters.company_id);
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
    .from('invoices')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Invoice;
}

/**
 * Update invoice status
 */
export async function updateInvoiceStatus(id: string, status: Invoice['status']) {
  const updateData: any = {
    status,
    updated_at: new Date().toISOString()
  };

  if (status === 'paid') {
    updateData.payment_date = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Format amount (cents to euros)
 */
export function formatAmount(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * Calculate BTW (21%)
 */
export function calculateBTW(amountExclBTW: number): number {
  return Math.round(amountExclBTW * 0.21);
}
