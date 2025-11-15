// @ts-nocheck
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useMedia } from '../../src/hooks/useMedia';

export const MediaManager = () => {
  const {
    media,
    folders,
    loading,
    stats,
    createFolder,
    uploadFile,
    updateMedia,
    deleteMedia,
    moveMedia,
    refreshMedia
  } = useMedia();

  const [activeTab, setActiveTab] = useState<'files' | 'folders'>('files');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filter media by type and folder
  const filteredMedia = media.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesFolder = currentFolderId ? item.folder_id === currentFolderId : !item.folder_id;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.original_filename.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesFolder && matchesSearch;
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(0);
      await uploadFile(file, currentFolderId || undefined);
      setShowAddModal(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const parent_id = formData.get('parent_id') as string || null;

    try {
      await createFolder(name, parent_id);
      setShowFolderModal(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleUpdateMedia = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMedia) return;

    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get('name') as string,
      alt_text: formData.get('alt_text') as string,
      description: formData.get('description') as string,
    };

    try {
      await updateMedia(editingMedia.id, updates);
      setEditingMedia(null);
    } catch (error) {
      console.error('Failed to update media:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten plik?')) return;
    try {
      await deleteMedia(id);
    } catch (error) {
      console.error('Failed to delete media:', error);
    }
  };

  const getBreadcrumbs = () => {
    if (!currentFolderId) return [];
    const breadcrumbs: any[] = [];
    let folderId = currentFolderId;
    
    while (folderId) {
      const folder = folders.find(f => f.id === folderId);
      if (!folder) break;
      breadcrumbs.unshift(folder);
      folderId = folder.parent_id;
    }
    
    return breadcrumbs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Ładowanie mediów...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">🎬 Media Manager</h1>
            <p className="text-white/60">Zarządzaj plikami multimedialnymi</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowFolderModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              📁 Nowy Folder
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
            >
              ⬆️ Upload Plik
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
            <div className="text-accent-cyan text-3xl mb-2">📁</div>
            <div className="text-white/60 text-sm mb-1">Wszystkie Pliki</div>
            <div className="text-white text-3xl font-bold">{stats.totalFiles}</div>
          </div>
          <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-6 border border-accent-cyber/20">
            <div className="text-green-400 text-3xl mb-2">🖼️</div>
            <div className="text-white/60 text-sm mb-1">Obrazy</div>
            <div className="text-white text-3xl font-bold">{stats.images}</div>
          </div>
          <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-6 border border-accent-cyber/20">
            <div className="text-purple-400 text-3xl mb-2">🎥</div>
            <div className="text-white/60 text-sm mb-1">Wideo</div>
            <div className="text-white text-3xl font-bold">{stats.videos}</div>
          </div>
          <div className="bg-gradient-glass backdrop-blur-md rounded-2xl p-6 border border-accent-cyber/20">
            <div className="text-pink-400 text-3xl mb-2">💾</div>
            <div className="text-white/60 text-sm mb-1">Całkowity Rozmiar</div>
            <div className="text-white text-3xl font-bold">{(stats.totalSize / 1024 / 1024).toFixed(1)} MB</div>
          </div>
        </div>

        {/* Breadcrumbs */}
        {currentFolderId && (
          <div className="bg-gradient-glass backdrop-blur-md rounded-xl p-4 mb-6 border border-accent-cyber/20">
            <div className="flex items-center gap-2 text-white/80">
              <button
                onClick={() => setCurrentFolderId(null)}
                className="hover:text-white transition-colors"
              >
                🏠 Home
              </button>
              {getBreadcrumbs().map((folder, idx) => (
                <span key={folder.id} className="flex items-center gap-2">
                  <span>/</span>
                  <button
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="hover:text-white transition-colors"
                  >
                    {folder.name}
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tabs & Filters */}
        <div className="bg-gradient-glass backdrop-blur-md rounded-2xl border border-accent-cyber/20 mb-6">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('files')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'files'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                📄 Pliki
              </button>
              <button
                onClick={() => setActiveTab('folders')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'folders'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                📁 Foldery
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-white/5 border border-white/10 text-white rounded-lg px-4 py-2"
              >
                <option value="all">Wszystkie typy</option>
                <option value="image">Obrazy</option>
                <option value="video">Wideo</option>
                <option value="document">Dokumenty</option>
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

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-purple-500/50 transition-all group"
                  >
                    {item.type === 'image' && (
                      <img
                        src={item.url}
                        alt={item.alt_text || item.name}
                        className="w-full h-32 object-cover"
                      />
                    )}
                    {item.type === 'video' && (
                      <video src={item.url} className="w-full h-32 object-cover" />
                    )}
                    {item.type === 'document' && (
                      <div className="w-full h-32 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800">
                        <span className="text-4xl">📄</span>
                      </div>
                    )}
                    
                    <div className="p-3">
                      <div className="text-white text-sm font-medium truncate mb-2">
                        {item.name}
                      </div>
                      <div className="text-white/40 text-xs mb-3">
                        {(item.size / 1024).toFixed(1)} KB
                      </div>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingMedia(item)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 rounded"
                        >
                          ✏️
                        </button>
                        <a
                          href={item.url}
                          download
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-1 rounded text-center"
                        >
                          ⬇️
                        </a>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-1 rounded"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Folders Tab */}
          {activeTab === 'folders' && (
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {folders
                  .filter(f => f.parent_id === currentFolderId)
                  .map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => setCurrentFolderId(folder.id)}
                      className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all text-center group"
                    >
                      <div className="text-5xl mb-3">📁</div>
                      <div className="text-white font-medium">{folder.name}</div>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-purple-500/20 max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-6">⬆️ Upload Pliku</h2>
            
            <input
              type="file"
              onChange={handleUpload}
              className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3 mb-4"
            />

            {uploadProgress > 0 && (
              <div className="mb-4">
                <div className="bg-white/10 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <div className="text-white/60 text-sm mt-1 text-center">
                  {uploadProgress}%
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-all"
              >
                Anuluj
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-purple-500/20 max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-6">📁 Nowy Folder</h2>
            
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Nazwa folderu</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Folder nadrzędny</label>
                <select
                  name="parent_id"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                >
                  <option value="">Główny folder</option>
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFolderModal(false)}
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

      {/* Edit Modal */}
      {editingMedia && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl border border-purple-500/20 max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-white mb-6">✏️ Edytuj Plik</h2>
            
            <form onSubmit={handleUpdateMedia} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2">Nazwa</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingMedia.name}
                  required
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Alt Text</label>
                <input
                  type="text"
                  name="alt_text"
                  defaultValue={editingMedia.alt_text || ''}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2">Opis</label>
                <textarea
                  name="description"
                  defaultValue={editingMedia.description || ''}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-4 py-3"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
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
export default MediaManager;
