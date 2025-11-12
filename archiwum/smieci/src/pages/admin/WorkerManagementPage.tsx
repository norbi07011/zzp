// @ts-nocheck
/**
 * WorkerManagementPage
 * Admin panel for managing workers
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Worker {
  id: string;
  user_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  title?: string;
  hourly_rate?: number;
  location?: string;
  city?: string;
  skills?: string[];
  experience_years?: number;
  availability_status?: string;
  is_verified?: boolean;
  is_premium?: boolean;
  profile_completion?: number;
  created_at: string;
}

export const WorkerManagementPage: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    is_verified: '',
    is_premium: '',
    availability_status: ''
  });

  useEffect(() => {
    loadWorkers();
  }, [filters]);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('workers')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters.is_verified) {
        query = query.eq('is_verified', filters.is_verified === 'true');
      }

      if (filters.is_premium) {
        query = query.eq('is_premium', filters.is_premium === 'true');
      }

      if (filters.availability_status) {
        query = query.eq('availability_status', filters.availability_status);
      }

      const { data, error } = await query;

      if (error) throw error;
      setWorkers(data || []);
    } catch (error) {
      console.error('Error loading workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (workerId: string, verified: boolean) => {
    try {
      const { error } = await supabase
        .from('workers')
        .update({ is_verified: verified })
        .eq('id', workerId);

      if (error) throw error;
      loadWorkers();
    } catch (error) {
      console.error('Error updating verification:', error);
    }
  };

  const handlePremiumToggle = async (workerId: string, premium: boolean) => {
    try {
      const { error } = await supabase
        .from('workers')
        .update({ is_premium: premium })
        .eq('id', workerId);

      if (error) throw error;
      loadWorkers();
    } catch (error) {
      console.error('Error updating premium status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">👷 Worker Management</h1>
          <p className="text-gray-600">Manage worker profiles, verification, and access control</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="Name or email..."
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
                <option value="false">Free</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.availability_status}
                onChange={(e) => setFilters({ ...filters, availability_status: e.target.value })}
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
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

        {/* Workers Table */}
        {!loading && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workers.map(worker => (
                  <tr key={worker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <span className="text-blue-600 font-semibold">
                            {worker.first_name?.[0]}{worker.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {worker.first_name} {worker.last_name}
                          </div>
                          <div className="text-xs text-gray-500">
                            Profile: {worker.profile_completion || 0}%
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{worker.email}</div>
                      <div className="text-xs text-gray-500">{worker.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {worker.title || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {worker.hourly_rate ? `€${worker.hourly_rate}/hr` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {worker.city || worker.location || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {worker.is_verified ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            ✅ Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                            ⏳ Unverified
                          </span>
                        )}
                        {worker.is_premium && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                            ⭐ Premium
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        {!worker.is_verified && (
                          <button
                            onClick={() => handleVerify(worker.id, true)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handlePremiumToggle(worker.id, !worker.is_premium)}
                          className="text-xs text-purple-600 hover:text-purple-800"
                        >
                          {worker.is_premium ? 'Remove Premium' : 'Make Premium'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {workers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No workers found
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Workers</h3>
            <p className="text-3xl font-bold text-gray-900">{workers.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Verified</h3>
            <p className="text-3xl font-bold text-green-600">
              {workers.filter(w => w.is_verified).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Premium</h3>
            <p className="text-3xl font-bold text-purple-600">
              {workers.filter(w => w.is_premium).length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Profile</h3>
            <p className="text-3xl font-bold text-blue-600">
              {workers.length > 0 
                ? Math.round(workers.reduce((sum, w) => sum + (w.profile_completion || 0), 0) / workers.length)
                : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerManagementPage;
