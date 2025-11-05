// @ts-nocheck
/**
 * Notification Center Component
 * Real-time notification UI with toast notifications
 * 
 * Features:
 * - Real-time notification feed
 * - Toast notifications
 * - Mark as read/unread
 * - Filter by type/priority
 * - Notification preferences
 * 
 * @version 1.0.0
 * @date October 2025
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  X,
  Filter,
  AlertCircle,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';
import notificationService, { 
  Notification, 
  NotificationPreferences,
  NotificationType,
  NotificationPriority 
} from '../../services/notifications/notificationService';
import { useAuth } from '../../contexts/AuthContext';
import './NotificationCenter.css';

// ============================================================================
// INTERFACES
// ============================================================================

interface ToastNotification extends Notification {
  toastId: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const NotificationCenter: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [showPreferences, setShowPreferences] = useState(false);

  // Initialize
  useEffect(() => {
    if (user) {
      initializeNotifications();
    }

    return () => {
      if (user) {
        notificationService.cleanup();
      }
    };
  }, [user]);

  /**
   * Initialize notification service
   */
  const initializeNotifications = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Initialize service
      await notificationService.initialize(user.id);

      // Load notifications
      const notifs = await notificationService.getNotifications(user.id, {
        limit: 50
      });
      setNotifications(notifs);

      // Load preferences
      const prefs = await notificationService.getPreferences(user.id);
      setPreferences(prefs);

      // Listen for new notifications
      notificationService.on('*', handleNewNotification);

    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle new notification
   */
  const handleNewNotification = (notification: Notification) => {
    // Add to list
    setNotifications(prev => [notification, ...prev]);

    // Show toast
    showToast(notification);
  };

  /**
   * Show toast notification
   */
  const showToast = (notification: Notification) => {
    const toastId = `toast-${Date.now()}-${Math.random()}`;
    const toast: ToastNotification = {
      ...notification,
      toastId
    };

    setToasts(prev => [...prev, toast]);

    // Auto-dismiss after delay
    const delay = notification.priority === 'urgent' ? 10000 : 5000;
    setTimeout(() => {
      dismissToast(toastId);
    }, delay);
  };

  /**
   * Dismiss toast
   */
  const dismissToast = (toastId: string) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  };

  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId: string) => {
    await notificationService.markAsRead(notificationId);
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  /**
   * Mark all as read
   */
  const markAllAsRead = async () => {
    if (!user) return;
    await notificationService.markAllAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  /**
   * Delete notification
   */
  const deleteNotification = async (notificationId: string) => {
    await notificationService.deleteNotification(notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  /**
   * Toggle DND mode
   */
  const toggleDND = async () => {
    if (!user || !preferences) return;

    const newDND = !preferences.do_not_disturb;
    await notificationService.updatePreferences(user.id, {
      do_not_disturb: newDND
    });

    setPreferences({
      ...preferences,
      do_not_disturb: newDND
    });
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  // Get priority icon
  const getPriorityIcon = (priority: NotificationPriority) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle size={18} className="priority-urgent" />;
      case 'high':
        return <AlertCircle size={18} className="priority-high" />;
      case 'medium':
        return <Info size={18} className="priority-medium" />;
      case 'low':
        return <Clock size={18} className="priority-low" />;
    }
  };

  // Get type emoji
  const getTypeEmoji = (type: NotificationType) => {
    const emojiMap: Record<NotificationType, string> = {
      job_posted: '💼',
      application_received: '📨',
      application_accepted: '✅',
      application_rejected: '❌',
      payment_received: '💰',
      payment_failed: '⚠️',
      message_received: '💬',
      review_received: '⭐',
      certificate_expiring: '📜',
      system_announcement: '📢',
      custom: '🔔'
    };
    return emojiMap[type] || '🔔';
  };

  return (
    <>
      {/* Notification Bell Button */}
      <div className="notification-bell-container">
        <button
          className="notification-bell"
          onClick={() => setIsOpen(!isOpen)}
        >
          {preferences?.do_not_disturb ? (
            <BellOff size={20} />
          ) : (
            <Bell size={20} />
          )}
          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
          )}
        </button>
      </div>

      {/* Notification Panel */}
      {isOpen && (
        <div className="notification-panel">
          {/* Header */}
          <div className="panel-header">
            <div className="header-left">
              <h3>🔔 Notifications</h3>
              {unreadCount > 0 && (
                <span className="unread-count">{unreadCount} new</span>
              )}
            </div>
            <div className="header-actions">
              <button
                className="btn-icon"
                onClick={toggleDND}
                title={preferences?.do_not_disturb ? 'Disable Do Not Disturb' : 'Enable Do Not Disturb'}
              >
                {preferences?.do_not_disturb ? <BellOff size={18} /> : <Bell size={18} />}
              </button>
              <button
                className="btn-icon"
                onClick={() => setShowPreferences(!showPreferences)}
                title="Settings"
              >
                <Settings size={18} />
              </button>
              <button
                className="btn-icon"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="panel-filters">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            {unreadCount > 0 && (
              <button
                className="btn-link"
                onClick={markAllAsRead}
              >
                <CheckCheck size={16} />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="notifications-list">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading notifications...</p>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={48} style={{ opacity: 0.3 }} />
                <p>No notifications yet</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'} priority-${notification.priority}`}
                >
                  <div className="notification-icon">
                    <span className="type-emoji">{getTypeEmoji(notification.type)}</span>
                    {getPriorityIcon(notification.priority)}
                  </div>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <div className="notification-meta">
                      <span className="timestamp">
                        {new Date(notification.created_at!).toLocaleString()}
                      </span>
                      {notification.action_url && (
                        <a href={notification.action_url} className="action-link">
                          View <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button
                        className="btn-icon-small"
                        onClick={() => markAsRead(notification.id!)}
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      className="btn-icon-small"
                      onClick={() => deleteNotification(notification.id!)}
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div
            key={toast.toastId}
            className={`toast-notification priority-${toast.priority}`}
          >
            <div className="toast-icon">
              <span className="type-emoji">{getTypeEmoji(toast.type)}</span>
            </div>
            <div className="toast-content">
              <h4>{toast.title}</h4>
              <p>{toast.message}</p>
            </div>
            <button
              className="toast-close"
              onClick={() => dismissToast(toast.toastId)}
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationCenter;
