// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import * as testSlotsService from '../services/testSlots';
import type { TestSlot, SlotStats, SlotStatus } from '../services/testSlots';

export function useTestSlots() {
  const [slots, setSlots] = useState<TestSlot[]>([]);
  const [stats, setStats] = useState<SlotStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties
  const availableSlots = slots.filter(s => s.status === 'available');
  const bookedSlots = slots.filter(s => s.status === 'booked');
  const completedSlots = slots.filter(s => s.status === 'completed');
  const cancelledSlots = slots.filter(s => s.status === 'cancelled');
  const upcomingSlots = slots.filter(s => {
    const slotDate = new Date(s.date);
    return slotDate > new Date() && s.status !== 'cancelled';
  });

  // Fetch all slots
  const fetchSlots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await testSlotsService.fetchAllTestSlots();
      setSlots(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching test slots:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await testSlotsService.getSlotStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching slot stats:', err);
    }
  }, []);

  // Fetch slots by date range
  const fetchSlotsByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await testSlotsService.fetchSlotsByDateRange(startDate, endDate);
      setSlots(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error fetching slots by date range:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create slot
  const createSlot = useCallback(async (slotData: Partial<TestSlot>) => {
    try {
      setError(null);
      const newSlot = await testSlotsService.createTestSlot(slotData);
      setSlots(prev => [newSlot, ...prev]);
      await fetchStats();
      return newSlot;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Update slot
  const updateSlot = useCallback(async (id: string, updates: Partial<TestSlot>) => {
    try {
      setError(null);
      const updated = await testSlotsService.updateTestSlot(id, updates);
      setSlots(prev => prev.map(s => s.id === id ? updated : s));
      await fetchStats();
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Delete slot
  const deleteSlot = useCallback(async (id: string) => {
    try {
      setError(null);
      await testSlotsService.deleteTestSlot(id);
      setSlots(prev => prev.filter(s => s.id !== id));
      await fetchStats();
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Book slot
  const bookSlot = useCallback(async (slotId: string, userId: string) => {
    try {
      setError(null);
      const updated = await testSlotsService.bookSlot(slotId, userId);
      setSlots(prev => prev.map(s => s.id === slotId ? updated : s));
      await fetchStats();
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Cancel booking
  const cancelBooking = useCallback(async (slotId: string) => {
    try {
      setError(null);
      const updated = await testSlotsService.cancelBooking(slotId);
      setSlots(prev => prev.map(s => s.id === slotId ? updated : s));
      await fetchStats();
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Complete slot
  const completeSlot = useCallback(async (slotId: string) => {
    try {
      setError(null);
      const updated = await testSlotsService.completeSlot(slotId);
      setSlots(prev => prev.map(s => s.id === slotId ? updated : s));
      await fetchStats();
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Bulk create slots
  const bulkCreateSlots = useCallback(async (slotsData: Partial<TestSlot>[]) => {
    try {
      setError(null);
      const newSlots = await testSlotsService.bulkCreateSlots(slotsData);
      setSlots(prev => [...newSlots, ...prev]);
      await fetchStats();
      return newSlots;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, [fetchStats]);

  // Search slots
  const searchSlots = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await testSlotsService.searchSlots(query);
      setSlots(data);
    } catch (err) {
      setError((err as Error).message);
      console.error('Error searching slots:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSlots();
    fetchStats();
  }, [fetchSlots, fetchStats]);

  return {
    // State
    slots,
    stats,
    loading,
    error,

    // Computed
    availableSlots,
    bookedSlots,
    completedSlots,
    cancelledSlots,
    upcomingSlots,

    // Methods
    fetchSlots,
    fetchStats,
    fetchSlotsByDateRange,
    createSlot,
    updateSlot,
    deleteSlot,
    bookSlot,
    cancelBooking,
    completeSlot,
    bulkCreateSlots,
    searchSlots,
  };
}
