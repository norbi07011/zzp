import { useState, useEffect } from 'react';
import { 
  fetchAllCertificates, 
  fetchExpiringCertificates,
  fetchExpiredCertificates,
  getCertificateStats, 
  verifyCertificate, 
  unverifyCertificate,
  deleteCertificate,
  bulkVerifyCertificates,
  CertificateWithWorker 
} from '../services/certificates';

interface UseCertificatesReturn {
  certificates: CertificateWithWorker[];
  expiringCertificates: CertificateWithWorker[];
  expiredCertificates: CertificateWithWorker[];
  stats: {
    total: number;
    verified: number;
    unverified: number;
    expiring: number;
    expired: number;
  };
  loading: boolean;
  error: string | null;
  refreshCertificates: () => Promise<void>;
  verifyCertificateById: (certId: string) => Promise<boolean>;
  unverifyCertificateById: (certId: string) => Promise<boolean>;
  deleteCertificateById: (certId: string) => Promise<boolean>;
  bulkVerify: (certIds: string[]) => Promise<number>;
}

/**
 * Custom hook for managing certificates in admin panel
 */
export function useCertificates(): UseCertificatesReturn {
  const [certificates, setCertificates] = useState<CertificateWithWorker[]>([]);
  const [expiringCertificates, setExpiringCertificates] = useState<CertificateWithWorker[]>([]);
  const [expiredCertificates, setExpiredCertificates] = useState<CertificateWithWorker[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
    expiring: 0,
    expired: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allCerts, expiringCerts, expiredCerts, statsData] = await Promise.all([
        fetchAllCertificates(),
        fetchExpiringCertificates(30),
        fetchExpiredCertificates(),
        getCertificateStats()
      ]);
      setCertificates(allCerts);
      setExpiringCertificates(expiringCerts);
      setExpiredCertificates(expiredCerts);
      setStats(statsData);
    } catch (err: any) {
      console.error('Error loading certificates:', err);
      setError(err.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const refreshCertificates = async () => {
    await loadCertificates();
  };

  const verifyCertificateById = async (certId: string): Promise<boolean> => {
    try {
      const success = await verifyCertificate(certId);
      if (success) {
        await refreshCertificates();
      }
      return success;
    } catch (err: any) {
      console.error('Error verifying certificate:', err);
      setError(err.message || 'Failed to verify certificate');
      return false;
    }
  };

  const unverifyCertificateById = async (certId: string): Promise<boolean> => {
    try {
      const success = await unverifyCertificate(certId);
      if (success) {
        await refreshCertificates();
      }
      return success;
    } catch (err: any) {
      console.error('Error unverifying certificate:', err);
      setError(err.message || 'Failed to unverify certificate');
      return false;
    }
  };

  const deleteCertificateById = async (certId: string): Promise<boolean> => {
    try {
      const success = await deleteCertificate(certId);
      if (success) {
        await refreshCertificates();
      }
      return success;
    } catch (err: any) {
      console.error('Error deleting certificate:', err);
      setError(err.message || 'Failed to delete certificate');
      return false;
    }
  };

  const bulkVerify = async (certIds: string[]): Promise<number> => {
    try {
      const count = await bulkVerifyCertificates(certIds);
      if (count > 0) {
        await refreshCertificates();
      }
      return count;
    } catch (err: any) {
      console.error('Error bulk verifying certificates:', err);
      setError(err.message || 'Failed to bulk verify certificates');
      return 0;
    }
  };

  return {
    certificates,
    expiringCertificates,
    expiredCertificates,
    stats,
    loading,
    error,
    refreshCertificates,
    verifyCertificateById,
    unverifyCertificateById,
    deleteCertificateById,
    bulkVerify
  };
}
