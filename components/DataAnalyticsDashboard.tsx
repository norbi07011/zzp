import React, { useState, useEffect, useMemo } from 'react';
import {
  ChartBarIcon,
  PresentationChartLineIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  CalendarIcon,
  DocumentTextIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  LineChart,
  Line as RechartsLine,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar as RechartsBar
} from 'recharts';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

// Data Analytics Dashboard Component - Task 4.3 Business Intelligence
interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalRevenue: number;
    conversionRate: number;
    averageOrderValue: number;
    pageViews: number;
    bounceRate: number;
    sessionDuration: number;
    newUsers: number;
  };
  trends: {
    users: Array<{ date: string; value: number; change: number }>;
    revenue: Array<{ date: string; value: number; change: number }>;
    traffic: Array<{ date: string; views: number; sessions: number; users: number }>;
    conversions: Array<{ date: string; rate: number; orders: number }>;
  };
  demographics: {
    ageGroups: Array<{ range: string; count: number; percentage: number }>;
    locations: Array<{ country: string; users: number; revenue: number }>;
    devices: Array<{ type: string; sessions: number; percentage: number }>;
    sources: Array<{ source: string; users: number; revenue: number; conversion: number }>;
  };
  performance: {
    topPages: Array<{ page: string; views: number; avgTime: number; exitRate: number }>;
    searchTerms: Array<{ term: string; searches: number; conversions: number }>;
    goals: Array<{ name: string; completed: number; target: number; value: number }>;
  };
}

interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'funnel';
  size: 'small' | 'medium' | 'large';
  data: any;
  visible: boolean;
  position: { x: number; y: number };
}

export const DataAnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [customDateRange, setCustomDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'audience' | 'acquisition' | 'behavior'>('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(false);

  useEffect(() => {
    // Generate comprehensive analytics data
    const generateData = (): AnalyticsData => {
      const days = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 365;
      
      // Generate time series data
      const dates = Array.from({ length: days }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        return date.toISOString().split('T')[0];
      });

      const users = dates.map((date, i) => ({
        date,
        value: Math.floor(1000 + Math.random() * 500 + Math.sin(i / 7) * 200),
        change: Math.random() * 20 - 10
      }));

      const revenue = dates.map((date, i) => ({
        date,
        value: Math.floor(5000 + Math.random() * 3000 + Math.sin(i / 7) * 1000),
        change: Math.random() * 30 - 15
      }));

      const traffic = dates.map((date, i) => ({
        date,
        views: Math.floor(2000 + Math.random() * 1000 + Math.sin(i / 7) * 500),
        sessions: Math.floor(800 + Math.random() * 400 + Math.sin(i / 7) * 200),
        users: Math.floor(600 + Math.random() * 300 + Math.sin(i / 7) * 150)
      }));

      const conversions = dates.map((date, i) => ({
        date,
        rate: 2.5 + Math.random() * 2 + Math.sin(i / 7) * 0.5,
        orders: Math.floor(50 + Math.random() * 30 + Math.sin(i / 7) * 15)
      }));

      return {
        overview: {
          totalUsers: users.reduce((sum, u) => sum + u.value, 0),
          totalRevenue: revenue.reduce((sum, r) => sum + r.value, 0),
          conversionRate: 3.4,
          averageOrderValue: 125.50,
          pageViews: traffic.reduce((sum, t) => sum + t.views, 0),
          bounceRate: 42.3,
          sessionDuration: 3.2,
          newUsers: Math.floor(users.reduce((sum, u) => sum + u.value, 0) * 0.35)
        },
        trends: { users, revenue, traffic, conversions },
        demographics: {
          ageGroups: [
            { range: '18-24', count: 2340, percentage: 23.4 },
            { range: '25-34', count: 3450, percentage: 34.5 },
            { range: '35-44', count: 2100, percentage: 21.0 },
            { range: '45-54', count: 1200, percentage: 12.0 },
            { range: '55+', count: 910, percentage: 9.1 }
          ],
          locations: [
            { country: 'United States', users: 4500, revenue: 125000 },
            { country: 'Germany', users: 2100, revenue: 68000 },
            { country: 'United Kingdom', users: 1800, revenue: 52000 },
            { country: 'France', users: 1200, revenue: 38000 },
            { country: 'Canada', users: 900, revenue: 28000 }
          ],
          devices: [
            { type: 'Desktop', sessions: 4500, percentage: 45.0 },
            { type: 'Mobile', sessions: 4200, percentage: 42.0 },
            { type: 'Tablet', sessions: 1300, percentage: 13.0 }
          ],
          sources: [
            { source: 'Organic Search', users: 3500, revenue: 95000, conversion: 3.8 },
            { source: 'Direct', users: 2200, revenue: 78000, conversion: 4.2 },
            { source: 'Social Media', users: 1800, revenue: 42000, conversion: 2.1 },
            { source: 'Email', users: 1200, revenue: 68000, conversion: 6.2 },
            { source: 'Paid Ads', users: 1300, revenue: 58000, conversion: 4.5 }
          ]
        },
        performance: {
          topPages: [
            { page: '/home', views: 15000, avgTime: 2.3, exitRate: 35.2 },
            { page: '/products', views: 12000, avgTime: 3.1, exitRate: 28.4 },
            { page: '/about', views: 8500, avgTime: 1.8, exitRate: 45.6 },
            { page: '/contact', views: 6200, avgTime: 2.7, exitRate: 32.1 },
            { page: '/blog', views: 5800, avgTime: 4.2, exitRate: 22.3 }
          ],
          searchTerms: [
            { term: 'react development', searches: 1200, conversions: 89 },
            { term: 'web design', searches: 980, conversions: 67 },
            { term: 'javascript tutorial', searches: 850, conversions: 45 },
            { term: 'frontend developer', searches: 720, conversions: 52 },
            { term: 'ui ux design', searches: 640, conversions: 38 }
          ],
          goals: [
            { name: 'Newsletter Signups', completed: 1250, target: 1500, value: 15000 },
            { name: 'Product Purchases', completed: 890, target: 1000, value: 125000 },
            { name: 'Demo Requests', completed: 340, target: 400, value: 85000 },
            { name: 'Contact Form', completed: 560, target: 600, value: 28000 }
          ]
        }
      };
    };

    const analyticsData = generateData();
    setData(analyticsData);

    // Initialize dashboard widgets
    const defaultWidgets: DashboardWidget[] = [
      {
        id: 'users-metric',
        title: 'Total Users',
        type: 'metric',
        size: 'small',
        data: analyticsData.overview.totalUsers,
        visible: true,
        position: { x: 0, y: 0 }
      },
      {
        id: 'revenue-metric',
        title: 'Total Revenue',
        type: 'metric',
        size: 'small',
        data: analyticsData.overview.totalRevenue,
        visible: true,
        position: { x: 1, y: 0 }
      },
      {
        id: 'conversion-metric',
        title: 'Conversion Rate',
        type: 'metric',
        size: 'small',
        data: analyticsData.overview.conversionRate,
        visible: true,
        position: { x: 2, y: 0 }
      },
      {
        id: 'traffic-chart',
        title: 'Traffic Trends',
        type: 'chart',
        size: 'large',
        data: analyticsData.trends.traffic,
        visible: true,
        position: { x: 0, y: 1 }
      }
    ];

    setWidgets(defaultWidgets);

    // Real-time updates if enabled
    let interval: NodeJS.Timeout;
    if (realTimeMode) {
      interval = setInterval(() => {
        setData(generateData());
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedPeriod, realTimeMode]);

  const exportDashboard = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const exportData = {
      data,
      widgets,
      settings: { period: selectedPeriod, dateRange: customDateRange },
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-dashboard-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getChangeColor = (change: number): string => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? 
      <ArrowTrendingUpIcon className="w-4 h-4" /> : 
      <ArrowTrendingDownIcon className="w-4 h-4" />;
  };

  // Chart configurations
  const trafficChartData = useMemo(() => {
    if (!data) return null;
    
    return {
      labels: data.trends.traffic.map(t => new Date(t.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Page Views',
          data: data.trends.traffic.map(t => t.views),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4
        },
        {
          label: 'Sessions',
          data: data.trends.traffic.map(t => t.sessions),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4
        },
        {
          label: 'Users',
          data: data.trends.traffic.map(t => t.users),
          borderColor: 'rgb(245, 158, 11)',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4
        }
      ]
    };
  }, [data]);

  const revenueChartData = useMemo(() => {
    if (!data) return null;
    
    return data.trends.revenue.map(r => ({
      date: new Date(r.date).toLocaleDateString(),
      revenue: r.value,
      change: r.change
    }));
  }, [data]);

  const deviceChartData = useMemo(() => {
    if (!data) return null;
    
    return {
      labels: data.demographics.devices.map(d => d.type),
      datasets: [{
        data: data.demographics.devices.map(d => d.percentage),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)'
        ],
        borderWidth: 2
      }]
    };
  }, [data]);

  const sourcePerformanceData = useMemo(() => {
    if (!data) return null;
    
    return {
      labels: data.demographics.sources.map(s => s.source),
      datasets: [
        {
          label: 'Users',
          data: data.demographics.sources.map(s => s.users),
          backgroundColor: 'rgba(59, 130, 246, 0.8)'
        },
        {
          label: 'Revenue',
          data: data.demographics.sources.map(s => s.revenue / 1000),
          backgroundColor: 'rgba(16, 185, 129, 0.8)'
        }
      ]
    };
  }, [data]);

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-8 h-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Data Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive business intelligence and performance metrics</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setRealTimeMode(!realTimeMode)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              realTimeMode 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${realTimeMode ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></div>
            Real-time
          </button>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={exportDashboard}
            disabled={isExporting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Exporting...
              </>
            ) : (
              <>
                <DocumentTextIcon className="w-4 h-4" />
                Export Data
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'analytics', label: 'Analytics', icon: PresentationChartLineIcon },
            { id: 'audience', label: 'Audience', icon: UserGroupIcon },
            { id: 'acquisition', label: 'Acquisition', icon: FunnelIcon },
            { id: 'behavior', label: 'Behavior', icon: EyeIcon }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Total Users</span>
                </div>
                <div className={`flex items-center gap-1 text-sm ${getChangeColor(12.5)}`}>
                  {getChangeIcon(12.5)}
                  12.5%
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(data.overview.totalUsers)}</div>
              <div className="text-sm text-gray-600">+{formatNumber(data.overview.newUsers)} new users</div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Total Revenue</span>
                </div>
                <div className={`flex items-center gap-1 text-sm ${getChangeColor(18.3)}`}>
                  {getChangeIcon(18.3)}
                  18.3%
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(data.overview.totalRevenue)}</div>
              <div className="text-sm text-gray-600">AOV: {formatCurrency(data.overview.averageOrderValue)}</div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FunnelIcon className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">Conversion Rate</span>
                </div>
                <div className={`flex items-center gap-1 text-sm ${getChangeColor(5.2)}`}>
                  {getChangeIcon(5.2)}
                  5.2%
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{data.overview.conversionRate}%</div>
              <div className="text-sm text-gray-600">Industry avg: 2.8%</div>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-600">Page Views</span>
                </div>
                <div className={`flex items-center gap-1 text-sm ${getChangeColor(8.7)}`}>
                  {getChangeIcon(8.7)}
                  8.7%
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{formatNumber(data.overview.pageViews)}</div>
              <div className="text-sm text-gray-600">Bounce rate: {data.overview.bounceRate}%</div>
            </div>
          </div>

          {/* Traffic Trends Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Traffic Trends</h3>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  Page Views
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  Sessions
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  Users
                </div>
              </div>
            </div>
            <div className="h-80">
              {trafficChartData && (
                <Line
                  data={trafficChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Revenue and Conversion Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Revenue Trends</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueChartData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip formatter={(value) => formatCurrency(value as number)} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Device Breakdown</h3>
              <div className="h-64">
                {deviceChartData && (
                  <Doughnut
                    data={deviceChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Source Performance */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Sources Performance</h3>
            <div className="h-80">
              {sourcePerformanceData && (
                <Bar
                  data={sourcePerformanceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top'
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              )}
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Conversion Funnel</h3>
            <div className="space-y-4">
              {[
                { stage: 'Visitors', count: 15000, percentage: 100, color: 'bg-blue-500' },
                { stage: 'Product Views', count: 8500, percentage: 56.7, color: 'bg-green-500' },
                { stage: 'Add to Cart', count: 3200, percentage: 21.3, color: 'bg-yellow-500' },
                { stage: 'Checkout', count: 1800, percentage: 12.0, color: 'bg-orange-500' },
                { stage: 'Purchase', count: 890, percentage: 5.9, color: 'bg-red-500' }
              ].map((stage, index) => (
                <div key={stage.stage} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-gray-700">{stage.stage}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                    <div 
                      className={`${stage.color} h-8 rounded-full flex items-center justify-center text-white text-sm font-medium transition-all duration-500`}
                      style={{ width: `${stage.percentage}%` }}
                    >
                      {stage.count.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600 text-right">{stage.percentage}%</div>
                  {index > 0 && (
                    <div className="w-20 text-sm text-red-600 text-right">
                      -{((1 - stage.percentage / 100) * 100).toFixed(1)}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Goals Progress */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Goals Progress</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.performance.goals.map(goal => {
                const progress = (goal.completed / goal.target) * 100;
                return (
                  <div key={goal.name} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">{goal.name}</h4>
                      <span className="text-sm text-gray-600">{goal.completed}/{goal.target}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          progress >= 100 ? 'bg-green-500' : 
                          progress >= 75 ? 'bg-blue-500' : 
                          progress >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, progress)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{progress.toFixed(1)}% complete</span>
                      <span className="font-medium text-gray-900">{formatCurrency(goal.value)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Audience Tab */}
      {activeTab === 'audience' && (
        <div className="space-y-6">
          {/* Demographics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Age Groups</h3>
              <div className="space-y-3">
                {data.demographics.ageGroups.map(group => (
                  <div key={group.range} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 w-16">{group.range}</span>
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${group.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{group.count.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">{group.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Locations</h3>
              <div className="space-y-3">
                {data.demographics.locations.map((location, index) => (
                  <div key={location.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-600 w-4">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-700">{location.country}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{location.users.toLocaleString()} users</div>
                      <div className="text-xs text-gray-600">{formatCurrency(location.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Flow */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">User Flow</h3>
            <div className="flex items-center justify-center space-x-8 p-8">
              {[
                { step: 'Landing Page', users: 10000, color: 'bg-blue-500' },
                { step: 'Product Page', users: 6500, color: 'bg-green-500' },
                { step: 'Cart', users: 2800, color: 'bg-yellow-500' },
                { step: 'Checkout', users: 1200, color: 'bg-orange-500' },
                { step: 'Success', users: 890, color: 'bg-red-500' }
              ].map((step, index) => (
                <React.Fragment key={step.step}>
                  <div className="text-center">
                    <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-sm mb-2`}>
                      {formatNumber(step.users)}
                    </div>
                    <div className="text-sm font-medium text-gray-700">{step.step}</div>
                  </div>
                  {index < 4 && (
                    <div className="flex-1 h-px bg-gray-300 relative">
                      <div className="absolute right-0 top-0 w-0 h-0 border-l-4 border-l-gray-300 border-t-2 border-t-transparent border-b-2 border-b-transparent transform translate-x-1"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Acquisition Tab */}
      {activeTab === 'acquisition' && (
        <div className="space-y-6">
          {/* Channel Performance */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Channel Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Users</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversion Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.demographics.sources.map(source => (
                    <tr key={source.source} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{source.source}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{source.users.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatCurrency(source.revenue)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{source.conversion}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          source.conversion > 4 ? 'text-green-600' : 
                          source.conversion > 2 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {(source.conversion * 50).toFixed(0)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Campaign Performance */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Campaign Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.demographics.sources}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source" />
                  <YAxis />
                  <RechartsTooltip />
                  <RechartsBar dataKey="users" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Behavior Tab */}
      {activeTab === 'behavior' && (
        <div className="space-y-6">
          {/* Top Pages */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Top Performing Pages</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.performance.topPages.map(page => (
                    <tr key={page.page} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{page.page}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{page.views.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{page.avgTime}m</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${
                          page.exitRate < 30 ? 'text-green-600' : 
                          page.exitRate < 45 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {page.exitRate}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Search Terms */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Search Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.performance.searchTerms.map(term => (
                <div key={term.term} className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm font-medium text-gray-900 mb-2">{term.term}</div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{term.searches} searches</span>
                    <span>{term.conversions} conversions</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(term.conversions / term.searches) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};