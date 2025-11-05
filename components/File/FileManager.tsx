// @ts-nocheck
/**
 * FILE MANAGER COMPONENT
 * Admin panel for file management with grid/list view, filtering, and actions
 */

import React, { useState, useEffect } from 'react';
import {
  Upload,
  Grid,
  List,
  Search,
  Download,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  File as FileIcon,
  HardDrive,
} from 'lucide-react';
import { fileStorageService } from '../../services/file/fileStorageService';
import { FileUploader } from './FileUploader';
import type {
  FileMetadata,
  FileCategory,
  FileFilter,
  FileStats,
} from '../../types/file';
import { formatFileSize } from '../../types/file';
import './FileManager.css';

export const FileManager: React.FC = () => {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploader, setShowUploader] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<FileCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * Load files
   */
  const loadFiles = async () => {
    setLoading(true);
    try {
      const filter: FileFilter = {};

      if (selectedCategory !== 'all') {
        filter.category = selectedCategory;
      }

      if (searchTerm) {
        filter.searchTerm = searchTerm;
      }

      const data = await fileStorageService.getFiles(filter);
      setFiles(data);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load statistics
   */
  const loadStats = async () => {
    try {
      const data = await fileStorageService.getFileStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  useEffect(() => {
    loadFiles();
    loadStats();
  }, [selectedCategory, searchTerm]);

  /**
   * Handle file deletion
   */
  const handleDelete = async (fileId: string) => {
    if (!confirm('Weet u zeker dat u dit bestand wilt verwijderen?')) {
      return;
    }

    try {
      await fileStorageService.deleteFile(fileId);
      await loadFiles();
      await loadStats();
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Verwijderen mislukt');
    }
  };

  /**
   * Handle file download
   */
  const handleDownload = async (file: FileMetadata) => {
    try {
      const url = await fileStorageService.getDownloadUrl(file.id);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalFilename;
      a.click();
    } catch (error) {
      console.error('Failed to download file:', error);
      alert('Download mislukt');
    }
  };

  /**
   * Handle upload complete
   */
  const handleUploadComplete = () => {
    setShowUploader(false);
    loadFiles();
    loadStats();
  };

  const categories: Array<{ value: FileCategory | 'all'; label: string }> = [
    { value: 'all', label: 'Alle bestanden' },
    { value: 'avatar', label: 'Avatars' },
    { value: 'certificate', label: 'Certificaten' },
    { value: 'document', label: 'Documenten' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'contract', label: 'Contracten' },
    { value: 'invoice', label: 'Facturen' },
    { value: 'cv', label: 'CV' },
    { value: 'other', label: 'Overige' },
  ];

  return (
    <div className="file-manager">
      {/* Header */}
      <div className="file-manager-header">
        <h1 className="file-manager-title">
          <FileText size={28} />
          Bestandsbeheer
        </h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowUploader(!showUploader)}
        >
          <Upload size={20} />
          Uploaden
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="file-stats">
          <div className="stat-card">
            <FileIcon size={24} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">{stats.totalFiles}</div>
              <div className="stat-label">Totaal bestanden</div>
            </div>
          </div>
          <div className="stat-card">
            <HardDrive size={24} className="stat-icon" />
            <div className="stat-content">
              <div className="stat-value">
                {formatFileSize(stats.storageUsed)}
              </div>
              <div className="stat-label">Opslag gebruikt</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="storage-chart">
              <div
                className="storage-bar"
                style={{ width: `${Math.min(stats.storageUsedPercentage, 100)}%` }}
              />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {stats.storageUsedPercentage.toFixed(1)}%
              </div>
              <div className="stat-label">
                van {formatFileSize(stats.storageLimit)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Uploader */}
      {showUploader && (
        <div className="file-uploader-section">
          <FileUploader
            category="document"
            multiple={true}
            maxFiles={10}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      )}

      {/* Toolbar */}
      <div className="file-toolbar">
        {/* Search */}
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Zoek bestanden..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <select
          className="category-filter"
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(e.target.value as FileCategory | 'all')
          }
        >
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>

        {/* View Mode */}
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={20} />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={20} />
          </button>
        </div>

        {/* Refresh */}
        <button className="btn-icon" onClick={loadFiles}>
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Files */}
      {loading ? (
        <div className="file-loading">
          <RefreshCw className="spinning" size={48} />
          <p>Laden...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="file-empty">
          <FileIcon size={64} />
          <p>Geen bestanden gevonden</p>
        </div>
      ) : (
        <div className={`file-${viewMode}`}>
          {files.map((file) => (
            <div key={file.id} className="file-item">
              {/* Thumbnail/Icon */}
              <div className="file-preview">
                {file.thumbnailUrl ? (
                  <img src={file.thumbnailUrl} alt={file.originalFilename} />
                ) : file.mimeType.startsWith('image/') ? (
                  <img src={file.storageUrl} alt={file.originalFilename} />
                ) : (
                  <FileIcon size={48} className="file-icon" />
                )}
              </div>

              {/* Info */}
              <div className="file-info">
                <div className="file-name" title={file.originalFilename}>
                  {file.originalFilename}
                </div>
                <div className="file-meta">
                  <span className="file-category">{file.category}</span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                  <span className="file-date">
                    {new Date(file.uploadedAt).toLocaleDateString('nl-NL')}
                  </span>
                </div>
                {file.description && (
                  <div className="file-description">{file.description}</div>
                )}
              </div>

              {/* Actions */}
              <div className="file-actions">
                <button
                  className="btn-icon"
                  onClick={() => handleDownload(file)}
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button
                  className="btn-icon"
                  onClick={() => window.open(file.storageUrl, '_blank')}
                  title="Bekijken"
                >
                  <Eye size={18} />
                </button>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => handleDelete(file.id)}
                  title="Verwijderen"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
