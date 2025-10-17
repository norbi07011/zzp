// @ts-nocheck
// Type checking disabled due to Supabase auto-generated types issues
// TODO: Regenerate database.types.ts using: npx supabase gen types typescript --project-id dtnotuyagygexmkyqtgb

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '../lib/database.types';
import { uploadAvatar, deleteAvatar } from '../services/storage';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface UseSupabaseProfileReturn {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  uploadProfileAvatar: (file: File) => Promise<boolean>;
  deleteProfileAvatar: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

/**
 * Custom hook for managing user profile in Supabase
 * Handles profile fetching, updates, and avatar management
 */
export function useSupabaseProfile(userId?: string): UseSupabaseProfileReturn {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile from Supabase
  const fetchProfile = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile on mount or when userId changes
  useEffect(() => {
    const initProfile = async () => {
      // If userId is provided, use it
      if (userId) {
        await fetchProfile(userId);
        return;
      }

      // Otherwise, get current user from auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await fetchProfile(user.id);
      } else {
        setLoading(false);
        setError('No authenticated user');
      }
    };

    initProfile();
  }, [userId]);

  // Update profile in Supabase
  const updateProfile = async (updates: Partial<Profile>): Promise<boolean> => {
    if (!profile) {
      setError('No profile loaded');
      return false;
    }

    try {
      setError(null);

      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setProfile({ ...profile, ...updates });
      return true;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      return false;
    }
  };

  // Upload avatar and update profile
  const uploadProfileAvatar = async (file: File): Promise<boolean> => {
    if (!profile) {
      setError('No profile loaded');
      return false;
    }

    try {
      setError(null);

      // Delete old avatar if exists
      if (profile.avatar_url) {
        await deleteAvatar(profile.avatar_url);
      }

      // Upload new avatar
      const result = await uploadAvatar(file, profile.id);

      if (!result.success) {
        setError(result.error || 'Upload failed');
        return false;
      }

      // Update profile with new avatar URL
      return await updateProfile({ avatar_url: result.url });
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Failed to upload avatar');
      return false;
    }
  };

  // Delete avatar and update profile
  const deleteProfileAvatar = async (): Promise<boolean> => {
    if (!profile || !profile.avatar_url) {
      setError('No avatar to delete');
      return false;
    }

    try {
      setError(null);

      // Delete from storage
      const result = await deleteAvatar(profile.avatar_url);

      if (!result.success) {
        setError(result.error || 'Deletion failed');
        return false;
      }

      // Update profile to remove avatar URL
      return await updateProfile({ avatar_url: null });
    } catch (err: any) {
      console.error('Error deleting avatar:', err);
      setError(err.message || 'Failed to delete avatar');
      return false;
    }
  };

  // Refresh profile from database
  const refreshProfile = async () => {
    if (profile) {
      await fetchProfile(profile.id);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadProfileAvatar,
    deleteProfileAvatar,
    refreshProfile
  };
}
