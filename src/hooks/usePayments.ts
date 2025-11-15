// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import * as paymentsService from "../services/payments";
import type {
  Payment,
  PaymentStats,
  PaymentStatus,
} from "../services/payments";

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties
  const completedPayments = payments.filter((p) => p.status === "completed");
  const pendingPayments = payments.filter((p) => p.status === "pending");
  const failedPayments = payments.filter((p) => p.status === "failed");
  const refundedPayments = payments.filter((p) => p.status === "refunded");
  const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = refundedPayments.reduce(
    (sum, p) => sum + (p.refund_amount || 0),
    0
  );

  // Fetch all payments
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("💳 FETCHING ALL PAYMENTS...");
      const data = await paymentsService.fetchAllPayments();
      console.log("💳 PAYMENTS LOADED:", {
        count: data.length,
        sample: data[0],
      });

      setPayments(data);
    } catch (err) {
      setError((err as Error).message);
      console.error("❌ Error fetching payments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const data = await paymentsService.getPaymentStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching payment stats:", err);
    }
  }, []);

  // Fetch payments by user
  const fetchPaymentsByUser = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentsService.fetchPaymentsByUser(userId);
      setPayments(data);
    } catch (err) {
      setError((err as Error).message);
      console.error("Error fetching user payments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch payments by company
  const fetchPaymentsByCompany = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentsService.fetchPaymentsByCompany(companyId);
      setPayments(data);
    } catch (err) {
      setError((err as Error).message);
      console.error("Error fetching company payments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create payment
  const createPayment = useCallback(
    async (paymentData: Partial<Payment>) => {
      try {
        setError(null);
        const newPayment = await paymentsService.createPayment(paymentData);
        setPayments((prev) => [newPayment, ...prev]);
        await fetchStats();
        return newPayment;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      }
    },
    [fetchStats]
  );

  // Update payment
  const updatePayment = useCallback(
    async (id: string, updates: Partial<Payment>) => {
      try {
        setError(null);
        const updated = await paymentsService.updatePayment(id, updates);
        setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
        await fetchStats();
        return updated;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      }
    },
    [fetchStats]
  );

  // Delete payment
  const deletePayment = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await paymentsService.deletePayment(id);
        setPayments((prev) => prev.filter((p) => p.id !== id));
        await fetchStats();
      } catch (err) {
        setError((err as Error).message);
        throw err;
      }
    },
    [fetchStats]
  );

  // Complete payment
  const completePayment = useCallback(
    async (id: string, transactionId: string) => {
      try {
        setError(null);
        const updated = await paymentsService.completePayment(
          id,
          transactionId
        );
        setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
        await fetchStats();
        return updated;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      }
    },
    [fetchStats]
  );

  // Fail payment
  const failPayment = useCallback(
    async (id: string, reason: string) => {
      try {
        setError(null);
        const updated = await paymentsService.failPayment(id, reason);
        setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
        await fetchStats();
        return updated;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      }
    },
    [fetchStats]
  );

  // Refund payment
  const refundPayment = useCallback(
    async (id: string, amount: number, reason: string) => {
      try {
        setError(null);
        const updated = await paymentsService.refundPayment(id, amount, reason);
        setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
        await fetchStats();
        return updated;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      }
    },
    [fetchStats]
  );

  // Generate invoice
  const generateInvoice = useCallback(async (id: string) => {
    try {
      setError(null);
      const updated = await paymentsService.generateInvoice(id);
      setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Search payments
  const searchPayments = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentsService.searchPayments(query);
      setPayments(data);
    } catch (err) {
      setError((err as Error).message);
      console.error("Error searching payments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Export payments to CSV
  const exportPayments = useCallback(async () => {
    try {
      setError(null);
      const blob = await paymentsService.exportPaymentsToCSV();
      return blob;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, [fetchPayments, fetchStats]);

  return {
    // State
    payments,
    stats,
    loading,
    error,

    // Computed
    completedPayments,
    pendingPayments,
    failedPayments,
    refundedPayments,
    totalRevenue,
    totalRefunded,

    // Methods
    fetchPayments,
    fetchStats,
    fetchPaymentsByUser,
    fetchPaymentsByCompany,
    createPayment,
    updatePayment,
    deletePayment,
    completePayment,
    failPayment,
    refundPayment,
    generateInvoice,
    searchPayments,
    exportPayments,
  };
}
