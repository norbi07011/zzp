// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import * as mediaService from '../services/media';
import type { MediaFile, MediaFolder, MediaStats, FileType } from '../services/media';

export function useMedia() {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties
  const images = media.filter(m => m.file_type === 'image');
  const videos = media.filter(m => m.file_type === 'video');
  const documents = media.filter(m => m.file_type === 'document');
  const totalSize = media.reduce((sum, m) => sum + (m.file_size || 0), 0);

  // Fetch all media
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await mediaService.fetchAllMedia();
      setMedia(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch folders
  const fetchFolders = useCallback(async () => {
    try {
      const data = await mediaService.fetchAllFolders();
      setFolders(data);
    } catch (err) {
      console.error('Error fetching folders:', err);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await mediaService.getMediaStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching media stats:', err);
    }
  }, []);

  // Fetch media by type
  const fetchMediaByType = useCallback(async (type: FileType) => {
    try {
      setLoading(true);
      setError(null);
      const data = await mediaService.fetchMediaByType(type);
      setMedia(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching media by type:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload file
  const uploadFile = useCallback(async (file: File, folderId?: string) => {
    try {
      setError(null);
      const uploaded = await mediaService.uploadFile(file, folderId);
      setMedia(prev => [uploaded, ...prev]);
      await fetchStats();
      return uploaded;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Update media
  const updateMedia = useCallback(async (id: string, updates: Partial<MediaFile>) => {
    try {
      setError(null);
      const updated = await mediaService.updateMediaFile(id, updates);
      setMedia(prev => prev.map(m => m.id === id ? updated : m));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Delete media
  const deleteMedia = useCallback(async (id: string) => {
    try {
      setError(null);
      await mediaService.deleteMediaFile(id);
      setMedia(prev => prev.filter(m => m.id !== id));
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Create folder
  const createFolder = useCallback(async (folderData: Partial<MediaFolder>) => {
    try {
      setError(null);
      const newFolder = await mediaService.createFolder(folderData);
      setFolders(prev => [...prev, newFolder]);
      return newFolder;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Update folder
  const updateFolder = useCallback(async (id: string, updates: Partial<MediaFolder>) => {
    try {
      setError(null);
      const updated = await mediaService.updateFolder(id, updates);
      setFolders(prev => prev.map(f => f.id === id ? updated : f));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Delete folder
  const deleteFolder = useCallback(async (id: string) => {
    try {
      setError(null);
      await mediaService.deleteFolder(id);
      setFolders(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Bulk delete media
  const bulkDeleteMedia = useCallback(async (ids: string[]) => {
    try {
      setError(null);
      await mediaService.bulkDeleteMedia(ids);
      setMedia(prev => prev.filter(m => !ids.includes(m.id)));
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Search media
  const searchMedia = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await mediaService.searchMedia(query);
      setMedia(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error searching media:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMedia();
    fetchFolders();
    fetchStats();
  }, [fetchMedia, fetchFolders, fetchStats]);

  return {
    // State
    media,
    folders,
    stats,
    loading,
    error,

    // Computed
    images,
    videos,
    documents,
    totalSize,

    // Methods
    fetchMedia,
    fetchFolders,
    fetchStats,
    fetchMediaByType,
    uploadFile,
    updateMedia,
    deleteMedia,
    createFolder,
    updateFolder,
    deleteFolder,
    bulkDeleteMedia,
    searchMedia,
  };
}
