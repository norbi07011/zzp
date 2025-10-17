// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import * as analyticsService from '../services/analytics';
import type { DashboardMetrics, KPI } from '../services/analytics';

export function useAnalytics() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [revenueTrend, setRevenueTrend] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard metrics
  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch KPIs
  const fetchKPIs = useCallback(async () => {
    try {
      const data = await analyticsService.getKPIs();
      setKpis(data);
    } catch (err) {
      console.error('Error fetching KPIs:', err);
    }
  }, []);

  // Fetch revenue trend
  const fetchRevenueTrend = useCallback(async (days: number = 30) => {
    try {
      const data = await analyticsService.getRevenueTrend(days);
      setRevenueTrend(data);
    } catch (err) {
      console.error('Error fetching revenue trend:', err);
    }
  }, []);

  // Refresh all analytics
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchMetrics(),
      fetchKPIs(),
      fetchRevenueTrend()
    ]);
  }, [fetchMetrics, fetchKPIs, fetchRevenueTrend]);

  // Initial load
  useEffect(() => {
    fetchMetrics();
    fetchKPIs();
    fetchRevenueTrend();
  }, [fetchMetrics, fetchKPIs, fetchRevenueTrend]);

  return {
    // State
    metrics,
    kpis,
    revenueTrend,
    loading,
    error,

    // Methods
    fetchMetrics,
    fetchKPIs,
    fetchRevenueTrend,
    refreshAll,
  };
}
