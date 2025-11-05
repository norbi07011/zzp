import React, { useState } from 'react';
import { useFileManager } from '../../src/hooks/useFileManager-simple';

interface FileManagerProps {
  projectId: string;
}

// Custom SVG icons to avoid lucide-react conflicts
const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6"/>
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
  </svg>
);

export const FileManagerSimple: React.FC<FileManagerProps> = ({ projectId }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  
  const {
    files,
    loading,
    error,
    uploadProgress,
    uploadFiles,
    deleteFile,
    downloadFile,
    refreshFiles,
    clearError
  } = useFileManager({ projectId });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      await uploadFiles(files);
    }
  };

  const handleDownload = async (file: any) => {
    try {
      await downloadFile(file);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (confirm('Czy na pewno chcesz usunąć ten plik?')) {
      await deleteFile(fileId);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">⏳ Ładowanie plików...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">📁 Pliki projektu</h3>
          <p className="text-gray-600 mt-1">Zarządzaj plikami i dokumentami projektu</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={refreshFiles}
            className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="Odśwież"
          >
            🔄
          </button>
          
          <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer flex items-center space-x-2">
            <UploadIcon />
            <span>Upload Pliki</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
          </label>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-red-800">❌ {error}</span>
            <button 
              onClick={clearError}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mb-4 space-y-2">
          {Object.values(uploadProgress).map((progress) => (
            <div key={progress.fileId} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">{progress.filename}</span>
                <span className="text-sm text-blue-600">
                  {progress.status === 'uploading' && `${progress.progress}%`}
                  {progress.status === 'processing' && '⚙️ Przetwarzanie...'}
                  {progress.status === 'complete' && '✅ Gotowe'}
                  {progress.status === 'error' && '❌ Błąd'}
                </span>
              </div>
              {progress.status === 'uploading' && (
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress.progress}%` }}
                  />
                </div>
              )}
              {progress.error && (
                <div className="text-sm text-red-600 mt-1">{progress.error}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Files Grid */}
      {files.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Brak plików</h3>
          <p className="text-gray-600 mb-4">Zacznij od uploadu pierwszego pliku do projektu</p>
          <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
            <UploadIcon />
            <span className="ml-2">Upload pierwszy plik</span>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept="*/*"
            />
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <FileIcon />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {file.file_name}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.file_size)}
                    </p>
                  </div>
                </div>
              </div>

              {file.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {file.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>{new Date(file.created_at).toLocaleDateString('pl-PL')}</span>
                {file.file_type && (
                  <span className="px-2 py-1 bg-gray-100 rounded">{file.file_type}</span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownload(file)}
                  className="flex-1 px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                >
                  <DownloadIcon />
                  <span>Pobierz</span>
                </button>
                
                <button
                  onClick={() => handleDelete(file.id)}
                  className="px-3 py-1.5 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                  title="Usuń plik"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer Stats */}
      {files.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Łącznie plików: {files.length}</span>
            <span>
              Łączny rozmiar: {formatFileSize(files.reduce((total, file) => total + file.file_size, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};