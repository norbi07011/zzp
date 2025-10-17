/**
 * FILE MANAGEMENT TYPES
 * Complete TypeScript types for file storage & management
 * Supports documents, certificates, portfolios, avatars
 */

export type FileCategory =
  | 'avatar'
  | 'certificate'
  | 'document'
  | 'portfolio'
  | 'contract'
  | 'invoice'
  | 'cv'
  | 'other';

export type FileAccessLevel = 'public' | 'private' | 'company' | 'worker';

export type FileStatus = 'pending' | 'processing' | 'ready' | 'failed' | 'archived';

export interface FileMetadata {
  id: string;
  userId: string;
  companyId?: string;
  workerId?: string;
  
  // File details
  filename: string;
  originalFilename: string;
  mimeType: string;
  size: number; // bytes
  
  // Storage
  storagePath: string;
  storageUrl: string;
  bucket: string;
  
  // Categorization
  category: FileCategory;
  tags: string[];
  description?: string;
  
  // Access control
  accessLevel: FileAccessLevel;
  isPublic: boolean;
  sharedWith?: string[]; // Array of user IDs
  
  // Processing
  status: FileStatus;
  processingError?: string;
  
  // Image-specific
  width?: number;
  height?: number;
  thumbnailUrl?: string;
  
  // Document-specific
  pageCount?: number;
  
  // Timestamps
  uploadedAt: Date;
  expiresAt?: Date;
  lastAccessedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadProgress {
  fileId?: string;
  filename: string;
  loaded: number;
  total: number;
  percentage: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface UploadOptions {
  category: FileCategory;
  accessLevel?: FileAccessLevel;
  tags?: string[];
  description?: string;
  expiresInDays?: number;
  generateThumbnail?: boolean;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-100 for images
}

export interface FileValidation {
  maxSize: number; // bytes
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export interface BucketConfig {
  name: string;
  public: boolean;
  allowedMimeTypes?: string[];
  fileSizeLimit?: number;
  allowedRoles?: string[];
}

// Default validation rules per category
export const FILE_VALIDATION: Record<FileCategory, FileValidation> = {
  avatar: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  },
  certificate: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
  },
  document: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedMimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ],
    allowedExtensions: ['.pdf', '.doc', '.docx', '.txt'],
  },
  portfolio: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
      'video/mp4',
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.mp4'],
  },
  contract: {
    maxSize: 20 * 1024 * 1024, // 20MB
    allowedMimeTypes: ['application/pdf'],
    allowedExtensions: ['.pdf'],
  },
  invoice: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf'],
    allowedExtensions: ['.pdf'],
  },
  cv: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['application/pdf'],
    allowedExtensions: ['.pdf'],
  },
  other: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: ['*'],
    allowedExtensions: ['*'],
  },
};

// Supabase Storage buckets
export const STORAGE_BUCKETS: Record<string, BucketConfig> = {
  avatars: {
    name: 'avatars',
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileSizeLimit: 5 * 1024 * 1024,
  },
  certificates: {
    name: 'certificates',
    public: false,
    allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    fileSizeLimit: 10 * 1024 * 1024,
  },
  documents: {
    name: 'documents',
    public: false,
    fileSizeLimit: 20 * 1024 * 1024,
  },
  portfolios: {
    name: 'portfolios',
    public: true,
    fileSizeLimit: 10 * 1024 * 1024,
  },
  private: {
    name: 'private',
    public: false,
    fileSizeLimit: 50 * 1024 * 1024,
  },
};

export interface FileFilter {
  userId?: string;
  companyId?: string;
  workerId?: string;
  category?: FileCategory;
  tags?: string[];
  status?: FileStatus;
  fromDate?: Date;
  toDate?: Date;
  searchTerm?: string;
}

export interface FileStats {
  totalFiles: number;
  totalSize: number; // bytes
  byCategory: Record<FileCategory, number>;
  byStatus: Record<FileStatus, number>;
  storageUsed: number; // bytes
  storageLimit: number; // bytes
  storageUsedPercentage: number;
}

export interface CertificateFile extends FileMetadata {
  category: 'certificate';
  certificateType?: string; // e.g., "VCA", "BHV", "Driver's License"
  issuer?: string;
  issueDate?: Date;
  expiryDate?: Date;
  certificateNumber?: string;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

export interface PortfolioFile extends FileMetadata {
  category: 'portfolio';
  projectName?: string;
  projectDate?: Date;
  skills?: string[];
  clientName?: string;
  isHighlighted?: boolean;
}

// Helper functions
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
};

export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

export const isPDFFile = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};

export const isVideoFile = (mimeType: string): boolean => {
  return mimeType.startsWith('video/');
};

export const validateFile = (
  file: File,
  category: FileCategory
): { valid: boolean; error?: string } => {
  const validation = FILE_VALIDATION[category];

  // Check file size
  if (file.size > validation.maxSize) {
    return {
      valid: false,
      error: `Bestand is te groot. Maximaal ${formatFileSize(validation.maxSize)}`,
    };
  }

  // Check MIME type
  if (
    validation.allowedMimeTypes[0] !== '*' &&
    !validation.allowedMimeTypes.includes(file.type)
  ) {
    return {
      valid: false,
      error: `Bestandstype niet toegestaan. Toegestaan: ${validation.allowedExtensions.join(', ')}`,
    };
  }

  // Check file extension
  const ext = '.' + getFileExtension(file.name);
  if (
    validation.allowedExtensions[0] !== '*' &&
    !validation.allowedExtensions.includes(ext)
  ) {
    return {
      valid: false,
      error: `Bestandsextensie niet toegestaan. Toegestaan: ${validation.allowedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
};

export const getBucketForCategory = (category: FileCategory): string => {
  const bucketMap: Record<FileCategory, string> = {
    avatar: 'avatars',
    certificate: 'certificates',
    document: 'documents',
    portfolio: 'portfolios',
    contract: 'private',
    invoice: 'private',
    cv: 'documents',
    other: 'private',
  };

  return bucketMap[category] || 'private';
};

// ============================================================================
// FILTER & STATS TYPES
// ============================================================================

/**
 * File filter options
 */
export interface FileFilter {
  userId?: string;
  companyId?: string;
  workerId?: string;
  category?: FileCategory;
  status?: FileStatus;
  fromDate?: Date;
  toDate?: Date;
  searchTerm?: string;
  tags?: string[];
  accessLevel?: FileAccessLevel;
}

/**
 * File statistics
 */
export interface FileStats {
  totalFiles: number;
  totalSize: number;
  byCategory: Record<FileCategory, number>;
  byStatus: Record<FileStatus, number>;
  storageUsed: number;
  storageLimit: number;
  storageUsedPercentage: number;
}

// ============================================================================
// EXTENDED TYPES
// ============================================================================

/**
 * Certificate file with additional metadata
 */
export interface CertificateFile extends FileMetadata {
  category: 'certificate';
  issuer?: string;
  expiryDate?: Date;
  certificateNumber?: string;
  isVerified?: boolean;
}

/**
 * Portfolio file with additional metadata
 */
export interface PortfolioFile extends FileMetadata {
  category: 'portfolio';
  projectName?: string;
  skills?: string[];
  isHighlighted?: boolean;
}
