// @ts-nocheck
/**
 * SecurityManagementPage
 * Admin panel for security monitoring, activity logs, and alerts
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  user?: {
    email: string;
  };
}

interface SecurityAlert {
  id: string;
  type: 'suspicious_login' | 'multiple_failures' | 'unusual_activity' | 'permission_denied';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user_id?: string;
  ip_address?: string;
  created_at: string;
  resolved: boolean;
}

export const SecurityManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'logs' | 'alerts' | 'stats'>('logs');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    action: '',
    severity: '',
    date_from: '',
    date_to: ''
  });
  const [stats, setStats] = useState({
    total_logs: 0,
    total_alerts: 0,
    critical_alerts: 0,
    resolved_alerts: 0
  });

  useEffect(() => {
    if (activeTab === 'logs') {
      loadActivityLogs();
    } else if (activeTab === 'alerts') {
      loadSecurityAlerts();
    }
  }, [activeTab, filters]);

  const loadActivityLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          user:user_id(email)
        `)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`action.ilike.%${filters.search}%,ip_address.ilike.%${filters.search}%`);
      }

      if (filters.action) {
        query = query.eq('action', filters.action);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query.limit(200);

      if (error) throw error;

      setStats({ ...stats, total_logs: data?.length || 0 });
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSecurityAlerts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('security_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.severity) {
        query = query.eq('severity', filters.severity);
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      const totalAlerts = data?.length || 0;
      const criticalAlerts = data?.filter(a => a.severity === 'critical').length || 0;
      const resolvedAlerts = data?.filter(a => a.resolved).length || 0;

      setStats({ ...stats, total_alerts: totalAlerts, critical_alerts: criticalAlerts, resolved_alerts: resolvedAlerts });
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading security alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: string, resolved: boolean) => {
    try {
      const { error } = await supabase
        .from('security_alerts')
        .update({ resolved })
        .eq('id', alertId);

      if (error) throw error;
      loadSecurityAlerts();
    } catch (error) {
      console.error('Error updating alert:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('login')) return '🔐';
    if (action.includes('create')) return '➕';
    if (action.includes('update')) return '✏️';
    if (action.includes('delete')) return '🗑️';
    if (action.includes('payment')) return '💳';
    return '📝';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔒 Security & Activity Logs</h1>
          <p className="text-gray-600">Monitor system security, track user activity, and manage alerts</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Activity Logs</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_logs}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Security Alerts</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.total_alerts}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Critical Alerts</h3>
            <p className="text-3xl font-bold text-red-600">{stats.critical_alerts}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Resolved</h3>
            <p className="text-3xl font-bold text-green-600">{stats.resolved_alerts}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2 px-4 ${activeTab === 'logs' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Activity Logs
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`pb-2 px-4 ${activeTab === 'alerts' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Security Alerts
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-4 ${activeTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Statistics
          </button>
        </div>

        {/* Activity Logs Tab */}
        {activeTab === 'logs' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Action, IP address..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.action}
                    onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                  >
                    <option value="">All Actions</option>
                    <option value="login">Login</option>
                    <option value="logout">Logout</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                    <option value="payment">Payment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.date_from}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.date_to}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Logs List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resource</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(log.created_at).toLocaleString('nl-NL')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {log.user?.email || 'System'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span>{getActionIcon(log.action)}</span>
                            <span className="text-sm font-medium text-gray-900">{log.action}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.resource_type ? `${log.resource_type} (${log.resource_id?.substring(0, 8)}...)` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {log.ip_address || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {logs.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No activity logs found
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Security Alerts Tab */}
        {activeTab === 'alerts' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.severity}
                    onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
                  >
                    <option value="">All Severities</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.date_from}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.date_to}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Alerts List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="divide-y divide-gray-200">
                  {alerts.map(alert => (
                    <div key={alert.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                              {alert.severity.toUpperCase()}
                            </span>
                            <span className="text-sm font-medium text-gray-900">{alert.type.replace(/_/g, ' ')}</span>
                            {alert.resolved && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                ✓ Resolved
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>🕐 {new Date(alert.created_at).toLocaleString('nl-NL')}</span>
                            {alert.ip_address && <span>📍 {alert.ip_address}</span>}
                          </div>
                        </div>
                        {!alert.resolved && (
                          <button
                            onClick={() => handleResolveAlert(alert.id, true)}
                            className="ml-4 px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {alerts.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No security alerts found
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Alert Distribution</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Critical</span>
                    <span className="text-sm font-medium text-red-600">{stats.critical_alerts}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full"
                      style={{ width: `${stats.total_alerts > 0 ? (stats.critical_alerts / stats.total_alerts) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Resolved</span>
                    <span className="text-sm font-medium text-green-600">{stats.resolved_alerts}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${stats.total_alerts > 0 ? (stats.resolved_alerts / stats.total_alerts) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Activity Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Activity Logs:</span>
                  <span className="font-semibold">{stats.total_logs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Alerts:</span>
                  <span className="font-semibold">{stats.total_alerts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resolution Rate:</span>
                  <span className="font-semibold text-green-600">
                    {stats.total_alerts > 0 ? Math.round((stats.resolved_alerts / stats.total_alerts) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityManagementPage;
