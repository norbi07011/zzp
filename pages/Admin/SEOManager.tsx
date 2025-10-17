// @ts-nocheck
import React, { useState } from 'react';
import { useSEO } from '../../src/hooks/useSEO';
import { Search, Link as LinkIcon, FileText, TrendingUp, Plus, Edit2, Trash2, ExternalLink, Copy } from 'lucide-react';

export const SEOManager = () => {
  const {
    metaTags,
    redirects,
    stats,
    loading,
    error,
    activeRedirects,
    createMetaTag,
    updateMetaTag,
    deleteMetaTag,
    createRedirect,
    updateRedirect,
    deleteRedirect,
    generateSitemap,
    searchMetaTags,
  } = useSEO();

  const [activeTab, setActiveTab] = useState<'meta' | 'redirects' | 'sitemap'>('meta');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [showRedirectModal, setShowRedirectModal] = useState(false);
  const [editingMeta, setEditingMeta] = useState(null);
  const [editingRedirect, setEditingRedirect] = useState(null);

  const [metaForm, setMetaForm] = useState({
    page_path: '',
    title: '',
    description: '',
    keywords: '',
    og_title: '',
    og_description: '',
    og_image: '',
  });

  const [redirectForm, setRedirectForm] = useState({
    from_path: '',
    to_path: '',
    status_code: 301,
    is_permanent: true,
  });

  const handleCreateMeta = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMetaTag(metaForm);
      setShowMetaModal(false);
      setMetaForm({
        page_path: '',
        title: '',
        description: '',
        keywords: '',
        og_title: '',
        og_description: '',
        og_image: '',
      });
    } catch (err) {
      console.error('Error creating meta tag:', err);
    }
  };

  const handleCreateRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRedirect(redirectForm);
      setShowRedirectModal(false);
      setRedirectForm({
        from_path: '',
        to_path: '',
        status_code: 301,
        is_permanent: true,
      });
    } catch (err) {
      console.error('Error creating redirect:', err);
    }
  };

  const handleGenerateSitemap = async () => {
    try {
      const sitemap = await generateSitemap();
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sitemap.xml';
      a.click();
      alert('Sitemap wygenerowana i pobrana!');
    } catch (err) {
      console.error('Error generating sitemap:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchMetaTags(searchQuery);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Manager</h1>
          <p className="text-gray-600">Zarządzaj meta tagami, przekierowaniami i sitemap</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Meta Tagi</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.total_meta_tags || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Przekierowania</p>
                <p className="text-2xl font-bold text-purple-600">{stats?.total_redirects || 0}</p>
              </div>
              <LinkIcon className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aktywne Przekierowania</p>
                <p className="text-2xl font-bold text-green-600">{activeRedirects.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Strony w Sitemap</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.sitemap_entries || 0}</p>
              </div>
              <Search className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('meta')}
                className={`${
                  activeTab === 'meta'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
              >
                Meta Tagi ({metaTags.length})
              </button>
              <button
                onClick={() => setActiveTab('redirects')}
                className={`${
                  activeTab === 'redirects'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
              >
                Przekierowania ({redirects.length})
              </button>
              <button
                onClick={() => setActiveTab('sitemap')}
                className={`${
                  activeTab === 'sitemap'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
              >
                Sitemap
              </button>
            </nav>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {activeTab !== 'sitemap' && (
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
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
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Szukaj
                </button>
              </form>
            )}

            {activeTab === 'meta' && (
              <button
                onClick={() => setShowMetaModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Dodaj Meta Tag
              </button>
            )}

            {activeTab === 'redirects' && (
              <button
                onClick={() => setShowRedirectModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Dodaj Przekierowanie
              </button>
            )}

            {activeTab === 'sitemap' && (
              <button
                onClick={handleGenerateSitemap}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Generuj Sitemap
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Meta Tags Tab */}
        {activeTab === 'meta' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ścieżka
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tytuł
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Keywords
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {metaTags.map((meta) => (
                    <tr key={meta.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-gray-900">{meta.page_path}</code>
                          <a
                            href={meta.page_path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{meta.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{meta.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">{meta.keywords || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingMeta(meta);
                              setMetaForm({
                                page_path: meta.page_path,
                                title: meta.title,
                                description: meta.description,
                                keywords: meta.keywords || '',
                                og_title: meta.og_title || '',
                                og_description: meta.og_description || '',
                                og_image: meta.og_image || '',
                              });
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edytuj"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteMetaTag(meta.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Usuń"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {metaTags.length === 0 && (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Brak meta tagów</h3>
                <p className="mt-1 text-sm text-gray-500">Dodaj pierwszy meta tag</p>
              </div>
            )}
          </div>
        )}

        {/* Redirects Tab */}
        {activeTab === 'redirects' && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Z
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Do
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kod Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Typ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Użycia
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {redirects.map((redirect) => (
                    <tr key={redirect.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm text-gray-900">{redirect.from_path}</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm text-blue-600">{redirect.to_path}</code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          redirect.status_code === 301 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {redirect.status_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {redirect.is_permanent ? 'Stałe' : 'Tymczasowe'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {redirect.redirect_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingRedirect(redirect);
                              setRedirectForm({
                                from_path: redirect.from_path,
                                to_path: redirect.to_path,
                                status_code: redirect.status_code,
                                is_permanent: redirect.is_permanent,
                              });
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edytuj"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteRedirect(redirect.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Usuń"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {redirects.length === 0 && (
              <div className="text-center py-12">
                <LinkIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Brak przekierowań</h3>
                <p className="mt-1 text-sm text-gray-500">Dodaj pierwsze przekierowanie</p>
              </div>
            )}
          </div>
        )}

        {/* Sitemap Tab */}
        {activeTab === 'sitemap' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Generator Sitemap</h3>
              <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
                Kliknij przycisk poniżej, aby wygenerować sitemap.xml zawierający wszystkie strony Twojej witryny
              </p>
              <button
                onClick={handleGenerateSitemap}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
              >
                <FileText className="w-5 h-5" />
                Generuj Sitemap XML
              </button>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg text-left max-w-2xl mx-auto">
                <h4 className="font-medium text-gray-900 mb-2">Informacje:</h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Sitemap zawiera {stats?.sitemap_entries || 0} stron</li>
                  <li>Plik zostanie zapisany jako sitemap.xml</li>
                  <li>Format zgodny z standardem XML Sitemap Protocol</li>
                  <li>Automatycznie uwzględnia wszystkie meta tagi</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Meta Tag Modal */}
        {(showMetaModal || editingMeta) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-6">
                {editingMeta ? 'Edytuj Meta Tag' : 'Nowy Meta Tag'}
              </h2>
              
              <form onSubmit={handleCreateMeta}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ścieżka Strony
                    </label>
                    <input
                      type="text"
                      value={metaForm.page_path}
                      onChange={(e) => setMetaForm({ ...metaForm, page_path: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="/about"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tytuł (Title Tag)
                    </label>
                    <input
                      type="text"
                      value={metaForm.title}
                      onChange={(e) => setMetaForm({ ...metaForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Rekomendowana długość: 50-60 znaków</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opis (Meta Description)
                    </label>
                    <textarea
                      value={metaForm.description}
                      onChange={(e) => setMetaForm({ ...metaForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Rekomendowana długość: 150-160 znaków</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Keywords (opcjonalne)
                    </label>
                    <input
                      type="text"
                      value={metaForm.keywords}
                      onChange={(e) => setMetaForm({ ...metaForm, keywords: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="word1, word2, word3"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-3">Open Graph (Social Media)</h3>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          OG Title
                        </label>
                        <input
                          type="text"
                          value={metaForm.og_title}
                          onChange={(e) => setMetaForm({ ...metaForm, og_title: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          OG Description
                        </label>
                        <textarea
                          value={metaForm.og_description}
                          onChange={(e) => setMetaForm({ ...metaForm, og_description: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          OG Image URL
                        </label>
                        <input
                          type="url"
                          value={metaForm.og_image}
                          onChange={(e) => setMetaForm({ ...metaForm, og_image: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMetaModal(false);
                      setEditingMeta(null);
                      setMetaForm({
                        page_path: '',
                        title: '',
                        description: '',
                        keywords: '',
                        og_title: '',
                        og_description: '',
                        og_image: '',
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingMeta ? 'Zapisz Zmiany' : 'Dodaj Meta Tag'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Redirect Modal */}
        {(showRedirectModal || editingRedirect) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingRedirect ? 'Edytuj Przekierowanie' : 'Nowe Przekierowanie'}
              </h2>
              
              <form onSubmit={handleCreateRedirect}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ścieżka Źródłowa
                    </label>
                    <input
                      type="text"
                      value={redirectForm.from_path}
                      onChange={(e) => setRedirectForm({ ...redirectForm, from_path: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="/old-page"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ścieżka Docelowa
                    </label>
                    <input
                      type="text"
                      value={redirectForm.to_path}
                      onChange={(e) => setRedirectForm({ ...redirectForm, to_path: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="/new-page"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kod Status HTTP
                    </label>
                    <select
                      value={redirectForm.status_code}
                      onChange={(e) => setRedirectForm({ ...redirectForm, status_code: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="301">301 - Permanent Redirect</option>
                      <option value="302">302 - Temporary Redirect</option>
                      <option value="307">307 - Temporary Redirect (Preserve Method)</option>
                      <option value="308">308 - Permanent Redirect (Preserve Method)</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={redirectForm.is_permanent}
                      onChange={(e) => setRedirectForm({ ...redirectForm, is_permanent: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700">
                      Przekierowanie stałe
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRedirectModal(false);
                      setEditingRedirect(null);
                      setRedirectForm({
                        from_path: '',
                        to_path: '',
                        status_code: 301,
                        is_permanent: true,
                      });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Anuluj
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {editingRedirect ? 'Zapisz Zmiany' : 'Dodaj Przekierowanie'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
