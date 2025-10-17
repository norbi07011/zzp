/**
 * SUPABASE EDGE FUNCTION: stripe-webhook
 * Handles Stripe webhook events for subscription lifecycle
 * 
 * DEPLOYMENT INSTRUCTIONS:
 * 1. Install Supabase CLI: npm install -g supabase
 * 2. Login: supabase login
 * 3. Link project: supabase link --project-ref your-project-ref
 * 4. Deploy: supabase functions deploy stripe-webhook
 * 5. Set secrets:
 *    supabase secrets set STRIPE_SECRET_KEY=sk_test_...
 *    supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
 *    supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJ...
 * 6. Get function URL: https://your-project.functions.supabase.co/stripe-webhook
 * 7. Add URL to Stripe Webhook Dashboard
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2024-12-18.acacia',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  try {
    const body = await req.text();
    
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('✅ Webhook verified:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('❌ Webhook error:', err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});

/**
 * Handle completed checkout session
 * Creates subscription record in database
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 Checkout completed:', session.id);

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  
  // Get worker ID from metadata
  const workerId = session.metadata?.userId;

  if (!workerId) {
    console.error('❌ No userId in session metadata');
    return;
  }

  // Update worker with Stripe customer ID
  const { error: updateError } = await supabase
    .from('workers')
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      subscription_tier: 'premium',
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', workerId);

  if (updateError) {
    console.error('❌ Error updating worker:', updateError);
    return;
  }

  console.log('✅ Worker updated with subscription:', workerId);

  // TODO: Send welcome email (FAZA 7)
  // await sendWelcomeEmail(workerId);
}

/**
 * Handle subscription update
 * Updates subscription status and tier
 */
async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  console.log('🔄 Subscription updated:', subscription.id);

  const customerId = subscription.customer as string;
  
  const status = subscription.status === 'active' ? 'active' : 
                 subscription.status === 'canceled' ? 'cancelled' : 
                 'inactive';

  const { error } = await supabase
    .from('workers')
    .update({
      subscription_status: status,
      subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('❌ Error updating subscription:', error);
    return;
  }

  console.log('✅ Subscription updated for customer:', customerId);
}

/**
 * Handle subscription cancellation
 * Downgrades to basic tier
 */
async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  console.log('❌ Subscription cancelled:', subscription.id);

  const customerId = subscription.customer as string;

  const { error } = await supabase
    .from('workers')
    .update({
      subscription_tier: 'basic',
      subscription_status: 'cancelled',
      stripe_subscription_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId);

  if (error) {
    console.error('❌ Error cancelling subscription:', error);
    return;
  }

  console.log('✅ Subscription cancelled for customer:', customerId);

  // TODO: Send cancellation confirmation email (FAZA 7)
}

/**
 * Handle successful payment
 * Records payment in database
 */
async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Payment succeeded:', invoice.id);

  const customerId = invoice.customer as string;

  // Get worker ID
  const { data: worker } = await supabase
    .from('workers')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!worker) {
    console.error('❌ Worker not found for customer:', customerId);
    return;
  }

  // Record payment
  const { error } = await supabase
    .from('subscription_payments')
    .insert({
      worker_id: worker.id,
      amount: (invoice.amount_paid / 100), // Convert cents to euros
      currency: invoice.currency.toUpperCase(),
      payment_method: 'card',
      status: 'completed',
      stripe_payment_intent_id: invoice.payment_intent as string,
      stripe_invoice_id: invoice.id,
      stripe_charge_id: invoice.charge as string,
      payment_date: new Date(invoice.created * 1000).toISOString(),
      period_start: new Date(invoice.period_start * 1000).toISOString().split('T')[0],
      period_end: new Date(invoice.period_end * 1000).toISOString().split('T')[0],
    });

  if (error) {
    console.error('❌ Error recording payment:', error);
    return;
  }

  console.log('✅ Payment recorded for worker:', worker.id);

  // TODO: Send payment receipt email (FAZA 7)
}

/**
 * Handle failed payment
 * Updates subscription status and sends alert
 */
async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('⚠️ Payment failed:', invoice.id);

  const customerId = invoice.customer as string;

  // Get worker
  const { data: worker } = await supabase
    .from('workers')
    .select('id, email')
    .eq('stripe_customer_id', customerId)
    .single();

  if (!worker) {
    console.error('❌ Worker not found for customer:', customerId);
    return;
  }

  // Record failed payment
  await supabase
    .from('subscription_payments')
    .insert({
      worker_id: worker.id,
      amount: (invoice.amount_due / 100),
      currency: invoice.currency.toUpperCase(),
      payment_method: 'card',
      status: 'failed',
      stripe_payment_intent_id: invoice.payment_intent as string,
      stripe_invoice_id: invoice.id,
      payment_date: new Date().toISOString(),
      period_start: new Date(invoice.period_start * 1000).toISOString().split('T')[0],
      period_end: new Date(invoice.period_end * 1000).toISOString().split('T')[0],
    });

  console.log('⚠️ Failed payment recorded for worker:', worker.id);

  // TODO: Send payment failed email (FAZA 7)
}
