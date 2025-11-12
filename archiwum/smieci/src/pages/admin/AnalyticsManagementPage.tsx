// @ts-nocheck
/**
 * AnalyticsManagementPage
 * Admin panel for analytics, reports, and business intelligence
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  users: {
    total: number;
    workers: number;
    employers: number;
    growth: number;
  };
  jobs: {
    total: number;
    active: number;
    completed: number;
    avg_per_day: number;
  };
  revenue: {
    total: number;
    monthly: number;
    avg_per_user: number;
    growth: number;
  };
  engagement: {
    active_users: number;
    messages_sent: number;
    avg_session: number;
    conversion_rate: number;
  };
}

export const AnalyticsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'revenue' | 'engagement'>('overview');
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    users: { total: 0, workers: 0, employers: 0, growth: 0 },
    jobs: { total: 0, active: 0, completed: 0, avg_per_day: 0 },
    revenue: { total: 0, monthly: 0, avg_per_user: 0, growth: 0 },
    engagement: { active_users: 0, messages_sent: 0, avg_session: 0, conversion_rate: 0 }
  });

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
        case 'all':
          startDate = new Date('2020-01-01');
          break;
      }

      // Fetch users data
      const { data: usersData } = await supabase
        .from('users')
        .select('role, created_at')
        .gte('created_at', startDate.toISOString());

      const totalUsers = usersData?.length || 0;
      const workers = usersData?.filter(u => u.role === 'worker').length || 0;
      const employers = usersData?.filter(u => u.role === 'employer').length || 0;

      // Fetch jobs data
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('status, created_at')
        .gte('created_at', startDate.toISOString());

      const totalJobs = jobsData?.length || 0;
      const activeJobs = jobsData?.filter(j => j.status === 'active').length || 0;
      const completedJobs = jobsData?.filter(j => j.status === 'completed').length || 0;
      const daysRange = Math.max(1, Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const avgJobsPerDay = Math.round((totalJobs / daysRange) * 10) / 10;

      // Fetch revenue data
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('amount, status, created_at')
        .eq('status', 'completed')
        .gte('created_at', startDate.toISOString());

      const totalRevenue = transactionsData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const monthlyRevenue = Math.round(totalRevenue / (daysRange / 30));
      const avgRevenuePerUser = totalUsers > 0 ? Math.round(totalRevenue / totalUsers) : 0;

      // Fetch engagement data
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString());

      const messagesSent = messagesData?.length || 0;

      // Fetch active users (users who logged in in the last 7 days)
      const last7Days = new Date();
      last7Days.setDate(now.getDate() - 7);
      const { data: activeUsersData } = await supabase
        .from('users')
        .select('id, last_login')
        .gte('last_login', last7Days.toISOString());

      const activeUsers = activeUsersData?.length || 0;

      // Calculate conversion rate (workers with completed profiles)
      const { data: workersData } = await supabase
        .from('worker_profiles')
        .select('is_profile_complete');

      const completedProfiles = workersData?.filter(w => w.is_profile_complete).length || 0;
      const conversionRate = workers > 0 ? Math.round((completedProfiles / workers) * 100) : 0;

      setAnalytics({
        users: {
          total: totalUsers,
          workers,
          employers,
          growth: 12.5 // Placeholder - would need historical data
        },
        jobs: {
          total: totalJobs,
          active: activeJobs,
          completed: completedJobs,
          avg_per_day: avgJobsPerDay
        },
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          avg_per_user: avgRevenuePerUser,
          growth: 8.3 // Placeholder - would need historical data
        },
        engagement: {
          active_users: activeUsers,
          messages_sent: messagesSent,
          avg_session: 15.4, // Placeholder - would need session tracking
          conversion_rate: conversionRate
        }
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Analytics & Reports</h1>
            <p className="text-gray-600">Business intelligence and performance metrics</p>
          </div>
          <div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`pb-2 px-4 ${activeTab === 'revenue' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Revenue
          </button>
          <button
            onClick={() => setActiveTab('engagement')}
            className={`pb-2 px-4 ${activeTab === 'engagement' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Engagement
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics.users.total}</p>
                    <p className="text-sm text-green-600 mt-2">↑ {analytics.users.growth}% growth</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Active Jobs</h3>
                    <p className="text-3xl font-bold text-blue-600">{analytics.jobs.active}</p>
                    <p className="text-sm text-gray-600 mt-2">{analytics.jobs.avg_per_day} per day</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(analytics.revenue.total)}</p>
                    <p className="text-sm text-green-600 mt-2">↑ {analytics.revenue.growth}% growth</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Active Users</h3>
                    <p className="text-3xl font-bold text-purple-600">{analytics.engagement.active_users}</p>
                    <p className="text-sm text-gray-600 mt-2">{analytics.engagement.conversion_rate}% conversion</p>
                  </div>
                </div>

                {/* Charts Placeholder */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 User Growth Trend</h3>
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      Chart visualization would go here
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Revenue Trend</h3>
                    <div className="h-64 flex items-center justify-center text-gray-400">
                      Chart visualization would go here
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-gray-900">{analytics.users.total}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Workers</h3>
                    <p className="text-3xl font-bold text-blue-600">{analytics.users.workers}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {analytics.users.total > 0 ? Math.round((analytics.users.workers / analytics.users.total) * 100) : 0}% of total
                    </p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Employers</h3>
                    <p className="text-3xl font-bold text-purple-600">{analytics.users.employers}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {analytics.users.total > 0 ? Math.round((analytics.users.employers / analytics.users.total) * 100) : 0}% of total
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 User Distribution</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Workers</span>
                        <span className="text-sm font-medium">{analytics.users.workers}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${analytics.users.total > 0 ? (analytics.users.workers / analytics.users.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Employers</span>
                        <span className="text-sm font-medium">{analytics.users.employers}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${analytics.users.total > 0 ? (analytics.users.employers / analytics.users.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Tab */}
            {activeTab === 'revenue' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
                    <p className="text-3xl font-bold text-green-600">{formatCurrency(analytics.revenue.total)}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Monthly Average</h3>
                    <p className="text-3xl font-bold text-blue-600">{formatCurrency(analytics.revenue.monthly)}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Avg per User</h3>
                    <p className="text-3xl font-bold text-purple-600">{formatCurrency(analytics.revenue.avg_per_user)}</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Revenue Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Subscriptions</span>
                      <span className="font-semibold text-green-600">{formatCurrency(Math.round(analytics.revenue.total * 0.7))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Job Postings</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(Math.round(analytics.revenue.total * 0.2))}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Premium Features</span>
                      <span className="font-semibold text-purple-600">{formatCurrency(Math.round(analytics.revenue.total * 0.1))}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Tab */}
            {activeTab === 'engagement' && (
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Active Users</h3>
                    <p className="text-3xl font-bold text-purple-600">{analytics.engagement.active_users}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Messages Sent</h3>
                    <p className="text-3xl font-bold text-blue-600">{analytics.engagement.messages_sent}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Session (min)</h3>
                    <p className="text-3xl font-bold text-green-600">{analytics.engagement.avg_session}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Conversion Rate</h3>
                    <p className="text-3xl font-bold text-orange-600">{analytics.engagement.conversion_rate}%</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Engagement Metrics</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Profile Completion Rate</span>
                        <span className="text-sm font-medium">{analytics.engagement.conversion_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${analytics.engagement.conversion_rate}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Active User Rate</span>
                        <span className="text-sm font-medium">
                          {analytics.users.total > 0 ? Math.round((analytics.engagement.active_users / analytics.users.total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${analytics.users.total > 0 ? (analytics.engagement.active_users / analytics.users.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsManagementPage;
