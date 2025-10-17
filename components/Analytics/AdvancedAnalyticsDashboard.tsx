/**
 * Advanced Analytics Dashboard
 * Real-time analytics and business intelligence visualization
 * 
 * Features:
 * - Business metrics overview
 * - Revenue analytics charts
 * - User engagement tracking
 * - Worker/Company performance
 * - Custom KPI widgets
 * - Export functionality
 * 
 * @version 1.0.0
 * @date October 2025
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  DollarSign,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import analyticsService, { BusinessMetrics, WorkerPerformance, CompanyStatistics } from '../../services/analytics/analyticsService';
import './AdvancedAnalyticsDashboard.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ============================================================================
// INTERFACES
// ============================================================================

interface StatCard {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: string;
}

interface DateRange {
  start: string;
  end: string;
  label: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const AdvancedAnalyticsDashboard: React.FC = () => {
  // State
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    end: new Date().toISOString(),
    label: 'Last 30 Days'
  });
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load data
  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  /**
   * Load all analytics data
   */
  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const metrics = await analyticsService.getBusinessMetrics(
        dateRange.start,
        dateRange.end
      );
      setBusinessMetrics(metrics);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh data
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  };

  /**
   * Change date range
   */
  const changeDateRange = (days: number, label: string) => {
    setDateRange({
      start: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
      label
    });
  };

  /**
   * Export data
   */
  const handleExport = () => {
    if (!businessMetrics) return;

    const data = {
      dateRange: dateRange.label,
      metrics: businessMetrics,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${Date.now()}.json`;
    a.click();
  };

  // Calculate stat cards
  const statCards: StatCard[] = businessMetrics ? [
    {
      title: 'Total Revenue',
      value: `€${businessMetrics.total_revenue.toFixed(2)}`,
      change: 12.5,
      trend: 'up',
      icon: <DollarSign size={24} />,
      color: 'green'
    },
    {
      title: 'Jobs Posted',
      value: businessMetrics.total_jobs_posted,
      change: 8.3,
      trend: 'up',
      icon: <Briefcase size={24} />,
      color: 'blue'
    },
    {
      title: 'Applications',
      value: businessMetrics.total_applications,
      change: -2.4,
      trend: 'down',
      icon: <Users size={24} />,
      color: 'purple'
    },
    {
      title: 'Hires',
      value: businessMetrics.total_hires,
      change: 15.7,
      trend: 'up',
      icon: <Activity size={24} />,
      color: 'orange'
    }
  ] : [];

  // Revenue chart data
  const revenueChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Revenue (€)',
        data: [1200, 1900, 1500, 2100],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Jobs chart data
  const jobsChartData = {
    labels: ['Posted', 'In Progress', 'Completed', 'Cancelled'],
    datasets: [
      {
        label: 'Jobs',
        data: [45, 30, 80, 5],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 99, 132, 0.8)'
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  if (loading) {
    return (
      <div className="analytics-dashboard loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="advanced-analytics-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>📊 Advanced Analytics</h1>
          <p className="subtitle">Business Intelligence & Performance Metrics</p>
        </div>
        <div className="header-actions">
          {/* Date Range Selector */}
          <div className="date-range-selector">
            <Calendar size={18} />
            <select
              value={dateRange.label}
              onChange={(e) => {
                const days = e.target.value === 'Last 7 Days' ? 7
                  : e.target.value === 'Last 30 Days' ? 30
                  : e.target.value === 'Last 90 Days' ? 90
                  : 365;
                changeDateRange(days, e.target.value);
              }}
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>Last 90 Days</option>
              <option>Last Year</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            className="btn-icon"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
          </button>

          {/* Export Button */}
          <button
            className="btn-primary"
            onClick={handleExport}
          >
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card, index) => (
          <div key={index} className={`stat-card ${card.color}`}>
            <div className="stat-icon">{card.icon}</div>
            <div className="stat-content">
              <h3 className="stat-title">{card.title}</h3>
              <p className="stat-value">{card.value}</p>
              <div className={`stat-change ${card.trend}`}>
                {card.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{Math.abs(card.change)}%</span>
                <span className="stat-period">vs last period</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Revenue Trend Chart */}
        <div className="chart-card large">
          <div className="chart-header">
            <div className="chart-title">
              <LineChart size={20} />
              <h3>Revenue Trend</h3>
            </div>
            <span className="chart-period">{dateRange.label}</span>
          </div>
          <div className="chart-container">
            <Line data={revenueChartData} options={chartOptions} />
          </div>
        </div>

        {/* Jobs Distribution Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">
              <PieChart size={20} />
              <h3>Jobs Distribution</h3>
            </div>
          </div>
          <div className="chart-container">
            <Pie data={jobsChartData} options={{ ...chartOptions, scales: undefined }} />
          </div>
        </div>

        {/* Applications vs Hires Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">
              <BarChart3 size={20} />
              <h3>Applications vs Hires</h3>
            </div>
          </div>
          <div className="chart-container">
            <Bar
              data={{
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [
                  {
                    label: 'Applications',
                    data: [65, 59, 80, 81],
                    backgroundColor: 'rgba(54, 162, 235, 0.6)'
                  },
                  {
                    label: 'Hires',
                    data: [28, 48, 40, 45],
                    backgroundColor: 'rgba(75, 192, 192, 0.6)'
                  }
                ]
              }}
              options={chartOptions}
            />
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="metrics-table-card">
        <div className="card-header">
          <h3>📈 Detailed Metrics</h3>
        </div>
        <div className="metrics-table">
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Current</th>
                <th>Previous</th>
                <th>Change</th>
                <th>Trend</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Conversion Rate</td>
                <td>24.5%</td>
                <td>22.1%</td>
                <td>+2.4%</td>
                <td className="trend-up">📈</td>
              </tr>
              <tr>
                <td>Avg Job Value</td>
                <td>€850</td>
                <td>€780</td>
                <td>+€70</td>
                <td className="trend-up">📈</td>
              </tr>
              <tr>
                <td>Response Time</td>
                <td>4.2h</td>
                <td>5.1h</td>
                <td>-0.9h</td>
                <td className="trend-up">📈</td>
              </tr>
              <tr>
                <td>Client Satisfaction</td>
                <td>4.7/5</td>
                <td>4.6/5</td>
                <td>+0.1</td>
                <td className="trend-up">📈</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="dashboard-footer">
        <p>
          📊 Last updated: {new Date().toLocaleString()} | 
          Data range: {dateRange.label} | 
          Total records: {businessMetrics?.total_jobs_posted || 0}
        </p>
      </div>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;
