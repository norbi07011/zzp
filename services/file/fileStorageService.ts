/**
 * FILE STORAGE SERVICE
 * Handles file uploads, downloads, and management via Supabase Storage
 * Supports image optimization, thumbnail generation, and access control
 */

import { supabase } from '@/lib/supabase';
import type {
  FileMetadata,
  UploadProgress,
  UploadOptions,
  FileCategory,
  FileFilter,
  FileStats,
} from '../../types/file';
import {
  validateFile,
  getBucketForCategory,
  formatFileSize,
  getFileExtension,
  isImageFile,
} from '../../types/file';

class FileStorageService {
  /**
   * Upload file to Supabase Storage
   */
  async uploadFile(
    file: File,
    options: UploadOptions,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileMetadata> {
    // Validate file
    const validation = validateFile(file, options.category);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Get bucket
    const bucket = getBucketForCategory(options.category);

    // Generate unique filename
    const timestamp = Date.now();
    const extension = getFileExtension(file.name);
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 50);
    const uniqueFilename = `${timestamp}_${sanitizedName}`;
    const storagePath = `${options.category}/${uniqueFilename}`;

    // Start upload with progress tracking
    onProgress?.({
      filename: file.name,
      loaded: 0,
      total: file.size,
      percentage: 0,
      status: 'uploading',
    });

    try {
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(storagePath);

      const storageUrl = urlData.publicUrl;

      // Process image if needed
      let thumbnailUrl: string | undefined;
      let width: number | undefined;
      let height: number | undefined;

      if (isImageFile(file.type) && options.generateThumbnail) {
        onProgress?.({
          filename: file.name,
          loaded: file.size,
          total: file.size,
          percentage: 100,
          status: 'processing',
        });

        const imageData = await this.processImage(file, options);
        thumbnailUrl = imageData.thumbnailUrl;
        width = imageData.width;
        height = imageData.height;
      }

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Create file metadata record
      const metadata: Partial<FileMetadata> = {
        userId: user.id,
        filename: uniqueFilename,
        originalFilename: file.name,
        mimeType: file.type,
        size: file.size,
        storagePath,
        storageUrl,
        bucket,
        category: options.category,
        tags: options.tags || [],
        description: options.description,
        accessLevel: options.accessLevel || 'private',
        isPublic: bucket === 'avatars' || bucket === 'portfolios',
        status: 'ready',
        thumbnailUrl,
        width,
        height,
        uploadedAt: new Date(),
        expiresAt: options.expiresInDays
          ? new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000)
          : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save to database
      const { data: savedMetadata, error: dbError } = await (supabase
        .from('files')
        .insert(metadata)
        .select()
        .single() as any);

      if (dbError) {
        // Cleanup uploaded file
        await this.deleteFile(storagePath, bucket);
        throw new Error(`Database error: ${dbError.message}`);
      }

      onProgress?.({
        fileId: (savedMetadata as any)?.id || '',
        filename: file.name,
        loaded: file.size,
        total: file.size,
        percentage: 100,
        status: 'complete',
      });

      return savedMetadata as FileMetadata;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';

      onProgress?.({
        filename: file.name,
        loaded: 0,
        total: file.size,
        percentage: 0,
        status: 'error',
        error: errorMessage,
      });

      throw error;
    }
  }

  /**
   * Process image (resize, optimize, generate thumbnail)
   */
  private async processImage(
    file: File,
    options: UploadOptions
  ): Promise<{
    thumbnailUrl?: string;
    width: number;
    height: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        URL.revokeObjectURL(url);

        // TODO: Backend implementation for thumbnail generation
        // For now, return original dimensions
        resolve({
          width,
          height,
          thumbnailUrl: undefined, // Backend will generate
        });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to process image'));
      };

      img.src = url;
    });
  }

  /**
   * Upload multiple files
   */
  async uploadMultipleFiles(
    files: File[],
    options: UploadOptions,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<FileMetadata[]> {
    const results: FileMetadata[] = [];

    for (let i = 0; i < files.length; i++) {
      const metadata = await this.uploadFile(
        files[i],
        options,
        onProgress ? (progress) => onProgress(i, progress) : undefined
      );
      results.push(metadata);
    }

    return results;
  }

  /**
   * Get file metadata by ID
   */
  async getFile(fileId: string): Promise<FileMetadata | null> {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .single();

    if (error) {
      console.error('Failed to get file:', error);
      return null;
    }

    return data as FileMetadata;
  }

  /**
   * Get files with filters
   */
  async getFiles(filter?: FileFilter): Promise<FileMetadata[]> {
    let query = supabase.from('files').select('*');

    if (filter?.userId) {
      query = query.eq('userId', filter.userId);
    }

    if (filter?.companyId) {
      query = query.eq('companyId', filter.companyId);
    }

    if (filter?.workerId) {
      query = query.eq('workerId', filter.workerId);
    }

    if (filter?.category) {
      query = query.eq('category', filter.category);
    }

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }

    if (filter?.fromDate) {
      query = query.gte('createdAt', filter.fromDate.toISOString());
    }

    if (filter?.toDate) {
      query = query.lte('createdAt', filter.toDate.toISOString());
    }

    if (filter?.searchTerm) {
      query = query.or(
        `originalFilename.ilike.%${filter.searchTerm}%,description.ilike.%${filter.searchTerm}%`
      );
    }

    query = query.order('createdAt', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get files: ${error.message}`);
    }

    return data as FileMetadata[];
  }

  /**
   * Delete file (storage + metadata)
   */
  async deleteFile(
    fileIdOrPath: string,
    bucket?: string
  ): Promise<void> {
    let storagePath: string;
    let fileBucket: string;

    if (bucket) {
      // Direct storage path provided
      storagePath = fileIdOrPath;
      fileBucket = bucket;
    } else {
      // File ID provided, get metadata first
      const file = await this.getFile(fileIdOrPath);
      if (!file) {
        throw new Error('File not found');
      }
      storagePath = file.storagePath;
      fileBucket = file.bucket;
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(fileBucket)
      .remove([storagePath]);

    if (storageError) {
      console.error('Failed to delete from storage:', storageError);
    }

    // Delete metadata from database
    if (!bucket) {
      const { error: dbError } = await supabase
        .from('files')
        .delete()
        .eq('id', fileIdOrPath);

      if (dbError) {
        console.error('Failed to delete metadata:', dbError);
      }
    }
  }

  /**
   * Delete multiple files
   */
  async deleteMultipleFiles(fileIds: string[]): Promise<void> {
    for (const fileId of fileIds) {
      await this.deleteFile(fileId);
    }
  }

  /**
   * Update file metadata
   */
  async updateFileMetadata(
    fileId: string,
    updates: Partial<FileMetadata>
  ): Promise<FileMetadata> {
    const updateData = { ...updates, updatedAt: new Date() };
    const queryBuilder = supabase.from('files') as any;
    const { data, error } = await queryBuilder
      .update(updateData)
      .eq('id', fileId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update file: ${error.message}`);
    }

    return data as FileMetadata;
  }

  /**
   * Get download URL (signed URL for private files)
   */
  async getDownloadUrl(
    fileId: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const file = await this.getFile(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    if (file.isPublic) {
      return file.storageUrl;
    }

    // Generate signed URL for private files
    const { data, error } = await supabase.storage
      .from(file.bucket)
      .createSignedUrl(file.storagePath, expiresIn);

    if (error) {
      throw new Error(`Failed to generate download URL: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Get file statistics
   */
  async getFileStats(userId?: string): Promise<FileStats> {
    let query = supabase.from('files').select('category, status, size');

    if (userId) {
      query = query.eq('userId', userId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get stats: ${error.message}`);
    }

    const files = data as any[];

    const totalFiles = files.length;
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);

    const byCategory: Record<FileCategory, number> = {
      avatar: 0,
      certificate: 0,
      document: 0,
      portfolio: 0,
      contract: 0,
      invoice: 0,
      cv: 0,
      other: 0,
    };

    const byStatus: Record<string, number> = {
      pending: 0,
      processing: 0,
      ready: 0,
      failed: 0,
      archived: 0,
    };

    files.forEach((file) => {
      if (file.category) {
        byCategory[file.category as FileCategory]++;
      }
      if (file.status) {
        byStatus[file.status]++;
      }
    });

    // Storage limit (example: 10GB per user)
    const storageLimit = 10 * 1024 * 1024 * 1024; // 10GB
    const storageUsedPercentage = (totalSize / storageLimit) * 100;

    return {
      totalFiles,
      totalSize,
      byCategory,
      byStatus: byStatus as any,
      storageUsed: totalSize,
      storageLimit,
      storageUsedPercentage,
    };
  }

  /**
   * Share file with users
   */
  async shareFile(
    fileId: string,
    userIds: string[]
  ): Promise<FileMetadata> {
    const file = await this.getFile(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    const sharedWith = [...new Set([...(file.sharedWith || []), ...userIds])];

    return this.updateFileMetadata(fileId, { sharedWith } as any);
  }

  /**
   * Unshare file
   */
  async unshareFile(
    fileId: string,
    userIds: string[]
  ): Promise<FileMetadata> {
    const file = await this.getFile(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    const sharedWith = (file.sharedWith || []).filter(
      (id) => !userIds.includes(id)
    );

    return this.updateFileMetadata(fileId, { sharedWith } as any);
  }

  /**
   * Clean up expired files
   */
  async cleanupExpiredFiles(): Promise<number> {
    const { data: expiredFiles } = await supabase
      .from('files')
      .select('id')
      .lt('expiresAt', new Date().toISOString())
      .not('expiresAt', 'is', null);

    if (!expiredFiles || expiredFiles.length === 0) {
      return 0;
    }

    const fileIds = expiredFiles.map((f: any) => f.id);
    await this.deleteMultipleFiles(fileIds);

    return fileIds.length;
  }
}

// Export singleton instance
export const fileStorageService = new FileStorageService();
