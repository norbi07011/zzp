// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useEmailMarketing } from '../../src/hooks/useEmailMarketing';
import { 
  Mail, 
  Send, 
  Users, 
  BarChart3, 
  TrendingUp,
  Plus,
  Edit2,
  Trash2,
  Play,
  Pause,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  RefreshCw,
  FileText,
  Eye
} from 'lucide-react';

export const EmailMarketingManager = () => {
  const {
    campaigns,
    templates,
    stats,
    loading,
    error,
    draftCampaigns,
    scheduledCampaigns,
    sentCampaigns,
    activeCampaigns,
    fetchCampaigns,
    fetchTemplates,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    scheduleCampaign,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refreshAll
  } = useEmailMarketing();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCampaigns();
    fetchTemplates();
  }, [fetchCampaigns, fetchTemplates]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshAll();
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createCampaign({
        name: formData.get('name') as string,
        subject: formData.get('subject') as string,
        from_email: formData.get('from_email') as string,
        from_name: formData.get('from_name') as string,
        template_id: formData.get('template_id') as string || null,
        recipients: (formData.get('recipients') as string).split(',').map(r => r.trim()),
        status: 'draft',
      });
      setShowCampaignModal(false);
    } catch (err) {
      console.error('Error creating campaign:', err);
    }
  };

  const handleUpdateCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCampaign) return;
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateCampaign(editingCampaign.id, {
        name: formData.get('name') as string,
        subject: formData.get('subject') as string,
        from_email: formData.get('from_email') as string,
        from_name: formData.get('from_name') as string,
        template_id: formData.get('template_id') as string || null,
        recipients: (formData.get('recipients') as string).split(',').map(r => r.trim()),
      });
      setShowCampaignModal(false);
      setEditingCampaign(null);
    } catch (err) {
      console.error('Error updating campaign:', err);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createTemplate({
        name: formData.get('name') as string,
        subject: formData.get('subject') as string,
        content: formData.get('content') as string,
        variables: (formData.get('variables') as string).split(',').map(v => v.trim()).filter(Boolean),
      });
      setShowTemplateModal(false);
    } catch (err) {
      console.error('Error creating template:', err);
    }
  };

  const handleSendCampaign = async (id: string) => {
    if (!confirm('Czy na pewno chcesz wysłać tę kampanię teraz?')) return;
    try {
      await sendCampaign(id);
    } catch (err) {
      console.error('Error sending campaign:', err);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sending: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-green-100 text-green-800',
      paused: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status] || badges.draft;
  };

  const getStatusIcon = (status: string) => {
    if (status === 'sent') return <CheckCircle className="w-4 h-4" />;
    if (status === 'sending') return <Send className="w-4 h-4 animate-pulse" />;
    if (status === 'scheduled') return <Calendar className="w-4 h-4" />;
    if (status === 'cancelled') return <XCircle className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">📧 Email Marketing</h1>
              <p className="text-gray-600">Zarządzanie kampaniami i szablonami email</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Odśwież
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Wysłane</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_sent || 0}</p>
              </div>
              <Send className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Ostatnie 30 dni
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Otwarte</p>
                <p className="text-2xl font-bold text-green-600">{stats?.open_rate || 0}%</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Open rate
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kliknięcia</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.click_rate || 0}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Click-through rate
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Odbiorcy</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.total_recipients || 0}</p>
              </div>
              <Users className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Całkowita baza
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === 'campaigns'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Kampanie ({campaigns.length})
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === 'templates'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                Szablony ({templates.length})
              </button>
            </nav>
          </div>

          {/* Filters & Actions */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Szukaj..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {activeTab === 'campaigns' ? (
                  <>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Wszystkie</option>
                      <option value="draft">Drafty</option>
                      <option value="scheduled">Zaplanowane</option>
                      <option value="sending">W trakcie</option>
                      <option value="sent">Wysłane</option>
                      <option value="cancelled">Anulowane</option>
                    </select>
                    <button
                      onClick={() => {
                        setEditingCampaign(null);
                        setShowCampaignModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Nowa Kampania
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      setEditingTemplate(null);
                      setShowTemplateModal(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nowy Szablon
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'campaigns' ? (
          /* Campaigns Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kampania
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Odbiorcy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statystyki
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCampaigns.length > 0 ? (
                    filteredCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            <div className="text-sm text-gray-500">{campaign.subject}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-900">
                            <Users className="w-4 h-4 text-gray-400" />
                            {campaign.recipients?.length || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>Sent: {campaign.sent_count || 0}</div>
                            <div className="text-xs text-gray-500">
                              Open: {campaign.open_rate || 0}% | Click: {campaign.click_rate || 0}%
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadge(campaign.status)}`}>
                            {getStatusIcon(campaign.status)}
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {campaign.scheduled_at ? new Date(campaign.scheduled_at).toLocaleDateString() : 
                           campaign.sent_at ? new Date(campaign.sent_at).toLocaleDateString() :
                           new Date(campaign.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            {campaign.status === 'draft' && (
                              <button
                                onClick={() => handleSendCampaign(campaign.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Wyślij teraz"
                              >
                                <Send className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingCampaign(campaign);
                                setShowCampaignModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edytuj"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Czy na pewno chcesz usunąć tę kampanię?')) {
                                  deleteCampaign(campaign.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Usuń"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Mail className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <h3 className="text-sm font-medium text-gray-900">Brak kampanii</h3>
                        <p className="text-sm text-gray-500 mt-1">Utwórz pierwszą kampanię</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Templates Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.length > 0 ? (
              templates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTemplate(template);
                          setShowTemplateModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Czy na pewno chcesz usunąć ten szablon?')) {
                            deleteTemplate(template.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{template.subject}</p>
                  {template.variables && template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.variables.map((variable, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                          {`{{${variable}}}`}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    Utworzono: {new Date(template.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 bg-white rounded-lg shadow p-12 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <h3 className="text-sm font-medium text-gray-900">Brak szablonów</h3>
                <p className="text-sm text-gray-500 mt-1">Utwórz pierwszy szablon email</p>
              </div>
            )}
          </div>
        )}

        {/* Campaign Modal */}
        {showCampaignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingCampaign ? 'Edytuj Kampanię' : 'Nowa Kampania'}
              </h2>
              
              <form onSubmit={editingCampaign ? handleUpdateCampaign : handleCreateCampaign}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nazwa Kampanii
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingCampaign?.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="np. Newsletter Listopad 2025"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temat Email
                    </label>
                    <input
                      type="text"
                      name="subject"
                      defaultValue={editingCampaign?.subject}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Temat wiadomości..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Od (Email)
                      </label>
                      <input
                        type="email"
                        name="from_email"
                        defaultValue={editingCampaign?.from_email || 'hello@zzp-werkplaats.nl'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Od (Nazwa)
                      </label>
                      <input
                        type="text"
                        name="from_name"
                        defaultValue={editingCampaign?.from_name || 'ZZP Werkplaats'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Szablon
                    </label>
                    <select
                      name="template_id"
                      defaultValue={editingCampaign?.template_id || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Wybierz szablon (opcjonalnie)</option>
                      {templates.map(template => (
                        <option key={template.id} value={template.id}>{template.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Odbiorcy (emails oddzielone przecinkami)
                    </label>
                    <textarea
                      name="recipients"
                      defaultValue={editingCampaign?.recipients?.join(', ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="email1@example.com, email2@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCampaignModal(false);
                      setEditingCampaign(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingCampaign ? 'Zapisz Zmiany' : 'Utwórz Kampanię'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingTemplate ? 'Edytuj Szablon' : 'Nowy Szablon'}
              </h2>
              
              <form onSubmit={handleCreateTemplate}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nazwa Szablonu
                    </label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={editingTemplate?.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="np. Newsletter Standard"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temat
                    </label>
                    <input
                      type="text"
                      name="subject"
                      defaultValue={editingTemplate?.subject}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Domyślny temat..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Treść HTML
                    </label>
                    <textarea
                      name="content"
                      defaultValue={editingTemplate?.content}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      rows={10}
                      placeholder="<html>...</html>"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zmienne (oddzielone przecinkami)
                    </label>
                    <input
                      type="text"
                      name="variables"
                      defaultValue={editingTemplate?.variables?.join(', ')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="name, company, date"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Użyj w treści: {'{{name}}'}, {'{{company}}'}, etc.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateModal(false);
                      setEditingTemplate(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    {editingTemplate ? 'Zapisz Szablon' : 'Utwórz Szablon'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export as default for lazy loading
export default EmailMarketingManager;
