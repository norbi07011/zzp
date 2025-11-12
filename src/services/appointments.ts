// @ts-nocheck
/**
 * Appointments Service Layer (UNIFIED)
 * Handles ALL appointment types: tests, meetings, consultations
 *
 * DATABASE: test_appointments table (unified appointments system)
 * Migration: 20251112_2300_unify_appointments_system.sql
 *
 * APPOINTMENT TYPES:
 * - 'test' = ZZP exams, certifications (worker_id required)
 * - 'meeting' = Client-worker meetings (client_id + worker_id)
 * - 'consultation' = Advisory sessions
 * - 'interview' = Job interviews
 */

import { supabase } from "@/lib/supabase";

// Type definitions
export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "scheduled";
export type AppointmentPriority = "low" | "normal" | "high" | "urgent";
export type AppointmentType = "test" | "meeting" | "consultation" | "interview";

export interface Appointment {
  id: string;
  client_id?: string; // Employer/client (NULL for admin-scheduled tests)
  worker_id: string;
  test_date: string; // TIMESTAMP (includes time)
  duration_minutes: number;
  location?: string;
  status: AppointmentStatus;
  notes?: string;
  appointment_type: AppointmentType; // NEW: unified type
  service_type?: string; // e.g., 'cleaning', 'zzp_exam'
  priority: AppointmentPriority;
  // Video call integration
  video_call_provider?: string;
  video_call_meeting_id?: string;
  video_call_join_url?: string;
  video_call_password?: string;
  // Reminders
  reminder_sms: boolean;
  reminder_email: boolean;
  // Test-specific fields (only for appointment_type='test')
  test_type?: string; // DEPRECATED: use service_type
  examiner_name?: string;
  result?: string;
  score?: number;
  passed?: boolean;
  // Metadata
  scheduled_by?: string;
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
  worker?: {
    id: string;
    profile: {
      full_name: string;
      email: string;
    };
  };
}

/**
 * Fetch all appointments with client and worker data
 */
export const fetchAllAppointments = async (): Promise<Appointment[]> => {
  console.log("🔍 fetchAllAppointments: Starting query...");
  try {
    const { data, error } = await supabase
      .from("test_appointments")
      .select(
        `
        *,
        client:profiles!test_appointments_client_id_fkey(
          id,
          full_name,
          email,
          phone
        ),
        worker:workers!test_appointments_worker_id_fkey(
          id,
          profile:profiles!workers_profile_id_fkey(full_name, email)
        )
      `
      )
      .order("test_date", { ascending: true });

    if (error) {
      console.error("❌ fetchAllAppointments error:", error);
      throw error;
    }

    console.log("✅ fetchAllAppointments success:", data?.length || 0, "rows");
    return data || [];
  } catch (error) {
    console.error("❌ fetchAllAppointments catch:", error);
    return [];
  }
};

/**
 * Fetch appointments by status
 */
export const fetchAppointmentsByStatus = async (
  status: AppointmentStatus
): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from("test_appointments")
      .select(
        `
        *,
        client:profiles!test_appointments_client_id_fkey(id, full_name, email, phone),
        worker:workers!test_appointments_worker_id_fkey(id, profile:profiles!workers_profile_id_fkey(full_name, email))
      `
      )
      .eq("status", status)
      .order("test_date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("fetchAppointmentsByStatus error:", error);
    return [];
  }
};

/**
 * Fetch appointments for specific date range
 */
export const fetchAppointmentsByDateRange = async (
  startDate: string,
  endDate: string
): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from("test_appointments")
      .select(
        `
        *,
        client:profiles!test_appointments_client_id_fkey(id, full_name, email, phone),
        worker:workers!test_appointments_worker_id_fkey(id, profile:profiles!workers_profile_id_fkey(full_name, email))
      `
      )
      .gte("test_date", startDate)
      .lte("test_date", endDate)
      .order("test_date", { ascending: true })
      .order("test_date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("fetchAppointmentsByDateRange error:", error);
    return [];
  }
};

/**
 * Fetch appointments for a specific worker
 */
export const fetchWorkerAppointments = async (
  workerId: string
): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from("test_appointments")
      .select(
        `
        *,
        client:profiles!test_appointments_client_id_fkey(id, full_name, email, phone),
        worker:workers!test_appointments_worker_id_fkey(id, profile:profiles!workers_profile_id_fkey(full_name, email))
      `
      )
      .eq("worker_id", workerId)
      .order("test_date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("fetchWorkerAppointments error:", error);
    return [];
  }
};

/**
 * Fetch appointments for a specific client
 */
export const fetchClientAppointments = async (
  clientId: string
): Promise<Appointment[]> => {
  try {
    const { data, error } = await supabase
      .from("test_appointments")
      .select(
        `
        *,
        client:profiles!test_appointments_client_id_fkey(id, full_name, email, phone),
        worker:workers!test_appointments_worker_id_fkey(id, profile:profiles!workers_profile_id_fkey(full_name, email))
      `
      )
      .eq("client_id", clientId)
      .order("test_date", { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("fetchClientAppointments error:", error);
    return [];
  }
};

/**
 * Create new appointment
 */
export const createAppointment = async (
  appointmentData: Partial<Appointment>
): Promise<Appointment | null> => {
  try {
    const { data, error } = await supabase
      .from("test_appointments")
      .insert(appointmentData)
      .select()
      .single();

    if (error) {
      console.error("Error creating appointment:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("createAppointment error:", error);
    return null;
  }
};

/**
 * Update appointment
 */
export const updateAppointment = async (
  appointmentId: string,
  updates: Partial<Appointment>
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("test_appointments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", appointmentId);

    if (error) {
      console.error("Error updating appointment:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("updateAppointment error:", error);
    return false;
  }
};

/**
 * Update appointment status
 */
export const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("test_appointments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", appointmentId);

    if (error) {
      console.error("Error updating appointment status:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("updateAppointmentStatus error:", error);
    return false;
  }
};

/**
 * Confirm appointment
 */
export const confirmAppointment = async (
  appointmentId: string
): Promise<boolean> => {
  return await updateAppointmentStatus(appointmentId, "confirmed");
};

/**
 * Cancel appointment
 */
export const cancelAppointment = async (
  appointmentId: string
): Promise<boolean> => {
  return await updateAppointmentStatus(appointmentId, "cancelled");
};

/**
 * Complete appointment
 */
export const completeAppointment = async (
  appointmentId: string
): Promise<boolean> => {
  return await updateAppointmentStatus(appointmentId, "completed");
};

/**
 * Delete appointment
 */
export const deleteAppointment = async (
  appointmentId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("test_appointments")
      .delete()
      .eq("id", appointmentId);

    if (error) {
      console.error("Error deleting appointment:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("deleteAppointment error:", error);
    return false;
  }
};

/**
 * Bulk update appointments
 */
export const bulkUpdateAppointments = async (
  appointmentIds: string[],
  updates: Partial<Appointment>
): Promise<number> => {
  try {
    const { error } = await supabase
      .from("test_appointments")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .in("id", appointmentIds);

    if (error) {
      console.error("Error bulk updating appointments:", error);
      return 0;
    }

    return appointmentIds.length;
  } catch (error) {
    console.error("bulkUpdateAppointments error:", error);
    return 0;
  }
};

/**
 * Get appointment statistics
 */
export const getAppointmentStats = async (): Promise<{
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byServiceType: Record<string, number>;
}> => {
  try {
    const { data: appointments, error } = await supabase
      .from("test_appointments")
      .select("status, test_date, service_type");

    if (error) throw error;

    const today = new Date().toISOString().split("T")[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const stats = {
      total: appointments?.length || 0,
      pending: appointments?.filter((a) => a.status === "pending").length || 0,
      confirmed:
        appointments?.filter((a) => a.status === "confirmed").length || 0,
      completed:
        appointments?.filter((a) => a.status === "completed").length || 0,
      cancelled:
        appointments?.filter((a) => a.status === "cancelled").length || 0,
      today: appointments?.filter((a) => a.test_date === today).length || 0,
      thisWeek: appointments?.filter((a) => a.test_date >= weekAgo).length || 0,
      thisMonth:
        appointments?.filter((a) => a.test_date >= monthAgo).length || 0,
      byServiceType: {} as Record<string, number>,
    };

    // Count by service type
    appointments?.forEach((app) => {
      if (app.service_type) {
        stats.byServiceType[app.service_type] =
          (stats.byServiceType[app.service_type] || 0) + 1;
      }
    });

    return stats;
  } catch (error) {
    console.error("getAppointmentStats error:", error);
    return {
      total: 0,
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0,
      byServiceType: {},
    };
  }
};

/**
 * Check if time slot is available
 */
export const checkTimeSlotAvailability = async (
  workerId: string,
  date: string,
  time: string,
  duration: number
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("test_appointments")
      .select("test_date, duration")
      .eq("worker_id", workerId)
      .eq("test_date", date)
      .neq("status", "cancelled");

    if (error) throw error;

    // Check for overlapping appointments
    const requestedStart = new Date(`2000-01-01T${time}`);
    const requestedEnd = new Date(requestedStart.getTime() + duration * 60000);

    for (const appointment of data || []) {
      const existingStart = new Date(`2000-01-01T${appointment.test_date}`);
      const existingEnd = new Date(
        existingStart.getTime() + appointment.duration * 60000
      );

      // Check for overlap
      if (
        (requestedStart >= existingStart && requestedStart < existingEnd) ||
        (requestedEnd > existingStart && requestedEnd <= existingEnd) ||
        (requestedStart <= existingStart && requestedEnd >= existingEnd)
      ) {
        return false; // Slot not available
      }
    }

    return true; // Slot is available
  } catch (error) {
    console.error("checkTimeSlotAvailability error:", error);
    return false;
  }
};

/**
 * Get upcoming appointments (next 7 days)
 */
export const getUpcomingAppointments = async (): Promise<Appointment[]> => {
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  return await fetchAppointmentsByDateRange(today, nextWeek);
};
