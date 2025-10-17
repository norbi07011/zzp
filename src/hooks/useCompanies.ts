// @ts-nocheck
/**
 * useCompanies Hook
 * Custom React hook for managing company data with Supabase
 */

import { useState, useEffect, useMemo } from 'react';
import {
  fetchAllCompanies,
  fetchCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  verifyCompany,
  unverifyCompany,
  updateSubscriptionPlan,
  updateSubscriptionStatus,
  extendSubscription,
  addCompanyTags,
  removeCompanyTags,
  searchCompanies,
  getCompanyStats,
  getTopSpendingCompanies,
  getCompaniesExpiringSoon,
  bulkUpdateCompanies,
  type Company,
  type CompanyStats,
  type SubscriptionPlan,
  type SubscriptionStatus
} from '../services/companies';

export function useCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [stats, setStats] = useState<CompanyStats>({
    total: 0,
    active: 0,
    trial: 0,
    inactive: 0,
    verified: 0,
    byPlan: { free: 0, basic: 0, premium: 0, enterprise: 0 },
    totalRevenue: 0,
    averageWorkers: 0,
    newThisMonth: 0,
    churnRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all companies
  const refreshCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllCompanies();
      setCompanies(data);

      // Fetch stats
      const statsData = await getCompanyStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
      console.error('Error in useCompanies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    refreshCompanies();
  }, []);

  // Computed properties
  const activeCompanies = useMemo(() => {
    return companies.filter(c => c.subscription_status === 'active');
  }, [companies]);

  const trialCompanies = useMemo(() => {
    return companies.filter(c => c.subscription_status === 'trial');
  }, [companies]);

  const inactiveCompanies = useMemo(() => {
    return companies.filter(c => c.subscription_status === 'inactive');
  }, [companies]);

  const verifiedCompanies = useMemo(() => {
    return companies.filter(c => c.is_verified);
  }, [companies]);

  const unverifiedCompanies = useMemo(() => {
    return companies.filter(c => !c.is_verified);
  }, [companies]);

  const premiumCompanies = useMemo(() => {
    return companies.filter(c => c.subscription_plan === 'premium' || c.subscription_plan === 'enterprise');
  }, [companies]);

  const companiesExpiringSoon = useMemo(() => {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return companies.filter(c => {
      if (!c.subscription_end_date || c.subscription_status !== 'active') return false;
      const endDate = new Date(c.subscription_end_date);
      return endDate >= now && endDate <= thirtyDaysFromNow;
    });
  }, [companies]);

  // CRUD Operations
  const create = async (companyData: Partial<Company>): Promise<boolean> => {
    const success = await createCompany(companyData);
    if (success) {
      await refreshCompanies();
    }
    return success;
  };

  const update = async (id: string, updates: Partial<Company>): Promise<boolean> => {
    const success = await updateCompany(id, updates);
    if (success) {
      await refreshCompanies();
    }
    return success;
  };

  const remove = async (id: string): Promise<boolean> => {
    const success = await deleteCompany(id);
    if (success) {
      await refreshCompanies();
    }
    return success;
  };

  const verify = async (id: string): Promise<boolean> => {
    const success = await verifyCompany(id);
    if (success) {
      await refreshCompanies();
    }
    return success;
  };

  const unverify = async (id: string): Promise<boolean> => {
    const success = await unverifyCompany(id);
    if (success) {
      await refreshCompanies();
    }
    return success;
  };

  const changePlan = async (
    id: string,
    plan: SubscriptionPlan,
    monthlyFee: number,
    workersLimit: number
  ): Promise<boolean> => {
    const success = await updateSubscriptionPlan(id, plan, monthlyFee, workersLimit);
    if (success) {
      await refreshCompanies();
    }
    return success;
  };

  const changeStatus = async (
    id: string,
    status: SubscriptionStatus
  ): Promise<boolean> => {
    const success = await updateSubscriptionStatus(id, status);
    if (success) {
      await refreshCompanies();
    }
    return success;
  };

  const extend = async (id: string, months: number): Promise<boolean> => {
    const success = await extendSubscription(id, months);
    if (success) {
      await refreshCompanies();
    }
    return success;
  };

  const addTags = async (id: string, tags: string[]): Promise<boolean> => {
    const success = await addCompanyTags(id, tags);
    if (success) {
      await refreshCompanies();
    }
    return success;
  };

  const removeTags = async (id: string, tags: string[]): Promise<boolean> => {
    const success = await removeCompanyTags(id, tags);
    if (success) {
      await refreshCompanies();
    }
    return success;
  };

  const search = async (query: string): Promise<Company[]> => {
    return await searchCompanies(query);
  };

  const getById = async (id: string): Promise<Company | null> => {
    return await fetchCompanyById(id);
  };

  const getTopSpending = async (limit: number = 10): Promise<Company[]> => {
    return await getTopSpendingCompanies(limit);
  };

  const getExpiring = async (): Promise<Company[]> => {
    return await getCompaniesExpiringSoon();
  };

  const bulkUpdate = async (ids: string[], updates: Partial<Company>): Promise<boolean> => {
    const success = await bulkUpdateCompanies(ids, updates);
    if (success) {
      await refreshCompanies();
    }
    return success;
  };

  return {
    // Data
    companies,
    activeCompanies,
    trialCompanies,
    inactiveCompanies,
    verifiedCompanies,
    unverifiedCompanies,
    premiumCompanies,
    companiesExpiringSoon,
    stats,

    // State
    loading,
    error,

    // Methods
    refreshCompanies,
    create,
    update,
    remove,
    verify,
    unverify,
    changePlan,
    changeStatus,
    extend,
    addTags,
    removeTags,
    search,
    getById,
    getTopSpending,
    getExpiring,
    bulkUpdate
  };
}
