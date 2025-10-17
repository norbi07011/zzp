// Simplified types for Supabase operations
// These bypass the auto-generated types which have issues

export interface SupabaseWorker {
  id: string;
  profile_id: string;
  kvk_number: string;
  btw_number: string | null;
  specialization: string;
  hourly_rate: number;
  years_experience: number;
  location_city: string;
  location_coords: any;
  radius_km: number;
  available_from: string | null;
  rating: number;
  rating_count: number;
  verified: boolean;
  verification_documents: any;
  bio: string | null;
  skills: string[];
  certifications: string[];
  created_at: string;
  updated_at: string;
}

export interface SupabaseCertificate {
  id: string;
  worker_id: string;
  certificate_type: string;
  certificate_number: string | null;
  issuer: string;
  issue_date: string;
  expiry_date: string | null;
  file_url: string;
  verified: boolean;
  ocr_data: any;
  created_at: string;
  updated_at: string;
}

export interface SupabaseProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  phone: string | null;
  language: string;
  role: 'worker' | 'employer' | 'admin';
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseEmployer {
  id: string;
  profile_id: string;
  company_name: string;
  kvk_number: string;
  industry: string;
  location_city: string;
  location_coords: any;
  company_size: string | null;
  verified: boolean;
  rating: number;
  rating_count: number;
  description: string | null;
  website: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupabaseJob {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  specialization: string;
  location_city: string;
  location_coords: any;
  hourly_rate_min: number | null;
  hourly_rate_max: number | null;
  start_date: string | null;
  end_date: string | null;
  required_skills: string[];
  required_certifications: string[];
  status: 'open' | 'closed' | 'filled';
  application_count: number;
  created_at: string;
  updated_at: string;
}
