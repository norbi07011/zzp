export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      test_appointments: {
        Row: {
          id: string;
          worker_id: string | null;
          test_date: string;
          duration_minutes: number | null;
          status:
            | "pending"
            | "scheduled"
            | "confirmed"
            | "completed"
            | "cancelled"
            | "no_show";
          test_type: "initial" | "renewal" | "spot_check" | "emergency" | null;
          location: string | null;
          examiner_name: string | null;
          result: "pass" | "fail" | "pending" | null;
          score: number | null;
          passed: boolean | null;
          notes: string | null;
          scheduled_by: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          cancellation_reason: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          worker_id?: string | null;
          test_date: string;
          duration_minutes?: number | null;
          status?:
            | "pending"
            | "scheduled"
            | "confirmed"
            | "completed"
            | "cancelled"
            | "no_show";
          test_type?: "initial" | "renewal" | "spot_check" | "emergency" | null;
          location?: string | null;
          examiner_name?: string | null;
          result?: "pass" | "fail" | "pending" | null;
          score?: number | null;
          passed?: boolean | null;
          notes?: string | null;
          scheduled_by?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          worker_id?: string | null;
          test_date?: string;
          duration_minutes?: number | null;
          status?:
            | "pending"
            | "scheduled"
            | "confirmed"
            | "completed"
            | "cancelled"
            | "no_show";
          test_type?: "initial" | "renewal" | "spot_check" | "emergency" | null;
          location?: string | null;
          examiner_name?: string | null;
          result?: "pass" | "fail" | "pending" | null;
          score?: number | null;
          passed?: boolean | null;
          notes?: string | null;
          scheduled_by?: string | null;
          completed_at?: string | null;
          cancelled_at?: string | null;
          cancellation_reason?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      // Allow other tables without explicit definitions
      [key: string]: any;
    };
  };
}
