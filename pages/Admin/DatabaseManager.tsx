// @ts-nocheck
import React, { useState } from 'react';
import { useDatabase } from '../../src/hooks/useDatabase';
import { 
  Database, 
  Table, 
  HardDrive, 
  Download, 
  RefreshCw, 
  TrendingUp,
  BarChart3,
  FileText,
  Search,
  AlertCircle,
  CheckCircle,
  Activity
} from 'lucide-react';

export const DatabaseManager = () => {
  const {
    stats,
    tables,
    loading,
    error,
    totalTables,
    totalRows,
    totalSize,
    largestTables,
    fetchStats,
    fetchTableInfo,
    exportTableData,
    refreshAll
  } = useDatabase();

  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleExport = async (tableName: string) => {
    try {
      setExporting(tableName);
      await exportTableData(tableName);
    } catch (err) {
      console.error('Error exporting table:', err);
    } finally {
      setExporting(null);
    }
  };

  const handleExportAll = async () => {
    try {
      setExporting('all');
      for (const table of tables) {
        await exportTableData(table.table_name);
        await new Promise(resolve => setTimeout(resolve, 500)); // Rate limit
      }
    } catch (err) {
      console.error('Error exporting all tables:', err);
    } finally {
      setExporting(null);
    }
  };

  const filteredTables = tables.filter(table =>
    table.table_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">🗄️ Baza Danych</h1>
              <p className="text-gray-600">Statystyki, eksport i zarządzanie tabelami</p>
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
                onClick={handleExportAll}
                disabled={exporting !== null}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting === 'all' ? 'Eksportowanie...' : 'Eksportuj Wszystko'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tabele</p>
                <p className="text-2xl font-bold text-gray-900">{totalTables}</p>
              </div>
              <Table className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Wszystkie tabele w bazie
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wiersze</p>
                <p className="text-2xl font-bold text-gray-900">{totalRows.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Łączna liczba rekordów
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rozmiar</p>
                <p className="text-2xl font-bold text-gray-900">{totalSize.toFixed(2)} MB</p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Całkowity rozmiar bazy
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-2xl font-bold text-green-600">
                  <CheckCircle className="w-8 h-8" />
                </p>
              </div>
              <Activity className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Baza działa prawidłowo
            </div>
          </div>
        </div>

        {/* Largest Tables */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Największe Tabele (Top 5)
          </h3>
          <div className="space-y-3">
            {largestTables.map((table, index) => {
              const maxRows = Math.max(...largestTables.map(t => t.row_count));
              const percentage = (table.row_count / maxRows) * 100;
              
              return (
                <div key={table.table_name} className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-600 w-8">{index + 1}.</div>
                  <div className="text-sm font-medium text-gray-900 w-48">{table.table_name}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900 w-32">
                    {table.row_count.toLocaleString()} wierszy
                  </div>
                  <div className="text-sm text-gray-500 w-24">
                    {formatBytes(table.size_bytes || 0)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Szukaj tabeli..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tables List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nazwa Tabeli
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wiersze
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rozmiar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ostatnia Modyfikacja
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTables.length > 0 ? (
                  filteredTables.map((table) => (
                    <tr key={table.table_name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Table className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{table.table_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{table.row_count.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatBytes(table.size_bytes || 0)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {table.last_modified ? new Date(table.last_modified).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleExport(table.table_name)}
                          disabled={exporting === table.table_name}
                          className="text-blue-600 hover:text-blue-900 disabled:opacity-50 flex items-center gap-1 ml-auto"
                        >
                          <Download className="w-4 h-4" />
                          {exporting === table.table_name ? 'Eksportowanie...' : 'Eksportuj CSV'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Database className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                      <h3 className="text-sm font-medium text-gray-900">Nie znaleziono tabel</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {searchQuery ? 'Spróbuj innego zapytania' : 'Baza danych jest pusta'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Database Info Footer */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-purple-600" />
            Informacje o Bazie Danych
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Konfiguracja</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Typ bazy:</dt>
                  <dd className="text-sm font-medium text-gray-900">PostgreSQL (Supabase)</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Wersja:</dt>
                  <dd className="text-sm font-medium text-gray-900">{stats?.version || '15.x'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Encoding:</dt>
                  <dd className="text-sm font-medium text-gray-900">UTF-8</dd>
                </div>
              </dl>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Statystyki</h4>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Aktywne połączenia:</dt>
                  <dd className="text-sm font-medium text-gray-900">{stats?.active_connections || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Cache hit ratio:</dt>
                  <dd className="text-sm font-medium text-gray-900">{stats?.cache_hit_ratio || 0}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600">Uptime:</dt>
                  <dd className="text-sm font-medium text-gray-900">{stats?.uptime || 'N/A'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export as default for lazy loading
export default DatabaseManager;
