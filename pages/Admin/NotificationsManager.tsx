// @ts-nocheck
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNotifications } from '../../src/hooks/useNotifications';

export const NotificationsManager = () => {
  const {
    notifications,
    templates,
    loading,
    stats,
    unreadNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    markAsRead,
    markAllAsRead,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    sendNotification,
    bulkCreateNotifications,
    searchNotifications,
    refreshNotifications
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'notifications' | 'templates'>('notifications');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesStatus = filterStatus === 'all' || n.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const notification = {
      user_id: formData.get('user_id') as string,
      type: formData.get('type') as any,
      priority: formData.get('priority') as any,
      title: formData.get('title') as string,
      message: formData.get('message') as string,
      action_url: formData.get('action_url') as string || undefined,
    };

    try {
      await createNotification(notification);
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingNotification) return;

    const formData = new FormData(e.currentTarget);
    const updates = {
      title: formData.get('title') as string,
      message: formData.get('message') as string,
      priority: formData.get('priority') as any,
      action_url: formData.get('action_url') as string || undefined,
    };

    try {
      await updateNotification(editingNotification.id, updates);
      setEditingNotification(null);
    } catch (error) {
      console.error('Failed to update notification:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć to powiadomienie?')) return;
    try {
      await deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!selectedUserId) {
      alert('Wybierz użytkownika');
      return;
    }
    try {
      await markAllAsRead(selectedUserId);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const template = {
      name: formData.get('name') as string,
      type: formData.get('type') as any,
      subject: formData.get('subject') as string || undefined,
      body: formData.get('body') as string,
      variables: (formData.get('variables') as string).split(',').map(v => v.trim()),
      is_active: true,
    };

    try {
      await createTemplate(template);
      setShowTemplateModal(false);
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleUpdateTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingTemplate) return;

    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get('name') as string,
      subject: formData.get('subject') as string || undefined,
      body: formData.get('body') as string,
      variables: (formData.get('variables') as string).split(',').map(v => v.trim()),
    };

    try {
      await updateTemplate(editingTemplate.id, updates);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten szablon?')) return;
    try {
      await deleteTemplate(id);
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'delivered': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'read': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'push': return '📱';
      case 'email': return '✉️';
      case 'sms': return '💬';
      case 'in_app': return '🔔';
      default: return '📨';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Ładowanie powiadomień...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🔔 Notifications Manager</h1>
            <p className="text-white/60">Zarządzaj powiadomieniami użytkowników</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleMarkAllAsRead}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              ✅ Oznacz wszystko jako przeczytane
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              ➕ Nowe Powiadomienie
            </button>
            <Link
              to="/admin"
              className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              ← Powrót
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-6 border border-accent-cyber/20">
            <div className="text-accent-cyan text-3xl mb-2">📨</div>
            <div className="text-white/60 text-sm mb-1">Wysłane</div>
            <div className="text-white text-3xl font-bold">{stats.total_sent}</div>
          </div>
          <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-6 border border-accent-cyber/20">
            <div className="text-green-400 text-3xl mb-2">✅</div>
            <div className="text-white/60 text-sm mb-1">Dostarczone</div>
            <div className="text-white text-3xl font-bold">{stats.total_delivered}</div>
            <div className="text-green-400 text-sm mt-1">{stats.delivery_rate.toFixed(1)}%</div>
          </div>
          <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-6 border border-accent-cyber/20">
            <div className="text-purple-400 text-3xl mb-2">👁️</div>
            <div className="text-white/60 text-sm mb-1">Przeczytane</div>
            <div className="text-white text-3xl font-bold">{stats.total_read}</div>
            <div className="text-purple-400 text-sm mt-1">{stats.read_rate.toFixed(1)}%</div>
          </div>
          <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-6 border border-accent-cyber/20">
            <div className="text-red-400 text-3xl mb-2">❌</div>
            <div className="text-white/60 text-sm mb-1">Błędy</div>
            <div className="text-white text-3xl font-bold">{stats.total_failed}</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gradient-glass backdrop-blur-md rounded-2xl border border-accent-cyber/20 mb-6">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('notifications')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'notifications'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                🔔 Powiadomienia ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'templates'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                📝 Szablony ({templates.length})
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2"
              >
                <option value="all">Wszystkie typy</option>
                <option value="push">Push</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="in_app">In-App</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2"
              >
                <option value="all">Wszystkie statusy</option>
                <option value="pending">Oczekujące</option>
                <option value="sent">Wysłane</option>
                <option value="delivered">Dostarczone</option>
                <option value="read">Przeczytane</option>
                <option value="failed">Błąd</option>
              </select>

              <input
                type="text"
                placeholder="Szukaj..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2 w-64"
              />
            </div>
          </div>

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="p-6">
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="text-4xl">{getTypeIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-white font-semibold text-lg">{notification.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(notification.status)}`}>
                              {notification.status}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(notification.priority)}`}>
                              {notification.priority}
                            </span>
                          </div>
                          <p className="text-white/70 mb-3">{notification.message}</p>
                          <div className="flex items-center gap-4 text-sm text-white/50">
                            <span>👤 User: {notification.user_id}</span>
                            <span>📅 {new Date(notification.created_at).toLocaleString('pl-PL')}</span>
                            {notification.read_at && (
                              <span>👁️ Przeczytano: {new Date(notification.read_at).toLocaleString('pl-PL')}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {notification.status !== 'read' && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
                          >
                            ✅ Przeczytaj
                          </button>
                        )}
                        <button
                          onClick={() => setEditingNotification(notification)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                        >
                          ✏️ Edytuj
                        </button>
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
                        >
                          🗑️ Usuń
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="p-6">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  ➕ Nowy Szablon
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-2">{template.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{getTypeIcon(template.type)}</span>
                          <span className="text-white/60 text-sm">{template.type}</span>
                        </div>
                        {template.subject && (
                          <p className="text-white/60 text-sm mb-2">📧 Temat: {template.subject}</p>
                        )}
                        <p className="text-white/70 mb-3 line-clamp-2">{template.body}</p>
                        <div className="flex flex-wrap gap-2">
                          {template.variables.map((variable, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs"
                            >
                              {`{{${variable}}}`}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-white/10">
                      <button
                        onClick={() => setEditingTemplate(template)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        ✏️ Edytuj
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        🗑️ Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Notification Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-purple-500/20 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">➕ Nowe Powiadomienie</h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2">User ID</label>
                  <input
                    type="text"
                    name="user_id"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2">Typ</label>
                  <select
                    name="type"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                  >
                    <option value="push">📱 Push</option>
                    <option value="email">✉️ Email</option>
                    <option value="sms">💬 SMS</option>
                    <option value="in_app">🔔 In-App</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Priorytet</label>
                <select
                  name="priority"
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                >
                  <option value="low">🟢 Niski</option>
                  <option value="medium">🟡 Średni</option>
                  <option value="high">🟠 Wysoki</option>
                  <option value="urgent">🔴 Pilny</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Tytuł</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Wiadomość</label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Action URL (opcjonalny)</label>
                <input
                  type="text"
                  name="action_url"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Utwórz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Notification Modal */}
      {editingNotification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-purple-500/20 max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-6">✏️ Edytuj Powiadomienie</h2>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Priorytet</label>
                <select
                  name="priority"
                  defaultValue={editingNotification.priority}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                >
                  <option value="low">🟢 Niski</option>
                  <option value="medium">🟡 Średni</option>
                  <option value="high">🟠 Wysoki</option>
                  <option value="urgent">🔴 Pilny</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Tytuł</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingNotification.title}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Wiadomość</label>
                <textarea
                  name="message"
                  defaultValue={editingNotification.message}
                  required
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Action URL</label>
                <input
                  type="text"
                  name="action_url"
                  defaultValue={editingNotification.action_url || ''}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingNotification(null)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Zapisz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-purple-500/20 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">➕ Nowy Szablon</h2>
            
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Nazwa szablonu</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Typ</label>
                <select
                  name="type"
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                >
                  <option value="push">📱 Push</option>
                  <option value="email">✉️ Email</option>
                  <option value="sms">💬 SMS</option>
                  <option value="in_app">🔔 In-App</option>
                </select>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Temat (dla email)</label>
                <input
                  type="text"
                  name="subject"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Treść</label>
                <textarea
                  name="body"
                  required
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Zmienne (oddziel przecinkami)</label>
                <input
                  type="text"
                  name="variables"
                  placeholder="np: name, email, date"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Utwórz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-purple-500/20 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">✏️ Edytuj Szablon</h2>
            
            <form onSubmit={handleUpdateTemplate} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Nazwa szablonu</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingTemplate.name}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Temat</label>
                <input
                  type="text"
                  name="subject"
                  defaultValue={editingTemplate.subject || ''}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Treść</label>
                <textarea
                  name="body"
                  defaultValue={editingTemplate.body}
                  required
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Zmienne</label>
                <input
                  type="text"
                  name="variables"
                  defaultValue={editingTemplate.variables.join(', ')}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
                >
                  Zapisz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
