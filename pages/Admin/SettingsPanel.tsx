// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useSettings } from '../../src/hooks/useSettings';
import { 
  Settings, 
  Key, 
  Shield, 
  Users, 
  Save, 
  RefreshCw, 
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  Search,
  Filter,
  Globe,
  Lock
} from 'lucide-react';

export const SettingsPanel = () => {
  const {
    settings,
    apiKeys,
    categories,
    loading,
    error,
    publicSettings,
    privateSettings,
    activeApiKeys,
    inactiveApiKeys,
    fetchSettings,
    fetchApiKeys,
    fetchCategories,
    upsertSetting,
    deleteSetting,
    createAPIKey,
    regenerateAPIKey,
    toggleAPIKey,
    deleteAPIKey,
    refreshAll
  } = useSettings();

  const [activeTab, setActiveTab] = useState<'settings' | 'api-keys'>('settings');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [editingSetting, setEditingSetting] = useState<any>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchApiKeys();
    fetchCategories();
  }, [fetchSettings, fetchApiKeys, fetchCategories]);

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

  const handleSaveSetting = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await upsertSetting({
        key: formData.get('key') as string,
        value: formData.get('value') as string,
        category: formData.get('category') as string,
        description: formData.get('description') as string,
        is_public: formData.get('is_public') === 'on',
      });
      setShowSettingModal(false);
      setEditingSetting(null);
    } catch (err) {
      console.error('Error saving setting:', err);
    }
  };

  const handleCreateApiKey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      await createAPIKey({
        name: formData.get('name') as string,
        description: formData.get('description') as string,
        permissions: (formData.get('permissions') as string).split(',').map(p => p.trim()),
      });
      setShowApiKeyModal(false);
    } catch (err) {
      console.error('Error creating API key:', err);
    }
  };

  const handleRegenerateKey = async (id: string) => {
    if (!confirm('Czy na pewno chcesz wygenerować nowy klucz? Stary klucz przestanie działać.')) return;
    try {
      await regenerateAPIKey(id);
    } catch (err) {
      console.error('Error regenerating key:', err);
    }
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const filteredSettings = settings.filter(setting => {
    const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      setting.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      setting.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">⚙️ Ustawienia Systemu</h1>
              <p className="text-gray-600">Konfiguracja, API keys i uprawnienia</p>
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
                <p className="text-sm text-gray-600">Ustawienia</p>
                <p className="text-2xl font-bold text-gray-900">{settings.length}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">API Keys</p>
                <p className="text-2xl font-bold text-gray-900">{apiKeys.length}</p>
              </div>
              <Key className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktywne</p>
                <p className="text-2xl font-bold text-green-600">{activeApiKeys.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Kategorie</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <Filter className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === 'settings'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Ustawienia Systemu ({settings.length})
              </button>
              <button
                onClick={() => setActiveTab('api-keys')}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === 'api-keys'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Key className="w-4 h-4 inline mr-2" />
                API Keys ({apiKeys.length})
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
                {activeTab === 'settings' ? (
                  <>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Wszystkie Kategorie</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        setEditingSetting(null);
                        setShowSettingModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Dodaj Ustawienie
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowApiKeyModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nowy API Key
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'settings' ? (
          /* Settings Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Klucz
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wartość
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Widoczność
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSettings.length > 0 ? (
                    filteredSettings.map((setting) => (
                      <tr key={setting.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{setting.key}</div>
                          <div className="text-sm text-gray-500">{setting.description}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{setting.value}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {setting.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {setting.is_public ? (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                              <Globe className="w-4 h-4" />
                              Publiczne
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              <Lock className="w-4 h-4" />
                              Prywatne
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingSetting(setting);
                                setShowSettingModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Czy na pewno chcesz usunąć to ustawienie?')) {
                                  deleteSetting(setting.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <Settings className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <h3 className="text-sm font-medium text-gray-900">Brak ustawień</h3>
                        <p className="text-sm text-gray-500 mt-1">Dodaj pierwsze ustawienie</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* API Keys List */
          <div className="space-y-4">
            {apiKeys.length > 0 ? (
              apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{apiKey.name}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          apiKey.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {apiKey.is_active ? 'Aktywny' : 'Nieaktywny'}
                        </span>
                      </div>
                      {apiKey.description && (
                        <p className="text-gray-600 mb-3">{apiKey.description}</p>
                      )}
                      
                      <div className="flex items-center gap-2 mb-3">
                        <code className="px-3 py-1 bg-gray-100 rounded text-sm font-mono text-gray-800">
                          {visibleKeys.has(apiKey.id) ? apiKey.key : '••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          {visibleKeys.has(apiKey.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleCopyKey(apiKey.key, apiKey.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {copiedKey === apiKey.id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>

                      {apiKey.permissions && apiKey.permissions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {apiKey.permissions.map((perm, idx) => (
                            <span key={idx} className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              {perm}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Utworzono: {new Date(apiKey.created_at).toLocaleDateString()}</span>
                        {apiKey.last_used && (
                          <span>Ostatnie użycie: {new Date(apiKey.last_used).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => toggleAPIKey(apiKey.id)}
                        className={`px-3 py-2 rounded-lg transition ${
                          apiKey.is_active
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {apiKey.is_active ? 'Dezaktywuj' : 'Aktywuj'}
                      </button>
                      <button
                        onClick={() => handleRegenerateKey(apiKey.id)}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Czy na pewno chcesz usunąć ten API key?')) {
                            deleteAPIKey(apiKey.id);
                          }
                        }}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Key className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <h3 className="text-sm font-medium text-gray-900">Brak API Keys</h3>
                <p className="text-sm text-gray-500 mt-1">Utwórz pierwszy klucz API</p>
              </div>
            )}
          </div>
        )}

        {/* Setting Modal */}
        {showSettingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingSetting ? 'Edytuj Ustawienie' : 'Nowe Ustawienie'}
              </h2>
              
              <form onSubmit={handleSaveSetting}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Klucz
                    </label>
                    <input
                      type="text"
                      name="key"
                      defaultValue={editingSetting?.key}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="np. app_name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wartość
                    </label>
                    <input
                      type="text"
                      name="value"
                      defaultValue={editingSetting?.value}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Wartość ustawienia"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategoria
                    </label>
                    <select
                      name="category"
                      defaultValue={editingSetting?.category}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Wybierz kategorię</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opis
                    </label>
                    <textarea
                      name="description"
                      defaultValue={editingSetting?.description}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Opcjonalny opis..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="is_public"
                      id="is_public"
                      defaultChecked={editingSetting?.is_public}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="is_public" className="text-sm text-gray-700">
                      Publiczne (dostępne dla użytkowników)
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettingModal(false);
                      setEditingSetting(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Zapisz
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* API Key Modal */}
        {showApiKeyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold mb-6">Nowy API Key</h2>
              
              <form onSubmit={handleCreateApiKey}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nazwa
                    </label>
                    <input
                      type="text"
                      name="name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="np. Production API Key"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opis
                    </label>
                    <textarea
                      name="description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Opcjonalny opis..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Uprawnienia (oddzielone przecinkami)
                    </label>
                    <input
                      type="text"
                      name="permissions"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="read, write, delete"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowApiKeyModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Utwórz Klucz
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
export default SettingsPanel;
