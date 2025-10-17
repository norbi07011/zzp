// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import * as databaseService from '../services/database';
import type { DatabaseStats, TableInfo } from '../services/database';

export function useDatabase() {
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties
  const totalTables = stats?.total_tables || 0;
  const totalRows = stats?.total_rows || 0;
  const totalSize = stats?.total_size_mb || 0;
  const largestTables = [...tables].sort((a, b) => b.row_count - a.row_count).slice(0, 5);

  // Fetch database stats
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await databaseService.getDatabaseStats();
      setStats(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching database stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch table info
  const fetchTableInfo = useCallback(async () => {
    try {
      const data = await databaseService.getTableInfo();
      setTables(data);
    } catch (err) {
      console.error('Error fetching table info:', err);
    }
  }, []);

  // Export table data
  const exportTableData = useCallback(async (tableName: string) => {
    try {
      setError(null);
      const csv = await databaseService.exportTableData(tableName);
      
      // Download CSV
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return csv;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Refresh all database data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchTableInfo()
    ]);
  }, [fetchStats, fetchTableInfo]);

  // Initial load
  useEffect(() => {
    fetchStats();
    fetchTableInfo();
  }, [fetchStats, fetchTableInfo]);

  return {
    // State
    stats,
    tables,
    loading,
    error,

    // Computed
    totalTables,
    totalRows,
    totalSize,
    largestTables,

    // Methods
    fetchStats,
    fetchTableInfo,
    exportTableData,
    refreshAll,
  };
}
