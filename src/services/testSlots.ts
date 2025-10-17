// @ts-nocheck
/**
 * Test Slots Service - Supabase Integration
 * Manages test scheduling, slot availability, capacity tracking
 * 
 * Database Schema (test_slots table):
 * - id: uuid (primary key)
 * - date: date (slot date)
 * - time_start: time (start time)
 * - time_end: time (end time)
 * - capacity: integer (max workers per slot)
 * - booked_count: integer (current bookings)
 * - location: text (test location)
 * - test_type: text (driving, theory, medical, etc)
 * - status: enum (available, full, cancelled, completed)
 * - instructor_id: uuid (assigned instructor)
 * - price: numeric (slot price)
 * - notes: text
 * - is_recurring: boolean
 * - recurrence_pattern: text (daily, weekly, monthly)
 * - created_at, updated_at: timestamp
 */

import { supabase } from '@/lib/supabase';

export type SlotStatus = 'available' | 'full' | 'cancelled' | 'completed';
export type TestType = 'driving' | 'theory' | 'medical' | 'practical' | 'final';

export interface TestSlot {
  id: string;
  date: string;
  time_start: string;
  time_end: string;
  capacity: number;
  booked_count: number;
  location: string;
  test_type: TestType;
  status: SlotStatus;
  instructor_id?: string;
  price: number;
  notes?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  instructor?: {
    id: string;
    full_name: string;
    email: string;
  };
  bookings?: Array<{
    id: string;
    worker_name: string;
    booking_status: string;
  }>;
}

export interface SlotStats {
  total: number;
  available: number;
  full: number;
  cancelled: number;
  completed: number;
  totalCapacity: number;
  totalBooked: number;
  utilizationRate: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
}

// Fetch all test slots
export async function fetchAllTestSlots() {
  const { data, error } = await supabase
    .from('test_slots')
    .select(`
      *,
      instructor:instructor_id (
        id,
        full_name,
        email
      )
    `)
    .order('date', { ascending: true })
    .order('time_start', { ascending: true });

  if (error) throw error;
  return data as TestSlot[];
}

// Fetch slot by ID
export async function fetchSlotById(id: string) {
  const { data, error } = await supabase
    .from('test_slots')
    .select(`
      *,
      instructor:instructor_id (
        id,
        full_name,
        email
      ),
      bookings:slot_bookings (
        id,
        worker_name,
        booking_status
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as TestSlot;
}

// Fetch slots by date range
export async function fetchSlotsByDateRange(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('test_slots')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;
  return data as TestSlot[];
}

// Fetch available slots
export async function fetchAvailableSlots(testType?: TestType) {
  let query = supabase
    .from('test_slots')
    .select('*')
    .eq('status', 'available')
    .gte('date', new Date().toISOString().split('T')[0])
    .gt('capacity', supabase.rpc('booked_count'));

  if (testType) {
    query = query.eq('test_type', testType);
  }

  const { data, error } = await query.order('date', { ascending: true });

  if (error) throw error;
  return data as TestSlot[];
}

// Create new test slot
export async function createTestSlot(slotData: Partial<TestSlot>) {
  const { data, error } = await supabase
    .from('test_slots')
    .insert([{
      ...slotData,
      booked_count: 0,
      status: 'available'
    }])
    .select()
    .single();

  if (error) throw error;
  return data as TestSlot;
}

// Update test slot
export async function updateTestSlot(id: string, updates: Partial<TestSlot>) {
  const { data, error } = await supabase
    .from('test_slots')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TestSlot;
}

// Delete test slot
export async function deleteTestSlot(id: string) {
  const { error } = await supabase
    .from('test_slots')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

// Book a slot (increment booked_count)
export async function bookSlot(slotId: string, workerId: string) {
  // First check if slot is available
  const { data: slot, error: fetchError } = await supabase
    .from('test_slots')
    .select('capacity, booked_count')
    .eq('id', slotId)
    .single();

  if (fetchError) throw fetchError;
  if (slot.booked_count >= slot.capacity) throw new Error('Slot is full');

  // Increment booked_count
  const { data, error } = await supabase
    .from('test_slots')
    .update({ 
      booked_count: slot.booked_count + 1,
      status: slot.booked_count + 1 >= slot.capacity ? 'full' : 'available'
    })
    .eq('id', slotId)
    .select()
    .single();

  if (error) throw error;

  // Create booking record
  await supabase
    .from('slot_bookings')
    .insert([{
      slot_id: slotId,
      worker_id: workerId,
      booking_status: 'confirmed'
    }]);

  return data as TestSlot;
}

// Cancel booking (decrement booked_count)
export async function cancelBooking(slotId: string, bookingId: string) {
  const { data: slot, error: fetchError } = await supabase
    .from('test_slots')
    .select('booked_count')
    .eq('id', slotId)
    .single();

  if (fetchError) throw fetchError;

  const { data, error } = await supabase
    .from('test_slots')
    .update({ 
      booked_count: Math.max(0, slot.booked_count - 1),
      status: 'available'
    })
    .eq('id', slotId)
    .select()
    .single();

  if (error) throw error;

  // Delete booking record
  await supabase
    .from('slot_bookings')
    .delete()
    .eq('id', bookingId);

  return data as TestSlot;
}

// Bulk create slots (for recurring)
export async function bulkCreateSlots(slots: Partial<TestSlot>[]) {
  const { data, error } = await supabase
    .from('test_slots')
    .insert(slots.map(slot => ({
      ...slot,
      booked_count: 0,
      status: 'available'
    })))
    .select();

  if (error) throw error;
  return data as TestSlot[];
}

// Cancel slot
export async function cancelSlot(id: string, reason?: string) {
  const { data, error } = await supabase
    .from('test_slots')
    .update({ 
      status: 'cancelled',
      notes: reason ? `Cancelled: ${reason}` : 'Cancelled'
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TestSlot;
}

// Complete slot
export async function completeSlot(id: string) {
  const { data, error } = await supabase
    .from('test_slots')
    .update({ status: 'completed' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as TestSlot;
}

// Get slot statistics
export async function getSlotStats() {
  const { data: slots, error } = await supabase
    .from('test_slots')
    .select('*');

  if (error) throw error;

  const stats: SlotStats = {
    total: slots.length,
    available: slots.filter(s => s.status === 'available').length,
    full: slots.filter(s => s.status === 'full').length,
    cancelled: slots.filter(s => s.status === 'cancelled').length,
    completed: slots.filter(s => s.status === 'completed').length,
    totalCapacity: slots.reduce((sum, s) => sum + s.capacity, 0),
    totalBooked: slots.reduce((sum, s) => sum + s.booked_count, 0),
    utilizationRate: 0,
    revenueThisWeek: 0,
    revenueThisMonth: 0
  };

  stats.utilizationRate = stats.totalCapacity > 0 
    ? (stats.totalBooked / stats.totalCapacity) * 100 
    : 0;

  // Calculate revenue
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  stats.revenueThisWeek = slots
    .filter(s => new Date(s.date) >= weekAgo && s.status === 'completed')
    .reduce((sum, s) => sum + (s.price * s.booked_count), 0);

  stats.revenueThisMonth = slots
    .filter(s => new Date(s.date) >= monthAgo && s.status === 'completed')
    .reduce((sum, s) => sum + (s.price * s.booked_count), 0);

  return stats;
}

// Search slots
export async function searchSlots(query: string) {
  const { data, error } = await supabase
    .from('test_slots')
    .select('*')
    .or(`location.ilike.%${query}%,test_type.ilike.%${query}%,notes.ilike.%${query}%`)
    .order('date', { ascending: true });

  if (error) throw error;
  return data as TestSlot[];
}

// Get slots by instructor
export async function getSlotsByInstructor(instructorId: string) {
  const { data, error } = await supabase
    .from('test_slots')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('date', { ascending: true });

  if (error) throw error;
  return data as TestSlot[];
}

// Get utilization report
export async function getUtilizationReport(startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from('test_slots')
    .select('date, capacity, booked_count, status')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) throw error;

  return data.map(slot => ({
    date: slot.date,
    capacity: slot.capacity,
    booked: slot.booked_count,
    utilization: (slot.booked_count / slot.capacity) * 100,
    status: slot.status
  }));
}
