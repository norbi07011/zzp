// @ts-nocheck
/**
 * Security Service - Supabase Integration
 * Activity logs, security alerts, IP blocking, 2FA management
 */

import { supabase } from '@/lib/supabase';

export type ActivityType = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'export' | 'failed_login';
export type AlertLevel = 'info' | 'warning' | 'critical';

export interface ActivityLog {
  id: string;
  user_id: string;
  activity_type: ActivityType;
  resource: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  created_at: string;
  user?: {
    email: string;
    full_name: string;
  };
}

export interface SecurityAlert {
  id: string;
  level: AlertLevel;
  title: string;
  description: string;
  is_resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

// Fetch activity logs
export async function fetchActivityLogs(limit: number = 100) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select(`
      *,
      user:user_id (email, full_name)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as ActivityLog[];
}

// Create activity log
export async function createActivityLog(logData: Partial<ActivityLog>) {
  const { data, error } = await supabase
    .from('activity_logs')
    .insert([logData])
    .select()
    .single();

  if (error) throw error;
  return data as ActivityLog;
}

// Fetch security alerts
export async function fetchSecurityAlerts() {
  const { data, error } = await supabase
    .from('security_alerts')
    .select('*')
    .eq('is_resolved', false)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as SecurityAlert[];
}

// Create security alert
export async function createSecurityAlert(alertData: Partial<SecurityAlert>) {
  const { data, error } = await supabase
    .from('security_alerts')
    .insert([alertData])
    .select()
    .single();

  if (error) throw error;
  return data as SecurityAlert;
}

// Resolve security alert
export async function resolveSecurityAlert(id: string) {
  const { data, error } = await supabase
    .from('security_alerts')
    .update({ is_resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SecurityAlert;
}

// Get failed login attempts
export async function getFailedLoginAttempts(hours: number = 24) {
  const since = new Date();
  since.setHours(since.getHours() - hours);

  const { data, error } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('activity_type', 'failed_login')
    .gte('created_at', since.toISOString());

  if (error) throw error;
  return data as ActivityLog[];
}
