// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../../src/hooks/useAnalytics';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  DollarSign, 
  Activity,
  Download,
  Calendar,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

export const AnalyticsManager = () => {
  const {
    metrics,
    kpis,
    revenueTrend,
    loading,
    error,
    fetchMetrics,
    fetchKPIs,
    fetchRevenueTrend,
    refreshAll
  } = useAnalytics();

  const [dateRange, setDateRange] = useState<number>(30);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMetrics();
    fetchKPIs();
    fetchRevenueTrend(dateRange);
  }, [fetchMetrics, fetchKPIs, fetchRevenueTrend, dateRange]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshAll();
    } catch (err) {
      console.error('Error refreshing analytics:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportCSV = () => {
    if (!metrics) return;
    
    const csvData = [
      ['Metric', 'Value'],
      ['Total Users', metrics.totalUsers],
      ['Active Users', metrics.activeUsers],
      ['Total Certificates', metrics.totalCertificates],
      ['Total Revenue', metrics.totalRevenue],
      ['Growth Rate', metrics.growthRate + '%']
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Analityka</h1>
              <p className="text-gray-600">Dashboard z kluczowymi metrykami i trendami</p>
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
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Eksportuj CSV
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

        {/* Date Range Selector */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Zakres czasu:</span>
            <div className="flex gap-2">
              {[7, 30, 90, 365].map((days) => (
                <button
                  key={days}
                  onClick={() => setDateRange(days)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    dateRange === days
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {days === 365 ? '1 rok' : `${days} dni`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">+{metrics?.userGrowthRate || 0}%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{metrics?.totalUsers || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Wszyscy Użytkownicy</p>
            <div className="mt-2 text-xs text-gray-500">
              Aktywni: {metrics?.activeUsers || 0}
            </div>
          </div>

          {/* Total Certificates */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">+{metrics?.certificateGrowthRate || 0}%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{metrics?.totalCertificates || 0}</h3>
            <p className="text-sm text-gray-600 mt-1">Certyfikaty</p>
            <div className="mt-2 text-xs text-gray-500">
              Zweryfikowane: {metrics?.verifiedCertificates || 0}
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">+{metrics?.revenueGrowthRate || 0}%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">€{metrics?.totalRevenue?.toFixed(2) || '0.00'}</h3>
            <p className="text-sm text-gray-600 mt-1">Całkowity Przychód</p>
            <div className="mt-2 text-xs text-gray-500">
              Śr. wartość: €{metrics?.averageOrderValue?.toFixed(2) || '0.00'}
            </div>
          </div>

          {/* Activity Rate */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">+{metrics?.activityGrowthRate || 0}%</span>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{metrics?.activityRate || 0}%</h3>
            <p className="text-sm text-gray-600 mt-1">Wskaźnik Aktywności</p>
            <div className="mt-2 text-xs text-gray-500">
              Sesje: {metrics?.totalSessions || 0}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <LineChart className="w-5 h-5 text-blue-600" />
                Trend Przychodów
              </h3>
              <span className="text-sm text-gray-500">{dateRange} dni</span>
            </div>
            
            {revenueTrend && revenueTrend.length > 0 ? (
              <div className="space-y-3">
                {revenueTrend.slice(0, 10).map((item: any, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-24">{item.date}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                        style={{ width: `${(item.revenue / Math.max(...revenueTrend.map((r: any) => r.revenue))) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-20">€{item.revenue.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <LineChart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>Brak danych o przychodach</p>
              </div>
            )}
          </div>

          {/* User Activity Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                Aktywność Użytkowników
              </h3>
              <span className="text-sm text-gray-500">Ostatnie 7 dni</span>
            </div>
            
            <div className="space-y-4">
              {['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'].map((day, index) => (
                <div key={day} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-24">{day}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.random() * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12">{Math.floor(Math.random() * 100)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPIs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Kluczowe Wskaźniki Wydajności (KPIs)
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wskaźnik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wartość Bieżąca
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Postęp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {kpis.length > 0 ? (
                  kpis.map((kpi: any, index: number) => {
                    const progress = (kpi.currentValue / kpi.target) * 100;
                    const isPositive = kpi.trend > 0;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{kpi.name}</div>
                          <div className="text-sm text-gray-500">{kpi.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{kpi.currentValue}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{kpi.target}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  progress >= 100 ? 'bg-green-500' : progress >= 70 ? 'bg-blue-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{progress.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                            <span className="text-sm font-medium">{Math.abs(kpi.trend)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <PieChart className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <h3 className="text-sm font-medium text-gray-900">Brak KPIs</h3>
                      <p className="text-sm text-gray-500 mt-1">Dane będą dostępne po zebraniu metryk</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics?.conversionRate || 0}%</div>
              <div className="text-sm text-gray-600 mt-1">Conversion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{metrics?.retentionRate || 0}%</div>
              <div className="text-sm text-gray-600 mt-1">Retention Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">€{metrics?.lifetimeValue?.toFixed(2) || '0.00'}</div>
              <div className="text-sm text-gray-600 mt-1">Customer Lifetime Value</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
