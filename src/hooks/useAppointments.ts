// @ts-nocheck
/**
 * useAppointments Hook
 * Custom hook for managing appointments in admin panel
 */

import { useState, useEffect, useCallback } from "react";
import {
  fetchAllAppointments,
  fetchAppointmentsByStatus,
  fetchAppointmentsByDateRange,
  createAppointment,
  updateAppointment,
  updateAppointmentStatus,
  confirmAppointment,
  cancelAppointment,
  completeAppointment,
  deleteAppointment,
  bulkUpdateAppointments,
  getAppointmentStats,
  getUpcomingAppointments,
  checkTimeSlotAvailability,
  type Appointment,
  type AppointmentStatus,
  type AppointmentPriority,
} from "../services/appointments";

export interface AppointmentStats {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  byServiceType: Record<string, number>;
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    byServiceType: {},
  });

  /**
   * Refresh appointments from database
   */
  const refreshAppointments = useCallback(async () => {
    console.log("🔄 useAppointments: refreshAppointments called");
    setLoading(true);
    setError(null);

    try {
      console.log("📞 Calling fetchAllAppointments()...");
      const appointmentsData = await fetchAllAppointments();
      console.log(
        "✅ Appointments fetched:",
        appointmentsData.length,
        appointmentsData
      );
      setAppointments(appointmentsData);

      // Fetch statistics
      const statsData = await getAppointmentStats();
      console.log("📊 Stats fetched:", statsData);
      setStats(statsData);
    } catch (err) {
      console.error("❌ Error refreshing appointments:", err);
      setError(err instanceof Error ? err.message : "Błąd ładowania spotkań");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get appointments by status
   */
  const getByStatus = useCallback(
    async (status: AppointmentStatus): Promise<Appointment[]> => {
      return await fetchAppointmentsByStatus(status);
    },
    []
  );

  /**
   * Get appointments by date range
   */
  const getByDateRange = useCallback(
    async (startDate: string, endDate: string): Promise<Appointment[]> => {
      return await fetchAppointmentsByDateRange(startDate, endDate);
    },
    []
  );

  /**
   * Create new appointment
   */
  const create = useCallback(
    async (
      appointmentData: Partial<Appointment>
    ): Promise<Appointment | null> => {
      const newAppointment = await createAppointment(appointmentData);

      if (newAppointment) {
        await refreshAppointments();
      }

      return newAppointment;
    },
    [refreshAppointments]
  );

  /**
   * Update appointment
   */
  const update = useCallback(
    async (
      appointmentId: string,
      updates: Partial<Appointment>
    ): Promise<boolean> => {
      const success = await updateAppointment(appointmentId, updates);

      if (success) {
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === appointmentId ? { ...app, ...updates } : app
          )
        );
      }

      return success;
    },
    []
  );

  /**
   * Update appointment status
   */
  const updateStatus = useCallback(
    async (
      appointmentId: string,
      status: AppointmentStatus
    ): Promise<boolean> => {
      const success = await updateAppointmentStatus(appointmentId, status);

      if (success) {
        setAppointments((prev) =>
          prev.map((app) =>
            app.id === appointmentId ? { ...app, status } : app
          )
        );

        // Update stats
        await refreshAppointments();
      }

      return success;
    },
    [refreshAppointments]
  );

  /**
   * Confirm appointment
   */
  const confirm = useCallback(
    async (appointmentId: string): Promise<boolean> => {
      return await updateStatus(appointmentId, "confirmed");
    },
    [updateStatus]
  );

  /**
   * Cancel appointment
   */
  const cancel = useCallback(
    async (appointmentId: string): Promise<boolean> => {
      return await updateStatus(appointmentId, "cancelled");
    },
    [updateStatus]
  );

  /**
   * Complete appointment
   */
  const complete = useCallback(
    async (appointmentId: string): Promise<boolean> => {
      return await updateStatus(appointmentId, "completed");
    },
    [updateStatus]
  );

  /**
   * Delete appointment
   */
  const remove = useCallback(
    async (appointmentId: string): Promise<boolean> => {
      const success = await deleteAppointment(appointmentId);

      if (success) {
        setAppointments((prev) =>
          prev.filter((app) => app.id !== appointmentId)
        );

        // Update stats
        setStats((prev) => ({
          ...prev,
          total: Math.max(0, prev.total - 1),
        }));
      }

      return success;
    },
    []
  );

  /**
   * Bulk update appointments
   */
  const bulkUpdate = useCallback(
    async (
      appointmentIds: string[],
      updates: Partial<Appointment>
    ): Promise<number> => {
      const count = await bulkUpdateAppointments(appointmentIds, updates);

      if (count > 0) {
        await refreshAppointments();
      }

      return count;
    },
    [refreshAppointments]
  );

  /**
   * Check time slot availability
   */
  const checkAvailability = useCallback(
    async (
      workerId: string,
      date: string,
      time: string,
      duration: number
    ): Promise<boolean> => {
      return await checkTimeSlotAvailability(workerId, date, time, duration);
    },
    []
  );

  /**
   * Get upcoming appointments
   */
  const getUpcoming = useCallback(async (): Promise<Appointment[]> => {
    return await getUpcomingAppointments();
  }, []);

  /**
   * Helper: Get pending appointments
   */
  const pendingAppointments = appointments.filter(
    (app) => app.status === "pending"
  );

  /**
   * Helper: Get confirmed appointments
   */
  const confirmedAppointments = appointments.filter(
    (app) => app.status === "confirmed"
  );

  /**
   * Helper: Get today's appointments
   */
  const todayAppointments = appointments.filter((app) => {
    const today = new Date().toISOString().split("T")[0];
    // Extract date from test_date timestamp (YYYY-MM-DDTHH:MM:SS+00:00)
    const appointmentDate = app.test_date?.split("T")[0];
    return appointmentDate === today;
  });

  /**
   * Helper: Get appointments requiring attention (pending or urgent)
   */
  const appointmentsNeedingAttention = appointments.filter(
    (app) => app.status === "pending" || app.priority === "urgent"
  );

  // Initial load
  useEffect(() => {
    refreshAppointments();
  }, [refreshAppointments]);

  return {
    // Data
    appointments,
    pendingAppointments,
    confirmedAppointments,
    todayAppointments,
    appointmentsNeedingAttention,
    stats,

    // State
    loading,
    error,

    // Actions
    refreshAppointments,
    getByStatus,
    getByDateRange,
    create,
    update,
    updateStatus,
    confirm,
    cancel,
    complete,
    remove,
    bulkUpdate,
    checkAvailability,
    getUpcoming,
  };
};
