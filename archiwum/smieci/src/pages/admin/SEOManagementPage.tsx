// @ts-nocheck
/**
 * SEOManagementPage
 * Admin panel for SEO management, meta tags, sitemap, and search optimization
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PageSEO {
  id: string;
  page_path: string;
  page_name: string;
  title: string;
  description: string;
  keywords: string[];
  og_image?: string;
  canonical_url?: string;
  index: boolean;
  follow: boolean;
  last_updated: string;
}

interface SEOStats {
  total_pages: number;
  indexed_pages: number;
  avg_title_length: number;
  avg_description_length: number;
}

export const SEOManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pages' | 'sitemap' | 'settings'>('pages');
  const [pages, setPages] = useState<PageSEO[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<PageSEO | null>(null);
  const [stats, setStats] = useState<SEOStats>({
    total_pages: 0,
    indexed_pages: 0,
    avg_title_length: 0,
    avg_description_length: 0
  });

  useEffect(() => {
    if (activeTab === 'pages') {
      loadPages();
    }
  }, [activeTab]);

  const loadPages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('seo_pages')
        .select('*')
        .order('page_path', { ascending: true });

      if (error) throw error;

      // Calculate stats
      const totalPages = data?.length || 0;
      const indexedPages = data?.filter(p => p.index).length || 0;
      const avgTitleLength = data?.reduce((sum, p) => sum + (p.title?.length || 0), 0) / totalPages || 0;
      const avgDescLength = data?.reduce((sum, p) => sum + (p.description?.length || 0), 0) / totalPages || 0;

      setStats({
        total_pages: totalPages,
        indexed_pages: indexedPages,
        avg_title_length: Math.round(avgTitleLength),
        avg_description_length: Math.round(avgDescLength)
      });

      setPages(data || []);
    } catch (error) {
      console.error('Error loading pages:', error);
      // Use mock data
      const mockPages: PageSEO[] = [
        {
          id: '1',
          page_path: '/',
          page_name: 'Homepage',
          title: 'ZZP Werkplaats - Vind de beste ZZP professionals',
          description: 'Platform voor ZZP professionals en opdrachtgevers. Vind vakbekwame freelancers of nieuwe opdrachten.',
          keywords: ['zzp', 'freelance', 'opdrachten', 'professionals'],
          index: true,
          follow: true,
          last_updated: new Date().toISOString()
        },
        {
          id: '2',
          page_path: '/about',
          page_name: 'About Page',
          title: 'Over ZZP Werkplaats - Ons verhaal',
          description: 'Leer meer over ZZP Werkplaats en hoe wij ZZP professionals en bedrijven verbinden.',
          keywords: ['over ons', 'missie', 'visie'],
          index: true,
          follow: true,
          last_updated: new Date().toISOString()
        },
        {
          id: '3',
          page_path: '/voor-opdrachtgevers',
          page_name: 'For Employers',
          title: 'Voor Opdrachtgevers - Vind de beste ZZP talent',
          description: 'Vind gekwalificeerde ZZP professionals voor uw projecten. Eenvoudig en snel.',
          keywords: ['opdrachtgevers', 'bedrijven', 'talent', 'inhuren'],
          index: true,
          follow: true,
          last_updated: new Date().toISOString()
        }
      ];

      setPages(mockPages);
      setStats({
        total_pages: 3,
        indexed_pages: 3,
        avg_title_length: 52,
        avg_description_length: 98
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePage = async (page: PageSEO) => {
    try {
      const { error } = await supabase
        .from('seo_pages')
        .upsert({
          ...page,
          last_updated: new Date().toISOString()
        });

      if (error) throw error;

      alert('SEO settings saved successfully!');
      setEditingPage(null);
      loadPages();
    } catch (error) {
      console.error('Error saving page:', error);
      alert('Error saving SEO settings');
    }
  };

  const getTitleColor = (length: number) => {
    if (length < 30) return 'text-red-600';
    if (length > 60) return 'text-orange-600';
    return 'text-green-600';
  };

  const getDescriptionColor = (length: number) => {
    if (length < 120) return 'text-red-600';
    if (length > 160) return 'text-orange-600';
    return 'text-green-600';
  };

  const generateSitemap = () => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter(p => p.index).map(page => `  <url>
    <loc>https://zzpwerkplaats.nl${page.page_path}</loc>
    <lastmod>${new Date(page.last_updated).toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    // Download sitemap
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 SEO Manager</h1>
            <p className="text-gray-600">Manage meta tags, sitemap, and search optimization</p>
          </div>
          <button
            onClick={generateSitemap}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            📄 Generate Sitemap
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Pages</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_pages}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Indexed Pages</h3>
            <p className="text-3xl font-bold text-green-600">{stats.indexed_pages}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Title Length</h3>
            <p className={`text-3xl font-bold ${getTitleColor(stats.avg_title_length)}`}>
              {stats.avg_title_length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Description</h3>
            <p className={`text-3xl font-bold ${getDescriptionColor(stats.avg_description_length)}`}>
              {stats.avg_description_length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('pages')}
            className={`pb-2 px-4 ${activeTab === 'pages' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Pages
          </button>
          <button
            onClick={() => setActiveTab('sitemap')}
            className={`pb-2 px-4 ${activeTab === 'sitemap' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Sitemap
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2 px-4 ${activeTab === 'settings' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Settings
          </button>
        </div>

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {pages.map(page => (
                  <div key={page.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    {editingPage?.id === page.id ? (
                      // Edit Mode
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Page Name</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={editingPage.page_name}
                            onChange={(e) => setEditingPage({ ...editingPage, page_name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title ({editingPage.title.length}/60)
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={editingPage.title}
                            onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description ({editingPage.description.length}/160)
                          </label>
                          <textarea
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            rows={3}
                            value={editingPage.description}
                            onChange={(e) => setEditingPage({ ...editingPage, description: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Keywords (comma separated)</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            value={editingPage.keywords.join(', ')}
                            onChange={(e) => setEditingPage({ 
                              ...editingPage, 
                              keywords: e.target.value.split(',').map(k => k.trim()) 
                            })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={editingPage.index}
                              onChange={(e) => setEditingPage({ ...editingPage, index: e.target.checked })}
                            />
                            <span className="text-sm text-gray-700">Index (allow search engines)</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              className="mr-2"
                              checked={editingPage.follow}
                              onChange={(e) => setEditingPage({ ...editingPage, follow: e.target.checked })}
                            />
                            <span className="text-sm text-gray-700">Follow (follow links)</span>
                          </label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSavePage(editingPage)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPage(null)}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View Mode
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{page.page_name}</h3>
                            <p className="text-sm text-gray-500">{page.page_path}</p>
                          </div>
                          <div className="flex gap-2">
                            {page.index ? (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                Indexed
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                                Not Indexed
                              </span>
                            )}
                            <button
                              onClick={() => setEditingPage(page)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-gray-500">Title:</span>
                            <p className="text-sm text-gray-900">
                              {page.title} 
                              <span className={`ml-2 text-xs ${getTitleColor(page.title.length)}`}>
                                ({page.title.length}/60)
                              </span>
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500">Description:</span>
                            <p className="text-sm text-gray-900">
                              {page.description}
                              <span className={`ml-2 text-xs ${getDescriptionColor(page.description.length)}`}>
                                ({page.description.length}/160)
                              </span>
                            </p>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-gray-500">Keywords:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {page.keywords.map((keyword, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Sitemap Tab */}
        {activeTab === 'sitemap' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📄 Sitemap Configuration</h3>
              <p className="text-gray-600 mb-4">
                Your sitemap includes {stats.indexed_pages} indexed pages out of {stats.total_pages} total pages.
              </p>
              <div className="space-y-3">
                <button
                  onClick={generateSitemap}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  📥 Download Sitemap XML
                </button>
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  🔄 Submit to Google Search Console
                </button>
                <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  📊 View Sitemap Coverage
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">💡 SEO Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Keep page titles between 30-60 characters</li>
                <li>Meta descriptions should be 120-160 characters</li>
                <li>Include target keywords in titles and descriptions</li>
                <li>Ensure all important pages are indexed</li>
                <li>Update sitemap regularly and submit to search engines</li>
              </ul>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Global SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Title Suffix</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    defaultValue="| ZZP Werkplaats"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default OG Image</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="https://zzpwerkplaats.nl/og-image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canonical Domain</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    defaultValue="https://zzpwerkplaats.nl"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Analytics ID</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Google Search Console</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Verification code"
                  />
                </div>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SEOManagementPage;
