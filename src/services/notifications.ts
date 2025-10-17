// @ts-nocheck
import { supabase } from '@/lib/supabase';

// Types
export type NotificationType = 'push' | 'email' | 'sms' | 'in_app';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'delivered' | 'read';

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  status: NotificationStatus;
  read_at?: string;
  delivered_at?: string;
  failed_reason?: string;
  metadata?: any;
  action_url?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  subject?: string;
  body: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total_sent: number;
  total_delivered: number;
  total_failed: number;
  total_read: number;
  delivery_rate: number;
  read_rate: number;
  by_type: Record<NotificationType, number>;
}

// Notifications
export async function fetchAllNotifications(userId?: string) {
  let query = supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Notification[];
}

export async function fetchNotificationById(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Notification;
}

export async function createNotification(notification: Partial<Notification>) {
  const { data, error } = await supabase
    .from('notifications')
    .insert([{ ...notification, status: 'pending' }])
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
}

export async function updateNotification(id: string, updates: Partial<Notification>) {
  const { data, error } = await supabase
    .from('notifications')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
}

export async function deleteNotification(id: string) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function markAsRead(id: string) {
  return await updateNotification(id, { 
    status: 'read',
    read_at: new Date().toISOString()
  });
}

export async function markAllAsRead(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ 
      status: 'read',
      read_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .neq('status', 'read')
    .select();

  if (error) throw error;
  return data as Notification[];
}

export async function sendNotification(userId: string, type: NotificationType, title: string, message: string, metadata?: any) {
  const notification = await createNotification({
    user_id: userId,
    type,
    priority: 'medium',
    title,
    message,
    metadata
  });

  // Here you would integrate with actual notification services
  // (Firebase, Twilio, SendGrid, etc.)
  
  return notification;
}

// Templates
export async function fetchAllTemplates() {
  const { data, error } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('is_active', true)
    .order('name');

  if (error) throw error;
  return data as NotificationTemplate[];
}

export async function createTemplate(template: Partial<NotificationTemplate>) {
  const { data, error } = await supabase
    .from('notification_templates')
    .insert([template])
    .select()
    .single();

  if (error) throw error;
  return data as NotificationTemplate;
}

export async function updateTemplate(id: string, updates: Partial<NotificationTemplate>) {
  const { data, error } = await supabase
    .from('notification_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as NotificationTemplate;
}

export async function deleteTemplate(id: string) {
  const { error } = await supabase
    .from('notification_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Stats
export async function getNotificationStats(userId?: string): Promise<NotificationStats> {
  const notifications = await fetchAllNotifications(userId);

  const sent = notifications.filter(n => n.status !== 'pending').length;
  const delivered = notifications.filter(n => n.status === 'delivered' || n.status === 'read').length;
  const failed = notifications.filter(n => n.status === 'failed').length;
  const read = notifications.filter(n => n.status === 'read').length;

  const byType = notifications.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {} as Record<NotificationType, number>);

  return {
    total_sent: sent,
    total_delivered: delivered,
    total_failed: failed,
    total_read: read,
    delivery_rate: sent > 0 ? (delivered / sent) * 100 : 0,
    read_rate: delivered > 0 ? (read / delivered) * 100 : 0,
    by_type: byType
  };
}

// Bulk operations
export async function bulkCreateNotifications(notifications: Partial<Notification>[]) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notifications.map(n => ({ ...n, status: 'pending' })))
    .select();

  if (error) throw error;
  return data as Notification[];
}

export async function bulkDeleteNotifications(ids: string[]) {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .in('id', ids);

  if (error) throw error;
}

// Search
export async function searchNotifications(query: string, userId?: string) {
  let dbQuery = supabase
    .from('notifications')
    .select('*')
    .or(`title.ilike.%${query}%,message.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (userId) {
    dbQuery = dbQuery.eq('user_id', userId);
  }

  const { data, error } = await dbQuery;
  if (error) throw error;
  return data as Notification[];
}
