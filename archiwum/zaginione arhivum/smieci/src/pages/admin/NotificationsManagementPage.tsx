// @ts-nocheck
/**
 * NotificationsManagementPage
 * Admin panel for managing notifications, push notifications, and alerts
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  user_id?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  is_sent: boolean;
  send_via: ('push' | 'email' | 'sms')[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduled_for?: string;
  sent_at?: string;
  created_at: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  message: string;
  type: string;
  category: string;
  usage_count: number;
}

export const NotificationsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'templates' | 'stats'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    priority: '',
    is_sent: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    pending: 0,
    read_rate: 0
  });

  useEffect(() => {
    if (activeTab === 'all') {
      loadNotifications();
    } else if (activeTab === 'templates') {
      loadTemplates();
    }
  }, [activeTab, filters]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters.is_sent) {
        query = query.eq('is_sent', filters.is_sent === 'true');
      }

      const { data, error } = await query.limit(200);

      if (error) throw error;

      const total = data?.length || 0;
      const sent = data?.filter(n => n.is_sent).length || 0;
      const pending = total - sent;
      const readCount = data?.filter(n => n.is_read).length || 0;
      const readRate = sent > 0 ? Math.round((readCount / sent) * 100) : 0;

      setStats({ total, sent, pending, read_rate: readRate });
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Mock data
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Welcome to ZZP Werkplaats!',
          message: 'Your account has been successfully created.',
          send_via: ['push', 'email'],
          priority: 'medium',
          is_read: true,
          is_sent: true,
          sent_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          type: 'warning',
          title: 'Profile Incomplete',
          message: 'Please complete your profile to increase visibility.',
          send_via: ['push'],
          priority: 'low',
          is_read: false,
          is_sent: true,
          sent_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          type: 'info',
          title: 'New Features Available',
          message: 'Check out our new certificate management system!',
          send_via: ['push', 'email'],
          priority: 'high',
          is_read: false,
          is_sent: false,
          scheduled_for: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString()
        }
      ];

      setNotifications(mockNotifications);
      setStats({
        total: 3,
        sent: 2,
        pending: 1,
        read_rate: 50
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notification_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      const mockTemplates: NotificationTemplate[] = [
        {
          id: '1',
          name: 'Welcome Email',
          title: 'Welcome to {{platform_name}}!',
          message: 'Hi {{user_name}}, thanks for joining us!',
          type: 'success',
          category: 'onboarding',
          usage_count: 342
        },
        {
          id: '2',
          name: 'Job Application Received',
          title: 'Your application has been received',
          message: 'Your application for {{job_title}} has been submitted.',
          type: 'info',
          category: 'jobs',
          usage_count: 189
        },
        {
          id: '3',
          name: 'Payment Confirmation',
          title: 'Payment successful',
          message: 'Your payment of €{{amount}} has been processed.',
          type: 'success',
          category: 'billing',
          usage_count: 156
        }
      ];
      setTemplates(mockTemplates);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const handleSendNow = (notificationId: string) => {
    alert(`Notification ${notificationId} would be sent now`);
  };

  const handleDelete = (notificationId: string) => {
    if (confirm('Delete this notification?')) {
      alert(`Notification ${notificationId} would be deleted`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔔 Notifications Manager</h1>
            <p className="text-gray-600">Manage push notifications, emails, and SMS alerts</p>
          </div>
          <button
            onClick={() => setShowNew(!showNew)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ➕ New Notification
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Sent</h3>
            <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pending</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Read Rate</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.read_rate}%</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            All Notifications
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-2 px-4 ${activeTab === 'templates' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Templates
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-4 ${activeTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Statistics
          </button>
        </div>

        {/* New Notification Form */}
        {showNew && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Notification</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Notification title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>info</option>
                    <option>success</option>
                    <option>warning</option>
                    <option>error</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Notification message..."
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option>low</option>
                    <option>medium</option>
                    <option>high</option>
                    <option>urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Send Via</label>
                  <div className="flex gap-2 mt-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-1" defaultChecked />
                      <span className="text-sm">Push</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-1" />
                      <span className="text-sm">Email</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-1" />
                      <span className="text-sm">SMS</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Send Now
                </button>
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Schedule
                </button>
                <button
                  onClick={() => setShowNew(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Notifications Tab */}
        {activeTab === 'all' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Title or message..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                  >
                    <option value="">All Types</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.is_sent}
                    onChange={(e) => setFilters({ ...filters, is_sent: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value="true">Sent</option>
                    <option value="false">Pending</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map(notification => (
                  <div key={notification.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                          <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>
                            {notification.type}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>📡 {notification.send_via.join(', ')}</span>
                          {notification.is_sent ? (
                            <span>✅ Sent {new Date(notification.sent_at!).toLocaleDateString('nl-NL')}</span>
                          ) : notification.scheduled_for ? (
                            <span>⏰ Scheduled {new Date(notification.scheduled_for).toLocaleDateString('nl-NL')}</span>
                          ) : (
                            <span>⏳ Pending</span>
                          )}
                          {notification.is_read && <span>👁️ Read</span>}
                        </div>
                      </div>
                      <div className="ml-4 flex flex-col gap-2">
                        {!notification.is_sent && (
                          <button
                            onClick={() => handleSendNow(notification.id)}
                            className="text-sm text-green-600 hover:text-green-800"
                          >
                            Send Now
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="text-sm text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No notifications found
              </div>
            )}
          </>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {templates.map(template => (
                  <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                        <span className="text-xs text-gray-500">{template.category}</span>
                      </div>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                        Used {template.usage_count}×
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Title:</p>
                        <p className="text-sm text-gray-900">{template.title}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Message:</p>
                        <p className="text-sm text-gray-900">{template.message}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="text-sm text-blue-600 hover:text-blue-800">Use Template</button>
                      <button className="text-sm text-gray-600 hover:text-gray-800">Edit</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Delivery Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Sent Rate</span>
                    <span className="text-sm font-medium">
                      {stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.sent / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Read Rate</span>
                    <span className="text-sm font-medium">{stats.read_rate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${stats.read_rate}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Notifications:</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sent:</span>
                  <span className="font-semibold text-green-600">{stats.sent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-semibold text-orange-600">{stats.pending}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsManagementPage;
