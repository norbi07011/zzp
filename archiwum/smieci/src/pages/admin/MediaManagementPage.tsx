// @ts-nocheck
/**
 * MediaManagementPage
 * Admin panel for managing media files, uploads, and storage
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface MediaFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mime_type: string;
  bucket: string;
  uploaded_by?: string;
  created_at: string;
  metadata?: any;
}

interface StorageStats {
  total_files: number;
  total_size: number;
  images: number;
  documents: number;
  videos: number;
  others: number;
}

export const MediaManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'documents' | 'videos'>('all');
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    bucket: '',
    date_from: '',
    date_to: ''
  });
  const [stats, setStats] = useState<StorageStats>({
    total_files: 0,
    total_size: 0,
    images: 0,
    documents: 0,
    videos: 0,
    others: 0
  });

  useEffect(() => {
    loadMediaFiles();
  }, [activeTab, filters]);

  const loadMediaFiles = async () => {
    setLoading(true);
    try {
      // Get list of buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) throw bucketsError;

      let allFiles: MediaFile[] = [];
      
      // Load files from each bucket
      for (const bucket of buckets || []) {
        if (filters.bucket && filters.bucket !== bucket.name) continue;

        const { data: bucketFiles, error: filesError } = await supabase.storage
          .from(bucket.name)
          .list();

        if (!filesError && bucketFiles) {
          const mappedFiles = bucketFiles.map(file => ({
            id: `${bucket.name}/${file.name}`,
            name: file.name,
            path: `${bucket.name}/${file.name}`,
            size: file.metadata?.size || 0,
            mime_type: file.metadata?.mimetype || 'unknown',
            bucket: bucket.name,
            created_at: file.created_at || new Date().toISOString(),
            metadata: file.metadata
          }));

          allFiles = [...allFiles, ...mappedFiles];
        }
      }

      // Apply filters
      let filteredFiles = allFiles;

      if (filters.search) {
        filteredFiles = filteredFiles.filter(f => 
          f.name.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      // Filter by tab
      if (activeTab !== 'all') {
        filteredFiles = filteredFiles.filter(f => {
          const type = getFileType(f.mime_type);
          return type === activeTab;
        });
      }

      // Calculate stats
      const totalSize = filteredFiles.reduce((sum, f) => sum + f.size, 0);
      const images = filteredFiles.filter(f => getFileType(f.mime_type) === 'images').length;
      const documents = filteredFiles.filter(f => getFileType(f.mime_type) === 'documents').length;
      const videos = filteredFiles.filter(f => getFileType(f.mime_type) === 'videos').length;
      const others = filteredFiles.length - images - documents - videos;

      setStats({
        total_files: filteredFiles.length,
        total_size: totalSize,
        images,
        documents,
        videos,
        others
      });

      setFiles(filteredFiles);
    } catch (error) {
      console.error('Error loading media files:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (mimeType: string): 'images' | 'documents' | 'videos' | 'others' => {
    if (mimeType.startsWith('image/')) return 'images';
    if (mimeType.startsWith('video/')) return 'videos';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'documents';
    return 'others';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('document')) return '📝';
    if (mimeType.includes('spreadsheet')) return '📊';
    return '📎';
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('media')
        .upload(fileName, file);

      if (error) throw error;

      alert('File uploaded successfully!');
      loadMediaFiles();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (bucket: string, path: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const fileName = path.replace(`${bucket}/`, '');
      const { error } = await supabase.storage
        .from(bucket)
        .remove([fileName]);

      if (error) throw error;

      alert('File deleted successfully!');
      loadMediaFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file');
    }
  };

  const handleDownloadFile = async (bucket: string, path: string) => {
    try {
      const fileName = path.replace(`${bucket}/`, '');
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(fileName);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📁 Media Manager</h1>
            <p className="text-gray-600">Manage uploads, files, and storage</p>
          </div>
          <div>
            <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
              {uploading ? 'Uploading...' : '📤 Upload File'}
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Files</h3>
            <p className="text-3xl font-bold text-gray-900">{stats.total_files}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Size</h3>
            <p className="text-2xl font-bold text-blue-600">{formatFileSize(stats.total_size)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Images</h3>
            <p className="text-3xl font-bold text-green-600">{stats.images}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Documents</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.documents}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Videos</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.videos}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            All Files
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`pb-2 px-4 ${activeTab === 'images' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Images
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`pb-2 px-4 ${activeTab === 'documents' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`pb-2 px-4 ${activeTab === 'videos' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-500'}`}
          >
            Videos
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="File name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bucket</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.bucket}
                onChange={(e) => setFilters({ ...filters, bucket: e.target.value })}
              >
                <option value="">All Buckets</option>
                <option value="media">Media</option>
                <option value="avatars">Avatars</option>
                <option value="documents">Documents</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Files Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {files.map(file => (
              <div key={file.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                <div className="flex flex-col h-full">
                  {/* File Icon/Preview */}
                  <div className="mb-3 flex items-center justify-center h-32 bg-gray-50 rounded-lg">
                    {file.mime_type.startsWith('image/') ? (
                      <img
                        src={`${supabase.storage.from(file.bucket).getPublicUrl(file.name.replace(`${file.bucket}/`, '')).data.publicUrl}`}
                        alt={file.name}
                        className="max-h-full max-w-full object-contain rounded"
                      />
                    ) : (
                      <span className="text-6xl">{getFileIcon(file.mime_type)}</span>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm mb-1 truncate" title={file.name}>
                      {file.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-1">{formatFileSize(file.size)}</p>
                    <p className="text-xs text-gray-400">{file.bucket}</p>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleDownloadFile(file.bucket, file.path)}
                      className="flex-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDeleteFile(file.bucket, file.path)}
                      className="flex-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && files.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No files found
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaManagementPage;
