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
      payments: {
        Row: {
          id: string;
          user_id: string;
          profile_id: string | null;
          payment_type:
            | "worker_subscription"
            | "employer_subscription"
            | "worker_earning"
            | "invoice_payment"
            | "refund";
          amount: number;
          currency: string;
          status:
            | "pending"
            | "processing"
            | "completed"
            | "failed"
            | "refunded"
            | "cancelled";
          payment_method:
            | "stripe_card"
            | "stripe_ideal"
            | "stripe_sepa"
            | "bank_transfer"
            | "cash"
            | "paypal"
            | "other"
            | null;
          stripe_payment_intent_id: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          stripe_invoice_id: string | null;
          stripe_charge_id: string | null;
          related_job_id: string | null;
          related_invoice_id: string | null;
          related_subscription_id: string | null;
          related_earning_id: string | null;
          description: string | null;
          metadata: Json | null;
          notes: string | null;
          refund_amount: number | null;
          refund_reason: string | null;
          refunded_at: string | null;
          refunded_by: string | null;
          invoice_generated: boolean | null;
          invoice_number: string | null;
          invoice_url: string | null;
          payment_date: string | null;
          completed_at: string | null;
          failed_at: string | null;
          failure_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_id?: string | null;
          payment_type:
            | "worker_subscription"
            | "employer_subscription"
            | "worker_earning"
            | "invoice_payment"
            | "refund";
          amount: number;
          currency?: string;
          status?:
            | "pending"
            | "processing"
            | "completed"
            | "failed"
            | "refunded"
            | "cancelled";
          payment_method?:
            | "stripe_card"
            | "stripe_ideal"
            | "stripe_sepa"
            | "bank_transfer"
            | "cash"
            | "paypal"
            | "other"
            | null;
          stripe_payment_intent_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_invoice_id?: string | null;
          stripe_charge_id?: string | null;
          related_job_id?: string | null;
          related_invoice_id?: string | null;
          related_subscription_id?: string | null;
          related_earning_id?: string | null;
          description?: string | null;
          metadata?: Json | null;
          notes?: string | null;
          refund_amount?: number | null;
          refund_reason?: string | null;
          refunded_at?: string | null;
          refunded_by?: string | null;
          invoice_generated?: boolean | null;
          invoice_number?: string | null;
          invoice_url?: string | null;
          payment_date?: string | null;
          completed_at?: string | null;
          failed_at?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;

          profile_id?: string | null;
          payment_type?:
            | "worker_subscription"
            | "employer_subscription"
            | "worker_earning"
            | "invoice_payment"
            | "refund";
          amount?: number;
          currency?: string;
          status?:
            | "pending"
            | "processing"
            | "completed"
            | "failed"
            | "refunded"
            | "cancelled";
          payment_method?:
            | "stripe_card"
            | "stripe_ideal"
            | "stripe_sepa"
            | "bank_transfer"
            | "cash"
            | "paypal"
            | "other"
            | null;
          stripe_payment_intent_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          stripe_invoice_id?: string | null;
          stripe_charge_id?: string | null;
          related_job_id?: string | null;
          related_invoice_id?: string | null;
          related_subscription_id?: string | null;
          related_earning_id?: string | null;
          description?: string | null;
          metadata?: Json | null;
          notes?: string | null;
          refund_amount?: number | null;
          refund_reason?: string | null;
          refunded_at?: string | null;
          refunded_by?: string | null;
          invoice_generated?: boolean | null;
          invoice_number?: string | null;
          invoice_url?: string | null;
          payment_date?: string | null;
          completed_at?: string | null;
          failed_at?: string | null;
          failure_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Allow other tables without explicit definitions
      [key: string]: any;
    };
  };
}
