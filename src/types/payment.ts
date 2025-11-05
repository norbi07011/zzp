// Temporary payment types to fix compilation errors
export interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
}

export interface BTWCalculation {
  subtotal: number;
  btw_amount: number;
  total: number;
}

export function calculateBTW(amount: number): BTWCalculation {
  const btw_amount = amount * 0.21;
  return {
    subtotal: amount,
    btw_amount,
    total: amount + btw_amount
  };
}

// Additional types needed by components/Payment/index.ts
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
}

export interface Payout {
  id: string;
  amount: number;
  status: string;
  arrival_date: string;
}