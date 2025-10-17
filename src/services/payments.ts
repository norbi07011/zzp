// @ts-nocheck
/**
 * Payments Service - Supabase Integration
 * Manages transactions, invoices, subscriptions, refunds
 * 
 * Database Schema (payments table):
 * - id: uuid (primary key)
 * - user_id: uuid (payer)
 * - company_id: uuid (if company payment)
 * - amount: numeric (payment amount)
 * - currency: text (EUR, PLN, USD)
 * - status: enum (pending, completed, failed, refunded)
 * - payment_method: enum (card, bank_transfer, paypal, stripe)
 * - transaction_id: text (external payment ID)
 * - description: text
 * - invoice_number: text
 * - invoice_url: text
 * - payment_date: timestamp
 * - due_date: timestamp
 * - refund_amount: numeric
 * - refund_reason: text
 * - metadata: jsonb (extra data)
 * - created_at, updated_at: timestamp
 */

import { supabase } from '@/lib/supabase';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
export type PaymentMethod = 'card' | 'bank_transfer' | 'paypal' | 'stripe' | 'cash';
export type Currency = 'EUR' | 'PLN' | 'USD' | 'GBP';

export interface Payment {
  id: string;
  user_id: string;
  company_id?: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  payment_method: PaymentMethod;
  transaction_id?: string;
  description?: string;
  invoice_number?: string;
  invoice_url?: string;
  payment_date?: string;
  due_date?: string;
  refund_amount?: number;
  refund_reason?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
  company?: {
    id: string;
    company_name: string;
  };
}

export interface PaymentStats {
  total: number;
  completed: number;
  pending: number;
  failed: number;
  refunded: number;
  totalRevenue: number;
  totalRefunded: number;
  revenueThisMonth: number;
  revenueThisWeek: number;
  averagePayment: number;
}

// Fetch all payments
export async function fetchAllPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      user:user_id (id, email, full_name),
      company:company_id (id, company_name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Payment[];
}

// Fetch payment by ID
export async function fetchPaymentById(id: string) {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      user:user_id (id, email, full_name),
      company:company_id (id, company_name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Payment;
}

// Fetch payments by user
export async function fetchPaymentsByUser(userId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Payment[];
}

// Fetch payments by company
export async function fetchPaymentsByCompany(companyId: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Payment[];
}

// Fetch payments by status
export async function fetchPaymentsByStatus(status: PaymentStatus) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Payment[];
}

// Create new payment
export async function createPayment(paymentData: Partial<Payment>) {
  const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  const { data, error } = await supabase
    .from('payments')
    .insert([{
      ...paymentData,
      invoice_number: invoiceNumber,
      status: paymentData.status || 'pending'
    }])
    .select()
    .single();

  if (error) throw error;
  return data as Payment;
}

// Update payment
export async function updatePayment(id: string, updates: Partial<Payment>) {
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Payment;
}

// Delete payment
export async function deletePayment(id: string) {
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Complete payment
export async function completePayment(id: string, transactionId?: string) {
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      status: 'completed',
      payment_date: new Date().toISOString(),
      transaction_id: transactionId
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Payment;
}

// Fail payment
export async function failPayment(id: string, reason?: string) {
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      status: 'failed',
      metadata: { failure_reason: reason }
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Payment;
}

// Refund payment
export async function refundPayment(id: string, amount: number, reason: string) {
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      status: 'refunded',
      refund_amount: amount,
      refund_reason: reason
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Payment;
}

// Generate invoice
export async function generateInvoice(paymentId: string) {
  // This would integrate with invoice generation service
  const invoiceUrl = `https://invoices.example.com/${paymentId}.pdf`;
  
  const { data, error } = await supabase
    .from('payments')
    .update({ invoice_url: invoiceUrl })
    .eq('id', paymentId)
    .select()
    .single();

  if (error) throw error;
  return data as Payment;
}

// Get payment statistics
export async function getPaymentStats() {
  const { data: payments, error } = await supabase
    .from('payments')
    .select('*');

  if (error) throw error;

  const stats: PaymentStats = {
    total: payments.length,
    completed: payments.filter(p => p.status === 'completed').length,
    pending: payments.filter(p => p.status === 'pending').length,
    failed: payments.filter(p => p.status === 'failed').length,
    refunded: payments.filter(p => p.status === 'refunded').length,
    totalRevenue: 0,
    totalRefunded: 0,
    revenueThisMonth: 0,
    revenueThisWeek: 0,
    averagePayment: 0
  };

  const completedPayments = payments.filter(p => p.status === 'completed');
  stats.totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  stats.totalRefunded = payments
    .filter(p => p.status === 'refunded')
    .reduce((sum, p) => sum + (p.refund_amount || 0), 0);

  // Calculate time-based revenue
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  stats.revenueThisWeek = completedPayments
    .filter(p => new Date(p.created_at) >= weekAgo)
    .reduce((sum, p) => sum + p.amount, 0);

  stats.revenueThisMonth = completedPayments
    .filter(p => new Date(p.created_at) >= monthAgo)
    .reduce((sum, p) => sum + p.amount, 0);

  stats.averagePayment = completedPayments.length > 0
    ? stats.totalRevenue / completedPayments.length
    : 0;

  return stats;
}

// Search payments
export async function searchPayments(query: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .or(`invoice_number.ilike.%${query}%,transaction_id.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Payment[];
}

// Get revenue by date range
export async function getRevenueByDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('payments')
    .select('amount, payment_date, currency')
    .eq('status', 'completed')
    .gte('payment_date', startDate)
    .lte('payment_date', endDate)
    .order('payment_date', { ascending: true });

  if (error) throw error;

  return data.reduce((acc, payment) => {
    const date = payment.payment_date.split('T')[0];
    if (!acc[date]) acc[date] = 0;
    acc[date] += payment.amount;
    return acc;
  }, {} as Record<string, number>);
}

// Get top paying customers
export async function getTopPayingCustomers(limit: number = 10) {
  const { data, error } = await supabase
    .from('payments')
    .select('user_id, amount, user:user_id (email, full_name)')
    .eq('status', 'completed')
    .order('amount', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

// Bulk process payments
export async function bulkProcessPayments(paymentIds: string[], status: PaymentStatus) {
  const { data, error } = await supabase
    .from('payments')
    .update({ status, payment_date: new Date().toISOString() })
    .in('id', paymentIds)
    .select();

  if (error) throw error;
  return data as Payment[];
}
