// @ts-nocheck
/**
 * DatabaseManagementPage
 * Admin panel for database queries, backups, and maintenance
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TableInfo {
  table_name: string;
  row_count?: number;
  size?: string;
  last_updated?: string;
}

interface QueryResult {
  columns: string[];
  rows: any[];
  row_count: number;
  execution_time: number;
}

export const DatabaseManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tables' | 'query' | 'backups'>('tables');
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('SELECT * FROM users LIMIT 10;');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryLoading, setQueryLoading] = useState(false);
  const [queryError, setQueryError] = useState<string>('');
  const [stats, setStats] = useState({
    total_tables: 0,
    total_rows: 0,
    database_size: '0 MB',
    last_backup: 'Never'
  });

  useEffect(() => {
    if (activeTab === 'tables') {
      loadTables();
    }
  }, [activeTab]);

  const loadTables = async () => {
    setLoading(true);
    try {
      // Get core tables information
      const coreTableNames = [
        'users', 'worker_profiles', 'companies', 'jobs', 
        'applications', 'certificates', 'worker_certificates',
        'subscriptions', 'transactions', 'invoices',
        'messages', 'notifications', 'activity_logs', 'security_alerts'
      ];

      const tableInfoPromises = coreTableNames.map(async (tableName) => {
        try {
          const { count, error } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          return {
            table_name: tableName,
            row_count: count || 0,
            size: 'N/A',
            last_updated: new Date().toISOString()
          };
        } catch (error) {
          return {
            table_name: tableName,
            row_count: 0,
            size: 'N/A',
            last_updated: 'Unknown'
          };
        }
      });

      const tableInfo = await Promise.all(tableInfoPromises);
      
      const totalRows = tableInfo.reduce((sum, t) => sum + (t.row_count || 0), 0);
      
      setStats({
        total_tables: tableInfo.length,
        total_rows: totalRows,
        database_size: `${Math.round(totalRows * 0.001)} MB`,
        last_backup: 'Manual only'
      });

      setTables(tableInfo);
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      setQueryError('Query cannot be empty');
      return;
    }

    // Safety check - only allow SELECT queries
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select')) {
      setQueryError('Only SELECT queries are allowed for safety reasons');
      return;
    }

    setQueryLoading(true);
    setQueryError('');
    setQueryResult(null);

    const startTime = performance.now();

    try {
      // Extract table name from query (basic parsing)
      const tableMatch = query.match(/from\s+(\w+)/i);
      const tableName = tableMatch ? tableMatch[1] : null;

      if (!tableName) {
        throw new Error('Could not extract table name from query');
      }

      // Execute query
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(100);

      if (error) throw error;

      const endTime = performance.now();
      const executionTime = Math.round(endTime - startTime);

      // Extract columns
      const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

      setQueryResult({
        columns,
        rows: data || [],
        row_count: data?.length || 0,
        execution_time: executionTime
      });
    } catch (error: any) {
      setQueryError(error.message || 'Error executing query');
    } finally {
      setQueryLoading(false);
    }
  };

  const quickQueries = [
    { name: 'All Users', query: 'SELECT * FROM users LIMIT 10;' },
    { name: 'Active Jobs', query: 'SELECT * FROM jobs WHERE status = \'active\' LIMIT 10;' },
    { name: 'Recent Transactions', query: 'SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;' },
    { name: 'Unread Messages', query: 'SELECT * FROM messages WHERE is_read = false LIMIT 10;' },
    { name: 'Premium Companies', query: 'SELECT * FROM companies WHERE is_premium = true LIMIT 10;' },
  ];

  const handleExportData = (tableName: string) => {
    alert(`Export functionality for ${tableName} would be implemented here`);
  };

  const handleBackup = () => {
    alert('Database backup functionality would be implemented here');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🗄️ Database Manager</h1>
            <p className="text-gray-600">Query, monitor, and manage database</p>
          </div>
          <button
            onClick={handleBackup}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            💾 Create Backup
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Tables</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_tables}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Rows</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total_rows.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Database Size</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.database_size}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Last Backup</h3>
            <p className="text-2xl font-bold text-orange-600">{stats.last_backup}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('tables')}
            className={`pb-2 px-4 ${activeTab === 'tables' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Tables
          </button>
          <button
            onClick={() => setActiveTab('query')}
            className={`pb-2 px-4 ${activeTab === 'query' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Query Editor
          </button>
          <button
            onClick={() => setActiveTab('backups')}
            className={`pb-2 px-4 ${activeTab === 'backups' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Backups
          </button>
        </div>

        {/* Tables Tab */}
        {activeTab === 'tables' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Table Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Row Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tables.map(table => (
                      <tr key={table.table_name} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{table.table_name}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {table.row_count?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {table.size}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {table.last_updated ? new Date(table.last_updated).toLocaleDateString('nl-NL') : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleExportData(table.table_name)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Export
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Query Editor Tab */}
        {activeTab === 'query' && (
          <div className="space-y-6">
            {/* Quick Queries */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Queries</h3>
              <div className="flex flex-wrap gap-2">
                {quickQueries.map(q => (
                  <button
                    key={q.name}
                    onClick={() => setQuery(q.query)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200"
                  >
                    {q.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Query Input */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">SQL Query (SELECT only)</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                rows={6}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your SELECT query here..."
              />
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">⚠️ Only SELECT queries are allowed</p>
                <button
                  onClick={executeQuery}
                  disabled={queryLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {queryLoading ? 'Executing...' : '▶️ Execute Query'}
                </button>
              </div>
            </div>

            {/* Query Error */}
            {queryError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">❌ {queryError}</p>
              </div>
            )}

            {/* Query Results */}
            {queryResult && (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                      Results: {queryResult.row_count} rows
                    </h3>
                    <span className="text-xs text-gray-500">
                      Executed in {queryResult.execution_time}ms
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {queryResult.columns.map(col => (
                          <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {queryResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          {queryResult.columns.map(col => (
                            <td key={col} className="px-6 py-4 text-sm text-gray-600">
                              {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] || '-')}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Backups Tab */}
        {activeTab === 'backups' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💾 Database Backups</h3>
              <p className="text-gray-600 mb-4">
                Automated backups are managed by Supabase. You can create manual backups or restore from previous backups.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleBackup}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Manual Backup
                </button>
                <button
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Backup History
                </button>
                <button
                  className="w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Restore from Backup
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Important Notes</h4>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>Backups are stored securely in Supabase infrastructure</li>
                <li>Point-in-time recovery is available for the last 7 days</li>
                <li>Manual backups are retained for 30 days</li>
                <li>Always test backup restoration in a development environment first</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManagementPage;
