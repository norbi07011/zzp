// @ts-nocheck
import { supabase } from '@/lib/supabase';

// Types
export type ReportType = 'users' | 'revenue' | 'appointments' | 'certificates' | 'companies' | 'custom';
export type ReportFormat = 'pdf' | 'csv' | 'excel' | 'json';
export type ReportStatus = 'pending' | 'generating' | 'completed' | 'failed';

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  parameters: any;
  file_url?: string;
  file_size?: number;
  generated_by: string;
  generated_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  default_format: ReportFormat;
  available_formats: ReportFormat[];
  default_parameters: any;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface ReportStats {
  total_reports: number;
  completed_reports: number;
  failed_reports: number;
  total_file_size: number;
  by_type: Record<ReportType, number>;
  by_format: Record<ReportFormat, number>;
}

// Reports
export async function fetchAllReports() {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Report[];
}

export async function fetchReportById(id: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Report;
}

export async function createReport(report: Partial<Report>) {
  const { data, error } = await supabase
    .from('reports')
    .insert([{ ...report, status: 'pending' }])
    .select()
    .single();

  if (error) throw error;
  return data as Report;
}

export async function updateReport(id: string, updates: Partial<Report>) {
  const { data, error } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Report;
}

export async function deleteReport(id: string) {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function generateReport(
  type: ReportType, 
  format: ReportFormat, 
  parameters: any, 
  generatedBy: string
): Promise<Report> {
  const report = await createReport({
    name: `${type}_report_${new Date().toISOString().split('T')[0]}`,
    type,
    format,
    parameters,
    generated_by: generatedBy
  });

  // Update status to generating
  await updateReport(report.id, { status: 'generating' });

  try {
    // Here you would implement actual report generation logic
    // This is a placeholder that simulates the process
    const fileUrl = await generateReportFile(type, format, parameters);
    
    await updateReport(report.id, {
      status: 'completed',
      file_url: fileUrl,
      generated_at: new Date().toISOString()
    });

    return await fetchReportById(report.id);
  } catch (error) {
    await updateReport(report.id, {
      status: 'failed',
      error_message: (error as Error).message
    });
    throw error;
  }
}

async function generateReportFile(type: ReportType, format: ReportFormat, parameters: any): Promise<string> {
  // Placeholder for actual report generation
  // In production, this would:
  // 1. Query data based on type and parameters
  // 2. Generate file in specified format
  // 3. Upload to storage (Supabase Storage)
  // 4. Return public URL
  
  return `https://example.com/reports/${type}_${Date.now()}.${format}`;
}

// Templates
export async function fetchAllTemplates() {
  const { data, error } = await supabase
    .from('report_templates')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as ReportTemplate[];
}

export async function createTemplate(template: Partial<ReportTemplate>) {
  const { data, error } = await supabase
    .from('report_templates')
    .insert([{ ...template, usage_count: 0 }])
    .select()
    .single();

  if (error) throw error;
  return data as ReportTemplate;
}

export async function updateTemplate(id: string, updates: Partial<ReportTemplate>) {
  const { data, error } = await supabase
    .from('report_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ReportTemplate;
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase
    .from('report_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function incrementTemplateUsage(id: string) {
  const { data, error } = await supabase
    .rpc('increment_template_usage', { template_id: id });

  if (error) throw error;
  return data;
}

// Stats
export async function getReportStats(): Promise<ReportStats> {
  const reports = await fetchAllReports();

  const completed = reports.filter(r => r.status === 'completed').length;
  const failed = reports.filter(r => r.status === 'failed').length;
  const totalSize = reports.reduce((sum, r) => sum + (r.file_size || 0), 0);

  const byType = reports.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {} as Record<ReportType, number>);

  const byFormat = reports.reduce((acc, r) => {
    acc[r.format] = (acc[r.format] || 0) + 1;
    return acc;
  }, {} as Record<ReportFormat, number>);

  return {
    total_reports: reports.length,
    completed_reports: completed,
    failed_reports: failed,
    total_file_size: totalSize,
    by_type: byType,
    by_format: byFormat
  };
}

// Export functions for quick reports
export async function exportUsersReport(format: ReportFormat = 'csv') {
  const { data: users } = await supabase.from('users').select('*');
  return generateReport('users', format, { users }, 'system');
}

export async function exportRevenueReport(startDate: string, endDate: string, format: ReportFormat = 'pdf') {
  return generateReport('revenue', format, { startDate, endDate }, 'system');
}

export async function exportAppointmentsReport(startDate: string, endDate: string, format: ReportFormat = 'excel') {
  return generateReport('appointments', format, { startDate, endDate }, 'system');
}

// Search
export async function searchReports(query: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .or(`name.ilike.%${query}%,type.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Report[];
}

// Bulk operations
export async function bulkDeleteReports(ids: string[]) {
  const { error } = await supabase
    .from('reports')
    .delete()
    .in('id', ids);

  if (error) throw error;
}
