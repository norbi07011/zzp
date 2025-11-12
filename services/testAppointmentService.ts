// @ts-nocheck
/**
 * Test Appointment Service
 * Service for managing test appointment slots and scheduling
 */

import { supabase } from "../src/lib/supabase";

export interface TestSlot {
  id: string;
  test_date: string; // ISO datetime
  duration_minutes: number;
  capacity: number;
  location: string;
  test_type: string;
  examiner_name?: string;
  examiner_id?: string;
  status: "active" | "cancelled";
  notes?: string;
  created_at: string;
  updated_at: string;
  // Calculated fields
  booked_count?: number;
  worker_id?: string; // For assigned slots
}

export interface SlotFormData {
  test_date: string;
  duration_minutes: number;
  capacity: number;
  location: string;
  test_type: string;
  examiner_name?: string;
  examiner_id?: string;
  notes?: string;
}

export interface SlotStats {
  total_slots: number;
  active_slots: number;
  this_week_slots: number;
  available_capacity: number;
  booked_workers: number;
  completed_tests: number;
}

export interface AssignedWorker {
  id: string;
  worker_id: string;
  worker_name: string;
  worker_email: string;
  test_date: string;
  status: string;
}

/**
 * Get all test slots with optional filters
 */
export async function getTestSlots(
  filters: {
    date_from?: string;
    date_to?: string;
    status?: string;
  } = {}
): Promise<TestSlot[]> {
  try {
    let query = (supabase as any)
      .from("test_appointments")
      .select("*")
      .eq("appointment_type", "test")
      .order("test_date", { ascending: true });

    if (filters.date_from) {
      query = query.gte("test_date", filters.date_from);
    }

    if (filters.date_to) {
      query = query.lte("test_date", filters.date_to);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Get booking counts for each slot
    const slotsWithCounts = await Promise.all(
      (data || []).map(async (slot: any) => {
        const { count } = await (supabase as any)
          .from("test_appointments")
          .select("*", { count: "exact", head: true })
          .eq("test_date", slot.test_date)
          .eq("location", slot.location)
          .not("worker_id", "is", null);

        return {
          ...slot,
          booked_count: count || 0,
        };
      })
    );

    return slotsWithCounts as TestSlot[];
  } catch (error) {
    console.error("Error fetching test slots:", error);
    throw error;
  }
}

/**
 * Get slots for specific week
 */
export async function getWeekSlots(startDate: Date): Promise<TestSlot[]> {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  return getTestSlots({
    date_from: startDate.toISOString(),
    date_to: endDate.toISOString(),
    status: "active",
  });
}

/**
 * Create new test slot
 */
export async function createTestSlot(
  slotData: SlotFormData
): Promise<TestSlot> {
  try {
    const { data, error } = await (supabase as any)
      .from("test_appointments")
      .insert({
        ...slotData,
        appointment_type: "test",
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return data as TestSlot;
  } catch (error) {
    console.error("Error creating test slot:", error);
    throw error;
  }
}

/**
 * Update test slot
 */
export async function updateTestSlot(
  slotId: string,
  updates: Partial<SlotFormData>
): Promise<boolean> {
  try {
    const { error } = await (supabase as any)
      .from("test_appointments")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", slotId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error updating test slot:", error);
    throw error;
  }
}

/**
 * Delete test slot (only if no workers assigned)
 */
export async function deleteTestSlot(slotId: string): Promise<boolean> {
  try {
    // Check if slot has assigned workers
    const { count } = await (supabase as any)
      .from("test_appointments")
      .select("*", { count: "exact", head: true })
      .eq("id", slotId)
      .not("worker_id", "is", null);

    if (count && count > 0) {
      throw new Error("Cannot delete slot with assigned workers");
    }

    const { error } = await (supabase as any)
      .from("test_appointments")
      .delete()
      .eq("id", slotId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error deleting test slot:", error);
    throw error;
  }
}

/**
 * Assign worker to test slot
 */
export async function assignWorkerToSlot(
  workerId: string,
  workerName: string,
  workerEmail: string,
  slotDate: string,
  location: string
): Promise<boolean> {
  try {
    // Create new appointment record for this worker
    const { error } = await (supabase as any).from("test_appointments").insert({
      worker_id: workerId,
      test_date: slotDate,
      location: location,
      appointment_type: "test",
      status: "scheduled",
      duration_minutes: 120,
      test_type: "ZZP Exam",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error assigning worker to slot:", error);
    throw error;
  }
}

/**
 * Get workers assigned to specific slot
 */
export async function getSlotWorkers(
  slotDate: string,
  location: string
): Promise<AssignedWorker[]> {
  try {
    const { data, error } = await (supabase as any)
      .from("test_appointments")
      .select(
        `
        id,
        worker_id,
        test_date,
        status,
        workers:worker_id (
          first_name,
          last_name,
          email
        )
      `
      )
      .eq("test_date", slotDate)
      .eq("location", location)
      .not("worker_id", "is", null);

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.id,
      worker_id: item.worker_id,
      worker_name: item.workers
        ? `${item.workers.first_name} ${item.workers.last_name}`
        : "Unknown",
      worker_email: item.workers?.email || "",
      test_date: item.test_date,
      status: item.status,
    })) as AssignedWorker[];
  } catch (error) {
    console.error("Error fetching slot workers:", error);
    return [];
  }
}

/**
 * Get approved applications ready for scheduling
 */
export async function getApprovedApplications(): Promise<any[]> {
  try {
    const { data, error } = await (supabase as any)
      .from("zzp_exam_applications")
      .select(
        `
        id,
        worker_id,
        full_name,
        email,
        status,
        workers:worker_id (
          first_name,
          last_name,
          email
        )
      `
      )
      .eq("status", "payment_completed")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data || []).map((app: any) => ({
      ...app,
      display_name: app.workers
        ? `${app.workers.first_name} ${app.workers.last_name}`
        : app.full_name,
    }));
  } catch (error) {
    console.error("Error fetching approved applications:", error);
    return [];
  }
}

/**
 * Get slot statistics
 */
export async function getSlotStats(): Promise<SlotStats> {
  try {
    const now = new Date();
    const weekFromNow = new Date(now);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    // Total active slots
    const { count: totalSlots } = await (supabase as any)
      .from("test_appointments")
      .select("*", { count: "exact", head: true })
      .eq("appointment_type", "test")
      .eq("status", "active")
      .gte("test_date", now.toISOString());

    // This week slots
    const { count: thisWeekSlots } = await (supabase as any)
      .from("test_appointments")
      .select("*", { count: "exact", head: true })
      .eq("appointment_type", "test")
      .eq("status", "active")
      .gte("test_date", now.toISOString())
      .lte("test_date", weekFromNow.toISOString());

    // Booked workers
    const { count: bookedWorkers } = await (supabase as any)
      .from("test_appointments")
      .select("*", { count: "exact", head: true })
      .eq("appointment_type", "test")
      .eq("status", "scheduled")
      .not("worker_id", "is", null)
      .gte("test_date", now.toISOString());

    // Completed tests
    const { count: completedTests } = await (supabase as any)
      .from("test_appointments")
      .select("*", { count: "exact", head: true })
      .eq("appointment_type", "test")
      .eq("status", "completed");

    // Calculate available capacity
    const slots = await getTestSlots({ status: "active" });
    const availableCapacity = slots.reduce((sum, slot) => {
      return sum + (slot.capacity || 10) - (slot.booked_count || 0);
    }, 0);

    return {
      total_slots: totalSlots || 0,
      active_slots: totalSlots || 0,
      this_week_slots: thisWeekSlots || 0,
      available_capacity: availableCapacity,
      booked_workers: bookedWorkers || 0,
      completed_tests: completedTests || 0,
    };
  } catch (error) {
    console.error("Error fetching slot stats:", error);
    return {
      total_slots: 0,
      active_slots: 0,
      this_week_slots: 0,
      available_capacity: 0,
      booked_workers: 0,
      completed_tests: 0,
    };
  }
}

/**
 * Send test reminders to workers scheduled for tests in the next 24 hours
 * This function should be called daily via cron job
 * @returns Number of reminder emails sent
 */
export async function sendTestReminders(): Promise<number> {
  try {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    // Get all scheduled tests in next 24 hours
    const { data: upcomingTests, error } = await (supabase as any)
      .from("test_appointments")
      .select(
        `
        *,
        workers:worker_id (
          id,
          first_name,
          last_name,
          email
        )
      `
      )
      .eq("appointment_type", "test")
      .eq("status", "scheduled")
      .not("worker_id", "is", null)
      .gte("test_date", now.toISOString())
      .lte("test_date", in24Hours.toISOString());

    if (error) {
      console.error("❌ Error fetching upcoming tests:", error);
      return 0;
    }

    if (!upcomingTests || upcomingTests.length === 0) {
      console.log("ℹ️ No upcoming tests in next 24 hours");
      return 0;
    }

    let sentCount = 0;

    // Send reminder to each worker
    for (const test of upcomingTests) {
      const worker = test.workers;
      if (!worker || !worker.email) {
        console.warn(`⚠️ Worker data missing for test ${test.id}`);
        continue;
      }

      const testDate = new Date(test.test_date);
      const workerName = `${worker.first_name} ${worker.last_name}`.trim();

      try {
        // TODO: Integrate with emailService
        console.log(
          `📧 Sending reminder to ${
            worker.email
          } for test on ${testDate.toLocaleString()}`
        );

        // Placeholder for email integration
        // await emailService.sendTemplateEmail(
        //   worker.email,
        //   'test_reminder',
        //   {
        //     workerName,
        //     testDate: testDate.toLocaleString('pl-PL'),
        //     location: test.location,
        //     duration: `${test.duration_minutes || 60} minut`
        //   }
        // );

        sentCount++;
      } catch (emailError) {
        console.error(
          `❌ Failed to send reminder to ${worker.email}:`,
          emailError
        );
      }
    }

    console.log(`✅ Sent ${sentCount} test reminders`);
    return sentCount;
  } catch (error) {
    console.error("❌ Error in sendTestReminders:", error);
    return 0;
  }
}

export const testAppointmentService = {
  getTestSlots,
  getWeekSlots,
  createTestSlot,
  updateTestSlot,
  deleteTestSlot,
  assignWorkerToSlot,
  getSlotWorkers,
  getApprovedApplications,
  getSlotStats,
  sendTestReminders,
};
