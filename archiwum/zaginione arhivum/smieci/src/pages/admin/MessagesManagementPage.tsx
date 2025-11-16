// @ts-nocheck
/**
 * MessagesManagementPage
 * Admin panel for managing messages, chat system, and communication
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  subject?: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: {
    email: string;
  };
  receiver?: {
    email: string;
  };
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  is_active: boolean;
}

export const MessagesManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'messages' | 'templates' | 'stats'>('messages');
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    is_read: '',
    date_from: '',
    date_to: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    today: 0,
    templates: 0
  });

  useEffect(() => {
    if (activeTab === 'messages') {
      loadMessages();
    } else if (activeTab === 'templates') {
      loadTemplates();
    }
  }, [activeTab, filters]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(email),
          receiver:receiver_id(email)
        `)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`subject.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      if (filters.is_read) {
        query = query.eq('is_read', filters.is_read === 'true');
      }

      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;

      // Calculate stats
      const total = data?.length || 0;
      const unread = data?.filter(m => !m.is_read).length || 0;
      const today = data?.filter(m => {
        const msgDate = new Date(m.created_at).toDateString();
        const todayDate = new Date().toDateString();
        return msgDate === todayDate;
      }).length || 0;

      setStats({ ...stats, total, unread, today });
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      setStats({ ...stats, templates: data?.length || 0 });
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string, read: boolean) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: read })
        .eq('id', messageId);

      if (error) throw error;
      loadMessages();
    } catch (error) {
      console.error('Error updating message:', error);
    }
  };

  const handleToggleTemplate = async (templateId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: active })
        .eq('id', templateId);

      if (error) throw error;
      loadTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💬 Messages & Communication</h1>
          <p className="text-gray-600">Manage messages, email templates, and communication system</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Messages</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Unread</h3>
            <p className="text-3xl font-bold text-red-600">{stats.unread}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Today</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.today}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Templates</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.templates}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('messages')}
            className={`pb-2 px-4 ${activeTab === 'messages' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`pb-2 px-4 ${activeTab === 'templates' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Email Templates
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-2 px-4 ${activeTab === 'stats' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Statistics
          </button>
        </div>

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Subject or content..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.is_read}
                    onChange={(e) => setFilters({ ...filters, is_read: e.target.value })}
                  >
                    <option value="">All</option>
                    <option value="false">Unread</option>
                    <option value="true">Read</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.date_from}
                    onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={filters.date_to}
                    onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Messages List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="divide-y divide-gray-200">
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`p-4 hover:bg-gray-50 ${!message.is_read ? 'bg-blue-50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {!message.is_read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              From: {message.sender?.email || 'Unknown'}
                            </span>
                            <span className="text-sm text-gray-500">→</span>
                            <span className="text-sm text-gray-600">
                              To: {message.receiver?.email || 'Unknown'}
                            </span>
                          </div>
                          {message.subject && (
                            <h4 className="font-medium text-gray-900 mb-1">{message.subject}</h4>
                          )}
                          <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {new Date(message.created_at).toLocaleString('nl-NL')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleMarkAsRead(message.id, !message.is_read)}
                          className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {message.is_read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {messages.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No messages found
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg border border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map(template => (
                    <tr key={template.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {template.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {template.subject}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {template.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {template.is_active ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleTemplate(template.id, !template.is_active)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {template.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {templates.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No templates found
              </div>
            )}
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Message Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Messages:</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Unread Messages:</span>
                  <span className="font-semibold text-red-600">{stats.unread}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Today's Messages:</span>
                  <span className="font-semibold text-blue-600">{stats.today}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Read Rate:</span>
                  <span className="font-semibold text-green-600">
                    {stats.total > 0 ? Math.round(((stats.total - stats.unread) / stats.total) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📧 Template Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Templates:</span>
                  <span className="font-semibold">{stats.templates}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Templates:</span>
                  <span className="font-semibold text-green-600">
                    {templates.filter(t => t.is_active).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Inactive Templates:</span>
                  <span className="font-semibold text-gray-600">
                    {templates.filter(t => !t.is_active).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesManagementPage;
