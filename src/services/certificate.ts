// @ts-nocheck
/**
 * Certificate Service
 * Managing certificates for workers
 */

import { supabase } from "@/lib/supabase";

export interface Certificate {
  id: string;
  certificate_name: string; // Fixed: was 'name', now matches database
  description?: string;
  category: string;
  subcategory?: string;
  industry: string;
  issuing_organization: string;
  organization_type: string;
  organization_website?: string;
  organization_country: string;
  certificate_type: string;
  difficulty_level: string;
  duration_validity_years?: number;
  renewal_required: boolean;
  prerequisites?: string;
  minimum_experience_years: number;
  education_requirement?: string;
  age_requirement_min?: number;
  age_requirement_max?: number;
  has_written_exam: boolean;
  has_practical_exam: boolean;
  has_continuous_assessment: boolean;
  exam_language: string;
  cost_exam_euros?: number;
  cost_renewal_euros?: number;
  cost_training_euros?: number;
  training_duration_hours?: number;
  training_locations?: string[];
  online_training_available: boolean;
  recognition_level?: string;
  mandatory_for_jobs: boolean;
  salary_impact_percentage?: number;
  keywords?: string[];
  related_skills?: string[];
  job_titles?: string[];
  is_popular: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkerCertificate {
  id: string;
  worker_id: string;
  certificate_id: string;
  certificate_number?: string;
  issue_date: string;
  expiry_date?: string;
  is_verified: boolean;
  verification_document_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  certificate?: Certificate;
  worker?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface CertificateFilters {
  category?: string;
  industry?: string;
  difficulty_level?: string;
  is_popular?: boolean;
  search?: string;
}

/**
 * Get all certificates with filters
 */
export async function getCertificates(filters?: CertificateFilters) {
  let query = supabase
    .from("certificates")
    .select("*")
    // Removed .eq('is_active', true) - column doesn't exist in certificates table
    .order("certificate_name", { ascending: true }); // Fixed: 'name' → 'certificate_name'

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.industry) {
    query = query.eq("industry", filters.industry);
  }

  if (filters?.difficulty_level) {
    query = query.eq("difficulty_level", filters.difficulty_level);
  }

  if (filters?.is_popular) {
    query = query.eq("is_popular", true);
  }

  if (filters?.search) {
    query = query.or(
      `certificate_name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Certificate[];
}

/**
 * Get certificate by ID
 */
export async function getCertificateById(id: string) {
  const { data, error } = await supabase
    .from("certificates")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Certificate;
}

/**
 * Create certificate
 */
export async function createCertificate(certificate: Partial<Certificate>) {
  const { data, error } = await supabase
    .from("certificates")
    .insert(certificate)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update certificate
 */
export async function updateCertificate(
  id: string,
  updates: Partial<Certificate>
) {
  const { data, error } = await supabase
    .from("certificates")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete certificate
 */
export async function deleteCertificate(id: string) {
  const { error } = await supabase.from("certificates").delete().eq("id", id);

  if (error) throw error;
}

/**
 * Get worker certificates
 */
export async function getWorkerCertificates(workerId?: string) {
  let query = supabase
    .from("worker_certificates")
    .select(
      `
      *,
      certificate:certificates(*),
      worker:workers(id, first_name, last_name, email)
    `
    )
    .order("created_at", { ascending: false });

  if (workerId) {
    query = query.eq("worker_id", workerId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as WorkerCertificate[];
}

/**
 * Assign certificate to worker
 */
export async function assignCertificateToWorker(data: {
  worker_id: string;
  certificate_id: string;
  certificate_number?: string;
  issue_date: string;
  expiry_date?: string;
}) {
  const { data: result, error } = await supabase
    .from("worker_certificates")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result;
}

/**
 * Verify worker certificate
 */
export async function verifyWorkerCertificate(id: string, verified: boolean) {
  const { data, error } = await supabase
    .from("worker_certificates")
    .update({
      is_verified: verified,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get certificate statistics
 */
export async function getCertificateStats() {
  const { data: certificates, error: certError } = await supabase
    .from("certificates")
    .select("id, certificate_type, verified");

  const { data: workerCerts, error: wcError } = await supabase
    .from("certificates")
    .select("id, verified, expiry_date");

  if (certError || wcError) throw certError || wcError;

  const total = certificates?.length || 0;
  const assigned = workerCerts?.length || 0;
  const verified = workerCerts?.filter((wc) => wc.verified).length || 0;

  // Count expiring soon (next 30 days)
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiringSoon =
    workerCerts?.filter((wc) => {
      if (!wc.expiry_date) return false;
      const expiry = new Date(wc.expiry_date);
      return expiry > now && expiry < thirtyDaysFromNow;
    }).length || 0;

  return {
    total_certificates: total,
    assigned_certificates: assigned,
    verified_certificates: verified,
    expiring_soon: expiringSoon,
  };
}

/**
 * Get expiring certificates
 */
export async function getExpiringCertificates(days: number = 30) {
  const now = new Date();
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("worker_certificates")
    .select(
      `
      *,
      certificate:certificates(*),
      worker:workers(id, first_name, last_name, email)
    `
    )
    .gte("expiry_date", now.toISOString())
    .lte("expiry_date", futureDate.toISOString())
    .order("expiry_date", { ascending: true });

  if (error) throw error;
  return data as WorkerCertificate[];
}
