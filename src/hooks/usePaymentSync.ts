// =====================================================
// PAYMENT SYNC HOOK - Auto-sync payments to unified table
// =====================================================
// Po każdej płatności (Stripe, trial, manual) automatycznie
// dodaje rekord do tabeli payments dla statystyk i raportów

import { supabase } from "@/lib/supabase";

export interface PaymentSyncData {
  user_id: string;
  profile_id: string;
  payment_type:
    | "worker_subscription"
    | "employer_subscription"
    | "worker_earning"
    | "invoice_payment";
  amount: number;
  currency?: string;
  status: "completed" | "pending" | "failed";
  payment_method?:
    | "stripe_card"
    | "stripe_ideal"
    | "stripe_sepa"
    | "bank_transfer"
    | "trial";
  description?: string;
  stripe_payment_intent_id?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  related_job_id?: string;
  related_invoice_id?: string;
  payment_date?: string;
}

export const usePaymentSync = () => {
  /**
   * Synchronizuj płatność do tabeli payments
   * Wywołaj po każdej udanej płatności
   */
  const syncPayment = async (
    data: PaymentSyncData
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log("💳 SYNC PAYMENT:", data);

      // @ts-ignore - payments table exists in DB but not in generated types
      const { data: payment, error } = await supabase
        // @ts-ignore
        .from("payments")
        .insert({
          user_id: data.user_id,
          profile_id: data.profile_id,
          payment_type: data.payment_type,
          amount: data.amount,
          currency: data.currency || "EUR",
          status: data.status,
          payment_method: data.payment_method,
          description: data.description,
          stripe_payment_intent_id: data.stripe_payment_intent_id,
          stripe_customer_id: data.stripe_customer_id,
          stripe_subscription_id: data.stripe_subscription_id,
          related_job_id: data.related_job_id,
          related_invoice_id: data.related_invoice_id,
          payment_date: data.payment_date || new Date().toISOString(),
          completed_at:
            data.status === "completed" ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Payment sync error:", error);
        return { success: false, error: error.message };
      }

      console.log("✅ Payment synced to payments table:", payment);
      return { success: true };
    } catch (err) {
      console.error("❌ Payment sync exception:", err);
      return { success: false, error: String(err) };
    }
  };

  /**
   * Worker subscription payment
   */
  const syncWorkerSubscription = async (
    userId: string,
    tier: "basic" | "pro" | "premium",
    stripeData?: {
      customerId?: string;
      subscriptionId?: string;
      paymentIntentId?: string;
    }
  ) => {
    const amount = tier === "premium" ? 25 : tier === "pro" ? 19 : 13;

    return syncPayment({
      user_id: userId,
      profile_id: userId,
      payment_type: "worker_subscription",
      amount,
      currency: "EUR",
      status: "completed",
      payment_method: stripeData ? "stripe_card" : "trial",
      description: `Worker Subscription - ${tier} plan`,
      stripe_customer_id: stripeData?.customerId,
      stripe_subscription_id: stripeData?.subscriptionId,
      stripe_payment_intent_id: stripeData?.paymentIntentId,
    });
  };

  /**
   * Employer subscription payment
   */
  const syncEmployerSubscription = async (
    userId: string,
    tier: "basic" | "pro" | "premium",
    companyName?: string,
    stripeData?: {
      customerId?: string;
      subscriptionId?: string;
      paymentIntentId?: string;
    }
  ) => {
    const amount = tier === "premium" ? 149 : tier === "pro" ? 99 : 49;

    return syncPayment({
      user_id: userId,
      profile_id: userId,
      payment_type: "employer_subscription",
      amount,
      currency: "EUR",
      status: "completed",
      payment_method: stripeData ? "stripe_card" : "trial",
      description: companyName
        ? `Employer Subscription - ${companyName} (${tier})`
        : `Employer Subscription - ${tier} plan`,
      stripe_customer_id: stripeData?.customerId,
      stripe_subscription_id: stripeData?.subscriptionId,
      stripe_payment_intent_id: stripeData?.paymentIntentId,
    });
  };

  /**
   * Cleaning Company subscription payment
   */
  const syncCleaningSubscription = async (
    userId: string,
    tier: "basic" | "pro" | "premium",
    companyName?: string,
    stripeData?: {
      customerId?: string;
      subscriptionId?: string;
      paymentIntentId?: string;
    }
  ) => {
    const amount = tier === "premium" ? 149 : tier === "pro" ? 99 : 49;

    return syncPayment({
      user_id: userId,
      profile_id: userId,
      payment_type: "employer_subscription", // Używamy employer_subscription dla cleaning companies
      amount,
      currency: "EUR",
      status: "completed",
      payment_method: stripeData ? "stripe_card" : "trial",
      description: companyName
        ? `Cleaning Company Subscription - ${companyName} (${tier})`
        : `Cleaning Company Subscription - ${tier} plan`,
      stripe_customer_id: stripeData?.customerId,
      stripe_subscription_id: stripeData?.subscriptionId,
      stripe_payment_intent_id: stripeData?.paymentIntentId,
    });
  };

  /**
   * Accountant subscription payment
   */
  const syncAccountantSubscription = async (
    userId: string,
    tier: "basic" | "pro" | "premium",
    companyName?: string,
    stripeData?: {
      customerId?: string;
      subscriptionId?: string;
      paymentIntentId?: string;
    }
  ) => {
    const amount = tier === "premium" ? 129 : tier === "pro" ? 79 : 29;

    return syncPayment({
      user_id: userId,
      profile_id: userId,
      payment_type: "employer_subscription", // Używamy employer_subscription dla accountants
      amount,
      currency: "EUR",
      status: "completed",
      payment_method: stripeData ? "stripe_card" : "trial",
      description: companyName
        ? `Accountant Subscription - ${companyName} (${tier})`
        : `Accountant Subscription - ${tier} plan`,
      stripe_customer_id: stripeData?.customerId,
      stripe_subscription_id: stripeData?.subscriptionId,
      stripe_payment_intent_id: stripeData?.paymentIntentId,
    });
  };

  /**
   * Invoice payment
   */
  const syncInvoicePayment = async (
    userId: string,
    invoiceId: string,
    amount: number,
    invoiceNumber: string,
    paymentMethod: "bank_transfer" | "stripe_card" = "bank_transfer"
  ) => {
    return syncPayment({
      user_id: userId,
      profile_id: userId,
      payment_type: "invoice_payment",
      amount,
      currency: "EUR",
      status: "completed",
      payment_method: paymentMethod,
      description: `Invoice Payment - ${invoiceNumber}`,
      related_invoice_id: invoiceId,
    });
  };

  /**
   * Worker earning payment
   */
  const syncWorkerEarning = async (
    userId: string,
    jobId: string,
    amount: number,
    description?: string
  ) => {
    return syncPayment({
      user_id: userId,
      profile_id: userId,
      payment_type: "worker_earning",
      amount,
      currency: "EUR",
      status: "pending", // Earnings start as pending
      payment_method: "stripe_card",
      description: description || `Worker Earning - Job Payment`,
      related_job_id: jobId,
    });
  };

  return {
    syncPayment,
    syncWorkerSubscription,
    syncEmployerSubscription,
    syncCleaningSubscription,
    syncAccountantSubscription,
    syncInvoicePayment,
    syncWorkerEarning,
  };
};

export default usePaymentSync;
