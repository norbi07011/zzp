// @ts-nocheck
/**
 * EmployerManagementPage
 * Admin panel for managing companies/employers
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Company {
  id: string;
  user_id: string;
  name: string;
  kvk_number?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  industry?: string;
  employee_count?: string;
  is_verified?: boolean;
  is_premium?: boolean;
  subscription_plan?: string;
  created_at: string;
  active_jobs_count?: number;
}

export const EmployerManagementPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    is_verified: '',
    is_premium: '',
    subscription_plan: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    premium: 0,
    active_jobs: 0
  });

  useEffect(() => {
    loadCompanies();
  }, [filters]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('companies')
        .select(`
          *,
          jobs:jobs(count)
        `)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,kvk_number.ilike.%${filters.search}%`);
      }

      if (filters.is_verified) {
        query = query.eq('is_verified', filters.is_verified === 'true');
      }

      if (filters.is_premium) {
        query = query.eq('is_premium', filters.is_premium === 'true');
      }

      if (filters.subscription_plan) {
        query = query.eq('subscription_plan', filters.subscription_plan);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate stats
      const total = data?.length || 0;
      const verified = data?.filter(c => c.is_verified).length || 0;
      const premium = data?.filter(c => c.is_premium).length || 0;
      const activeJobs = data?.reduce((sum, c) => sum + (c.jobs?.[0]?.count || 0), 0) || 0;

      setStats({ total, verified, premium, active_jobs: activeJobs });
      setCompanies(data || []);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (companyId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ is_verified: verified })
        .eq('id', companyId);

      if (error) throw error;
      loadCompanies();
    } catch (error) {
      console.error('Error updating verification:', error);
    }
  };

  const handlePremiumToggle = async (companyId: string, premium: boolean) => {
    try {
      const { error } = await supabase
        .from('companies')
        .update({ 
          is_premium: premium,
          subscription_plan: premium ? 'premium' : 'basic'
        })
        .eq('id', companyId);

      if (error) throw error;
      loadCompanies();
    } catch (error) {
      console.error('Error updating premium status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 Employer Management</h1>
          <p className="text-gray-600">Manage companies, subscriptions, and verify business details</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Companies</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Verified</h3>
            <p className="text-3xl font-bold text-green-600">{stats.verified}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Premium</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.premium}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Jobs</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.active_jobs}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Name, email, KvK..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Verification</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.is_verified}
                onChange={(e) => setFilters({ ...filters, is_verified: e.target.value })}
              >
                <option value="">All</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Premium</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.is_premium}
                onChange={(e) => setFilters({ ...filters, is_premium: e.target.value })}
              >
                <option value="">All</option>
                <option value="true">Premium</option>
                <option value="false">Basic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.subscription_plan}
                onChange={(e) => setFilters({ ...filters, subscription_plan: e.target.value })}
              >
                <option value="">All Plans</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Companies Table */}
        {!loading && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jobs</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map(company => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                          <span className="text-purple-600 font-semibold text-lg">
                            {company.name?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{company.name}</div>
                          <div className="text-xs text-gray-500">KvK: {company.kvk_number || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{company.email}</div>
                      <div className="text-xs text-gray-500">{company.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {company.industry || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {company.city || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                        {company.jobs?.[0]?.count || 0} active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {company.is_verified ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            ✅ Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            ⏳ Unverified
                          </span>
                        )}
                        {company.is_premium && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            ⭐ {company.subscription_plan || 'Premium'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {!company.is_verified && (
                          <button
                            onClick={() => handleVerify(company.id, true)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handlePremiumToggle(company.id, !company.is_premium)}
                          className="text-xs text-purple-600 hover:text-purple-800"
                        >
                          {company.is_premium ? 'Downgrade' : 'Upgrade'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {companies.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No companies found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployerManagementPage;
