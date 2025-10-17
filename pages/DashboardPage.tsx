import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BanknotesIcon,
  CreditCardIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { dashboardService } from '../services/dashboard';
import type { DashboardStats, ActivityItem, RevenueTrendPoint } from '../services/dashboard';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  // State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Parallel data fetching
      const [statsData, activityData, trendData] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentActivity(10),
        dashboardService.getRevenueTrend(6)
      ]);

      setStats(statsData);
      setActivities(activityData);
      setRevenueTrend(trendData);
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(t('dashboard.error.loadFailed', 'Failed to load dashboard data'));
    } finally {
      setLoading(false);
    }
  };

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting.morning', 'Good morning');
    if (hour < 18) return t('dashboard.greeting.afternoon', 'Good afternoon');
    return t('dashboard.greeting.evening', 'Good evening');
  };

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <ExclamationCircleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-900 mb-2">
              {t('dashboard.error.title', 'Error Loading Dashboard')}
            </h3>
            <p className="text-sm text-red-700 mb-4">{error}</p>
            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t('common.retry', 'Retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}! 👋
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {t('dashboard.subtitle', 'Here\'s your business overview for')} {stats?.currentMonth || '...'}
              </p>
            </div>
            <button
              onClick={loadDashboardData}
              disabled={loading}
              className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
              title={t('common.refresh', 'Refresh')}
            >
              <ClockIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title={t('dashboard.stats.revenue', 'Revenue')}
            value={stats?.totalRevenue || 0}
            subtitle={`${stats?.currentMonth || ''} ${new Date().getFullYear()}`}
            trend={stats?.revenueGrowth}
            icon={<BanknotesIcon className="w-6 h-6" />}
            color="blue"
            loading={loading}
          />

          <StatCard
            title={t('dashboard.stats.expenses', 'Expenses')}
            value={stats?.totalExpenses || 0}
            subtitle={`${stats?.currentMonth || ''} ${new Date().getFullYear()}`}
            trend={stats?.expenseGrowth}
            icon={<CreditCardIcon className="w-6 h-6" />}
            color="red"
            loading={loading}
          />

          <StatCard
            title={t('dashboard.stats.profit', 'Net Profit')}
            value={stats?.netProfit || 0}
            subtitle={`${stats?.currentMonth || ''} ${new Date().getFullYear()}`}
            icon={<ChartBarIcon className="w-6 h-6" />}
            color={stats && stats.netProfit >= 0 ? 'green' : 'red'}
            loading={loading}
          />

          <StatCard
            title={t('dashboard.stats.tax', 'Estimated Tax')}
            value={stats?.estimatedTax || 0}
            subtitle={t('dashboard.stats.taxSubtitle', 'BTW + Income Tax')}
            icon={<DocumentTextIcon className="w-6 h-6" />}
            color="yellow"
            loading={loading}
          />
        </div>

        {/* Invoice Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {t('dashboard.invoices.pending', 'Pending Invoices')}
              </h3>
              <div className="p-2 bg-yellow-50 text-yellow-600 rounded-lg">
                <ClockIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : stats?.pendingInvoices || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {t('dashboard.invoices.paid', 'Paid Invoices')}
              </h3>
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <DocumentTextIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : stats?.paidInvoices || 0}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">
                {t('dashboard.invoices.overdue', 'Overdue Invoices')}
              </h3>
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <ExclamationCircleIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {loading ? '...' : stats?.overdueInvoices || 0}
            </p>
            {stats && stats.overdueInvoices > 0 && (
              <p className="text-xs text-red-600 mt-1">
                {t('dashboard.invoices.overdueWarning', 'Requires attention')}
              </p>
            )}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="mb-6">
          <RevenueChart data={revenueTrend} loading={loading} />
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentActivity activities={activities} loading={loading} />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>

        {/* Tax Reminder (if applicable) */}
        {stats && stats.estimatedTax > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-900">
                  {t('dashboard.tax.reminder', 'Tax Reminder')}
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  {t('dashboard.tax.message', 'You have an estimated tax liability of')} {' '}
                  <span className="font-semibold">
                    {new Intl.NumberFormat('nl-NL', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(stats.estimatedTax)}
                  </span>
                  {' '}{t('dashboard.tax.forPeriod', 'for the current period')}.
                </p>
              </div>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                {t('dashboard.tax.viewDetails', 'View details')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
