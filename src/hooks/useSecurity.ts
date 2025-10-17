// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import * as securityService from '../services/security';
import type { ActivityLog, SecurityAlert, ActivityType, AlertLevel } from '../services/security';

export function useSecurity() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties
  const unresolvedAlerts = securityAlerts.filter(a => !a.is_resolved);
  const resolvedAlerts = securityAlerts.filter(a => a.is_resolved);
  const criticalAlerts = unresolvedAlerts.filter(a => a.level === 'critical');
  const highAlerts = unresolvedAlerts.filter(a => a.level === 'high');
  const recentLogs = activityLogs.slice(0, 50);

  // Fetch activity logs
  const fetchActivityLogs = useCallback(async (userId?: string, activityType?: ActivityType) => {
    try {
      setLoading(true);
      setError(null);
      const data = await securityService.fetchActivityLogs(userId, activityType);
      setActivityLogs(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch security alerts
  const fetchSecurityAlerts = useCallback(async (level?: AlertLevel, isResolved?: boolean) => {
    try {
      const data = await securityService.fetchSecurityAlerts(level, isResolved);
      setSecurityAlerts(data);
    } catch (err) {
      console.error('Error fetching security alerts:', err);
    }
  }, []);

  // Create activity log
  const createActivityLog = useCallback(async (logData: Partial<ActivityLog>) => {
    try {
      setError(null);
      const newLog = await securityService.createActivityLog(logData);
      setActivityLogs(prev => [newLog, ...prev]);
      return newLog;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Create security alert
  const createSecurityAlert = useCallback(async (alertData: Partial<SecurityAlert>) => {
    try {
      setError(null);
      const newAlert = await securityService.createSecurityAlert(alertData);
      setSecurityAlerts(prev => [newAlert, ...prev]);
      return newAlert;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Resolve security alert
  const resolveSecurityAlert = useCallback(async (id: string) => {
    try {
      setError(null);
      const resolved = await securityService.resolveSecurityAlert(id);
      setSecurityAlerts(prev => prev.map(a => a.id === id ? resolved : a));
      return resolved;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Get failed login attempts
  const getFailedLoginAttempts = useCallback(async (userId?: string, hours: number = 24) => {
    try {
      const data = await securityService.getFailedLoginAttempts(userId, hours);
      return data;
    } catch (err) {
      console.error('Error fetching failed login attempts:', err);
      return [];
    }
  }, []);

  // Refresh all security data
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchActivityLogs(),
      fetchSecurityAlerts()
    ]);
  }, [fetchActivityLogs, fetchSecurityAlerts]);

  // Initial load
  useEffect(() => {
    fetchActivityLogs();
    fetchSecurityAlerts();
  }, [fetchActivityLogs, fetchSecurityAlerts]);

  return {
    // State
    activityLogs,
    securityAlerts,
    loading,
    error,

    // Computed
    unresolvedAlerts,
    resolvedAlerts,
    criticalAlerts,
    highAlerts,
    recentLogs,

    // Methods
    fetchActivityLogs,
    fetchSecurityAlerts,
    createActivityLog,
    createSecurityAlert,
    resolveSecurityAlert,
    getFailedLoginAttempts,
    refreshAll,
  };
}
