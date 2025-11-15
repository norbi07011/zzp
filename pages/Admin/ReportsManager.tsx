// @ts-nocheck
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useReports } from '../../src/hooks/useReports';

export const ReportsManager = () => {
  const {
    reports,
    templates,
    loading,
    stats,
    generateReport,
    downloadReport,
    deleteReport,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    exportUsersReport,
    exportCertificatesReport,
    exportTransactionsReport,
    refreshReports
  } = useReports();

  const [activeTab, setActiveTab] = useState<'reports' | 'templates'>('reports');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchesType = filterType === 'all' || r.type === filterType;
    const matchesFormat = filterFormat === 'all' || r.format === filterFormat;
    const matchesSearch = searchQuery === '' || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesFormat && matchesSearch;
  });

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const reportData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      format: formData.get('format') as 'pdf' | 'csv' | 'excel',
      filters: {
        start_date: formData.get('start_date') as string || undefined,
        end_date: formData.get('end_date') as string || undefined,
        category: formData.get('category') as string || undefined,
      }
    };

    try {
      setGenerating(true);
      await generateReport(
        reportData.name,
        reportData.type,
        reportData.format,
        reportData.filters
      );
      setShowGenerateModal(false);
      setGenerating(false);
    } catch (error) {
      console.error('Failed to generate report:', error);
      setGenerating(false);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      await downloadReport(id);
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten raport?')) return;
    try {
      await deleteReport(id);
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const template = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      format: formData.get('format') as 'pdf' | 'csv' | 'excel',
      description: formData.get('description') as string,
      query: formData.get('query') as string,
      columns: (formData.get('columns') as string).split(',').map(c => c.trim()),
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
      description: formData.get('description') as string,
      query: formData.get('query') as string,
      columns: (formData.get('columns') as string).split(',').map(c => c.trim()),
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

  const handleQuickExport = async (type: 'users' | 'certificates' | 'transactions') => {
    try {
      setGenerating(true);
      switch (type) {
        case 'users':
          await exportUsersReport();
          break;
        case 'certificates':
          await exportCertificatesReport();
          break;
        case 'transactions':
          await exportTransactionsReport();
          break;
      }
      setGenerating(false);
    } catch (error) {
      console.error(`Failed to export ${type}:`, error);
      setGenerating(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return '📄';
      case 'csv': return '📊';
      case 'excel': return '📗';
      default: return '📁';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'users': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'certificates': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'transactions': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'analytics': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'custom': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Ładowanie raportów...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">📊 Reports Manager</h1>
            <p className="text-white/60">Generuj i zarządzaj raportami systemowymi</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowGenerateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
              disabled={generating}
            >
              {generating ? '⏳ Generowanie...' : '📊 Generuj Raport'}
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
            <div className="text-accent-cyan text-3xl mb-2">📊</div>
            <div className="text-white/60 text-sm mb-1">Wszystkie Raporty</div>
            <div className="text-white text-3xl font-bold">{stats.totalReports}</div>
          </div>
          <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-6 border border-accent-cyber/20">
            <div className="text-blue-400 text-3xl mb-2">📄</div>
            <div className="text-white/60 text-sm mb-1">PDF</div>
            <div className="text-white text-3xl font-bold">{stats.pdfReports}</div>
          </div>
          <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-6 border border-accent-cyber/20">
            <div className="text-green-400 text-3xl mb-2">📊</div>
            <div className="text-white/60 text-sm mb-1">CSV/Excel</div>
            <div className="text-white text-3xl font-bold">{stats.csvReports + stats.excelReports}</div>
          </div>
          <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-6 border border-accent-cyber/20">
            <div className="text-purple-400 text-3xl mb-2">📝</div>
            <div className="text-white/60 text-sm mb-1">Szablony</div>
            <div className="text-white text-3xl font-bold">{templates.length}</div>
          </div>
        </div>

        {/* Quick Export Buttons */}
        <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-6 border border-accent-cyber/20 mb-6">
          <h2 className="text-white font-semibold text-lg mb-4">⚡ Szybki Eksport</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleQuickExport('users')}
              disabled={generating}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              👥 Eksportuj Użytkowników
            </button>
            <button
              onClick={() => handleQuickExport('certificates')}
              disabled={generating}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📜 Eksportuj Certyfikaty
            </button>
            <button
              onClick={() => handleQuickExport('transactions')}
              disabled={generating}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💰 Eksportuj Transakcje
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gradient-glass backdrop-blur-md rounded-2xl border border-accent-cyber/20 mb-6">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('reports')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'reports'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                📊 Raporty ({reports.length})
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
                <option value="users">Użytkownicy</option>
                <option value="certificates">Certyfikaty</option>
                <option value="transactions">Transakcje</option>
                <option value="analytics">Analityka</option>
                <option value="custom">Własne</option>
              </select>

              <select
                value={filterFormat}
                onChange={(e) => setFilterFormat(e.target.value)}
                className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2"
              >
                <option value="all">Wszystkie formaty</option>
                <option value="pdf">PDF</option>
                <option value="csv">CSV</option>
                <option value="excel">Excel</option>
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

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3">
                        <div className="text-4xl">{getFormatIcon(report.format)}</div>
                        <div>
                          <h3 className="text-white font-semibold text-lg mb-2">{report.name}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(report.type)}`}>
                            {report.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-white/60">
                      <div>📅 {new Date(report.created_at).toLocaleString('pl-PL')}</div>
                      <div>💾 {report.file_size ? `${(report.file_size / 1024).toFixed(1)} KB` : 'N/A'}</div>
                      {report.generated_by && <div>👤 {report.generated_by}</div>}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDownload(report.id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        ⬇️ Pobierz
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all"
                      >
                        🗑️
                      </button>
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
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(template.type)}`}>
                            {template.type}
                          </span>
                          <span className="text-white/60 text-sm">{getFormatIcon(template.format)} {template.format.toUpperCase()}</span>
                        </div>
                        <p className="text-white/60 text-sm mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {template.columns.map((col, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs"
                            >
                              {col}
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

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-purple-500/20 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">📊 Generuj Raport</h2>
            
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Nazwa raportu</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="np. Raport miesięczny styczeń 2025"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2">Typ raportu</label>
                  <select
                    name="type"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                  >
                    <option value="users">👥 Użytkownicy</option>
                    <option value="certificates">📜 Certyfikaty</option>
                    <option value="transactions">💰 Transakcje</option>
                    <option value="analytics">📊 Analityka</option>
                    <option value="custom">⚙️ Własny</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 mb-2">Format</label>
                  <select
                    name="format"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                  >
                    <option value="pdf">📄 PDF</option>
                    <option value="csv">📊 CSV</option>
                    <option value="excel">📗 Excel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2">Data od (opcjonalnie)</label>
                  <input
                    type="date"
                    name="start_date"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-white/80 mb-2">Data do (opcjonalnie)</label>
                  <input
                    type="date"
                    name="end_date"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Kategoria (opcjonalnie)</label>
                <input
                  type="text"
                  name="category"
                  placeholder="np. Marketing, Finanse"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  disabled={generating}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {generating ? '⏳ Generowanie...' : 'Generuj'}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 mb-2">Typ</label>
                  <select
                    name="type"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                  >
                    <option value="users">👥 Użytkownicy</option>
                    <option value="certificates">📜 Certyfikaty</option>
                    <option value="transactions">💰 Transakcje</option>
                    <option value="analytics">📊 Analityka</option>
                    <option value="custom">⚙️ Własny</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/80 mb-2">Format</label>
                  <select
                    name="format"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                  >
                    <option value="pdf">📄 PDF</option>
                    <option value="csv">📊 CSV</option>
                    <option value="excel">📗 Excel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/80 mb-2">Opis</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">SQL Query</label>
                <textarea
                  name="query"
                  required
                  rows={4}
                  placeholder="SELECT * FROM..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Kolumny (oddziel przecinkami)</label>
                <input
                  type="text"
                  name="columns"
                  required
                  placeholder="np: id, name, email, created_at"
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
                <label className="block text-white/80 mb-2">Opis</label>
                <textarea
                  name="description"
                  defaultValue={editingTemplate.description || ''}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">SQL Query</label>
                <textarea
                  name="query"
                  defaultValue={editingTemplate.query}
                  required
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Kolumny</label>
                <input
                  type="text"
                  name="columns"
                  defaultValue={editingTemplate.columns.join(', ')}
                  required
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

// Export as default for lazy loading
export default ReportsManager;
