import React, { useRef, useState, useCallback } from 'react';
// Używamy uproszczonych ikon DIV zamiast lucide-react ze względu na konflikty nazw
import { useFileManager, ProjectFile, FileType, UploadProgress } from '../hooks/useFileManager';

// ============================================
// SIMPLE ICON COMPONENTS
// ============================================

const UploadIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
    </svg>
  </div>
);

const XIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
    </svg>
  </div>
);

const FileIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
    </svg>
  </div>
);

const ImageIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
    </svg>
  </div>
);

const FileTextIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
    </svg>
  </div>
);

const VideoIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z" />
    </svg>
  </div>
);

const ArchiveIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>📁</div>
);

const MusicIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>🎵</div>
);

const WrenchIcon = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>🔧</div>
);

// ============================================
// INTERFACES
// ============================================

interface FileUploadProps {
  projectId: string;
  onUploadComplete?: (files: ProjectFile[]) => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number; // in bytes, default 100MB
  allowedTypes?: string[]; // MIME types, default all
  multiple?: boolean;
  className?: string;
}

interface FileItemProps {
  file: File;
  progress?: UploadProgress;
  onRemove: (file: File) => void;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (mimeType: string): React.ReactNode => {
  if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word')) 
    return <FileTextIcon className="w-5 h-5 text-red-500" />;
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) 
    return <ArchiveIcon className="w-5 h-5 text-orange-500" />;
  if (mimeType.startsWith('video/')) return <VideoIcon className="w-5 h-5 text-purple-500" />;
  if (mimeType.startsWith('audio/')) return <MusicIcon className="w-5 h-5 text-green-500" />;
  if (mimeType.includes('dwg') || mimeType.includes('dxf')) return <WrenchIcon className="w-5 h-5 text-gray-600" />;
  return <FileIcon className="w-5 h-5 text-gray-400" />;
};

const validateFile = (file: File, maxSize: number, allowedTypes?: string[]): string | null => {
  // Check file size
  if (file.size > maxSize) {
    return `Plik ${file.name} jest za duży. Maksymalny rozmiar: ${formatFileSize(maxSize)}`;
  }
  
  // Check file type
  if (allowedTypes && allowedTypes.length > 0) {
    const isAllowed = allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.replace('/*', '/'));
      }
      return file.type === type;
    });
    
    if (!isAllowed) {
      return `Typ pliku ${file.type} nie jest obsługiwany`;
    }
  }
  
  return null;
};

// ============================================
// FILE ITEM COMPONENT
// ============================================

const FileItem: React.FC<FileItemProps> = ({ file, progress, onRemove }) => {
  const isUploading = progress?.status === 'uploading';
  const hasError = progress?.status === 'error';
  const isComplete = progress?.status === 'complete';
  
  return (
    <div className={`
      flex items-center gap-3 p-3 bg-white rounded-lg border
      ${hasError ? 'border-red-200 bg-red-50' : ''}
      ${isComplete ? 'border-green-200 bg-green-50' : ''}
      ${isUploading ? 'border-blue-200 bg-blue-50' : ''}
    `}>
      {/* File Icon */}
      <div className="flex-shrink-0">
        {getFileIcon(file.type)}
      </div>
      
      {/* File Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </h4>
          <button
            onClick={() => onRemove(file)}
            disabled={isUploading}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            {formatFileSize(file.size)}
          </span>
          
          {/* Status */}
          {progress && (
            <>
              {isUploading && (
                <span className="text-xs text-blue-600">
                  Przesyłanie... {progress.progress}%
                </span>
              )}
              {hasError && (
                <span className="text-xs text-red-600">
                  Błąd: {progress.error}
                </span>
              )}
              {isComplete && (
                <span className="text-xs text-green-600">
                  ✓ Przesłano
                </span>
              )}
            </>
          )}
        </div>
        
        {/* Progress Bar */}
        {isUploading && progress && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const FileUpload: React.FC<FileUploadProps> = ({
  projectId,
  onUploadComplete,
  onUploadError,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  allowedTypes,
  multiple = true,
  className = ''
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  
  const { uploadProgress, uploadFiles } = useFileManager({ 
    projectId, 
    enabled: true 
  });

  // ============================================
  // DRAG & DROP HANDLERS
  // ============================================
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(Array.from(e.dataTransfer.files));
    }
  }, []);

  // ============================================
  // FILE SELECTION
  // ============================================
  
  const handleFileSelection = useCallback((files: File[]) => {
    const newErrors: string[] = [];
    const validFiles: File[] = [];
    
    for (const file of files) {
      const error = validateFile(file, maxFileSize, allowedTypes);
      if (error) {
        newErrors.push(error);
      } else {
        validFiles.push(file);
      }
    }
    
    setErrors(newErrors);
    
    if (multiple) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    } else {
      setSelectedFiles(validFiles.slice(0, 1));
    }
    
    if (newErrors.length > 0 && onUploadError) {
      onUploadError(newErrors.join(', '));
    }
  }, [maxFileSize, allowedTypes, multiple, onUploadError]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileSelection(Array.from(e.target.files));
    }
  }, [handleFileSelection]);

  // ============================================
  // UPLOAD ACTIONS
  // ============================================
  
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      const uploadedFiles = await uploadFiles(selectedFiles);
      
      if (uploadedFiles.length > 0) {
        setSelectedFiles([]);
        setErrors([]);
        if (onUploadComplete) {
          onUploadComplete(uploadedFiles);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Błąd przesyłania plików';
      setErrors([errorMessage]);
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    }
  }, [selectedFiles, uploadFiles, onUploadComplete, onUploadError]);

  const removeFile = useCallback((fileToRemove: File) => {
    setSelectedFiles(prev => prev.filter(file => file !== fileToRemove));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedFiles([]);
    setErrors([]);
  }, []);

  // ============================================
  // RENDER
  // ============================================
  
  const hasFiles = selectedFiles.length > 0;
  const isUploading = uploadProgress.length > 0;
  const canUpload = hasFiles && !isUploading;

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center
          transition-colors duration-200 cursor-pointer
          ${dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={allowedTypes?.join(',')}
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />
        
        <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            {dragActive ? 'Upuść pliki tutaj' : 'Prześlij pliki'}
          </h3>
          <p className="text-sm text-gray-500">
            Przeciągnij i upuść pliki lub{' '}
            <span className="text-blue-600 font-medium">kliknij aby wybrać</span>
          </p>
          <p className="text-xs text-gray-400">
            Maksymalny rozmiar: {formatFileSize(maxFileSize)}
            {multiple && ' • Możesz wybrać wiele plików'}
          </p>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Wystąpiły błędy:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc space-y-1 pl-5">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected Files */}
      {hasFiles && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Wybrane pliki ({selectedFiles.length})
            </h4>
            <button
              onClick={clearAll}
              disabled={isUploading}
              className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              Wyczyść wszystkie
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedFiles.map((file, index) => {
              const progress = uploadProgress.find(p => p.filename === file.name);
              return (
                <FileItem
                  key={`${file.name}-${index}`}
                  file={file}
                  progress={progress}
                  onRemove={removeFile}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {canUpload && (
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UploadIcon className="w-4 h-4 mr-2" />
            Prześlij pliki ({selectedFiles.length})
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;