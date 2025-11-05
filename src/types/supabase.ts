// Auto-generated types - simplified version to avoid issues
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
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
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          phone?: string | null;
          language?: string;
          role?: 'worker' | 'employer' | 'admin';
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          avatar_url?: string | null;
          phone?: string | null;
          language?: string;
          role?: 'worker' | 'employer' | 'admin';
          is_premium?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      workers: {
        Row: {
          id: string;
          profile_id: string;
          kvk_number: string;
          specialization: string;
          hourly_rate: number;
          years_experience: number;
          location_city: string;
          verified: boolean;
          rating: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          kvk_number: string;
          specialization: string;
          hourly_rate: number;
          years_experience: number;
          location_city: string;
          verified?: boolean;
          rating?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          kvk_number?: string;
          specialization?: string;
          hourly_rate?: number;
          years_experience?: number;
          location_city?: string;
          verified?: boolean;
          rating?: number;
          created_at?: string;
        };
      };
      employers: {
        Row: {
          id: string;
          profile_id: string;
          company_name: string;
          kvk_number: string;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          company_name: string;
          kvk_number: string;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          company_name?: string;
          kvk_number?: string;
          verified?: boolean;
          created_at?: string;
        };
      };
      certificates: {
        Row: {
          id: string;
          worker_id: string;
          certificate_type: string;
          issuer: string;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          certificate_type: string;
          issuer: string;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          certificate_type?: string;
          issuer?: string;
          verified?: boolean;
          created_at?: string;
        };
      };
      files: {
        Row: {
          id: string;
          userId: string;
          filename: string;
          originalFilename: string;
          mimeType: string;
          size: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          userId: string;
          filename: string;
          originalFilename: string;
          mimeType: string;
          size: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          filename?: string;
          originalFilename?: string;
          mimeType?: string;
          size?: number;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          amount: number;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          amount: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_number?: string;
          amount?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          company_name: string;
          kvk_number: string;
          btw_number: string;
          address: string;
          postal_code: string;
          city: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          kvk_number: string;
          btw_number: string;
          address: string;
          postal_code: string;
          city: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          kvk_number?: string;
          btw_number?: string;
          address?: string;
          postal_code?: string;
          city?: string;
          created_at?: string;
        };
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          enabled_channels: string[];
          job_notifications: boolean;
          application_notifications: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          enabled_channels: string[];
          job_notifications?: boolean;
          application_notifications?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          enabled_channels?: string[];
          job_notifications?: boolean;
          application_notifications?: boolean;
          created_at?: string;
        };
      };
      email_events: {
        Row: {
          id: string;
          type: string;
          recipient: string;
          data: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          recipient: string;
          data?: any;
          created_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          recipient?: string;
          data?: any;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
