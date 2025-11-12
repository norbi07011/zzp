// @ts-nocheck
/**
 * ZZP Exam Service
 * Service for managing ZZP exam applications, evaluations, and certificates
 *
 * NOTE: Using 'as any' casts for Supabase queries because zzp_exam_applications
 * table is not in generated TypeScript types yet. This will work at runtime
 * as long as the table exists in the database.
 */

import { supabase } from "../src/lib/supabase";
import {
  generateZZPCertificatePDF,
  downloadCertificatePDF,
  uploadCertificatePDF,
} from "./pdfCertificateGenerator";

export interface ZZPExamApplication {
  id: string;
  worker_id: string;
  worker?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  full_name: string;
  email: string;
  phone?: string;
  specializations: string[];
  status:
    | "pending"
    | "payment_completed"
    | "scheduled"
    | "completed"
    | "passed"
    | "failed"
    | "approved"
    | "rejected";
  documents: any[]; // JSONB array containing exam data, payment info
  test_score?: number;
  test_date?: string;
  approved_by?: string;
  approved_at?: string;
  certificate_number?: string;
  rejection_reason?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExamEvaluation {
  application_id: string;
  test_score: number;
  admin_notes: string;
  exam_result: "passed" | "failed";
}

export interface ExamFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface ExamStats {
  total_applications: number;
  pending_payment: number;
  scheduled: number;
  completed: number;
  passed: number;
  failed: number;
  certificates_issued: number;
  total_revenue: number;
}

/**
 * Get all ZZP exam applications with filters
 */
export async function getExamApplications(
  filters: ExamFilters = {}
): Promise<ZZPExamApplication[]> {
  try {
    let query = (supabase as any)
      .from("zzp_exam_applications")
      .select(
        `
        *,
        worker:workers!worker_id (
          first_name,
          last_name,
          email,
          phone
        )
      `
      )
      .order("created_at", { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.date_from) {
      query = query.gte("created_at", filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte("created_at", filters.date_to);
    }

    if (filters.search) {
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []) as ZZPExamApplication[];
  } catch (error) {
    console.error("Error fetching exam applications:", error);
    throw error;
  }
}

/**
 * Get single exam application by ID
 */
export async function getExamApplication(
  id: string
): Promise<ZZPExamApplication | null> {
  try {
    const { data, error } = await supabase
      .from("zzp_exam_applications")
      .select(
        `
        *,
        worker:workers!worker_id (
          first_name,
          last_name,
          email,
          phone
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error("Error fetching exam application:", error);
    return null;
  }
}

/**
 * Get exam statistics
 */
export async function getExamStats(): Promise<ExamStats> {
  try {
    // Get all applications
    const { data: applications, error: appsError } = await supabase
      .from("zzp_exam_applications")
      .select("status, created_at");

    if (appsError) throw appsError;

    // Get payments for revenue
    const { data: payments, error: paymentsError } = await supabase
      .from("payments")
      .select("amount, status")
      .eq("metadata->>type", "zzp_exam")
      .eq("status", "completed");

    if (paymentsError) console.error("Error fetching payments:", paymentsError);

    const stats: ExamStats = {
      total_applications: applications?.length || 0,
      pending_payment:
        applications?.filter((a: any) => a.status === "pending").length || 0,
      scheduled:
        applications?.filter(
          (a: any) =>
            a.status === "scheduled" || a.status === "payment_completed"
        ).length || 0,
      completed:
        applications?.filter((a: any) => a.status === "completed").length || 0,
      passed:
        applications?.filter(
          (a: any) => a.status === "passed" || a.status === "approved"
        ).length || 0,
      failed:
        applications?.filter(
          (a: any) => a.status === "failed" || a.status === "rejected"
        ).length || 0,
      certificates_issued:
        applications?.filter(
          (a: any) => a.status === "approved" && a.certificate_number
        ).length || 0,
      total_revenue:
        payments?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) ||
        0,
    };

    return stats;
  } catch (error) {
    console.error("Error fetching exam stats:", error);
    return {
      total_applications: 0,
      pending_payment: 0,
      scheduled: 0,
      completed: 0,
      passed: 0,
      failed: 0,
      certificates_issued: 0,
      total_revenue: 0,
    };
  }
}

/**
 * Update exam application with evaluation
 */
export async function evaluateExam(
  evaluation: ExamEvaluation
): Promise<boolean> {
  try {
    const { application_id, test_score, admin_notes, exam_result } = evaluation;

    const { error } = await supabase
      .from("zzp_exam_applications")
      .update({
        test_score,
        admin_notes,
        status: exam_result, // 'passed' or 'failed'
        test_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", application_id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error evaluating exam:", error);
    throw error;
  }
}

/**
 * Issue certificate to passed application
 */
export async function issueCertificate(
  applicationId: string,
  adminId: string
): Promise<string> {
  try {
    // Get application to check status
    const { data: app, error: fetchError } = await supabase
      .from("zzp_exam_applications")
      .select("status")
      .eq("id", applicationId)
      .single();

    if (fetchError) throw fetchError;

    if (app.status !== "passed") {
      throw new Error("Application must be passed before issuing certificate");
    }

    // Generate certificate number
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from("zzp_exam_applications")
      .select("*", { count: "exact", head: true })
      .not("certificate_number", "is", null);

    const certificateNumber = `ZZP-${year}-${String((count || 0) + 1).padStart(
      5,
      "0"
    )}`;

    // Update application
    const { error: updateError } = await supabase
      .from("zzp_exam_applications")
      .update({
        status: "approved",
        certificate_number: certificateNumber,
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateError) throw updateError;

    return certificateNumber;
  } catch (error) {
    console.error("Error issuing certificate:", error);
    throw error;
  }
}

/**
 * Issue certificate with PDF generation and download
 */
export async function issueCertificateWithPDF(
  applicationId: string,
  adminId: string
): Promise<string> {
  try {
    // Get full application data
    const app = await getExamApplication(applicationId);

    if (!app) {
      throw new Error("Application not found");
    }

    if (app.status !== "passed") {
      throw new Error("Application must be passed before issuing certificate");
    }

    // Generate certificate number
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from("zzp_exam_applications")
      .select("*", { count: "exact", head: true })
      .not("certificate_number", "is", null);

    const certificateNumber = `ZZP-${year}-${String((count || 0) + 1).padStart(
      5,
      "0"
    )}`;

    // Update application
    const { error: updateError } = await supabase
      .from("zzp_exam_applications")
      .update({
        status: "approved",
        certificate_number: certificateNumber,
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (updateError) throw updateError;

    // Generate PDF
    const workerName = app.worker
      ? `${app.worker.first_name} ${app.worker.last_name}`
      : app.full_name;

    const pdfBlob = await generateZZPCertificatePDF({
      certificateNumber,
      workerName,
      workerEmail: app.worker?.email || app.email,
      specializations: app.specializations || [],
      testScore: app.test_score || 0,
      testDate: app.test_date || new Date().toISOString(),
      issueDate: new Date().toISOString(),
      issuedBy: adminId,
    });

    // Upload to Supabase Storage
    const pdfUrl = await uploadCertificatePDF(
      pdfBlob,
      certificateNumber,
      supabase
    );

    // Save to worker_certificates table
    if (pdfUrl && app.worker_id) {
      try {
        await supabase.from("worker_certificates").insert({
          worker_id: app.worker_id,
          certificate_name: `ZZP Premium Certificate - ${certificateNumber}`,
          certificate_type: "ZZP Premium",
          issue_date: new Date().toISOString(),
          expiration_date: null, // ZZP Premium doesn't expire
          file_url: pdfUrl,
          verified: true,
          verified_by: adminId,
          verification_date: new Date().toISOString(),
        });
        console.log("✅ Certificate saved to worker_certificates table");
      } catch (certError) {
        console.error(
          "⚠️ Warning: Could not save to worker_certificates:",
          certError
        );
        // Don't throw - PDF was still generated successfully
      }
    }

    // Trigger download
    downloadCertificatePDF(pdfBlob, certificateNumber);

    return certificateNumber;
  } catch (error) {
    console.error("Error issuing certificate with PDF:", error);
    throw error;
  }
}

/**
 * Approve exam application (change status from pending to payment_completed)
 */
export async function approveApplication(
  applicationId: string,
  adminId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("zzp_exam_applications")
      .update({
        status: "payment_completed",
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error approving application:", error);
    throw error;
  }
}

/**
 * Reject exam application
 */
export async function rejectApplication(
  applicationId: string,
  rejectionReason: string,
  adminId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("zzp_exam_applications")
      .update({
        status: "rejected",
        rejection_reason: rejectionReason,
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error rejecting application:", error);
    throw error;
  }
}

/**
 * Get upcoming exams (scheduled for next 30 days)
 */
export async function getUpcomingExams(): Promise<ZZPExamApplication[]> {
  try {
    // Get exams from documents JSONB field
    const { data, error } = await supabase
      .from("zzp_exam_applications")
      .select(
        `
        *,
        worker:workers!worker_id (
          first_name,
          last_name,
          email,
          phone
        )
      `
      )
      .in("status", ["payment_completed", "scheduled"])
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Filter by exam_date in documents JSONB
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const upcomingExams = (data || []).filter((app: any) => {
      if (
        !app.documents ||
        !Array.isArray(app.documents) ||
        app.documents.length === 0
      ) {
        return false;
      }

      const examData = app.documents[0];
      if (!examData.exam_date) return false;

      const examDate = new Date(examData.exam_date);
      return examDate >= now && examDate <= futureDate;
    });

    return upcomingExams;
  } catch (error) {
    console.error("Error fetching upcoming exams:", error);
    return [];
  }
}

/**
 * Extract exam date from documents JSONB
 */
export function getExamDate(application: ZZPExamApplication): string | null {
  try {
    if (
      !application.documents ||
      !Array.isArray(application.documents) ||
      application.documents.length === 0
    ) {
      return null;
    }
    return application.documents[0]?.exam_date || null;
  } catch {
    return null;
  }
}

/**
 * Extract warehouse location from documents JSONB
 */
export function getWarehouseLocation(
  application: ZZPExamApplication
): string | null {
  try {
    if (
      !application.documents ||
      !Array.isArray(application.documents) ||
      application.documents.length === 0
    ) {
      return null;
    }
    return application.documents[0]?.warehouse_location || null;
  } catch {
    return null;
  }
}

/**
 * Extract payment info from documents JSONB
 */
export function getPaymentInfo(application: ZZPExamApplication): {
  amount: number;
  currency: string;
  status: string;
  stripe_session_id?: string;
} | null {
  try {
    if (
      !application.documents ||
      !Array.isArray(application.documents) ||
      application.documents.length === 0
    ) {
      return null;
    }
    const doc = application.documents[0];
    return {
      amount: doc.payment_amount || 230,
      currency: doc.payment_currency || "EUR",
      status: doc.payment_status || "pending",
      stripe_session_id: doc.stripe_session_id,
    };
  } catch {
    return null;
  }
}

export const zzpExamService = {
  getExamApplications,
  getExamApplication,
  getExamStats,
  evaluateExam,
  issueCertificate,
  issueCertificateWithPDF,
  approveApplication,
  rejectApplication,
  getUpcomingExams,
  getExamDate,
  getWarehouseLocation,
  getPaymentInfo,
};
