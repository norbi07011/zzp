// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import * as notificationsService from '../services/notifications';
import type { Notification, NotificationTemplate, NotificationStats, NotificationType, NotificationPriority } from '../services/notifications';

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties
  const unreadNotifications = notifications.filter(n => n.status !== 'read');
  const readNotifications = notifications.filter(n => n.status === 'read');
  const pendingNotifications = notifications.filter(n => n.status === 'pending');
  const failedNotifications = notifications.filter(n => n.status === 'failed');
  const unreadCount = unreadNotifications.length;

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsService.fetchAllNotifications(userId);
      setNotifications(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    try {
      const data = await notificationsService.fetchAllTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Error fetching templates:', err);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await notificationsService.getNotificationStats(userId);
      setStats(data);
    } catch (err) {
      console.error('Error fetching notification stats:', err);
    }
  }, [userId]);

  // Create notification
  const createNotification = useCallback(async (notificationData: Partial<Notification>) => {
    try {
      setError(null);
      const newNotification = await notificationsService.createNotification(notificationData);
      setNotifications(prev => [newNotification, ...prev]);
      await fetchStats();
      return newNotification;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Update notification
  const updateNotification = useCallback(async (id: string, updates: Partial<Notification>) => {
    try {
      setError(null);
      const updated = await notificationsService.updateNotification(id, updates);
      setNotifications(prev => prev.map(n => n.id === id ? updated : n));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      setError(null);
      await notificationsService.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Mark as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      setError(null);
      const updated = await notificationsService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? updated : n));
      await fetchStats();
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!userId) return;
    try {
      setError(null);
      await notificationsService.markAllAsRead(userId);
      await fetchNotifications();
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [userId, fetchNotifications, fetchStats]);

  // Send notification
  const sendNotification = useCallback(async (
    targetUserId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: any
  ) => {
    try {
      setError(null);
      const sent = await notificationsService.sendNotification(targetUserId, type, title, message, metadata);
      if (targetUserId === userId) {
        setNotifications(prev => [sent, ...prev]);
      }
      await fetchStats();
      return sent;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [userId, fetchStats]);

  // Create template
  const createTemplate = useCallback(async (templateData: Partial<NotificationTemplate>) => {
    try {
      setError(null);
      const newTemplate = await notificationsService.createTemplate(templateData);
      setTemplates(prev => [...prev, newTemplate]);
      return newTemplate;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Update template
  const updateTemplate = useCallback(async (id: string, updates: Partial<NotificationTemplate>) => {
    try {
      setError(null);
      const updated = await notificationsService.updateTemplate(id, updates);
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
      await notificationsService.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Bulk create notifications
  const bulkCreateNotifications = useCallback(async (notificationsData: Partial<Notification>[]) => {
    try {
      setError(null);
      const created = await notificationsService.bulkCreateNotifications(notificationsData);
      await fetchNotifications();
      await fetchStats();
      return created;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchNotifications, fetchStats]);

  // Bulk delete notifications
  const bulkDeleteNotifications = useCallback(async (ids: string[]) => {
    try {
      setError(null);
      await notificationsService.bulkDeleteNotifications(ids);
      setNotifications(prev => prev.filter(n => !ids.includes(n.id)));
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Search notifications
  const searchNotifications = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await notificationsService.searchNotifications(query, userId);
      setNotifications(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error searching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Initial load
  useEffect(() => {
    fetchNotifications();
    fetchTemplates();
    fetchStats();
  }, [fetchNotifications, fetchTemplates, fetchStats]);

  return {
    // State
    notifications,
    templates,
    stats,
    loading,
    error,

    // Computed
    unreadNotifications,
    readNotifications,
    pendingNotifications,
    failedNotifications,
    unreadCount,

    // Methods
    fetchNotifications,
    fetchTemplates,
    fetchStats,
    createNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    sendNotification,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    bulkCreateNotifications,
    bulkDeleteNotifications,
    searchNotifications,
  };
}
