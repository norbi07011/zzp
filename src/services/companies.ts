// @ts-nocheck
/**
 * Companies Service - Supabase Integration
 * Manages employer/company profiles, subscriptions, and business data
 * 
 * Database Schema (companies table):
 * - id: uuid (primary key)
 * - user_id: uuid (foreign key to auth.users)
 * - company_name: text
 * - company_nip: text (Tax ID)
 * - company_regon: text (Business Registry Number)
 * - company_address: text
 * - company_city: text
 * - company_postal_code: text
 * - company_country: text (default: 'Poland')
 * - industry: text
 * - company_size: text (1-10, 11-50, 51-200, 201-500, 500+)
 * - website: text
 * - description: text
 * - logo_url: text
 * - contact_person: text
 * - contact_email: text
 * - contact_phone: text
 * - subscription_plan: text (free, basic, premium, enterprise)
 * - subscription_status: text (active, inactive, trial, cancelled, expired)
 * - subscription_start_date: date
 * - subscription_end_date: date
 * - monthly_fee: decimal
 * - workers_limit: integer
 * - active_workers_count: integer
 * - total_appointments: integer
 * - total_spent: decimal
 * - is_verified: boolean
 * - verification_date: timestamp
 * - notes: text
 * - tags: text[] (array)
 * - created_at: timestamp
 * - updated_at: timestamp
 */

import { supabase } from '@/lib/supabase';

export type SubscriptionPlan = 'free' | 'basic' | 'premium' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'trial' | 'cancelled' | 'expired';
export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+';

export interface Company {
  id: string;
  user_id: string;
  company_name: string;
  company_nip?: string;
  company_regon?: string;
  company_address?: string;
  company_city?: string;
  company_postal_code?: string;
  company_country: string;
  industry?: string;
  company_size?: CompanySize;
  website?: string;
  description?: string;
  logo_url?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  subscription_start_date?: string;
  subscription_end_date?: string;
  monthly_fee: number;
  workers_limit: number;
  active_workers_count: number;
  total_appointments: number;
  total_spent: number;
  is_verified: boolean;
  verification_date?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    id: string;
    email: string;
    profile?: {
      full_name?: string;
      avatar_url?: string;
    };
  };
}

export interface CompanyStats {
  total: number;
  active: number;
  trial: number;
  inactive: number;
  verified: number;
  byPlan: {
    free: number;
    basic: number;
    premium: number;
    enterprise: number;
  };
  totalRevenue: number;
  averageWorkers: number;
  newThisMonth: number;
  churnRate: number;
}

/**
 * Fetch all companies with optional filters
 */
export async function fetchAllCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      user:user_id (
        id,
        email,
        profile:profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching companies:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch company by ID
 */
export async function fetchCompanyById(id: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      user:user_id (
        id,
        email,
        profile:profiles (
          full_name,
          avatar_url
        )
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching company:', error);
    return null;
  }

  return data;
}

/**
 * Fetch companies by subscription plan
 */
export async function fetchCompaniesByPlan(plan: SubscriptionPlan): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('subscription_plan', plan)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching companies by plan:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch companies by subscription status
 */
export async function fetchCompaniesByStatus(status: SubscriptionStatus): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('subscription_status', status)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching companies by status:', error);
    throw error;
  }

  return data || [];
}

/**
 * Create new company
 */
export async function createCompany(companyData: Partial<Company>): Promise<boolean> {
  const { error } = await supabase
    .from('companies')
    .insert([{
      ...companyData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]);

  if (error) {
    console.error('Error creating company:', error);
    return false;
  }

  return true;
}

/**
 * Update company
 */
export async function updateCompany(id: string, updates: Partial<Company>): Promise<boolean> {
  const { error } = await supabase
    .from('companies')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating company:', error);
    return false;
  }

  return true;
}

/**
 * Delete company
 */
export async function deleteCompany(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting company:', error);
    return false;
  }

  return true;
}

/**
 * Verify company
 */
export async function verifyCompany(id: string): Promise<boolean> {
  return await updateCompany(id, {
    is_verified: true,
    verification_date: new Date().toISOString()
  });
}

/**
 * Unverify company
 */
export async function unverifyCompany(id: string): Promise<boolean> {
  return await updateCompany(id, {
    is_verified: false,
    verification_date: null
  });
}

/**
 * Update subscription plan
 */
export async function updateSubscriptionPlan(
  id: string,
  plan: SubscriptionPlan,
  monthlyFee: number,
  workersLimit: number
): Promise<boolean> {
  return await updateCompany(id, {
    subscription_plan: plan,
    monthly_fee: monthlyFee,
    workers_limit: workersLimit
  });
}

/**
 * Update subscription status
 */
export async function updateSubscriptionStatus(
  id: string,
  status: SubscriptionStatus
): Promise<boolean> {
  const updates: Partial<Company> = {
    subscription_status: status
  };

  // If activating, set start date
  if (status === 'active' || status === 'trial') {
    updates.subscription_start_date = new Date().toISOString();
  }

  // If cancelling/expiring, set end date
  if (status === 'cancelled' || status === 'expired') {
    updates.subscription_end_date = new Date().toISOString();
  }

  return await updateCompany(id, updates);
}

/**
 * Extend subscription
 */
export async function extendSubscription(id: string, months: number): Promise<boolean> {
  const company = await fetchCompanyById(id);
  if (!company) return false;

  const endDate = new Date(company.subscription_end_date || new Date());
  endDate.setMonth(endDate.getMonth() + months);

  return await updateCompany(id, {
    subscription_end_date: endDate.toISOString(),
    subscription_status: 'active'
  });
}

/**
 * Add tags to company
 */
export async function addCompanyTags(id: string, newTags: string[]): Promise<boolean> {
  const company = await fetchCompanyById(id);
  if (!company) return false;

  const existingTags = company.tags || [];
  const uniqueTags = Array.from(new Set([...existingTags, ...newTags]));

  return await updateCompany(id, { tags: uniqueTags });
}

/**
 * Remove tags from company
 */
export async function removeCompanyTags(id: string, tagsToRemove: string[]): Promise<boolean> {
  const company = await fetchCompanyById(id);
  if (!company) return false;

  const existingTags = company.tags || [];
  const filteredTags = existingTags.filter(tag => !tagsToRemove.includes(tag));

  return await updateCompany(id, { tags: filteredTags });
}

/**
 * Search companies
 */
export async function searchCompanies(query: string): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .or(`company_name.ilike.%${query}%,company_nip.ilike.%${query}%,contact_email.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching companies:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get company statistics
 */
export async function getCompanyStats(): Promise<CompanyStats> {
  const companies = await fetchAllCompanies();

  const now = new Date();
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  const stats: CompanyStats = {
    total: companies.length,
    active: companies.filter(c => c.subscription_status === 'active').length,
    trial: companies.filter(c => c.subscription_status === 'trial').length,
    inactive: companies.filter(c => c.subscription_status === 'inactive').length,
    verified: companies.filter(c => c.is_verified).length,
    byPlan: {
      free: companies.filter(c => c.subscription_plan === 'free').length,
      basic: companies.filter(c => c.subscription_plan === 'basic').length,
      premium: companies.filter(c => c.subscription_plan === 'premium').length,
      enterprise: companies.filter(c => c.subscription_plan === 'enterprise').length,
    },
    totalRevenue: companies.reduce((sum, c) => sum + c.total_spent, 0),
    averageWorkers: companies.length > 0 
      ? companies.reduce((sum, c) => sum + c.active_workers_count, 0) / companies.length 
      : 0,
    newThisMonth: companies.filter(c => new Date(c.created_at) > monthAgo).length,
    churnRate: 0 // Calculate based on cancellations
  };

  return stats;
}

/**
 * Get top spending companies
 */
export async function getTopSpendingCompanies(limit: number = 10): Promise<Company[]> {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('total_spent', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top spending companies:', error);
    throw error;
  }

  return data || [];
}

/**
 * Get companies expiring soon (within 30 days)
 */
export async function getCompaniesExpiringSoon(): Promise<Company[]> {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 30);

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('subscription_status', 'active')
    .lte('subscription_end_date', thirtyDaysFromNow.toISOString())
    .gte('subscription_end_date', now.toISOString())
    .order('subscription_end_date', { ascending: true });

  if (error) {
    console.error('Error fetching expiring companies:', error);
    throw error;
  }

  return data || [];
}

/**
 * Bulk update companies
 */
export async function bulkUpdateCompanies(
  ids: string[],
  updates: Partial<Company>
): Promise<boolean> {
  const { error } = await supabase
    .from('companies')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .in('id', ids);

  if (error) {
    console.error('Error bulk updating companies:', error);
    return false;
  }

  return true;
}
