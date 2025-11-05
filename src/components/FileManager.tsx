import React, { useState, useCallback } from 'react';
import { useFileManager, ProjectFile, formatFileSize } from '../hooks/useFileManager';
import FileUpload from './FileUpload';

// ============================================
// SIMPLE ICONS (reusing from FileUpload)
// ============================================

const DownloadIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
    </svg>
  </div>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z" />
    </svg>
  </div>
);

const SearchIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
    </svg>
  </div>
);

const EyeIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
    </svg>
  </div>
);

const FileIcon: React.FC<{ file: ProjectFile }> = ({ file }) => {
  const mimeType = file.file_type || '';
  
  if (mimeType.startsWith('image/')) return <span className="text-blue-500">🖼️</span>;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word'))
    return <span className="text-red-500">📄</span>;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z'))
    return <span className="text-orange-500">�</span>;
  if (mimeType.startsWith('video/')) return <span className="text-purple-500">🎬</span>;
  if (mimeType.startsWith('audio/')) return <span className="text-green-500">🎵</span>;
  if (mimeType.includes('dwg') || mimeType.includes('dxf')) return <span className="text-gray-600">🔧</span>;
  return <span className="text-gray-400">📄</span>;
};

// ============================================
// INTERFACES
// ============================================

interface FileManagerProps {
  projectId: string;
  className?: string;
}

interface FileItemProps {
  file: ProjectFile;
  onDownload: (file: ProjectFile) => void;
  onDelete: (fileId: string) => void;
  onPreview: (file: ProjectFile) => void;
}

// ============================================
// FILE ITEM COMPONENT
// ============================================

const FileItem: React.FC<FileItemProps> = ({ file, onDownload, onDelete, onPreview }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const canPreview = file.file_type?.startsWith('image/') || file.file_type === 'application/pdf';
  
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* File Icon */}
        <div className="flex-shrink-0 text-2xl">
          <FileIcon file={file} />
        </div>
        
        {/* File Info */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {file.file_name || 'Unnamed file'}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>{formatFileSize(file.file_size)}</span>
            <span>•</span>
            <span>{file.file_type}</span>
          </div>
          
          {/* Description */}
          {file.description && (
            <p className="text-xs text-gray-400 mt-1 truncate">
              {file.description}
            </p>
          )}
          
          {/* Tags section removed - not available in task_attachments */}
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex items-center gap-1 ml-4">
        {canPreview && (
          <button
            onClick={() => onPreview(file)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Podgląd"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={() => onDownload(file)}
          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Pobierz"
        >
          <DownloadIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => onDelete(file.id)}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Usuń"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const FileManager: React.FC<FileManagerProps> = ({ projectId, className = '' }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [previewFile, setPreviewFile] = useState<ProjectFile | null>(null);
  
  const {
    files,
    loading,
    error,
    downloadFile,
    deleteFile,
    getFileUrl,
    refreshFiles
  } = useFileManager({ projectId, enabled: true });

  // ============================================
  // FILTERING
  // ============================================
  
  const filteredFiles = files.filter(file => {
    const matchesSearch = (file.file_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (file.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || file.file_type === selectedType;
    
    return matchesSearch && matchesType;
  });

  // ============================================
  // HANDLERS
  // ============================================
  
  const handleUploadComplete = useCallback((uploadedFiles: ProjectFile[]) => {
    refreshFiles();
  }, [refreshFiles]);

  const handleDownload = useCallback((file: ProjectFile) => {
    downloadFile(file);
  }, [downloadFile]);

  const handleDelete = useCallback(async (fileId: string) => {
    if (window.confirm('Czy na pewno chcesz usunąć ten plik?')) {
      await deleteFile(fileId);
    }
  }, [deleteFile]);

  const handlePreview = useCallback(async (file: ProjectFile) => {
    setPreviewFile(file);
  }, []);

  // ============================================
  // FILE TYPE STATS
  // ============================================
  
  const fileStats = files.reduce((stats, file) => {
    const fileType = file.file_type || 'unknown';
    stats[fileType] = (stats[fileType] || 0) + 1;
    return stats;
  }, {} as Record<string, number>);

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Prześlij nowe pliki
        </h3>
        <FileUpload
          projectId={projectId}
          onUploadComplete={handleUploadComplete}
          onUploadError={(error) => console.error('Upload error:', error)}
        />
      </div>

      {/* File Browser */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Pliki projektu ({files.length})
          </h3>
          
          <button
            onClick={refreshFiles}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Odśwież
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj plików..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Wszystkie typy</option>
            <option value="image">Obrazy ({fileStats.image || 0})</option>
            <option value="document">Dokumenty ({fileStats.document || 0})</option>
            <option value="spreadsheet">Arkusze ({fileStats.spreadsheet || 0})</option>
            <option value="video">Filmy ({fileStats.video || 0})</option>
            <option value="archive">Archiwa ({fileStats.archive || 0})</option>
            <option value="other">Inne ({fileStats.other || 0})</option>
          </select>
        </div>

        {/* File List */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Ładowanie plików...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <button
              onClick={refreshFiles}
              className="mt-2 text-blue-600 hover:text-blue-800"
            >
              Spróbuj ponownie
            </button>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {files.length === 0 
                ? 'Brak plików w tym projekcie'
                : 'Brak plików pasujących do filtrów'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFiles.map((file) => (
              <FileItem
                key={file.id}
                file={file}
                onDownload={handleDownload}
                onDelete={handleDelete}
                onPreview={handlePreview}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-full w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">{previewFile.file_name || 'Unnamed file'}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4">
              {previewFile.file_type === 'image' ? (
                <img
                  src={`https://dtnotuyagygexmkyqtgb.supabase.co/storage/v1/object/public/project-files/${previewFile.storage_path}`}
                  alt={previewFile.file_name || 'File preview'}
                  className="max-w-full max-h-96 object-contain mx-auto"
                />
              ) : previewFile.file_type === 'application/pdf' ? (
                <iframe
                  src={`https://dtnotuyagygexmkyqtgb.supabase.co/storage/v1/object/public/project-files/${previewFile.storage_path}`}
                  className="w-full h-96"
                  title={previewFile.file_name || 'PDF Preview'}
                />
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Podgląd nie jest dostępny dla tego typu pliku
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManager;