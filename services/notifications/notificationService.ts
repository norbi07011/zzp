/**
 * Real-time Notifications Service
 * WebSocket-based notification system for ZZP Werkplaats
 * 
 * Features:
 * - Real-time push notifications
 * - In-app notifications
 * - Email notifications
 * - Browser push notifications
 * - Notification preferences
 * - Do Not Disturb mode
 * - Notification history
 * 
 * @version 1.0.0
 * @date October 2025
 */

import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type NotificationType = 
  | 'job_posted'
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'payment_received'
  | 'payment_failed'
  | 'message_received'
  | 'review_received'
  | 'certificate_expiring'
  | 'system_announcement'
  | 'custom';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationChannel = 'in_app' | 'email' | 'push' | 'sms';

export interface Notification {
  id?: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  read_at?: string;
  expires_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  enabled_channels: NotificationChannel[];
  job_notifications: boolean;
  application_notifications: boolean;
  payment_notifications: boolean;
  message_notifications: boolean;
  marketing_notifications: boolean;
  do_not_disturb: boolean;
  dnd_start_time?: string; // HH:MM format
  dnd_end_time?: string;
  email_frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
}

export interface NotificationStats {
  total_unread: number;
  total_today: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
}

// ============================================================================
// NOTIFICATION SERVICE CLASS
// ============================================================================

class NotificationService {
  private channel: RealtimeChannel | null = null;
  private userId: string | null = null;
  private listeners: Map<string, Set<(notification: Notification) => void>> = new Map();
  private isInitialized: boolean = false;

  /**
   * Initialize notification service
   */
  async initialize(userId: string): Promise<void> {
    if (this.isInitialized && this.userId === userId) {
      return;
    }

    this.userId = userId;

    try {
      // Subscribe to real-time notifications
      await this.subscribeToNotifications();

      // Request browser notification permission
      await this.requestBrowserPermission();

      // Load user preferences
      await this.loadPreferences();

      this.isInitialized = true;
      console.log('✅ Notification Service initialized for user:', userId);
    } catch (error) {
      console.error('❌ Failed to initialize Notification Service:', error);
      throw error;
    }
  }

  /**
   * Cleanup on logout
   */
  async cleanup(): Promise<void> {
    if (this.channel) {
      await supabase.removeChannel(this.channel);
      this.channel = null;
    }
    this.listeners.clear();
    this.userId = null;
    this.isInitialized = false;
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTION
  // ============================================================================

  /**
   * Subscribe to real-time notifications via Supabase Realtime
   */
  private async subscribeToNotifications(): Promise<void> {
    if (!this.userId) return;

    // Remove existing channel if any
    if (this.channel) {
      await supabase.removeChannel(this.channel);
    }

    // Create new channel for user's notifications
    this.channel = supabase
      .channel(`notifications:${this.userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload: any) => {
          const notification = payload.new as Notification;
          this.handleNewNotification(notification);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to real-time notifications');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.error('❌ Notification channel error:', status);
        }
      });
  }

  /**
   * Handle incoming real-time notification
   */
  private handleNewNotification(notification: Notification): void {
    console.log('📬 New notification received:', notification);

    // Show browser notification if enabled
    this.showBrowserNotification(notification);

    // Play sound if enabled
    this.playNotificationSound(notification.priority);

    // Trigger listeners
    this.triggerListeners(notification.type, notification);
    this.triggerListeners('*', notification); // Wildcard listeners
  }

  // ============================================================================
  // BROWSER NOTIFICATIONS
  // ============================================================================

  /**
   * Request browser notification permission
   */
  async requestBrowserPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * Show browser notification
   */
  private async showBrowserNotification(notification: Notification): Promise<void> {
    if (Notification.permission !== 'granted') return;

    // Check if in DND mode
    const inDND = await this.isInDoNotDisturb();
    if (inDND && notification.priority !== 'urgent') return;

    try {
      const browserNotif = new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        badge: '/badge.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        silent: notification.priority === 'low',
      });

      browserNotif.onclick = () => {
        window.focus();
        if (notification.action_url) {
          window.location.href = notification.action_url;
        }
        browserNotif.close();
      };
    } catch (error) {
      console.error('Failed to show browser notification:', error);
    }
  }

  /**
   * Play notification sound based on priority
   */
  private playNotificationSound(priority: NotificationPriority): void {
    try {
      const soundFile = priority === 'urgent' 
        ? '/sounds/urgent.mp3'
        : priority === 'high'
        ? '/sounds/high.mp3'
        : '/sounds/default.mp3';

      const audio = new Audio(soundFile);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // User hasn't interacted with page yet, sound blocked
      });
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }

  // ============================================================================
  // NOTIFICATION CRUD
  // ============================================================================

  /**
   * Send a notification
   */
  async sendNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<string | null> {
    try {
      // Check user preferences
      const prefs = await this.getPreferences(notification.user_id);
      if (!prefs) {
        console.warn('No preferences found for user:', notification.user_id);
      }

      // Filter channels based on preferences
      const enabledChannels = prefs?.enabled_channels || ['in_app'];
      notification.channels = notification.channels.filter(c => enabledChannels.includes(c));

      // Check Do Not Disturb
      const inDND = await this.isInDoNotDisturb(notification.user_id);
      if (inDND && notification.priority !== 'urgent') {
        console.log('User in DND mode, skipping non-urgent notification');
        return null;
      }

      // Insert into database (will trigger real-time subscription)
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notification.user_id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          channels: notification.channels,
          read: false,
          action_url: notification.action_url,
          metadata: notification.metadata,
          expires_at: notification.expires_at,
        } as any)
        .select()
        .single();

      if (error) throw error;

      // Send via other channels if enabled
      if (notification.channels.includes('email')) {
        await this.sendEmailNotification(notification);
      }

      return (data as any)?.id || null;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return null;
    }
  }

  /**
   * Send email notification
   */
  private async sendEmailNotification(notification: Notification): Promise<void> {
    // TODO: Integrate with Email Service (KROK 1.3)
    console.log('📧 Email notification queued:', notification.title);
  }

  /**
   * Get user notifications
   */
  async getNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      type?: NotificationType;
    } = {}
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options.unreadOnly) {
        query = query.eq('read', false);
      }

      if (options.type) {
        query = query.eq('type', options.type);
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get notifications:', error);
      return [];
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      // @ts-ignore - Supabase type system issue with RPC
      const { error } = await supabase.rpc('mark_notifications_as_read', {
        notification_ids: [notificationId]
      });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<void> {
    try {
      // Get all unread notification IDs
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('read', false);

      if (notifications && notifications.length > 0) {
        // @ts-ignore - Supabase type system issue
        const notificationIds = notifications.map(n => n.id);
        // @ts-ignore - Supabase type system issue with RPC
        const { error } = await supabase.rpc('mark_notifications_as_read', {
          notification_ids: notificationIds
        });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }

  /**
   * Get notification statistics
   */
  async getStats(userId: string): Promise<NotificationStats> {
    try {
      const notifications = await this.getNotifications(userId);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats: NotificationStats = {
        total_unread: notifications.filter(n => !n.read).length,
        total_today: notifications.filter(n => 
          new Date(n.created_at!) >= today
        ).length,
        by_type: {},
        by_priority: {},
      };

      notifications.forEach(n => {
        stats.by_type[n.type] = (stats.by_type[n.type] || 0) + 1;
        stats.by_priority[n.priority] = (stats.by_priority[n.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      return {
        total_unread: 0,
        total_today: 0,
        by_type: {},
        by_priority: {},
      };
    }
  }

  // ============================================================================
  // PREFERENCES
  // ============================================================================

  /**
   * Load user preferences
   */
  private async loadPreferences(): Promise<NotificationPreferences | null> {
    if (!this.userId) return null;
    return this.getPreferences(this.userId);
  }

  /**
   * Get notification preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Create default preferences if not found
        if (error.code === 'PGRST116') {
          return await this.createDefaultPreferences(userId);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to get preferences:', error);
      return null;
    }
  }

  /**
   * Create default preferences
   */
  private async createDefaultPreferences(userId: string): Promise<NotificationPreferences> {
    const defaultPrefs: NotificationPreferences = {
      user_id: userId,
      enabled_channels: ['in_app', 'email'],
      job_notifications: true,
      application_notifications: true,
      payment_notifications: true,
      message_notifications: true,
      marketing_notifications: false,
      do_not_disturb: false,
      email_frequency: 'immediate',
    };

    const { data, error } = await supabase
      .from('notification_preferences')
      .insert(defaultPrefs as any)
      .select()
      .single();

    if (error) throw error;
    return data || defaultPrefs;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        } as any);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to update preferences:', error);
      throw error;
    }
  }

  /**
   * Check if user is in Do Not Disturb mode
   */
  private async isInDoNotDisturb(userId?: string): Promise<boolean> {
    const uid = userId || this.userId;
    if (!uid) return false;

    const prefs = await this.getPreferences(uid);
    if (!prefs || !prefs.do_not_disturb) return false;

    // Check time-based DND
    if (prefs.dnd_start_time && prefs.dnd_end_time) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      return currentTime >= prefs.dnd_start_time && currentTime <= prefs.dnd_end_time;
    }

    return true;
  }

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================

  /**
   * Add notification listener
   */
  on(type: NotificationType | '*', callback: (notification: Notification) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  /**
   * Remove notification listener
   */
  off(type: NotificationType | '*', callback: (notification: Notification) => void): void {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * Trigger listeners for notification type
   */
  private triggerListeners(type: string, notification: Notification): void {
    const listeners = this.listeners.get(type as NotificationType);
    if (listeners) {
      listeners.forEach(callback => callback(notification));
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

export const notificationService = new NotificationService();
export default notificationService;
