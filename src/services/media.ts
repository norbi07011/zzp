// @ts-nocheck
/**
 * Media Service - Supabase Integration
 * Manages file uploads, images, videos, documents, folders
 * 
 * Database Schema (media table):
 * - id: uuid (primary key)
 * - user_id: uuid (uploader)
 * - filename: text
 * - original_filename: text
 * - file_type: text (image, video, document, other)
 * - mime_type: text
 * - file_size: bigint (bytes)
 * - storage_path: text (Supabase storage path)
 * - public_url: text
 * - folder_id: uuid (parent folder)
 * - width: integer (for images/videos)
 * - height: integer (for images/videos)
 * - duration: integer (for videos, in seconds)
 * - alt_text: text (accessibility)
 * - title: text
 * - description: text
 * - tags: text[]
 * - is_public: boolean
 * - download_count: integer
 * - created_at, updated_at: timestamp
 */

import { supabase } from '@/lib/supabase';

export type FileType = 'image' | 'video' | 'document' | 'audio' | 'archive' | 'other';

export interface MediaFile {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  file_type: FileType;
  mime_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  folder_id?: string;
  width?: number;
  height?: number;
  duration?: number;
  alt_text?: string;
  title?: string;
  description?: string;
  tags?: string[];
  is_public: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  user?: {
    id: string;
    email: string;
    full_name: string;
  };
  folder?: {
    id: string;
    name: string;
  };
}

export interface MediaFolder {
  id: string;
  user_id: string;
  name: string;
  parent_id?: string;
  description?: string;
  is_public: boolean;
  file_count: number;
  total_size: number;
  created_at: string;
  updated_at: string;
}

export interface MediaStats {
  total: number;
  images: number;
  videos: number;
  documents: number;
  totalSize: number;
  publicFiles: number;
  privateFiles: number;
  uploadedToday: number;
  uploadedThisWeek: number;
  totalDownloads: number;
}

// Fetch all media files
export async function fetchAllMedia() {
  const { data, error } = await supabase
    .from('media')
    .select(`
      *,
      user:user_id (id, email, full_name),
      folder:folder_id (id, name)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as MediaFile[];
}

// Fetch media by ID
export async function fetchMediaById(id: string) {
  const { data, error } = await supabase
    .from('media')
    .select(`
      *,
      user:user_id (id, email, full_name),
      folder:folder_id (id, name)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as MediaFile;
}

// Fetch media by type
export async function fetchMediaByType(fileType: FileType) {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('file_type', fileType)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as MediaFile[];
}

// Fetch media by folder
export async function fetchMediaByFolder(folderId: string) {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('folder_id', folderId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as MediaFile[];
}

// Upload file
export async function uploadFile(file: File, folderId?: string, metadata?: Partial<MediaFile>) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const storagePath = `uploads/${fileName}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('media')
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(storagePath);

  // Determine file type
  const fileType = getFileType(file.type);

  // Create database record
  const { data, error } = await supabase
    .from('media')
    .insert([{
      filename: fileName,
      original_filename: file.name,
      file_type: fileType,
      mime_type: file.type,
      file_size: file.size,
      storage_path: storagePath,
      public_url: urlData.publicUrl,
      folder_id: folderId,
      is_public: metadata?.is_public ?? true,
      download_count: 0,
      ...metadata
    }])
    .select()
    .single();

  if (error) throw error;
  return data as MediaFile;
}

// Helper: Determine file type from MIME type
function getFileType(mimeType: string): FileType {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) return 'archive';
  return 'other';
}

// Update media file
export async function updateMediaFile(id: string, updates: Partial<MediaFile>) {
  const { data, error } = await supabase
    .from('media')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as MediaFile;
}

// Delete media file
export async function deleteMediaFile(id: string) {
  // First get the file info
  const { data: file, error: fetchError } = await supabase
    .from('media')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('media')
    .remove([file.storage_path]);

  if (storageError) throw storageError;

  // Delete from database
  const { error } = await supabase
    .from('media')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Increment download count
export async function incrementDownloadCount(id: string) {
  const { data, error } = await supabase.rpc('increment_media_downloads', { media_id: id });

  if (error) throw error;
  return data;
}

// Search media
export async function searchMedia(query: string) {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .or(`filename.ilike.%${query}%,original_filename.ilike.%${query}%,title.ilike.%${query}%,description.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as MediaFile[];
}

// Get media statistics
export async function getMediaStats() {
  const { data: files, error } = await supabase
    .from('media')
    .select('*');

  if (error) throw error;

  const stats: MediaStats = {
    total: files.length,
    images: files.filter(f => f.file_type === 'image').length,
    videos: files.filter(f => f.file_type === 'video').length,
    documents: files.filter(f => f.file_type === 'document').length,
    totalSize: files.reduce((sum, f) => sum + f.file_size, 0),
    publicFiles: files.filter(f => f.is_public).length,
    privateFiles: files.filter(f => !f.is_public).length,
    uploadedToday: 0,
    uploadedThisWeek: 0,
    totalDownloads: files.reduce((sum, f) => sum + f.download_count, 0)
  };

  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const todayStart = new Date(today.setHours(0, 0, 0, 0));

  stats.uploadedToday = files.filter(f => new Date(f.created_at) >= todayStart).length;
  stats.uploadedThisWeek = files.filter(f => new Date(f.created_at) >= weekAgo).length;

  return stats;
}

// Folder management
export async function fetchAllFolders() {
  const { data, error } = await supabase
    .from('media_folders')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data as MediaFolder[];
}

export async function createFolder(folderData: Partial<MediaFolder>) {
  const { data, error } = await supabase
    .from('media_folders')
    .insert([{
      ...folderData,
      file_count: 0,
      total_size: 0
    }])
    .select()
    .single();

  if (error) throw error;
  return data as MediaFolder;
}

export async function updateFolder(id: string, updates: Partial<MediaFolder>) {
  const { data, error } = await supabase
    .from('media_folders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as MediaFolder;
}

export async function deleteFolder(id: string) {
  // First check if folder has files
  const { data: files, error: checkError } = await supabase
    .from('media')
    .select('id')
    .eq('folder_id', id);

  if (checkError) throw checkError;
  if (files.length > 0) throw new Error('Cannot delete folder with files');

  const { error } = await supabase
    .from('media_folders')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Bulk operations
export async function bulkDeleteMedia(ids: string[]) {
  // Get all storage paths
  const { data: files, error: fetchError } = await supabase
    .from('media')
    .select('storage_path')
    .in('id', ids);

  if (fetchError) throw fetchError;

  // Delete from storage
  const paths = files.map(f => f.storage_path);
  const { error: storageError } = await supabase.storage
    .from('media')
    .remove(paths);

  if (storageError) throw storageError;

  // Delete from database
  const { error } = await supabase
    .from('media')
    .delete()
    .in('id', ids);

  if (error) throw error;
  return true;
}

export async function bulkUpdateMedia(ids: string[], updates: Partial<MediaFile>) {
  const { data, error } = await supabase
    .from('media')
    .update(updates)
    .in('id', ids)
    .select();

  if (error) throw error;
  return data as MediaFile[];
}

// Get recent uploads
export async function getRecentUploads(limit: number = 20) {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as MediaFile[];
}

// Get popular downloads
export async function getPopularDownloads(limit: number = 20) {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('download_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as MediaFile[];
}
