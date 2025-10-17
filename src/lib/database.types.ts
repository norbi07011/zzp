// TypeScript types generated from Supabase schema
// Generated: 2025-10-07

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          phone: string | null
          language: 'nl' | 'en' | 'pl' | 'de' | 'es' | 'fr' | 'ar'
          role: 'worker' | 'employer' | 'admin'
          is_premium: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          phone?: string | null
          language?: 'nl' | 'en' | 'pl' | 'de' | 'es' | 'fr' | 'ar'
          role: 'worker' | 'employer' | 'admin'
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          phone?: string | null
          language?: 'nl' | 'en' | 'pl' | 'de' | 'es' | 'fr' | 'ar'
          role?: 'worker' | 'employer' | 'admin'
          is_premium?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workers: {
        Row: {
          id: string
          profile_id: string
          kvk_number: string
          btw_number: string | null
          specialization: string
          hourly_rate: number
          years_experience: number
          location_city: string
          location_coords: unknown | null // PostGIS geography type
          radius_km: number
          available_from: string | null
          rating: number
          rating_count: number
          verified: boolean
          verification_documents: Json | null
          bio: string | null
          skills: string[]
          certifications: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          kvk_number: string
          btw_number?: string | null
          specialization: string
          hourly_rate: number
          years_experience: number
          location_city: string
          location_coords?: unknown | null
          radius_km?: number
          available_from?: string | null
          rating?: number
          rating_count?: number
          verified?: boolean
          verification_documents?: Json | null
          bio?: string | null
          skills?: string[]
          certifications?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          kvk_number?: string
          btw_number?: string | null
          specialization?: string
          hourly_rate?: number
          years_experience?: number
          location_city?: string
          location_coords?: unknown | null
          radius_km?: number
          available_from?: string | null
          rating?: number
          rating_count?: number
          verified?: boolean
          verification_documents?: Json | null
          bio?: string | null
          skills?: string[]
          certifications?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      employers: {
        Row: {
          id: string
          profile_id: string
          company_name: string
          kvk_number: string
          industry: string
          location_city: string
          location_coords: unknown | null
          company_size: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          verified: boolean
          rating: number
          rating_count: number
          description: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          company_name: string
          kvk_number: string
          industry: string
          location_city: string
          location_coords?: unknown | null
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          verified?: boolean
          rating?: number
          rating_count?: number
          description?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          company_name?: string
          kvk_number?: string
          industry?: string
          location_city?: string
          location_coords?: unknown | null
          company_size?: '1-10' | '11-50' | '51-200' | '201-500' | '500+' | null
          verified?: boolean
          rating?: number
          rating_count?: number
          description?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          worker_id: string
          certificate_type: string
          certificate_number: string | null
          issuer: string
          issue_date: string
          expiry_date: string | null
          file_url: string
          verified: boolean
          ocr_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          certificate_type: string
          certificate_number?: string | null
          issuer: string
          issue_date: string
          expiry_date?: string | null
          file_url: string
          verified?: boolean
          ocr_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          worker_id?: string
          certificate_type?: string
          certificate_number?: string | null
          issuer?: string
          issue_date?: string
          expiry_date?: string | null
          file_url?: string
          verified?: boolean
          ocr_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          employer_id: string
          title: string
          description: string
          specialization: string
          location_city: string
          location_coords: unknown | null
          hourly_rate_min: number | null
          hourly_rate_max: number | null
          start_date: string | null
          end_date: string | null
          required_skills: string[]
          required_certifications: string[]
          status: 'open' | 'closed' | 'filled'
          application_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          employer_id: string
          title: string
          description: string
          specialization: string
          location_city: string
          location_coords?: unknown | null
          hourly_rate_min?: number | null
          hourly_rate_max?: number | null
          start_date?: string | null
          end_date?: string | null
          required_skills?: string[]
          required_certifications?: string[]
          status?: 'open' | 'closed' | 'filled'
          application_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          employer_id?: string
          title?: string
          description?: string
          specialization?: string
          location_city?: string
          location_coords?: unknown | null
          hourly_rate_min?: number | null
          hourly_rate_max?: number | null
          start_date?: string | null
          end_date?: string | null
          required_skills?: string[]
          required_certifications?: string[]
          status?: 'open' | 'closed' | 'filled'
          application_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
