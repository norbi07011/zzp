// @ts-nocheck
/**
 * SystemMonitoringPage
 * Admin panel for real-time system monitoring and health checks
 */

import React, { useState, useEffect } from 'react';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
}

interface Service {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  responseTime: number;
  lastCheck: string;
}

interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const SystemMonitoringPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'alerts' | 'logs'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const systemMetrics: SystemMetric[] = [
    { name: 'CPU Usage', value: 34, unit: '%', status: 'healthy', threshold: 80 },
    { name: 'Memory Usage', value: 62, unit: '%', status: 'healthy', threshold: 85 },
    { name: 'Disk Usage', value: 45, unit: '%', status: 'healthy', threshold: 90 },
    { name: 'Network I/O', value: 23, unit: 'MB/s', status: 'healthy', threshold: 100 },
    { name: 'Database Connections', value: 124, unit: '', status: 'healthy', threshold: 200 },
    { name: 'Active Sessions', value: 847, unit: '', status: 'healthy', threshold: 2000 },
    { name: 'Queue Size', value: 12, unit: 'jobs', status: 'healthy', threshold: 100 },
    { name: 'Error Rate', value: 0.3, unit: '%', status: 'healthy', threshold: 5 }
  ];

  const services: Service[] = [
    {
      name: 'Web Server',
      status: 'online',
      uptime: 99.98,
      responseTime: 45,
      lastCheck: new Date(Date.now() - 30 * 1000).toISOString()
    },
    {
      name: 'Database',
      status: 'online',
      uptime: 99.95,
      responseTime: 12,
      lastCheck: new Date(Date.now() - 15 * 1000).toISOString()
    },
    {
      name: 'Redis Cache',
      status: 'online',
      uptime: 99.99,
      responseTime: 3,
      lastCheck: new Date(Date.now() - 20 * 1000).toISOString()
    },
    {
      name: 'Email Service',
      status: 'online',
      uptime: 99.92,
      responseTime: 234,
      lastCheck: new Date(Date.now() - 45 * 1000).toISOString()
    },
    {
      name: 'File Storage',
      status: 'online',
      uptime: 99.97,
      responseTime: 67,
      lastCheck: new Date(Date.now() - 25 * 1000).toISOString()
    },
    {
      name: 'Payment Gateway',
      status: 'degraded',
      uptime: 98.5,
      responseTime: 892,
      lastCheck: new Date(Date.now() - 10 * 1000).toISOString()
    },
    {
      name: 'Search Engine',
      status: 'online',
      uptime: 99.94,
      responseTime: 156,
      lastCheck: new Date(Date.now() - 35 * 1000).toISOString()
    },
    {
      name: 'Analytics API',
      status: 'online',
      uptime: 99.91,
      responseTime: 89,
      lastCheck: new Date(Date.now() - 40 * 1000).toISOString()
    }
  ];

  const alerts: Alert[] = [
    {
      id: '1',
      severity: 'warning',
      message: 'Payment Gateway response time above threshold (892ms)',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      resolved: false
    },
    {
      id: '2',
      severity: 'info',
      message: 'Scheduled maintenance completed successfully',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      resolved: true
    },
    {
      id: '3',
      severity: 'error',
      message: 'Failed to connect to backup database (3 retries)',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: true
    },
    {
      id: '4',
      severity: 'info',
      message: 'Cache cleared successfully for user_profiles',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      resolved: true
    }
  ];

  const systemLogs = [
    { time: '14:23:45', level: 'INFO', message: 'User authentication successful - user_456' },
    { time: '14:23:42', level: 'INFO', message: 'Database query executed - SELECT * FROM jobs (45ms)' },
    { time: '14:23:38', level: 'WARN', message: 'Slow query detected - profiles table (892ms)' },
    { time: '14:23:35', level: 'INFO', message: 'Cache hit - job_listings (87% hit rate)' },
    { time: '14:23:30', level: 'ERROR', message: 'Payment processing failed - insufficient funds' },
    { time: '14:23:25', level: 'INFO', message: 'Email sent successfully - welcome@zzp.nl' },
    { time: '14:23:20', level: 'INFO', message: 'File uploaded - certificate_123.pdf (2.3MB)' },
    { time: '14:23:15', level: 'WARN', message: 'Rate limit approaching - API key pk_live_51H3***' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'offline':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'info': return 'ℹ️';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'critical': return '🚨';
      default: return '📌';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'text-blue-600';
      case 'WARN': return 'text-yellow-600';
      case 'ERROR': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const handleResolveAlert = (alertId: string) => {
    alert(`Resolving alert ${alertId}...`);
  };

  const handleRestartService = (serviceName: string) => {
    if (confirm(`Restart ${serviceName}? This may cause brief downtime.`)) {
      alert(`Restarting ${serviceName}...`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📡 System Monitoring</h1>
            <p className="text-gray-600">Real-time system health and performance monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-600">
                Auto-refresh (5s)
              </label>
            </div>
            <div className="text-sm text-gray-500">
              Last refresh: {lastRefresh.toLocaleTimeString('nl-NL')}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">✅</div>
              <div>
                <h2 className="text-2xl font-bold mb-1">All Systems Operational</h2>
                <p className="text-green-100">8/8 services online • 0 critical issues</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">System Uptime</p>
              <p className="text-3xl font-bold">99.96%</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            System Overview
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`pb-2 px-4 ${activeTab === 'services' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Services Status
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-2 px-4 ${activeTab === 'alerts' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Alerts ({alerts.filter(a => !a.resolved).length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2 px-4 ${activeTab === 'logs' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            System Logs
          </button>
        </div>

        {/* System Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-4 gap-6">
            {systemMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                    {metric.status}
                  </span>
                </div>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
                  <span className="text-gray-500 ml-1">{metric.unit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      metric.value / metric.threshold > 0.8 ? 'bg-red-500' :
                      metric.value / metric.threshold > 0.6 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Threshold: {metric.threshold}{metric.unit}</p>
              </div>
            ))}
          </div>
        )}

        {/* Services Status Tab */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uptime</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Response Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Check</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map(service => (
                  <tr key={service.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(service.status)}`}>
                        {service.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${service.uptime >= 99.9 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {service.uptime}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-medium ${
                        service.responseTime < 100 ? 'text-green-600' :
                        service.responseTime < 500 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {service.responseTime}ms
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(service.lastCheck).toLocaleTimeString('nl-NL')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRestartService(service.name)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Restart
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`bg-white rounded-lg border-2 p-6 ${
                  alert.resolved ? 'border-gray-200 opacity-60' : 
                  alert.severity === 'critical' ? 'border-red-300' :
                  alert.severity === 'error' ? 'border-red-200' :
                  alert.severity === 'warning' ? 'border-yellow-200' : 'border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="text-2xl">{getSeverityIcon(alert.severity)}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        {alert.resolved && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                            Resolved
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 font-medium mb-1">{alert.message}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(alert.timestamp).toLocaleString('nl-NL')}
                      </p>
                    </div>
                  </div>
                  {!alert.resolved && (
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* System Logs Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 bg-gray-900 rounded-t-lg">
              <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                <span>💻</span>
                <span>System Logs - Real-time</span>
              </div>
            </div>
            <div className="p-6 bg-gray-50 font-mono text-sm max-h-96 overflow-y-auto">
              {systemLogs.map((log, index) => (
                <div key={index} className="mb-2 hover:bg-white p-2 rounded">
                  <span className="text-gray-500">[{log.time}]</span>
                  {' '}
                  <span className={`font-bold ${getLogLevelColor(log.level)}`}>{log.level}</span>
                  {' '}
                  <span className="text-gray-700">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemMonitoringPage;
