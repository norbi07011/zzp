// @ts-nocheck
// Type checking disabled due to Supabase auto-generated types issues
// TODO: Regenerate database.types.ts using: npx supabase gen types typescript --project-id dtnotuyagygexmkyqtgb

import { supabase } from '@/lib/supabase';
import { Database } from '../lib/database.types';

type Certificate = Database['public']['Tables']['certificates']['Row'];
type CertificateInsert = Database['public']['Tables']['certificates']['Insert'];
type CertificateUpdate = Database['public']['Tables']['certificates']['Update'];

export interface CertificateWithWorker extends Certificate {
  worker: {
    id: string;
    profile: {
      full_name: string;
      email: string;
    };
  };
}

/**
 * Fetch all certificates with worker info
 */
export async function fetchAllCertificates(): Promise<CertificateWithWorker[]> {
  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      worker:workers!inner(
        id,
        profile:profiles!workers_profile_id_fkey(
          full_name,
          email
        )
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching certificates:', error);
    throw error;
  }

  return data as any as CertificateWithWorker[];
}

/**
 * Fetch certificates by worker ID
 */
export async function fetchCertificatesByWorker(workerId: string): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .eq('worker_id', workerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching worker certificates:', error);
    throw error;
  }

  return data || [];
}

/**
 * Fetch certificates expiring soon (within X days)
 */
export async function fetchExpiringCertificates(daysUntilExpiry: number = 30): Promise<CertificateWithWorker[]> {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysUntilExpiry);

  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      worker:workers!inner(
        id,
        profile:profiles!workers_profile_id_fkey(
          full_name,
          email
        )
      )
    `)
    .not('expiry_date', 'is', null)
    .gte('expiry_date', today.toISOString().split('T')[0])
    .lte('expiry_date', futureDate.toISOString().split('T')[0])
    .order('expiry_date', { ascending: true });

  if (error) {
    console.error('Error fetching expiring certificates:', error);
    throw error;
  }

  return data as any as CertificateWithWorker[];
}

/**
 * Fetch expired certificates
 */
export async function fetchExpiredCertificates(): Promise<CertificateWithWorker[]> {
  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      worker:workers!inner(
        id,
        profile:profiles!workers_profile_id_fkey(
          full_name,
          email
        )
      )
    `)
    .not('expiry_date', 'is', null)
    .lt('expiry_date', today)
    .order('expiry_date', { ascending: false });

  if (error) {
    console.error('Error fetching expired certificates:', error);
    throw error;
  }

  return data as any as CertificateWithWorker[];
}

/**
 * Create new certificate
 */
export async function createCertificate(certificate: CertificateInsert): Promise<Certificate | null> {
  const { data, error } = await supabase
    .from('certificates')
    .insert(certificate as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating certificate:', error);
    throw error;
  }

  return data;
}

/**
 * Update certificate
 */
export async function updateCertificate(certId: string, updates: CertificateUpdate): Promise<Certificate | null> {
  const { data, error } = await supabase
    .from('certificates')
    .update(updates as any)
    .eq('id', certId)
    .select()
    .single();

  if (error) {
    console.error('Error updating certificate:', error);
    throw error;
  }

  return data;
}

/**
 * Delete certificate (also removes file from storage)
 */
export async function deleteCertificate(certId: string): Promise<boolean> {
  // First, get certificate to find file_url for storage deletion
  const { data: cert } = await supabase
    .from('certificates')
    .select('file_url')
    .eq('id', certId)
    .single();

  // Delete from database
  const { error } = await supabase
    .from('certificates')
    .delete()
    .eq('id', certId);

  if (error) {
    console.error('Error deleting certificate:', error);
    return false;
  }

  // Delete file from storage if exists
  if ((cert as any)?.file_url) {
    try {
      const filePath = (cert as any).file_url.split('/certificates/')[1]?.split('?')[0];
      if (filePath) {
        await supabase.storage.from('certificates').remove([filePath]);
      }
    } catch (storageError) {
      console.error('Error deleting certificate file:', storageError);
      // Don't fail the operation if storage deletion fails
    }
  }

  return true;
}

/**
 * Verify certificate (admin action)
 */
export async function verifyCertificate(certId: string): Promise<boolean> {
  const { error } = await supabase
    .from('certificates')
    .update({ verified: true } as any)
    .eq('id', certId);

  if (error) {
    console.error('Error verifying certificate:', error);
    return false;
  }

  return true;
}

/**
 * Unverify certificate (admin action)
 */
export async function unverifyCertificate(certId: string): Promise<boolean> {
  const { error } = await supabase
    .from('certificates')
    .update({ verified: false } as any)
    .eq('id', certId);

  if (error) {
    console.error('Error unverifying certificate:', error);
    return false;
  }

  return true;
}

/**
 * Update certificate with OCR data
 */
export async function updateCertificateOCR(certId: string, ocrData: any): Promise<boolean> {
  const { error } = await supabase
    .from('certificates')
    .update({ ocr_data: ocrData } as any)
    .eq('id', certId);

  if (error) {
    console.error('Error updating certificate OCR data:', error);
    return false;
  }

  return true;
}

/**
 * Get certificate statistics
 */
export async function getCertificateStats() {
  const { count: totalCerts } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true });

  const { count: verifiedCerts } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .eq('verified', true);

  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  const { count: expiringCerts } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .not('expiry_date', 'is', null)
    .gte('expiry_date', today)
    .lte('expiry_date', futureDate.toISOString().split('T')[0]);

  const { count: expiredCerts } = await supabase
    .from('certificates')
    .select('*', { count: 'exact', head: true })
    .not('expiry_date', 'is', null)
    .lt('expiry_date', today);

  return {
    total: totalCerts || 0,
    verified: verifiedCerts || 0,
    unverified: (totalCerts || 0) - (verifiedCerts || 0),
    expiring: expiringCerts || 0,
    expired: expiredCerts || 0
  };
}

/**
 * Bulk verify certificates
 */
export async function bulkVerifyCertificates(certIds: string[]): Promise<number> {
  const { data, error } = await supabase
    .from('certificates')
    .update({ verified: true } as any)
    .in('id', certIds)
    .select();

  if (error) {
    console.error('Error bulk verifying certificates:', error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Send renewal reminders (placeholder - actual email sending would need separate service)
 */
export async function sendRenewalReminders(certIds: string[]): Promise<number> {
  // Fetch certificates with worker emails
  const { data: certificates } = await supabase
    .from('certificates')
    .select(`
      *,
      worker:workers!inner(
        profile:profiles!inner(
          email,
          full_name
        )
      )
    `)
    .in('id', certIds);

  if (!certificates) return 0;

  // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
  console.log('Would send renewal reminders to:', certificates);

  return certificates.length;
}
