export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_name: string
          event_type: string
          id: string
          ip_address: unknown
          properties: Json | null
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_name: string
          event_type: string
          id?: string
          ip_address?: unknown
          properties?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_name?: string
          event_type?: string
          id?: string
          ip_address?: unknown
          properties?: Json | null
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          available_from: string | null
          cover_letter: string | null
          created_at: string | null
          employer_id: string
          id: string
          job_id: string
          proposed_rate: number | null
          reviewed_at: string | null
          status: string | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          available_from?: string | null
          cover_letter?: string | null
          created_at?: string | null
          employer_id: string
          id?: string
          job_id: string
          proposed_rate?: number | null
          reviewed_at?: string | null
          status?: string | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          available_from?: string | null
          cover_letter?: string | null
          created_at?: string | null
          employer_id?: string
          id?: string
          job_id?: string
          proposed_rate?: number | null
          reviewed_at?: string | null
          status?: string | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "v_employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "v_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_name: string
          certificate_number: string | null
          certificate_type: string
          created_at: string | null
          expiry_date: string | null
          file_url: string | null
          id: string
          issue_date: string | null
          issuer: string | null
          updated_at: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
          worker_id: string
        }
        Insert: {
          certificate_name: string
          certificate_number?: string | null
          certificate_type: string
          created_at?: string | null
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          worker_id: string
        }
        Update: {
          certificate_name?: string
          certificate_number?: string | null
          certificate_type?: string
          created_at?: string | null
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          issue_date?: string | null
          issuer?: string | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "v_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      earnings: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          description: string | null
          employer_id: string | null
          id: string
          invoice_number: string | null
          job_id: string | null
          payment_date: string
          payment_method: string | null
          status: string | null
          worker_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          employer_id?: string | null
          id?: string
          invoice_number?: string | null
          job_id?: string | null
          payment_date: string
          payment_method?: string | null
          status?: string | null
          worker_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          description?: string | null
          employer_id?: string | null
          id?: string
          invoice_number?: string | null
          job_id?: string | null
          payment_date?: string
          payment_method?: string | null
          status?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "v_employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "v_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "earnings_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_saved_workers: {
        Row: {
          employer_id: string
          folder: string | null
          id: string
          last_viewed_at: string | null
          notes: string | null
          saved_at: string | null
          tags: string[] | null
          worker_id: string
        }
        Insert: {
          employer_id: string
          folder?: string | null
          id?: string
          last_viewed_at?: string | null
          notes?: string | null
          saved_at?: string | null
          tags?: string[] | null
          worker_id: string
        }
        Update: {
          employer_id?: string
          folder?: string | null
          id?: string
          last_viewed_at?: string | null
          notes?: string | null
          saved_at?: string | null
          tags?: string[] | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employer_saved_workers_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employer_saved_workers_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "v_employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employer_saved_workers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "v_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employer_saved_workers_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_search_history: {
        Row: {
          category: string | null
          employer_id: string
          filters: Json | null
          id: string
          level: string | null
          location_city: string | null
          max_rate: number | null
          min_rate: number | null
          radius_km: number | null
          results_count: number | null
          search_date: string | null
          skills: string[] | null
          subcategory: string | null
        }
        Insert: {
          category?: string | null
          employer_id: string
          filters?: Json | null
          id?: string
          level?: string | null
          location_city?: string | null
          max_rate?: number | null
          min_rate?: number | null
          radius_km?: number | null
          results_count?: number | null
          search_date?: string | null
          skills?: string[] | null
          subcategory?: string | null
        }
        Update: {
          category?: string | null
          employer_id?: string
          filters?: Json | null
          id?: string
          level?: string | null
          location_city?: string | null
          max_rate?: number | null
          min_rate?: number | null
          radius_km?: number | null
          results_count?: number | null
          search_date?: string | null
          skills?: string[] | null
          subcategory?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_search_history_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employer_search_history_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "v_employers"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_stats: {
        Row: {
          active_jobs: number | null
          contacts_this_month: number | null
          contacts_this_week: number | null
          created_at: string | null
          employer_id: string
          filled_jobs: number | null
          id: string
          last_contact_at: string | null
          last_search_at: string | null
          pending_applications: number | null
          searches_this_month: number | null
          searches_this_week: number | null
          total_applications_received: number | null
          total_contacts: number | null
          total_jobs_posted: number | null
          total_saved_workers: number | null
          total_searches: number | null
          updated_at: string | null
        }
        Insert: {
          active_jobs?: number | null
          contacts_this_month?: number | null
          contacts_this_week?: number | null
          created_at?: string | null
          employer_id: string
          filled_jobs?: number | null
          id?: string
          last_contact_at?: string | null
          last_search_at?: string | null
          pending_applications?: number | null
          searches_this_month?: number | null
          searches_this_week?: number | null
          total_applications_received?: number | null
          total_contacts?: number | null
          total_jobs_posted?: number | null
          total_saved_workers?: number | null
          total_searches?: number | null
          updated_at?: string | null
        }
        Update: {
          active_jobs?: number | null
          contacts_this_month?: number | null
          contacts_this_week?: number | null
          created_at?: string | null
          employer_id?: string
          filled_jobs?: number | null
          id?: string
          last_contact_at?: string | null
          last_search_at?: string | null
          pending_applications?: number | null
          searches_this_month?: number | null
          searches_this_week?: number | null
          total_applications_received?: number | null
          total_contacts?: number | null
          total_jobs_posted?: number | null
          total_saved_workers?: number | null
          total_searches?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_stats_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: true
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employer_stats_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: true
            referencedRelation: "v_employers"
            referencedColumns: ["id"]
          },
        ]
      }
      employers: {
        Row: {
          address: string | null
          avg_rating: number | null
          city: string | null
          company_name: string | null
          company_size: string | null
          contact_email: string | null
          contact_person: string | null
          contact_phone: string | null
          country: string | null
          created_at: string | null
          description: string | null
          id: string
          industry: string | null
          kvk_number: string | null
          logo_url: string | null
          postal_code: string | null
          profile_id: string
          subscription_expires_at: string | null
          subscription_start_date: string | null
          subscription_started_at: string | null
          subscription_status: string | null
          subscription_tier: string | null
          total_hires: number | null
          total_jobs_posted: number | null
          updated_at: string | null
          verified: boolean | null
          verified_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          avg_rating?: number | null
          city?: string | null
          company_name?: string | null
          company_size?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          kvk_number?: string | null
          logo_url?: string | null
          postal_code?: string | null
          profile_id: string
          subscription_expires_at?: string | null
          subscription_start_date?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          total_hires?: number | null
          total_jobs_posted?: number | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          avg_rating?: number | null
          city?: string | null
          company_name?: string | null
          company_size?: string | null
          contact_email?: string | null
          contact_person?: string | null
          contact_phone?: string | null
          country?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          kvk_number?: string | null
          logo_url?: string | null
          postal_code?: string | null
          profile_id?: string
          subscription_expires_at?: string | null
          subscription_start_date?: string | null
          subscription_started_at?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          total_hires?: number | null
          total_jobs_posted?: number | null
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string | null
          allow_messages: boolean | null
          application_url: string | null
          applications_count: number | null
          benefits: string[] | null
          category: string | null
          city: string | null
          company_logo_url: string | null
          contract_duration_months: number | null
          country: string | null
          created_at: string | null
          description: string
          education_level: string | null
          employer_id: string
          employment_type: string | null
          experience_level: string | null
          expires_at: string | null
          featured: boolean | null
          filled_at: string | null
          hours_per_week: number | null
          id: string
          languages: string[] | null
          latitude: number | null
          location: string | null
          location_type: string | null
          longitude: number | null
          metadata: Json | null
          postal_code: string | null
          preferred_skills: string[] | null
          published_at: string | null
          required_certificates: string[] | null
          required_skills: string[] | null
          salary_currency: string | null
          salary_max: number | null
          salary_min: number | null
          salary_period: string | null
          salary_visible: boolean | null
          short_description: string | null
          start_date: string | null
          status: string | null
          subcategory: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          urgent: boolean | null
          views_count: number | null
        }
        Insert: {
          address?: string | null
          allow_messages?: boolean | null
          application_url?: string | null
          applications_count?: number | null
          benefits?: string[] | null
          category?: string | null
          city?: string | null
          company_logo_url?: string | null
          contract_duration_months?: number | null
          country?: string | null
          created_at?: string | null
          description: string
          education_level?: string | null
          employer_id: string
          employment_type?: string | null
          experience_level?: string | null
          expires_at?: string | null
          featured?: boolean | null
          filled_at?: string | null
          hours_per_week?: number | null
          id?: string
          languages?: string[] | null
          latitude?: number | null
          location?: string | null
          location_type?: string | null
          longitude?: number | null
          metadata?: Json | null
          postal_code?: string | null
          preferred_skills?: string[] | null
          published_at?: string | null
          required_certificates?: string[] | null
          required_skills?: string[] | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: string | null
          salary_visible?: boolean | null
          short_description?: string | null
          start_date?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          urgent?: boolean | null
          views_count?: number | null
        }
        Update: {
          address?: string | null
          allow_messages?: boolean | null
          application_url?: string | null
          applications_count?: number | null
          benefits?: string[] | null
          category?: string | null
          city?: string | null
          company_logo_url?: string | null
          contract_duration_months?: number | null
          country?: string | null
          created_at?: string | null
          description?: string
          education_level?: string | null
          employer_id?: string
          employment_type?: string | null
          experience_level?: string | null
          expires_at?: string | null
          featured?: boolean | null
          filled_at?: string | null
          hours_per_week?: number | null
          id?: string
          languages?: string[] | null
          latitude?: number | null
          location?: string | null
          location_type?: string | null
          longitude?: number | null
          metadata?: Json | null
          postal_code?: string | null
          preferred_skills?: string[] | null
          published_at?: string | null
          required_certificates?: string[] | null
          required_skills?: string[] | null
          salary_currency?: string | null
          salary_max?: number | null
          salary_min?: number | null
          salary_period?: string | null
          salary_visible?: boolean | null
          short_description?: string | null
          start_date?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          urgent?: boolean | null
          views_count?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: string[] | null
          content: string
          created_at: string | null
          id: string
          job_id: string | null
          read: boolean | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          attachments?: string[] | null
          content: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          read?: boolean | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          attachments?: string[] | null
          content?: string
          created_at?: string | null
          id?: string
          job_id?: string | null
          read?: boolean | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          link: string | null
          message: string
          priority: string | null
          read: boolean | null
          read_at: string | null
          sent_email: boolean | null
          sent_push: boolean | null
          sent_sms: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          link?: string | null
          message: string
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          sent_email?: boolean | null
          sent_push?: boolean | null
          sent_sms?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          link?: string | null
          message?: string
          priority?: string | null
          read?: boolean | null
          read_at?: string | null
          sent_email?: boolean | null
          sent_push?: boolean | null
          sent_sms?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          role?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          approved_at: string | null
          comment: string | null
          communication_rating: number | null
          created_at: string | null
          employer_id: string | null
          id: string
          job_id: string | null
          photos: string[] | null
          punctuality_rating: number | null
          quality_rating: number | null
          rating: number
          reviewed_by_admin: string | null
          reviewee_id: string
          reviewer_id: string
          safety_rating: number | null
          status: string | null
          updated_at: string | null
          verified_by_platform: boolean | null
          worker_id: string | null
          would_recommend: boolean | null
        }
        Insert: {
          approved_at?: string | null
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          employer_id?: string | null
          id?: string
          job_id?: string | null
          photos?: string[] | null
          punctuality_rating?: number | null
          quality_rating?: number | null
          rating: number
          reviewed_by_admin?: string | null
          reviewee_id: string
          reviewer_id: string
          safety_rating?: number | null
          status?: string | null
          updated_at?: string | null
          verified_by_platform?: boolean | null
          worker_id?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          approved_at?: string | null
          comment?: string | null
          communication_rating?: number | null
          created_at?: string | null
          employer_id?: string | null
          id?: string
          job_id?: string | null
          photos?: string[] | null
          punctuality_rating?: number | null
          quality_rating?: number | null
          rating?: number
          reviewed_by_admin?: string | null
          reviewee_id?: string
          reviewer_id?: string
          safety_rating?: number | null
          status?: string | null
          updated_at?: string | null
          verified_by_platform?: boolean | null
          worker_id?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "v_employers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_by_admin_fkey"
            columns: ["reviewed_by_admin"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_by_admin_fkey"
            columns: ["reviewed_by_admin"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "v_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_availability: {
        Row: {
          booking_job_id: string | null
          created_at: string | null
          date: string
          end_time: string | null
          id: string
          is_booked: boolean | null
          start_time: string | null
          worker_id: string
        }
        Insert: {
          booking_job_id?: string | null
          created_at?: string | null
          date: string
          end_time?: string | null
          id?: string
          is_booked?: boolean | null
          start_time?: string | null
          worker_id: string
        }
        Update: {
          booking_job_id?: string | null
          created_at?: string | null
          date?: string
          end_time?: string | null
          id?: string
          is_booked?: boolean | null
          start_time?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_availability_booking_job_id_fkey"
            columns: ["booking_job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_availability_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "v_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_availability_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_portfolio: {
        Row: {
          category: string | null
          client_company: string | null
          client_name: string | null
          created_at: string | null
          description: string | null
          duration_days: number | null
          end_date: string | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_public: boolean | null
          project_url: string | null
          start_date: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          video_url: string | null
          worker_id: string
        }
        Insert: {
          category?: string | null
          client_company?: string | null
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          end_date?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_public?: boolean | null
          project_url?: string | null
          start_date?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          video_url?: string | null
          worker_id: string
        }
        Update: {
          category?: string | null
          client_company?: string | null
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          duration_days?: number | null
          end_date?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_public?: boolean | null
          project_url?: string | null
          start_date?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          video_url?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_portfolio_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "v_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_portfolio_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_skills: {
        Row: {
          created_at: string | null
          id: string
          proficiency: number | null
          skill_name: string
          updated_at: string | null
          verified: boolean | null
          verified_at: string | null
          verified_by: string | null
          worker_id: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          proficiency?: number | null
          skill_name: string
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          worker_id: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          proficiency?: number | null
          skill_name?: string
          updated_at?: string | null
          verified?: boolean | null
          verified_at?: string | null
          verified_by?: string | null
          worker_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_skills_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_skills_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_skills_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "v_workers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_skills_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          available_from: string | null
          avatar_url: string | null
          bio: string | null
          btw_number: string | null
          certifications: string[] | null
          created_at: string | null
          email_notifications: boolean | null
          experience_years: number | null
          hourly_rate: number | null
          hourly_rate_max: number | null
          id: string
          kvk_number: string | null
          languages: string[] | null
          last_active: string | null
          last_payment_date: string | null
          location_city: string | null
          location_country: string | null
          location_postal_code: string | null
          monthly_fee: number | null
          own_tools: string[] | null
          own_vehicle: boolean | null
          phone: string | null
          profile_id: string
          profile_views: number | null
          profile_visibility: string | null
          push_notifications: boolean | null
          radius_km: number | null
          rating: number | null
          rating_count: number | null
          response_time: string | null
          show_email: boolean | null
          show_location: boolean | null
          show_phone: boolean | null
          sms_notifications: boolean | null
          specialization: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_end_date: string | null
          subscription_start_date: string | null
          subscription_status: string | null
          subscription_tier: string | null
          total_jobs_completed: number | null
          updated_at: string | null
          vehicle_type: string | null
          verified: boolean | null
          zzp_certificate_date: string | null
          zzp_certificate_expires_at: string | null
          zzp_certificate_issued: boolean | null
          zzp_certificate_number: string | null
        }
        Insert: {
          available_from?: string | null
          avatar_url?: string | null
          bio?: string | null
          btw_number?: string | null
          certifications?: string[] | null
          created_at?: string | null
          email_notifications?: boolean | null
          experience_years?: number | null
          hourly_rate?: number | null
          hourly_rate_max?: number | null
          id?: string
          kvk_number?: string | null
          languages?: string[] | null
          last_active?: string | null
          last_payment_date?: string | null
          location_city?: string | null
          location_country?: string | null
          location_postal_code?: string | null
          monthly_fee?: number | null
          own_tools?: string[] | null
          own_vehicle?: boolean | null
          phone?: string | null
          profile_id: string
          profile_views?: number | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          radius_km?: number | null
          rating?: number | null
          rating_count?: number | null
          response_time?: string | null
          show_email?: boolean | null
          show_location?: boolean | null
          show_phone?: boolean | null
          sms_notifications?: boolean | null
          specialization?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          total_jobs_completed?: number | null
          updated_at?: string | null
          vehicle_type?: string | null
          verified?: boolean | null
          zzp_certificate_date?: string | null
          zzp_certificate_expires_at?: string | null
          zzp_certificate_issued?: boolean | null
          zzp_certificate_number?: string | null
        }
        Update: {
          available_from?: string | null
          avatar_url?: string | null
          bio?: string | null
          btw_number?: string | null
          certifications?: string[] | null
          created_at?: string | null
          email_notifications?: boolean | null
          experience_years?: number | null
          hourly_rate?: number | null
          hourly_rate_max?: number | null
          id?: string
          kvk_number?: string | null
          languages?: string[] | null
          last_active?: string | null
          last_payment_date?: string | null
          location_city?: string | null
          location_country?: string | null
          location_postal_code?: string | null
          monthly_fee?: number | null
          own_tools?: string[] | null
          own_vehicle?: boolean | null
          phone?: string | null
          profile_id?: string
          profile_views?: number | null
          profile_visibility?: string | null
          push_notifications?: boolean | null
          radius_km?: number | null
          rating?: number | null
          rating_count?: number | null
          response_time?: string | null
          show_email?: boolean | null
          show_location?: boolean | null
          show_phone?: boolean | null
          sms_notifications?: boolean | null
          specialization?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_end_date?: string | null
          subscription_start_date?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          total_jobs_completed?: number | null
          updated_at?: string | null
          vehicle_type?: string | null
          verified?: boolean | null
          zzp_certificate_date?: string | null
          zzp_certificate_expires_at?: string | null
          zzp_certificate_issued?: boolean | null
          zzp_certificate_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      v_employers: {
        Row: {
          company_name: string | null
          created_at: string | null
          id: string | null
          kvk_number: string | null
          profile_id: string | null
        }
        Insert: {
          company_name?: string | null
          created_at?: string | null
          id?: string | null
          kvk_number?: string | null
          profile_id?: string | null
        }
        Update: {
          company_name?: string | null
          created_at?: string | null
          id?: string | null
          kvk_number?: string | null
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      v_profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string | null
          role: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          role?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string | null
          role?: string | null
        }
        Relationships: []
      }
      v_workers: {
        Row: {
          created_at: string | null
          experience_years: number | null
          id: string | null
          profile_id: string | null
          specialization: string | null
          verified: boolean | null
        }
        Insert: {
          created_at?: string | null
          experience_years?: number | null
          id?: string | null
          profile_id?: string | null
          specialization?: string | null
          verified?: boolean | null
        }
        Update: {
          created_at?: string | null
          experience_years?: number | null
          id?: string | null
          profile_id?: string | null
          specialization?: string | null
          verified?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "workers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "v_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_notification: {
        Args: {
          p_data?: Json
          p_link?: string
          p_message: string
          p_priority?: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      custom_access_token_hook: { Args: { event: Json }; Returns: Json }
      generate_certificate_number: { Args: never; Returns: string }
      get_unread_message_count: { Args: { user_id: string }; Returns: number }
      get_unread_notifications_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      get_worker_earnings_stats: {
        Args: { p_worker_id: string }
        Returns: {
          paid_earnings: number
          pending_earnings: number
          total_earnings: number
          total_jobs: number
        }[]
      }
      update_employer_stats: {
        Args: { p_employer_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
