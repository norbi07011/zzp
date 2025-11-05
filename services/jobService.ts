/**
 * =====================================================
 * JOB SERVICE - Backend Integration
 * =====================================================
 * Service for managing job postings
 * Created: 2025-01-13
 */

import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

// =====================================================
// TYPES - Database-generated types
// =====================================================

type JobsRow = Database['public']['Tables']['jobs']['Row'];
type JobsInsert = Database['public']['Tables']['jobs']['Insert'];
type JobsUpdate = Database['public']['Tables']['jobs']['Update'];

export interface Job extends JobsRow {
  // Joined employer data (Supabase returns array for inner joins)
  employer?: {
    id: string;
    company_name: string | null;
    logo_url: string | null;
    city: string | null;
  }[];
}

export interface JobFilters {
  searchTerm?: string;
  category?: string;
  city?: string;
  employmentType?: string;
  experienceLevel?: string;
  minSalary?: number;
  maxSalary?: number;
  requiredSkills?: string[];
  locationtype?: 'on-site' | 'remote' | 'hybrid';
  status?: 'active' | 'filled' | 'expired' | 'draft';
}

export interface CreateJobData {
  title: string;
  description: string;
  short_description?: string;
  category: string;
  subcategory?: string;
  location?: string;
  city?: string;
  country?: string;
  address?: string;
  postal_code?: string;
  location_type?: 'on-site' | 'remote' | 'hybrid';
  employment_type?: 'full-time' | 'part-time' | 'contract' | 'temporary' | 'freelance' | 'internship';
  experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'expert' | 'any';
  education_level?: string;
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  salary_period?: 'hour' | 'day' | 'month' | 'year';
  salary_visible?: boolean;
  hours_per_week?: number;
  contract_duration_months?: number;
  start_date?: string;
  expires_at?: string;
  required_skills?: string[];
  preferred_skills?: string[];
  required_certificates?: string[];
  languages?: string[];
  benefits?: string[];
  tags?: string[];
  application_url?: string;
  allow_messages?: boolean;
  featured?: boolean;
  urgent?: boolean;
}

// =====================================================
// JOB CRUD OPERATIONS
// =====================================================

/**
 * Fetch all jobs with optional filters
 */
export async function fetchJobs(filters: JobFilters = {}): Promise<Job[]> {
  try {
    console.log('[JOB-SERVICE] fetchJobs called with filters:', filters);

    // Start building query
    let query = supabase
      .from('jobs')
      .select(`
        *,
        employer:employers!inner(
          id,
          company_name,
          logo_url,
          city
        )
      `);

    // Default: only show active published jobs
    if (!filters.status) {
      query = query
        .eq('status', 'active')
        .not('published_at', 'is', null);
    } else {
      query = query.eq('status', filters.status);
    }

    // Apply filters
    if (filters.category && filters.category !== 'all') {
      query = query.eq('category', filters.category);
    }

    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`);
    }

    if (filters.employmentType && filters.employmentType !== 'all') {
      query = query.eq('employment_type', filters.employmentType);
    }

    if (filters.experienceLevel && filters.experienceLevel !== 'all') {
      query = query.eq('experience_level', filters.experienceLevel);
    }

    if (filters.minSalary !== undefined) {
      query = query.gte('salary_min', filters.minSalary);
    }

    if (filters.maxSalary !== undefined) {
      query = query.lte('salary_max', filters.maxSalary);
    }

    if (filters.locationtype && filters.locationtype !== 'on-site' && filters.locationtype !== 'remote' && filters.locationtype !== 'hybrid') {
      // Invalid location type, skip filter
    } else if (filters.locationtype) {
      query = query.eq('location_type', filters.locationtype);
    }

    // Skills filter (PostgreSQL array overlap)
    if (filters.requiredSkills && filters.requiredSkills.length > 0) {
      query = query.overlaps('required_skills', filters.requiredSkills);
    }

    // Execute query
    const { data, error } = await query
      .order('featured', { ascending: false }) // Featured first
      .order('urgent', { ascending: false })   // Then urgent
      .order('published_at', { ascending: false }); // Then newest

    if (error) {
      console.error('[JOB-SERVICE] Error fetching jobs:', error);
      throw error;
    }

    console.log(`[JOB-SERVICE] Found ${data?.length || 0} jobs`);

    // Apply text search filter (client-side for now)
    let jobs = data || [];
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      jobs = jobs.filter(job =>
        job.title.toLowerCase().includes(term) ||
        job.description.toLowerCase().includes(term) ||
        job.city?.toLowerCase().includes(term) ||
        job.category?.toLowerCase().includes(term)
      );
    }

    return jobs;
  } catch (error) {
    console.error('[JOB-SERVICE] fetchJobs error:', error);
    return [];
  }
}

/**
 * Get single job by ID
 */
export async function getJobById(jobId: string): Promise<Job | null> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        employer:employers!inner(
          id,
          company_name,
          logo_url,
          city,
          contact_email,
          contact_person,
          contact_phone
        )
      `)
      .eq('id', jobId)
      .maybeSingle();

    if (error) throw error;

    // Increment view count
    if (data) {
      await supabase
        .from('jobs')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', jobId);
    }

    return data;
  } catch (error) {
    console.error('[JOB-SERVICE] Error fetching job:', error);
    return null;
  }
}

/**
 * Get jobs by employer ID
 */
export async function getJobsByEmployerId(employerId: string): Promise<Job[]> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('employer_id', employerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[JOB-SERVICE] Error fetching employer jobs:', error);
    return [];
  }
}

/**
 * Create new job posting
 */
export async function createJob(
  employerId: string,
  jobData: CreateJobData
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const payload: JobsInsert = {
      employer_id: employerId,
      title: jobData.title,
      description: jobData.description,
      short_description: jobData.short_description || null,
      category: jobData.category || null,
      subcategory: jobData.subcategory || null,
      location: jobData.location || null,
      city: jobData.city || null,
      country: jobData.country || 'Netherlands',
      address: jobData.address || null,
      postal_code: jobData.postal_code || null,
      location_type: jobData.location_type || 'on-site',
      employment_type: jobData.employment_type || 'full-time',
      experience_level: jobData.experience_level || null,
      education_level: jobData.education_level || null,
      salary_min: jobData.salary_min || null,
      salary_max: jobData.salary_max || null,
      salary_currency: jobData.salary_currency || 'EUR',
      salary_period: jobData.salary_period || 'hour',
      salary_visible: jobData.salary_visible ?? true,
      hours_per_week: jobData.hours_per_week || null,
      contract_duration_months: jobData.contract_duration_months || null,
      start_date: jobData.start_date || null,
      expires_at: jobData.expires_at || null,
      required_skills: jobData.required_skills || [],
      preferred_skills: jobData.preferred_skills || [],
      required_certificates: jobData.required_certificates || [],
      languages: jobData.languages || ['nl'],
      benefits: jobData.benefits || [],
      tags: jobData.tags || [],
      application_url: jobData.application_url || null,
      allow_messages: jobData.allow_messages ?? true,
      featured: jobData.featured || false,
      urgent: jobData.urgent || false,
      status: 'draft', // Always start as draft
      published_at: null,
      views_count: 0,
      applications_count: 0,
    };

    const { data, error } = await supabase
      .from('jobs')
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error('[JOB-SERVICE] Error creating job:', error);
      return { success: false, error: error.message };
    }

    console.log('[JOB-SERVICE] Job created:', data.id);
    return { success: true, jobId: data.id };
  } catch (error: any) {
    console.error('[JOB-SERVICE] createJob error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update existing job
 */
export async function updateJob(
  jobId: string,
  updates: Partial<CreateJobData>
): Promise<boolean> {
  try {
    const payload: JobsUpdate = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('jobs')
      .update(payload)
      .eq('id', jobId);

    if (error) throw error;
    console.log('[JOB-SERVICE] Job updated:', jobId);
    return true;
  } catch (error) {
    console.error('[JOB-SERVICE] Error updating job:', error);
    return false;
  }
}

/**
 * Delete job posting
 */
export async function deleteJob(jobId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId);

    if (error) throw error;
    console.log('[JOB-SERVICE] Job deleted:', jobId);
    return true;
  } catch (error) {
    console.error('[JOB-SERVICE] Error deleting job:', error);
    return false;
  }
}

/**
 * Publish job (change status from draft to active)
 */
export async function publishJob(jobId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('jobs')
      .update({
        status: 'active',
        published_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (error) throw error;
    console.log('[JOB-SERVICE] Job published:', jobId);
    return true;
  } catch (error) {
    console.error('[JOB-SERVICE] Error publishing job:', error);
    return false;
  }
}

/**
 * Mark job as filled
 */
export async function markJobAsFilled(jobId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('jobs')
      .update({
        status: 'filled',
        filled_at: new Date().toISOString(),
      })
      .eq('id', jobId);

    if (error) throw error;
    console.log('[JOB-SERVICE] Job marked as filled:', jobId);
    return true;
  } catch (error) {
    console.error('[JOB-SERVICE] Error marking job as filled:', error);
    return false;
  }
}

// =====================================================
// JOB APPLICATIONS
// =====================================================

/**
 * Apply to a job
 */
export async function applyToJob(
  jobId: string,
  workerId: string,
  coverLetter?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if already applied
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('worker_id', workerId)
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'Już złożyłeś aplikację na tę ofertę' };
    }

    // Get job to retrieve employer_id
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('employer_id')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return { success: false, error: 'Oferta nie została znaleziona' };
    }

    // Create application
    const { error } = await supabase
      .from('applications')
      .insert([{
        job_id: jobId,
        worker_id: workerId,
        employer_id: job.employer_id,
        cover_letter: coverLetter || null,
        status: 'pending',
      }]);

    if (error) throw error;

    // Increment applications count manually using rpc
    await supabase.rpc('increment_jobs_applications_count' as any, { p_job_id: jobId });

    console.log('[JOB-SERVICE] Application submitted:', { jobId, workerId });
    return { success: true };
  } catch (error: any) {
    console.error('[JOB-SERVICE] Error applying to job:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get applications for a job (employer view)
 */
export async function getJobApplications(jobId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        worker:workers!inner(
          id,
          specialization,
          hourly_rate,
          years_experience,
          rating,
          profile:profiles!inner(
            full_name,
            email,
            avatar_url,
            phone
          )
        )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[JOB-SERVICE] Error fetching applications:', error);
    return [];
  }
}

/**
 * Get worker's applications (worker view)
 */
export async function getWorkerApplications(workerId: string): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs!inner(
          id,
          title,
          city,
          employment_type,
          salary_min,
          salary_max,
          employer:employers!inner(
            company_name,
            company_logo_url
          )
        )
      `)
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('[JOB-SERVICE] Error fetching worker applications:', error);
    return [];
  }
}

// =====================================================
// EXPORT ALL
// =====================================================

const jobService = {
  // Jobs CRUD
  fetchJobs,
  getJobById,
  getJobsByEmployerId,
  createJob,
  updateJob,
  deleteJob,
  publishJob,
  markJobAsFilled,
  
  // Applications
  applyToJob,
  getJobApplications,
  getWorkerApplications,
};

export default jobService;
