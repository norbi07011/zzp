// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import * as reportsService from '../services/reports';
import type { Report, ReportTemplate, ReportStats, ReportType, ReportFormat, ReportStatus } from '../services/reports';

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties
  const completedReports = reports.filter(r => r.status === 'completed');
  const pendingReports = reports.filter(r => r.status === 'pending');
  const generatingReports = reports.filter(r => r.status === 'generating');
  const failedReports = reports.filter(r => r.status === 'failed');
  const recentReports = reports.slice(0, 10);

  // Fetch all reports
  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.fetchAllReports();
      setReports(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const data = await reportsService.fetchAllTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await reportsService.getReportStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching report stats:', err);
    }
  }, []);

  // Create report
  const createReport = useCallback(async (reportData: Partial<Report>) => {
    try {
      setError(null);
      const newReport = await reportsService.createReport(reportData);
      setReports(prev => [newReport, ...prev]);
      await fetchStats();
      return newReport;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Update report
  const updateReport = useCallback(async (id: string, updates: Partial<Report>) => {
    try {
      setError(null);
      const updated = await reportsService.updateReport(id, updates);
      setReports(prev => prev.map(r => r.id === id ? updated : r));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Delete report
  const deleteReport = useCallback(async (id: string) => {
    try {
      setError(null);
      await reportsService.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Generate report
  const generateReport = useCallback(async (
    type: ReportType,
    format: ReportFormat,
    parameters: any,
    generatedBy: string
  ) => {
    try {
      setError(null);
      const generated = await reportsService.generateReport(type, format, parameters, generatedBy);
      setReports(prev => prev.map(r => r.id === generated.id ? generated : r));
      await fetchStats();
      return generated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Create template
  const createTemplate = useCallback(async (templateData: Partial<ReportTemplate>) => {
    try {
      setError(null);
      const newTemplate = await reportsService.createTemplate(templateData);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Update template
  const updateTemplate = useCallback(async (id: string, updates: Partial<ReportTemplate>) => {
    try {
      setError(null);
      const updated = await reportsService.updateTemplate(id, updates);
      setTemplates(prev => prev.map(t => t.id === id ? updated : t));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Delete template
  const deleteTemplate = useCallback(async (id: string) => {
    try {
      setError(null);
      await reportsService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Quick export functions
  const exportUsersReport = useCallback(async (format: ReportFormat = 'csv') => {
    try {
      setError(null);
      const report = await reportsService.exportUsersReport(format);
      await fetchReports();
      await fetchStats();
      return report;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchReports, fetchStats]);

  const exportRevenueReport = useCallback(async (startDate: string, endDate: string, format: ReportFormat = 'pdf') => {
    try {
      setError(null);
      const report = await reportsService.exportRevenueReport(startDate, endDate, format);
      await fetchReports();
      await fetchStats();
      return report;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchReports, fetchStats]);

  const exportAppointmentsReport = useCallback(async (startDate: string, endDate: string, format: ReportFormat = 'excel') => {
    try {
      setError(null);
      const report = await reportsService.exportAppointmentsReport(startDate, endDate, format);
      await fetchReports();
      await fetchStats();
      return report;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchReports, fetchStats]);

  // Search reports
  const searchReports = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await reportsService.searchReports(query);
      setReports(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error searching reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Bulk delete reports
  const bulkDeleteReports = useCallback(async (ids: string[]) => {
    try {
      setError(null);
      await reportsService.bulkDeleteReports(ids);
      setReports(prev => prev.filter(r => !ids.includes(r.id)));
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Initial load
  useEffect(() => {
    fetchReports();
    fetchTemplates();
    fetchStats();
  }, [fetchReports, fetchTemplates, fetchStats]);

  return {
    // State
    reports,
    templates,
    stats,
    loading,
    error,

    // Computed
    completedReports,
    pendingReports,
    generatingReports,
    failedReports,
    recentReports,

    // Methods
    fetchReports,
    fetchTemplates,
    fetchStats,
    createReport,
    updateReport,
    deleteReport,
    generateReport,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    exportUsersReport,
    exportRevenueReport,
    exportAppointmentsReport,
    searchReports,
    bulkDeleteReports,
  };
}
