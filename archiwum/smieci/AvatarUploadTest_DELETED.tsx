import React, { useState } from 'react';
import { useSupabaseProfile } from '../hooks/useSupabaseProfile';
import { User, Upload, Trash2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * AvatarUploadTest Component
 * Test component for Supabase Storage integration
 * Tests avatar upload, display, and deletion
 */
export default function AvatarUploadTest() {
  const { profile, loading, error, uploadProfileAvatar, deleteProfileAvatar, refreshProfile } = useSupabaseProfile();
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus(null);

    const success = await uploadProfileAvatar(file);

    if (success) {
      setUploadStatus({ type: 'success', message: 'Avatar uploaded successfully!' });
    } else {
      setUploadStatus({ type: 'error', message: error || 'Upload failed' });
    }

    setUploading(false);

    // Clear file input
    event.target.value = '';
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm('Are you sure you want to delete your avatar?')) {
      return;
    }

    setDeleting(true);
    setUploadStatus(null);

    const success = await deleteProfileAvatar();

    if (success) {
      setUploadStatus({ type: 'success', message: 'Avatar deleted successfully!' });
    } else {
      setUploadStatus({ type: 'error', message: error || 'Deletion failed' });
    }

    setDeleting(false);
  };

  const handleRefresh = async () => {
    setUploadStatus(null);
    await refreshProfile();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-700 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle className="w-6 h-6" />
            <h2 className="text-xl font-bold">No Profile Found</h2>
          </div>
          <p className="text-gray-700">Please log in to test avatar upload.</p>
          <p className="text-sm text-gray-500 mt-4">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Avatar Upload Test</h1>
          </div>
          <p className="text-gray-600">Test Supabase Storage integration for avatar uploads</p>
        </div>

        {/* Status Messages */}
        {uploadStatus && (
          <div
            className={`rounded-xl shadow-lg p-4 mb-6 flex items-center gap-3 ${
              uploadStatus.type === 'success'
                ? 'bg-green-50 border-2 border-green-500'
                : 'bg-red-50 border-2 border-red-500'
            }`}
          >
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-600" />
            )}
            <p
              className={`font-medium ${
                uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {uploadStatus.message}
            </p>
          </div>
        )}

        {/* Profile Info */}
        <div className="bg-white rounded-xl shadow-xl p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium text-gray-900">{profile.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="font-medium text-gray-900 capitalize">{profile.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Premium:</span>
              <span className={`font-medium ${profile.is_premium ? 'text-yellow-600' : 'text-gray-900'}`}>
                {profile.is_premium ? 'Yes ⭐' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* Avatar Display and Upload */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Current Avatar</h2>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              aria-label="Refresh profile"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Avatar Preview */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile avatar"
                  className="w-48 h-48 rounded-full object-cover border-4 border-blue-500 shadow-lg"
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-gray-400 shadow-lg">
                  <User className="w-24 h-24 text-gray-500" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                {profile.avatar_url ? 'Uploaded' : 'No Avatar'}
              </div>
            </div>
          </div>

          {/* Avatar URL Display */}
          {profile.avatar_url && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 mb-2">Storage URL:</p>
              <p className="text-xs text-gray-800 break-all font-mono">{profile.avatar_url}</p>
            </div>
          )}

          {/* Upload Controls */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="avatar-upload"
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload New Avatar
                  </>
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/jpg"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                aria-label="Select avatar file"
              />
              <p className="text-xs text-gray-500 mt-2 text-center">
                Allowed: JPEG, PNG, WebP • Max size: 5MB
              </p>
            </div>

            {profile.avatar_url && (
              <button
                onClick={handleDeleteAvatar}
                disabled={deleting}
                className="flex items-center justify-center gap-3 w-full px-6 py-4 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
                aria-label="Delete current avatar"
              >
                {deleting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    Delete Avatar
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Technical Info */}
        <div className="bg-white rounded-xl shadow-xl p-8 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Supabase Storage: <strong>avatars</strong> bucket</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">RLS Policy: <strong>public_read_avatars</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Upload Policy: <strong>authenticated_upload_avatars</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-gray-700">Hook: <strong>useSupabaseProfile</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
