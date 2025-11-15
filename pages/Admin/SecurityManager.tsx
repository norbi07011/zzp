// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useSecurity } from '../../src/hooks/useSecurity';
import { 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lock,
  Unlock,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Download,
  Clock,
  User,
  MapPin
} from 'lucide-react';

export const SecurityManager = () => {
  const {
    activityLogs,
    securityAlerts,
    loading,
    error,
    unresolvedAlerts,
    resolvedAlerts,
    criticalAlerts,
    highAlerts,
    recentLogs,
    fetchActivityLogs,
    fetchSecurityAlerts,
    createActivityLog,
    createSecurityAlert,
    resolveSecurityAlert,
    deleteActivityLog,
    refreshAll
  } = useSecurity();

  const [activeTab, setActiveTab] = useState<'logs' | 'alerts'>('logs');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchActivityLogs();
    fetchSecurityAlerts();
  }, [fetchActivityLogs, fetchSecurityAlerts]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshAll();
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await resolveSecurityAlert(id);
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const handleCreateAlert = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createSecurityAlert({
        level: formData.get('level') as any,
        title: formData.get('title') as string,
        description: formData.get('description') as string,
      });
      setShowAlertModal(false);
    } catch (err) {
      console.error('Error creating alert:', err);
    }
  };

  const handleExportLogs = () => {
    const csvData = [
      ['Timestamp', 'User', 'Activity Type', 'Resource', 'IP Address'],
      ...activityLogs.map(log => [
        new Date(log.created_at).toLocaleString(),
        log.user_id || 'System',
        log.activity_type,
        log.resource || '-',
        log.ip_address || '-'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredLogs = activityLogs.filter(log => {
    const matchesType = filterType === 'all' || log.activity_type === filterType;
    const matchesSearch = searchQuery === '' || 
      log.activity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const filteredAlerts = securityAlerts.filter(alert => {
    const matchesLevel = filterLevel === 'all' || alert.level === filterLevel;
    const matchesSearch = searchQuery === '' || 
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const getAlertLevelColor = (level: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
      info: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[level] || colors.info;
  };

  const getAlertIcon = (level: string) => {
    if (level === 'critical' || level === 'high') return <AlertTriangle className="w-5 h-5" />;
    if (level === 'medium') return <Shield className="w-5 h-5" />;
    return <Activity className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🔒 Bezpieczeństwo</h1>
              <p className="text-gray-600">Monitorowanie aktywności i zarządzanie alertami</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Odśwież
              </button>
              <button
                onClick={() => setShowAlertModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
              >
                <AlertTriangle className="w-4 h-4" />
                Nowy Alert
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wszystkie Alerty</p>
                <p className="text-2xl font-bold text-gray-900">{securityAlerts.length}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Nierozwiązane</p>
                <p className="text-2xl font-bold text-red-600">{unresolvedAlerts.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Krytyczne</p>
                <p className="text-2xl font-bold text-orange-600">{criticalAlerts.length}</p>
              </div>
              <XCircle className="w-8 h-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Logi Aktywności</p>
                <p className="text-2xl font-bold text-green-600">{activityLogs.length}</p>
              </div>
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('logs')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === 'logs'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-2" />
                Logi Aktywności ({activityLogs.length})
              </button>
              <button
                onClick={() => setActiveTab('alerts')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === 'alerts'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Alerty Bezpieczeństwa ({securityAlerts.length})
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Szukaj..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {activeTab === 'logs' ? (
                  <>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Wszystkie Typy</option>
                      <option value="login">Login</option>
                      <option value="logout">Logout</option>
                      <option value="create">Create</option>
                      <option value="update">Update</option>
                      <option value="delete">Delete</option>
                      <option value="view">View</option>
                    </select>
                    <button
                      onClick={handleExportLogs}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Eksportuj
                    </button>
                  </>
                ) : (
                  <select
                    value={filterLevel}
                    onChange={(e) => setFilterLevel(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Wszystkie Poziomy</option>
                    <option value="critical">Krytyczne</option>
                    <option value="high">Wysokie</option>
                    <option value="medium">Średnie</option>
                    <option value="low">Niskie</option>
                    <option value="info">Info</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'logs' ? (
          /* Activity Logs Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Użytkownik
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Typ Aktywności
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zasób
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User Agent
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <User className="w-4 h-4 text-gray-400" />
                            {log.user_id || 'System'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {log.activity_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.resource || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {log.ip_address || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {log.user_agent || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Activity className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <h3 className="text-sm font-medium text-gray-900">Brak logów aktywności</h3>
                        <p className="text-sm text-gray-500 mt-1">Logi pojawią się tutaj</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Security Alerts */
          <div className="space-y-4">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`bg-white rounded-lg shadow p-6 border-l-4 ${getAlertLevelColor(alert.level)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-3 rounded-lg ${getAlertLevelColor(alert.level)}`}>
                        {getAlertIcon(alert.level)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{alert.title}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getAlertLevelColor(alert.level)}`}>
                            {alert.level.toUpperCase()}
                          </span>
                          {alert.is_resolved && (
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Rozwiązane
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-3">{alert.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(alert.created_at).toLocaleString()}
                          </div>
                          {alert.resolved_at && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              Rozwiązano: {new Date(alert.resolved_at).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {!alert.is_resolved && (
                      <button
                        onClick={() => handleResolveAlert(alert.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Rozwiąż
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Shield className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <h3 className="text-sm font-medium text-gray-900">Brak alertów bezpieczeństwa</h3>
                <p className="text-sm text-gray-500 mt-1">Wszystko wygląda bezpiecznie</p>
              </div>
            )}
          </div>
        )}

        {/* Create Alert Modal */}
        {showAlertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold mb-6">Nowy Alert Bezpieczeństwa</h2>
              
              <form onSubmit={handleCreateAlert}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poziom
                    </label>
                    <select
                      name="level"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="info">Info</option>
                      <option value="low">Niski</option>
                      <option value="medium">Średni</option>
                      <option value="high">Wysoki</option>
                      <option value="critical">Krytyczny</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tytuł
                    </label>
                    <input
                      type="text"
                      name="title"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="np. Podejrzana aktywność wykryta"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opis
                    </label>
                    <textarea
                      name="description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Szczegółowy opis alertu..."
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAlertModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Utwórz Alert
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export as default for lazy loading
export default SecurityManager;
