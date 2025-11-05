// @ts-nocheck
/**
 * FILE UPLOADER COMPONENT
 * Drag & drop file upload with progress tracking, validation, and thumbnails
 */

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, FileText, ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { fileStorageService } from '../../services/file/fileStorageService';
import type {
  FileCategory,
  FileAccessLevel,
  UploadProgress,
  UploadOptions,
} from '../../types/file';
import { formatFileSize, validateFile, isImageFile } from '../../types/file';
import './FileUploader.css';

interface FileUploaderProps {
  category: FileCategory;
  accessLevel?: FileAccessLevel;
  multiple?: boolean;
  maxFiles?: number;
  tags?: string[];
  description?: string;
  generateThumbnail?: boolean;
  expiresInDays?: number;
  onUploadComplete?: (fileIds: string[]) => void;
  onUploadError?: (error: Error) => void;
}

interface UploadingFile {
  file: File;
  preview?: string;
  progress: UploadProgress;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  category,
  accessLevel = 'private',
  multiple = false,
  maxFiles = 10,
  tags = [],
  description,
  generateThumbnail = true,
  expiresInDays,
  onUploadComplete,
  onUploadError,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Generate preview URL for images
   */
  const generatePreview = (file: File): string | undefined => {
    if (isImageFile(file.type)) {
      return URL.createObjectURL(file);
    }
    return undefined;
  };

  /**
   * Handle file selection
   */
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);

      // Check max files limit
      if (fileArray.length > maxFiles) {
        onUploadError?.(
          new Error(`Maximum ${maxFiles} bestanden toegestaan`)
        );
        return;
      }

      // Validate files
      const validFiles: File[] = [];
      for (const file of fileArray) {
        const validation = validateFile(file, category);
        if (!validation.valid) {
          onUploadError?.(new Error(`${file.name}: ${validation.error}`));
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) return;

      // Prepare upload options
      const options: UploadOptions = {
        category,
        accessLevel,
        tags,
        description,
        generateThumbnail,
        expiresInDays,
      };

      // Initialize uploading files
      const uploading: UploadingFile[] = validFiles.map((file) => ({
        file,
        preview: generatePreview(file),
        progress: {
          filename: file.name,
          loaded: 0,
          total: file.size,
          percentage: 0,
          status: 'pending',
        },
      }));

      setUploadingFiles(uploading);

      // Upload files
      const uploadedFileIds: string[] = [];

      for (let i = 0; i < validFiles.length; i++) {
        try {
          const metadata = await fileStorageService.uploadFile(
            validFiles[i],
            options,
            (progress) => {
              setUploadingFiles((prev) => {
                const updated = [...prev];
                updated[i] = { ...updated[i], progress };
                return updated;
              });
            }
          );

          uploadedFileIds.push(metadata.id);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Upload failed';
          onUploadError?.(new Error(`${validFiles[i].name}: ${errorMessage}`));

          setUploadingFiles((prev) => {
            const updated = [...prev];
            updated[i] = {
              ...updated[i],
              progress: {
                ...updated[i].progress,
                status: 'error',
                error: errorMessage,
              },
            };
            return updated;
          });
        }
      }

      // Callback
      if (uploadedFileIds.length > 0) {
        onUploadComplete?.(uploadedFileIds);
      }

      // Clear after 2 seconds
      setTimeout(() => {
        setUploadingFiles([]);
      }, 2000);
    },
    [
      category,
      accessLevel,
      tags,
      description,
      generateThumbnail,
      expiresInDays,
      maxFiles,
      onUploadComplete,
      onUploadError,
    ]
  );

  /**
   * Handle drag & drop
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  /**
   * Handle click upload
   */
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * Remove uploading file
   */
  const handleRemove = (index: number) => {
    setUploadingFiles((prev) => {
      const file = prev[index];
      // Revoke preview URL
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="file-uploader">
      {/* Drop Zone */}
      <div
        className={`upload-dropzone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Upload className="upload-icon" size={48} />
        <p className="upload-text">
          {multiple
            ? 'Sleep bestanden hierheen of klik om te uploaden'
            : 'Sleep bestand hierheen of klik om te uploaden'}
        </p>
        <p className="upload-hint">
          Categorie: <strong>{category}</strong> • Max{' '}
          {maxFiles} bestand{maxFiles > 1 ? 'en' : ''}
        </p>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        className="upload-input"
        onChange={handleInputChange}
        accept="*/*"
      />

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="upload-list">
          {uploadingFiles.map((item, index) => (
            <div key={index} className="upload-item">
              {/* Preview/Icon */}
              <div className="upload-item-preview">
                {item.preview ? (
                  <img
                    src={item.preview}
                    alt={item.file.name}
                    className="upload-preview-image"
                  />
                ) : (
                  <FileText size={32} className="upload-file-icon" />
                )}
              </div>

              {/* File Info */}
              <div className="upload-item-info">
                <div className="upload-item-name">{item.file.name}</div>
                <div className="upload-item-size">
                  {formatFileSize(item.file.size)}
                </div>

                {/* Progress Bar */}
                {item.progress.status === 'uploading' ||
                item.progress.status === 'processing' ? (
                  <div className="upload-progress">
                    <div
                      className="upload-progress-bar"
                      style={{ width: `${item.progress.percentage}%` }}
                    />
                    <div className="upload-progress-text">
                      {item.progress.status === 'processing'
                        ? 'Verwerken...'
                        : `${item.progress.percentage}%`}
                    </div>
                  </div>
                ) : null}

                {/* Status */}
                {item.progress.status === 'complete' && (
                  <div className="upload-status upload-status-success">
                    <CheckCircle2 size={16} />
                    <span>Geüpload</span>
                  </div>
                )}

                {item.progress.status === 'error' && (
                  <div className="upload-status upload-status-error">
                    <AlertCircle size={16} />
                    <span>{item.progress.error || 'Upload mislukt'}</span>
                  </div>
                )}
              </div>

              {/* Remove Button */}
              {item.progress.status !== 'uploading' &&
                item.progress.status !== 'processing' && (
                  <button
                    className="upload-item-remove"
                    onClick={() => handleRemove(index)}
                    aria-label="Verwijder"
                  >
                    <X size={20} />
                  </button>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
