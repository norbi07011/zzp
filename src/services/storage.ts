import { supabase } from '@/lib/supabase';

// =====================================================
// STORAGE SERVICE - Avatar & Certificate Upload
// =====================================================

const MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_CERTIFICATE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_CERTIFICATE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg'
];

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Upload avatar to Supabase Storage (public bucket)
 * @param file - Image file to upload
 * @param userId - User ID for filename uniqueness
 */
export async function uploadAvatar(file: File, userId: string): Promise<UploadResult> {
  try {
    // Validate file type
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      };
    }

    // Validate file size
    if (file.size > MAX_AVATAR_SIZE) {
      return {
        success: false,
        error: `File too large. Maximum size is ${MAX_AVATAR_SIZE / 1024 / 1024}MB.`
      };
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl
    };
  } catch (error) {
    console.error('Unexpected avatar upload error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during upload.'
    };
  }
}

/**
 * Upload certificate to Supabase Storage (private bucket)
 * @param file - Certificate file to upload (PDF or image)
 * @param workerId - Worker ID for folder organization
 */
export async function uploadCertificate(file: File, workerId: string): Promise<UploadResult> {
  try {
    // Validate file type
    if (!ALLOWED_CERTIFICATE_TYPES.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only PDF and image files are allowed.'
      };
    }

    // Validate file size
    if (file.size > MAX_CERTIFICATE_SIZE) {
      return {
        success: false,
        error: `File too large. Maximum size is ${MAX_CERTIFICATE_SIZE / 1024 / 1024}MB.`
      };
    }

    // Generate unique filename with worker folder
    const fileExt = file.name.split('.').pop();
    const fileName = `${workerId}/${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('certificates')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false // Don't overwrite existing certificates
      });

    if (error) {
      console.error('Certificate upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }

    // Get signed URL (valid for 1 year)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('certificates')
      .createSignedUrl(data.path, 31536000); // 1 year in seconds

    if (urlError) {
      console.error('Signed URL error:', urlError);
      return {
        success: false,
        error: 'File uploaded but failed to generate access URL.'
      };
    }

    return {
      success: true,
      url: signedUrlData.signedUrl
    };
  } catch (error) {
    console.error('Unexpected certificate upload error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred during upload.'
    };
  }
}

/**
 * Delete avatar from Supabase Storage
 * @param avatarUrl - Full URL of the avatar to delete
 */
export async function deleteAvatar(avatarUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract file path from URL
    const urlParts = avatarUrl.split('/avatars/');
    if (urlParts.length < 2) {
      return { success: false, error: 'Invalid avatar URL' };
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      console.error('Avatar deletion error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected avatar deletion error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Delete certificate from Supabase Storage
 * @param certificateUrl - Full URL of the certificate to delete
 */
export async function deleteCertificate(certificateUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract file path from signed URL (before query params)
    const urlParts = certificateUrl.split('/certificates/')[1]?.split('?')[0];
    if (!urlParts) {
      return { success: false, error: 'Invalid certificate URL' };
    }

    const { error } = await supabase.storage
      .from('certificates')
      .remove([urlParts]);

    if (error) {
      console.error('Certificate deletion error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Unexpected certificate deletion error:', error);
    return { success: false, error: 'An unexpected error occurred.' };
  }
}

/**
 * Get download URL for a certificate
 * @param filePath - Path to file in certificates bucket
 */
export async function getCertificateDownloadUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('certificates')
      .createSignedUrl(filePath, 3600); // Valid for 1 hour

    if (error) {
      console.error('Error generating download URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Unexpected error generating download URL:', error);
    return null;
  }
}
