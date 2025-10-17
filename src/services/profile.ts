// @ts-nocheck
/**
 * Profile Service - User Profile Management
 * Handles CRUD operations for worker and company profiles
 * Integrates with file upload, skills management, and verification
 * 
 * Features:
 * - Worker profile management (skills, certifications, portfolio)
 * - Company profile management (logo, KvK verification)
 * - Avatar/logo upload with Supabase Storage
 * - Profile completion tracking
 * - Privacy settings management
 */

import { supabase } from '@/lib/supabase';

// Extended types
export interface WorkerProfile {
  id: string;
  user_id: string;
  profile: any;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  specialization?: string;
  bio?: string;
  hourly_rate?: number;
  avatar_url?: string;
  skills: string[];
  years_of_experience?: number;
  availability_status?: string;
  certifications: Certification[];
  portfolio_items: PortfolioItem[];
  completion_percentage: number;
}

export interface CompanyProfile {
  id: string;
  user_id: string;
  profile: any;
  company_name?: string;
  company_nip?: string;
  company_address?: string;
  company_city?: string;
  company_postal_code?: string;
  industry?: string;
  company_size?: string;
  website?: string;
  description?: string;
  logo_url?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  is_verified?: boolean;
  kvk_verified: boolean;
  completion_percentage: number;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  file_url?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  project_url?: string;
  tags: string[];
  created_at: string;
}

export interface ProfileSettings {
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  profile_visibility: 'public' | 'private' | 'connections';
  show_email: boolean;
  show_phone: boolean;
  show_location: boolean;
  language: 'nl' | 'en' | 'pl';
  timezone: string;
}

// Avatar/Logo Upload
const STORAGE_BUCKET = 'avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Upload avatar/logo to Supabase Storage
 */
export async function uploadAvatar(
  file: File,
  userId: string,
  type: 'worker' | 'company'
): Promise<{ url: string; path: string }> {
  // Validate file
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 5MB limit');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed');
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${type}/${Date.now()}.${fileExt}`;

  try {
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path
    };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw new Error('Failed to upload avatar');
  }
}

/**
 * Delete avatar/logo from storage
 */
export async function deleteAvatar(path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw new Error('Failed to delete avatar');
  }
}

// ===========================
// WORKER PROFILE MANAGEMENT
// ===========================

/**
 * Get worker profile with all related data
 */
export async function getWorkerProfile(userId: string): Promise<WorkerProfile | null> {
  try {
    // Get worker data from workers table
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('profile_id', userId)
      .single();

    if (workerError) throw workerError;
    if (!worker) return null;

    // Get profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // Combine worker + profile data
    const combined = {
      ...worker,
      ...profile,
      user_id: userId,
      skills: worker.skills || [],
    };

    // Calculate completion percentage
    const completion = calculateWorkerCompletion(combined);

    return {
      ...combined,
      certifications: [],
      portfolio_items: [],
      completion_percentage: completion
    } as WorkerProfile;
  } catch (error) {
    console.error('Error fetching worker profile:', error);
    return null;
  }
}

/**
 * Update worker profile
 */
export async function updateWorkerProfile(
  userId: string,
  updates: Partial<WorkerUpdate>
): Promise<WorkerProfile | null> {
  try {
    // Update workers table
    const { data, error } = await supabase
      .from('workers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('profile_id', userId)
      .select('*')
      .single();

    if (error) throw error;

    // Get updated profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const combined = {
      ...data,
      ...profile,
      user_id: userId,
      skills: data.skills || [],
    };

    const completion = calculateWorkerCompletion(combined);

    return {
      ...combined,
      certifications: [],
      portfolio_items: [],
      completion_percentage: completion
    } as WorkerProfile;
  } catch (error) {
    console.error('Error updating worker profile:', error);
    throw new Error('Failed to update worker profile');
  }
}

/**
 * Update worker skills
 */
export async function updateWorkerSkills(
  userId: string,
  skills: string[]
): Promise<void> {
  try {
    const { error } = await supabase
      .from('workers')
      .update({ 
        skills,
        updated_at: new Date().toISOString()
      })
      .eq('profile_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating skills:', error);
    throw new Error('Failed to update skills');
  }
}

/**
 * Calculate worker profile completion percentage
 */
function calculateWorkerCompletion(worker: any): number {
  const fields = [
    worker.first_name,
    worker.last_name,
    worker.email,
    worker.phone,
    worker.city,
    worker.specialization,
    worker.bio,
    worker.hourly_rate,
    worker.avatar_url,
    worker.skills && worker.skills.length > 0,
    worker.years_of_experience,
    worker.availability_status
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

// ===========================
// COMPANY PROFILE MANAGEMENT
// ===========================

/**
 * Get company profile
 */
export async function getCompanyProfile(userId: string): Promise<CompanyProfile | null> {
  try {
    const { data: company, error } = await supabase
      .from('companies')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    if (!company) return null;

    const completion = calculateCompanyCompletion(company);

    return {
      ...company,
      kvk_verified: company.is_verified || false,
      completion_percentage: completion
    } as CompanyProfile;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return null;
  }
}

/**
 * Update company profile
 */
export async function updateCompanyProfile(
  userId: string,
  updates: Partial<CompanyUpdate>
): Promise<CompanyProfile | null> {
  try {
    const { data, error } = await supabase
      .from('companies')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select(`
        *,
        profile:profiles(*)
      `)
      .single();

    if (error) throw error;

    const completion = calculateCompanyCompletion(data);

    return {
      ...data,
      kvk_verified: data.is_verified || false,
      completion_percentage: completion
    } as CompanyProfile;
  } catch (error) {
    console.error('Error updating company profile:', error);
    throw new Error('Failed to update company profile');
  }
}

/**
 * Verify company KvK (Chamber of Commerce)
 */
export async function verifyCompanyKvK(
  userId: string,
  kvkNumber: string
): Promise<boolean> {
  try {
    // TODO: Integrate with KvK API for real verification
    // For now, just mark as verified
    const { error } = await supabase
      .from('companies')
      .update({
        company_nip: kvkNumber, // Using NIP field for KvK
        is_verified: true,
        verification_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error verifying KvK:', error);
    throw new Error('Failed to verify KvK number');
  }
}

/**
 * Calculate company profile completion percentage
 */
function calculateCompanyCompletion(company: any): number {
  const fields = [
    company.company_name,
    company.company_nip, // KvK number
    company.company_address,
    company.company_city,
    company.company_postal_code,
    company.industry,
    company.company_size,
    company.website,
    company.description,
    company.logo_url,
    company.contact_person,
    company.contact_email,
    company.contact_phone,
    company.is_verified
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

// ===========================
// GENERAL PROFILE SETTINGS
// ===========================

/**
 * Get user profile settings
 */
export async function getProfileSettings(userId: string): Promise<ProfileSettings> {
  try {
    const { data, error } = await supabase
      .from('v_profiles')
      .select('preferences')
      .eq('user_id', userId)
      .single();

    if (error) throw error;

    // Default settings
    const defaults: ProfileSettings = {
      notifications_enabled: true,
      email_notifications: true,
      sms_notifications: false,
      profile_visibility: 'public',
      show_email: false,
      show_phone: false,
      show_location: true,
      language: 'nl',
      timezone: 'Europe/Amsterdam'
    };

    return { ...defaults, ...(data?.preferences || {}) };
  } catch (error) {
    console.error('Error fetching profile settings:', error);
    throw new Error('Failed to fetch profile settings');
  }
}

/**
 * Update profile settings
 */
export async function updateProfileSettings(
  userId: string,
  settings: Partial<ProfileSettings>
): Promise<void> {
  try {
    // Get current preferences
    const { data: current } = await supabase
      .from('v_profiles')
      .select('preferences')
      .eq('user_id', userId)
      .single();

    const updatedPreferences = {
      ...(current?.preferences || {}),
      ...settings
    };

    const { error } = await supabase
      .from('v_profiles')
      .update({
        preferences: updatedPreferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating profile settings:', error);
    throw new Error('Failed to update profile settings');
  }
}

/**
 * Delete user profile (GDPR compliance)
 */
export async function deleteUserProfile(userId: string): Promise<void> {
  try {
    // This should be handled by database CASCADE delete
    // But we can add explicit cleanup here
    
    // Delete avatar from storage
    const { data: profile } = await supabase
      .from('v_profiles')
      .select('avatar_url')
      .eq('user_id', userId)
      .single();

    if (profile?.avatar_url) {
      // Extract path from URL and delete
      // Implementation depends on URL structure
    }

    // Delete profile (will cascade to workers/companies)
    const { error } = await supabase
      .from('v_profiles')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting profile:', error);
    throw new Error('Failed to delete profile');
  }
}

// Export all functions
export const profileService = {
  // Avatar management
  uploadAvatar,
  deleteAvatar,
  
  // Worker profile
  getWorkerProfile,
  updateWorkerProfile,
  updateWorkerSkills,
  
  // Company profile
  getCompanyProfile,
  updateCompanyProfile,
  verifyCompanyKvK,
  
  // Settings
  getProfileSettings,
  updateProfileSettings,
  
  // Deletion
  deleteUserProfile
};

export default profileService;
