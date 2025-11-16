// @ts-nocheck
/**
 * DataAnalyticsManagementPage
 * Admin panel for business intelligence and data analytics
 */

import React, { useState } from 'react';

interface AnalyticsWidget {
  id: string;
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  positive: boolean;
}

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export const DataAnalyticsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'users' | 'custom'>('overview');
  const [dateRange, setDateRange] = useState('7d');

  const overviewWidgets: AnalyticsWidget[] = [
    { id: '1', title: 'Total Revenue', value: '€284,392', change: 12.5, trend: 'up', positive: true },
    { id: '2', title: 'Active Users', value: '3,847', change: 8.3, trend: 'up', positive: true },
    { id: '3', title: 'Job Postings', value: '1,892', change: -3.2, trend: 'down', positive: false },
    { id: '4', title: 'Conversion Rate', value: '4.8%', change: 1.2, trend: 'up', positive: true },
    { id: '5', title: 'Avg Session Time', value: '12m 34s', change: 5.7, trend: 'up', positive: true },
    { id: '6', title: 'Bounce Rate', value: '32.4%', change: -2.1, trend: 'down', positive: true },
    { id: '7', title: 'New Signups', value: '892', change: 15.8, trend: 'up', positive: true },
    { id: '8', title: 'Churn Rate', value: '2.3%', change: -0.5, trend: 'down', positive: true }
  ];

  const revenueBySource: ChartData[] = [
    { label: 'Job Postings', value: 145000, color: '#3B82F6' },
    { label: 'Subscriptions', value: 89000, color: '#10B981' },
    { label: 'Certifications', value: 34000, color: '#F59E0B' },
    { label: 'Premium Features', value: 16392, color: '#8B5CF6' }
  ];

  const userGrowth: ChartData[] = [
    { label: 'Jan', value: 2400 },
    { label: 'Feb', value: 2680 },
    { label: 'Mar', value: 2890 },
    { label: 'Apr', value: 3120 },
    { label: 'May', value: 3456 },
    { label: 'Jun', value: 3689 },
    { label: 'Jul', value: 3847 }
  ];

  const topPerformers = [
    { name: 'Amsterdam Region', metric: 'Jobs Posted', value: 456, change: 18.2 },
    { name: 'IT Category', metric: 'Applications', value: 2341, change: 12.5 },
    { name: 'Premium Employers', metric: 'Revenue', value: '€45,892', change: 22.1 },
    { name: 'ZZP Certificates', metric: 'Issued', value: 123, change: 15.7 },
    { name: 'Mobile App', metric: 'Sessions', value: 12847, change: 34.5 }
  ];

  const customReports = [
    {
      id: '1',
      name: 'Monthly Revenue Breakdown',
      description: 'Detailed revenue analysis by source and category',
      lastRun: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: '2',
      name: 'User Engagement Metrics',
      description: 'Session times, page views, and interaction rates',
      lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    },
    {
      id: '3',
      name: 'Job Market Trends',
      description: 'Industry demand analysis and salary benchmarks',
      lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'scheduled'
    },
    {
      id: '4',
      name: 'Conversion Funnel Analysis',
      description: 'Step-by-step conversion tracking from signup to payment',
      lastRun: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'completed'
    }
  ];

  const handleRunReport = (reportId: string) => {
    alert(`Running report ${reportId}...`);
  };

  const handleExportData = () => {
    alert('Exporting analytics data...');
  };

  const getChangeColor = (change: number, positive: boolean) => {
    const isPositive = positive ? change > 0 : change < 0;
    return isPositive ? 'text-green-600' : 'text-red-600';
  };

  const maxRevenue = Math.max(...revenueBySource.map(r => r.value));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Data Analytics</h1>
            <p className="text-gray-600">Business intelligence and performance insights</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button
              onClick={handleExportData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              📥 Export Data
            </button>
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
            onClick={() => setActiveTab('revenue')}
            className={`pb-2 px-4 ${activeTab === 'revenue' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Revenue Analytics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            User Analytics
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2 px-4 ${activeTab === 'custom' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Custom Reports
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-4 gap-6">
              {overviewWidgets.map(widget => (
                <div key={widget.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">{widget.title}</h3>
                  <div className="flex items-end justify-between">
                    <p className="text-2xl font-bold text-gray-900">{widget.value}</p>
                    <div className="flex items-center gap-1">
                      <span className={getChangeColor(widget.change, widget.positive)}>
                        {widget.trend === 'up' ? '↑' : '↓'}
                      </span>
                      <span className={`text-sm font-medium ${getChangeColor(widget.change, widget.positive)}`}>
                        {Math.abs(widget.change)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performers</h3>
              <div className="space-y-3">
                {topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{performer.name}</h4>
                        <p className="text-sm text-gray-500">{performer.metric}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{performer.value}</p>
                      <p className="text-sm text-green-600">+{performer.change}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Revenue Analytics Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            {/* Revenue Summary */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-gray-900">€284,392</p>
                <p className="text-sm text-green-600 mt-1">+12.5% vs last period</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Revenue/User</h3>
                <p className="text-3xl font-bold text-gray-900">€73.89</p>
                <p className="text-sm text-green-600 mt-1">+8.2% vs last period</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">MRR Growth</h3>
                <p className="text-3xl font-bold text-gray-900">18.3%</p>
                <p className="text-sm text-green-600 mt-1">+3.1% vs last period</p>
              </div>
            </div>

            {/* Revenue by Source */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue by Source</h3>
              <div className="space-y-4">
                {revenueBySource.map(source => (
                  <div key={source.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">{source.label}</span>
                      <span className="text-sm font-bold text-gray-900">
                        €{source.value.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 rounded-full transition-all"
                        style={{
                          width: `${(source.value / maxRevenue) * 100}%`,
                          backgroundColor: source.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Analytics Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Stats */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-gray-900">3,847</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Active Today</h3>
                <p className="text-3xl font-bold text-green-600">1,234</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">New This Week</h3>
                <p className="text-3xl font-bold text-blue-600">156</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Retention Rate</h3>
                <p className="text-3xl font-bold text-purple-600">87.3%</p>
              </div>
            </div>

            {/* User Growth Chart */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">User Growth Trend</h3>
              <div className="flex items-end justify-between h-64 gap-4">
                {userGrowth.map(month => (
                  <div key={month.label} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                         style={{ height: `${(month.value / 4000) * 100}%` }}
                         title={`${month.value} users`}
                    />
                    <span className="text-xs text-gray-600 mt-2">{month.label}</span>
                    <span className="text-xs font-medium text-gray-900">{month.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Custom Reports Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-4">
            {customReports.map(report => (
              <div key={report.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        report.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{report.description}</p>
                    <p className="text-sm text-gray-500">
                      Last run: {new Date(report.lastRun).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRunReport(report.id)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Run Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataAnalyticsManagementPage;
