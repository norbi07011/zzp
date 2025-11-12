// @ts-nocheck
/**
 * AdminPerformancePage
 * Unified Performance & Scalability Optimization Dashboard
 * Combines performance monitoring, scalability metrics, and production readiness
 */

import React, { useState, useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  value: string | number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  category: 'performance' | 'scalability' | 'production';
  trend?: 'up' | 'down' | 'stable';
}

interface ScalabilityMetric {
  name: string;
  current: number;
  max: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
}

interface OptimizationAction {
  id: number;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'performance' | 'scalability';
  status: 'active' | 'pending' | 'recommended';
  priority: number;
}

export const AdminPerformancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'scalability' | 'production'>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedOptimizations, setSelectedOptimizations] = useState<number[]>([]);

  // Performance Metrics
  const performanceMetrics: PerformanceMetric[] = [
    { name: 'Server Response Time', value: '92ms', status: 'excellent', category: 'performance', trend: 'down' },
    { name: 'Database Query Time', value: '38ms', status: 'excellent', category: 'performance', trend: 'stable' },
    { name: 'API Response Time', value: '76ms', status: 'good', category: 'performance', trend: 'down' },
    { name: 'Page Load Time', value: '1.4s', status: 'excellent', category: 'performance', trend: 'down' },
    { name: 'Time to Interactive', value: '1.9s', status: 'good', category: 'performance', trend: 'stable' },
    { name: 'Cache Hit Rate', value: '92%', status: 'excellent', category: 'performance', trend: 'up' },
    { name: 'CDN Coverage', value: '98%', status: 'excellent', category: 'scalability', trend: 'stable' },
    { name: 'Load Balancer Health', value: '100%', status: 'excellent', category: 'scalability', trend: 'stable' },
    { name: 'Auto-Scaling Status', value: 'Active', status: 'excellent', category: 'scalability', trend: 'stable' },
    { name: 'Database Replication', value: '3 nodes', status: 'excellent', category: 'scalability', trend: 'stable' },
    { name: 'Error Rate', value: '0.08%', status: 'excellent', category: 'production', trend: 'down' },
    { name: 'Uptime', value: '99.97%', status: 'excellent', category: 'production', trend: 'stable' },
    { name: 'SSL/TLS Score', value: 'A+', status: 'excellent', category: 'production', trend: 'stable' },
    { name: 'Security Audits', value: 'Passed', status: 'excellent', category: 'production', trend: 'stable' },
    { name: 'Backup Status', value: 'Current', status: 'excellent', category: 'production', trend: 'stable' },
    { name: 'Monitoring Coverage', value: '100%', status: 'excellent', category: 'production', trend: 'stable' }
  ];

  // Scalability Metrics
  const scalabilityMetrics: ScalabilityMetric[] = [
    { name: 'Active Users', current: 2847, max: 10000, unit: 'users', status: 'healthy' },
    { name: 'Concurrent Connections', current: 1234, max: 5000, unit: 'connections', status: 'healthy' },
    { name: 'Request Rate', current: 3456, max: 15000, unit: 'req/min', status: 'healthy' },
    { name: 'Database Connections', current: 145, max: 500, unit: 'connections', status: 'healthy' },
    { name: 'Storage Usage', current: 387, max: 2000, unit: 'GB', status: 'healthy' },
    { name: 'Bandwidth Usage', current: 1.8, max: 10, unit: 'TB/day', status: 'healthy' },
    { name: 'API Rate Limit', current: 45, max: 100, unit: '%', status: 'healthy' },
    { name: 'Worker Processes', current: 8, max: 32, unit: 'processes', status: 'healthy' }
  ];

  // Optimization Actions
  const optimizationActions: OptimizationAction[] = [
    {
      id: 1,
      title: 'Redis Cache Optimization',
      description: 'Optimize cache keys and TTL for better hit rates',
      impact: 'high',
      category: 'performance',
      status: 'active',
      priority: 1
    },
    {
      id: 2,
      title: 'Database Index Optimization',
      description: 'Add composite indexes on frequently queried columns',
      impact: 'high',
      category: 'performance',
      status: 'recommended',
      priority: 2
    },
    {
      id: 3,
      title: 'CDN Edge Caching',
      description: 'Extend CDN caching to all static assets',
      impact: 'medium',
      category: 'performance',
      status: 'active',
      priority: 3
    },
    {
      id: 4,
      title: 'Horizontal Pod Autoscaling',
      description: 'Enable automatic scaling based on CPU/memory metrics',
      impact: 'high',
      category: 'scalability',
      status: 'active',
      priority: 1
    },
    {
      id: 5,
      title: 'Database Read Replicas',
      description: 'Add read replicas for better query distribution',
      impact: 'high',
      category: 'scalability',
      status: 'active',
      priority: 2
    },
    {
      id: 6,
      title: 'Message Queue Implementation',
      description: 'Implement RabbitMQ for async job processing',
      impact: 'medium',
      category: 'scalability',
      status: 'recommended',
      priority: 4
    },
    {
      id: 7,
      title: 'Code Splitting & Lazy Loading',
      description: 'Split bundles and lazy load components',
      impact: 'medium',
      category: 'performance',
      status: 'active',
      priority: 5
    },
    {
      id: 8,
      title: 'WebP Image Optimization',
      description: 'Convert images to WebP format for 30% size reduction',
      impact: 'low',
      category: 'performance',
      status: 'recommended',
      priority: 6
    }
  ];

  // Production Readiness Checks
  const productionChecks = [
    { name: 'SSL/TLS Configuration', status: 'passed', score: 100 },
    { name: 'Security Headers', status: 'passed', score: 98 },
    { name: 'CORS Configuration', status: 'passed', score: 100 },
    { name: 'Rate Limiting', status: 'passed', score: 95 },
    { name: 'Error Monitoring', status: 'passed', score: 100 },
    { name: 'Logging & Audit Trail', status: 'passed', score: 100 },
    { name: 'Backup & Recovery', status: 'passed', score: 100 },
    { name: 'Health Checks', status: 'passed', score: 100 },
    { name: 'Load Testing', status: 'passed', score: 92 },
    { name: 'Disaster Recovery Plan', status: 'passed', score: 95 }
  ];

  // NOWE: Performance History (Real-time charts data)
  const performanceHistory = {
    '1h': { labels: ['0m', '15m', '30m', '45m', '60m'], values: [95, 92, 89, 91, 92] },
    '24h': { labels: ['0h', '6h', '12h', '18h', '24h'], values: [88, 92, 95, 91, 92] },
    '7d': { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], values: [85, 88, 92, 90, 93, 91, 92] },
    '30d': { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], values: [82, 87, 90, 92] }
  };

  // NOWE: Real-time Alerts
  const alerts = [
    { id: 1, severity: 'warning', message: 'Memory usage approaching 70%', time: '2 min ago', action: 'Scale up' },
    { id: 2, severity: 'info', message: 'Cache cleared successfully', time: '15 min ago', action: null },
    { id: 3, severity: 'success', message: 'Performance optimization applied', time: '1 hour ago', action: null }
  ];

  // NOWE: Cost Optimization
  const costMetrics = {
    current: 2847,
    projected: 3200,
    saved: 450,
    currency: 'USD'
  };

  // Auto-refresh metrics
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      console.log('Auto-refreshing metrics...');
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      case 'healthy': return 'text-green-600';
      case 'passed': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100';
      case 'good': return 'bg-blue-100';
      case 'warning': return 'bg-yellow-100';
      case 'critical': return 'bg-red-100';
      case 'healthy': return 'bg-green-100';
      case 'passed': return 'bg-green-100';
      default: return 'bg-gray-100';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      case 'stable': return '➡️';
      default: return '';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const handleRefreshMetrics = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  const handleApplyOptimization = (id: number) => {
    const action = optimizationActions.find(a => a.id === id);
    if (action) {
      alert(`✅ Applying optimization: ${action.title}\n\nThis will be implemented in the next deployment cycle.`);
    }
  };

  const handleBulkOptimization = () => {
    if (selectedOptimizations.length === 0) {
      alert('⚠️ Please select at least one optimization to apply.');
      return;
    }
    const count = selectedOptimizations.length;
    if (confirm(`🚀 Apply ${count} selected optimizations?\n\nThis may temporarily impact performance during deployment.`)) {
      alert(`✅ Successfully queued ${count} optimizations for deployment!`);
      setSelectedOptimizations([]);
    }
  };

  const toggleOptimizationSelection = (id: number) => {
    setSelectedOptimizations(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleExportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      healthScore: calculateHealthScore(),
      scalabilityScore: calculateScalabilityScore(),
      productionScore: calculateProductionScore(),
      metrics: performanceMetrics,
      alerts: alerts,
      cost: costMetrics
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateHealthScore = () => {
    const excellentCount = performanceMetrics.filter(m => m.status === 'excellent').length;
    return Math.round((excellentCount / performanceMetrics.length) * 100);
  };

  const calculateScalabilityScore = () => {
    const avgUsage = scalabilityMetrics.reduce((acc, m) => acc + (m.current / m.max), 0) / scalabilityMetrics.length;
    return Math.round((1 - avgUsage) * 100); // Higher score = more headroom
  };

  const calculateProductionScore = () => {
    const avgScore = productionChecks.reduce((acc, c) => acc + c.score, 0) / productionChecks.length;
    return Math.round(avgScore);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                ⚡ Performance & Scalability Dashboard
              </h1>
              <p className="text-gray-600">Monitor performance, scalability, and production readiness</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="px-4 py-2 bg-white rounded-lg border border-gray-200 font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>

              {/* Export Report Button */}
              <button
                onClick={handleExportReport}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2"
              >
                📊 Export Report
              </button>

              {/* Comparison Mode Toggle */}
              <label className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={comparisonMode}
                  onChange={(e) => setComparisonMode(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Compare</span>
              </label>

              {/* Auto-refresh Toggle */}
              <label className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm font-medium text-gray-700">Auto-refresh</span>
              </label>

              {/* Refresh Button */}
              <button
                onClick={handleRefreshMetrics}
                disabled={refreshing}
                className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2 ${
                  refreshing ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {refreshing ? '🔄 Refreshing...' : '🔄 Refresh Now'}
              </button>
            </div>
          </div>

          {/* NOWE: Real-time Alerts Banner */}
          {showAlerts && alerts.length > 0 && (
            <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔔</span>
                  <h3 className="font-semibold text-gray-900">Real-time Alerts</h3>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    {alerts.length} active
                  </span>
                </div>
                <button
                  onClick={() => setShowAlerts(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-2">
                {alerts.map(alert => (
                  <div key={alert.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <span className={`text-lg ${
                        alert.severity === 'warning' ? '⚠️' :
                        alert.severity === 'success' ? '✅' : 'ℹ️'
                      }`}>
                        {alert.severity === 'warning' ? '⚠️' :
                         alert.severity === 'success' ? '✅' : 'ℹ️'}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-500">{alert.time}</p>
                      </div>
                    </div>
                    {alert.action && (
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700">
                        {alert.action}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overall Health Scores */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-100 font-medium">Performance Score</span>
                <span className="text-3xl">⚡</span>
              </div>
              <div className="text-4xl font-bold mb-1">{calculateHealthScore()}%</div>
              <div className="text-green-100 text-sm">Excellent performance across all metrics</div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-100 font-medium">Scalability Score</span>
                <span className="text-3xl">📈</span>
              </div>
              <div className="text-4xl font-bold mb-1">{calculateScalabilityScore()}%</div>
              <div className="text-blue-100 text-sm">Healthy headroom for growth</div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-purple-100 font-medium">Production Readiness</span>
                <span className="text-3xl">✅</span>
              </div>
              <div className="text-4xl font-bold mb-1">{calculateProductionScore()}%</div>
              <div className="text-purple-100 text-sm">Ready for production deployment</div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-orange-100 font-medium">Cost Optimization</span>
                <span className="text-3xl">💰</span>
              </div>
              <div className="text-4xl font-bold mb-1">${costMetrics.saved}</div>
              <div className="text-orange-100 text-sm">Saved this month vs projected</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200 bg-white rounded-t-lg">
          <div className="flex gap-1 p-2">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'performance', label: 'Performance', icon: '⚡' },
              { key: 'scalability', label: 'Scalability', icon: '📈' },
              { key: 'production', label: 'Production', icon: '🚀' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  activeTab === tab.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* Quick Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {performanceMetrics.slice(0, 8).map((metric, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{metric.name}</span>
                      {metric.trend && <span className="text-lg">{getTrendIcon(metric.trend)}</span>}
                    </div>
                    <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}
                    </div>
                    <div className={`mt-1 text-xs px-2 py-1 rounded-full inline-block ${getStatusBg(metric.status)} ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </div>
                  </div>
                ))}
              </div>

              {/* NOWE: Performance History Chart */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📊 Performance Trend ({timeRange})
                </h3>
                <div className="space-y-4">
                  <div className="flex items-end justify-between h-48 gap-2">
                    {performanceHistory[timeRange].values.map((value, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '100%' }}>
                          <div
                            className={`absolute bottom-0 w-full rounded-t-lg transition-all ${
                              value >= 90 ? 'bg-green-500' : value >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ height: `${value}%` }}
                          >
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold">
                              {value}%
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {performanceHistory[timeRange].labels[idx]}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <span className="text-gray-600">Excellent (90%+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                      <span className="text-gray-600">Good (75-89%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <span className="text-gray-600">Needs Attention (&lt;75%)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scalability Metrics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📈 Scalability Metrics
                </h3>
                <div className="space-y-4">
                  {scalabilityMetrics.map((metric, idx) => {
                    const percentage = (metric.current / metric.max) * 100;
                    const isWarning = percentage > 70;
                    const isCritical = percentage > 90;
                    
                    return (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-gray-700">{metric.name}</span>
                          <span className="text-sm text-gray-600">
                            {metric.current.toLocaleString()} / {metric.max.toLocaleString()} {metric.unit}
                          </span>
                        </div>
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`absolute h-full rounded-full transition-all ${
                              isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          {percentage.toFixed(1)}% capacity used
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Optimization Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    🎯 Priority Optimizations
                  </h3>
                  {selectedOptimizations.length > 0 && (
                    <button
                      onClick={handleBulkOptimization}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2"
                    >
                      🚀 Apply {selectedOptimizations.length} Selected
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {optimizationActions
                    .filter(a => a.status === 'recommended')
                    .sort((a, b) => a.priority - b.priority)
                    .slice(0, 5)
                    .map((action) => (
                      <div key={action.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <input
                          type="checkbox"
                          checked={selectedOptimizations.includes(action.id)}
                          onChange={() => toggleOptimizationSelection(action.id)}
                          className="mt-1 rounded"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{action.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(action.impact)}`}>
                              {action.impact} impact
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                        <button
                          onClick={() => handleApplyOptimization(action.id)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                        >
                          Apply
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* PERFORMANCE TAB */}
          {activeTab === 'performance' && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  ⚡ Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {performanceMetrics
                    .filter(m => m.category === 'performance')
                    .map((metric, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                          {metric.trend && <span className="text-xl">{getTrendIcon(metric.trend)}</span>}
                        </div>
                        <div className={`text-3xl font-bold mb-1 ${getStatusColor(metric.status)}`}>
                          {metric.value}
                        </div>
                        <div className={`text-xs px-3 py-1 rounded-full inline-block ${getStatusBg(metric.status)} ${getStatusColor(metric.status)}`}>
                          {metric.status}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🔧 Performance Optimizations
                </h3>
                <div className="space-y-3">
                  {optimizationActions
                    .filter(a => a.category === 'performance')
                    .sort((a, b) => a.priority - b.priority)
                    .map((action) => (
                      <div key={action.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-gray-900">{action.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(action.impact)}`}>
                              {action.impact}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              action.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {action.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                        {action.status === 'recommended' && (
                          <button
                            onClick={() => handleApplyOptimization(action.id)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* SCALABILITY TAB */}
          {activeTab === 'scalability' && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  📈 Scalability Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {performanceMetrics
                    .filter(m => m.category === 'scalability')
                    .map((metric, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                          {metric.trend && <span className="text-xl">{getTrendIcon(metric.trend)}</span>}
                        </div>
                        <div className={`text-3xl font-bold mb-1 ${getStatusColor(metric.status)}`}>
                          {metric.value}
                        </div>
                        <div className={`text-xs px-3 py-1 rounded-full inline-block ${getStatusBg(metric.status)} ${getStatusColor(metric.status)}`}>
                          {metric.status}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  📊 Resource Utilization
                </h3>
                <div className="space-y-5">
                  {scalabilityMetrics.map((metric, idx) => {
                    const percentage = (metric.current / metric.max) * 100;
                    const isWarning = percentage > 70;
                    const isCritical = percentage > 90;
                    
                    return (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-gray-900">{metric.name}</span>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-700">
                              {metric.current.toLocaleString()} / {metric.max.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">{metric.unit}</div>
                          </div>
                        </div>
                        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`absolute h-full rounded-full transition-all ${
                              isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className={`text-sm font-medium ${
                            isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {percentage.toFixed(1)}% used
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isCritical ? 'bg-red-100 text-red-800' : isWarning ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {metric.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🚀 Scalability Optimizations
                </h3>
                <div className="space-y-3">
                  {optimizationActions
                    .filter(a => a.category === 'scalability')
                    .sort((a, b) => a.priority - b.priority)
                    .map((action) => (
                      <div key={action.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="font-semibold text-gray-900">{action.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full border ${getImpactColor(action.impact)}`}>
                              {action.impact}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              action.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {action.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                        {action.status === 'recommended' && (
                          <button
                            onClick={() => handleApplyOptimization(action.id)}
                            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* PRODUCTION TAB */}
          {activeTab === 'production' && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  🚀 Production Readiness
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {performanceMetrics
                    .filter(m => m.category === 'production')
                    .map((metric, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{metric.name}</span>
                          {metric.trend && <span className="text-xl">{getTrendIcon(metric.trend)}</span>}
                        </div>
                        <div className={`text-3xl font-bold mb-1 ${getStatusColor(metric.status)}`}>
                          {metric.value}
                        </div>
                        <div className={`text-xs px-3 py-1 rounded-full inline-block ${getStatusBg(metric.status)} ${getStatusColor(metric.status)}`}>
                          {metric.status}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  ✅ Production Checklist
                </h3>
                <div className="space-y-3">
                  {productionChecks.map((check, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          check.status === 'passed' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {check.status === 'passed' ? '✅' : '❌'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{check.name}</div>
                          <div className="text-sm text-gray-600">Score: {check.score}%</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${check.score >= 95 ? 'bg-green-500' : check.score >= 80 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${check.score}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getStatusColor(check.status)}`}>
                          {check.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">✅</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Production Ready</h3>
                    <p className="text-gray-700 mb-4">
                      All production readiness checks have passed. The system is optimized, secure, and ready for deployment.
                    </p>
                    <div className="flex gap-3">
                      <button className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors">
                        🚀 Deploy to Production
                      </button>
                      <button className="px-6 py-2 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                        📋 Generate Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPerformancePage;
