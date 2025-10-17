// @ts-nocheck
// Deno Edge Function - TypeScript checking disabled for Deno runtime
// Supabase Edge Function: Stripe Webhooks Handler
// Processes all Stripe webhook events (payments, subscriptions, refunds)
// Deploy: supabase functions deploy webhooks-stripe

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'stripe-signature, content-type',
      },
    });
  }

  try {
    // Verify webhook signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 });
    }

    const body = await req.text();
    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Webhook signature verification failed', { status: 400 });
    }

    console.log(`[Stripe Webhook] Event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// =============================================================================
// PAYMENT INTENT HANDLERS
// =============================================================================

async function handlePaymentSucceeded(paymentIntent) {
  const { id, amount, currency, metadata } = paymentIntent;

  const { error: updateError } = await supabase
    .from('payments')
    .update({
      status: 'succeeded',
      stripe_payment_intent_id: id,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', id);

  if (updateError) {
    console.error('[Payment Succeeded] Update error:', updateError);
    throw updateError;
  }

  if (metadata?.create_invoice === 'true') {
    await createInvoiceFromPayment(paymentIntent);
  }

  await sendPaymentConfirmationEmail(paymentIntent);

  await trackAnalyticsEvent({
    event_type: 'payment_succeeded',
    user_id: metadata?.user_id,
    metadata: {
      amount: amount / 100,
      currency,
      payment_intent_id: id,
    },
  });

  console.log(`[Payment Succeeded] ${id} - ${amount / 100} ${currency.toUpperCase()}`);
}

async function handlePaymentFailed(paymentIntent) {
  const { id, last_payment_error, metadata } = paymentIntent;

  const { error } = await supabase
    .from('payments')
    .update({
      status: 'failed',
      error_message: last_payment_error?.message || 'Payment failed',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', id);

  if (error) {
    console.error('[Payment Failed] Update error:', error);
  }

  await sendPaymentFailureEmail(paymentIntent);

  await trackAnalyticsEvent({
    event_type: 'payment_failed',
    user_id: metadata?.user_id,
    metadata: {
      payment_intent_id: id,
      error_message: last_payment_error?.message,
    },
  });

  console.log(`[Payment Failed] ${id} - ${last_payment_error?.message}`);
}

// =============================================================================
// INVOICE HANDLERS
// =============================================================================

async function handleInvoicePaid(invoice) {
  const { id, total, currency, subscription } = invoice;

  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', id);

  if (error) {
    console.error('[Invoice Paid] Update error:', error);
  }

  if (subscription) {
    await updateSubscriptionAfterPayment(subscription);
  }

  await sendInvoicePaidEmail(invoice);

  console.log(`[Invoice Paid] ${id} - ${total / 100} ${currency.toUpperCase()}`);
}

async function handleInvoicePaymentFailed(invoice) {
  const { id, subscription, attempt_count } = invoice;

  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'payment_failed',
      attempt_count,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_invoice_id', id);

  if (error) {
    console.error('[Invoice Payment Failed] Update error:', error);
  }

  if (subscription && attempt_count && attempt_count >= 3) {
    await suspendSubscription(subscription);
  }

  await sendInvoiceFailureEmail(invoice);

  console.log(`[Invoice Payment Failed] ${id} - Attempt ${attempt_count}`);
}

// =============================================================================
// SUBSCRIPTION HANDLERS
// =============================================================================

async function handleSubscriptionUpdated(subscription) {
  const { id, customer, status, current_period_end, items, cancel_at_period_end } = subscription;

  const plan = items.data[0]?.price.lookup_key || items.data[0]?.price.id;

  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      stripe_subscription_id: id,
      stripe_customer_id: customer,
      status,
      plan,
      current_period_end: new Date(current_period_end * 1000).toISOString(),
      cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'stripe_subscription_id',
    });

  if (error) {
    console.error('[Subscription Updated] Upsert error:', error);
  }

  if (status === 'active') {
    await sendSubscriptionActivatedEmail(subscription);
  } else if (status === 'past_due') {
    await sendSubscriptionPastDueEmail(subscription);
  }

  console.log(`[Subscription Updated] ${id} - Status: ${status}`);
}

async function handleSubscriptionDeleted(subscription) {
  const { id } = subscription;

  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', id);

  if (error) {
    console.error('[Subscription Deleted] Update error:', error);
  }

  await sendSubscriptionCancelledEmail(subscription);

  console.log(`[Subscription Deleted] ${id}`);
}

// =============================================================================
// REFUND HANDLER
// =============================================================================

async function handleChargeRefunded(charge) {
  const { id, amount_refunded, payment_intent } = charge;

  const { error } = await supabase
    .from('payments')
    .update({
      refunded: true,
      refund_amount: amount_refunded / 100,
      refunded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', payment_intent);

  if (error) {
    console.error('[Charge Refunded] Update error:', error);
  }

  await sendRefundConfirmationEmail(charge);

  console.log(`[Charge Refunded] ${id} - ${amount_refunded / 100}`);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function createInvoiceFromPayment(paymentIntent) {
  console.log('[Create Invoice] From payment:', paymentIntent.id);
}

async function updateSubscriptionAfterPayment(subscriptionId) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'active',
      last_payment_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('[Update Subscription] Error:', error);
  }
}

async function suspendSubscription(subscriptionId) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'suspended',
      suspended_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('[Suspend Subscription] Error:', error);
  }
}

async function sendPaymentConfirmationEmail(paymentIntent) {
  console.log('[Email] Payment confirmation:', paymentIntent.id);
}

async function sendPaymentFailureEmail(paymentIntent) {
  console.log('[Email] Payment failure:', paymentIntent.id);
}

async function sendInvoicePaidEmail(invoice) {
  console.log('[Email] Invoice paid:', invoice.id);
}

async function sendInvoiceFailureEmail(invoice) {
  console.log('[Email] Invoice failure:', invoice.id);
}

async function sendSubscriptionActivatedEmail(subscription) {
  console.log('[Email] Subscription activated:', subscription.id);
}

async function sendSubscriptionPastDueEmail(subscription) {
  console.log('[Email] Subscription past due:', subscription.id);
}

async function sendSubscriptionCancelledEmail(subscription) {
  console.log('[Email] Subscription cancelled:', subscription.id);
}

async function sendRefundConfirmationEmail(charge) {
  console.log('[Email] Refund confirmation:', charge.id);
}

async function trackAnalyticsEvent(event) {
  const { error } = await supabase.from('analytics_events').insert({
    event_type: event.event_type,
    user_id: event.user_id,
    metadata: event.metadata,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[Analytics] Track error:', error);
  }
}
