// @ts-nocheck
// Type checking disabled due to Supabase auto-generated types issues
// TODO: Regenerate database.types.ts using: npx supabase gen types typescript --project-id dtnotuyagygexmkyqtgb

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Database } from '../lib/database.types';
import { uploadCertificate, deleteCertificate } from '../services/storage';

type Certificate = Database['public']['Tables']['certificates']['Row'];
type CertificateInsert = Database['public']['Tables']['certificates']['Insert'];

interface UseSupabaseCertificatesReturn {
  certificates: Certificate[];
  loading: boolean;
  error: string | null;
  addCertificate: (file: File, metadata: Omit<CertificateInsert, 'file_url' | 'worker_id'>) => Promise<boolean>;
  removeCertificate: (certificateId: string) => Promise<boolean>;
  refreshCertificates: () => Promise<void>;
}

/**
 * Custom hook for managing worker certificates in Supabase
 * Handles certificate fetching, uploading, and deletion
 */
export function useSupabaseCertificates(workerId: string): UseSupabaseCertificatesReturn {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch certificates from Supabase
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('certificates')
        .select('*')
        .eq('worker_id', workerId)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      setCertificates(data || []);
    } catch (err: any) {
      console.error('Error fetching certificates:', err);
      setError(err.message || 'Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  // Fetch certificates on mount or when workerId changes
  useEffect(() => {
    if (workerId) {
      fetchCertificates();
    }
  }, [workerId]);

  // Add new certificate (upload + database insert)
  const addCertificate = async (
    file: File,
    metadata: Omit<CertificateInsert, 'file_url' | 'worker_id'>
  ): Promise<boolean> => {
    try {
      setError(null);

      // Upload file to Storage
      const uploadResult = await uploadCertificate(file, workerId);

      if (!uploadResult.success) {
        setError(uploadResult.error || 'Upload failed');
        return false;
      }

      // Insert certificate record into database
      const { error: insertError } = await supabase
        .from('certificates')
        .insert({
          ...metadata,
          worker_id: workerId,
          file_url: uploadResult.url!
        });

      if (insertError) {
        // If database insert fails, try to cleanup uploaded file
        await deleteCertificate(uploadResult.url!);
        throw insertError;
      }

      // Refresh certificates list
      await fetchCertificates();
      return true;
    } catch (err: any) {
      console.error('Error adding certificate:', err);
      setError(err.message || 'Failed to add certificate');
      return false;
    }
  };

  // Remove certificate (database + storage)
  const removeCertificate = async (certificateId: string): Promise<boolean> => {
    try {
      setError(null);

      // Find certificate to get file URL
      const certificate = certificates.find(cert => cert.id === certificateId);
      if (!certificate) {
        setError('Certificate not found');
        return false;
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certificateId);

      if (deleteError) {
        throw deleteError;
      }

      // Delete from storage
      await deleteCertificate(certificate.file_url);

      // Refresh certificates list
      await fetchCertificates();
      return true;
    } catch (err: any) {
      console.error('Error removing certificate:', err);
      setError(err.message || 'Failed to remove certificate');
      return false;
    }
  };

  // Refresh certificates from database
  const refreshCertificates = async () => {
    await fetchCertificates();
  };

  return {
    certificates,
    loading,
    error,
    addCertificate,
    removeCertificate,
    refreshCertificates
  };
}
