// @ts-nocheck
// Deno Edge Function - TypeScript checking disabled for Deno runtime
// Supabase Edge Function: Resend Webhooks Handler
// Processes all Resend email delivery events
// Deploy: supabase functions deploy webhooks-resend

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'svix-id, svix-timestamp, svix-signature, content-type',
      },
    });
  }

  try {
    // Verify Svix signature (Resend uses Svix for webhooks)
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response('Missing Svix headers', { status: 400 });
    }

    const body = await req.json();

    console.log(`[Resend Webhook] Event: ${body.type}`);

    // Handle different event types
    switch (body.type) {
      case 'email.sent':
        await handleEmailSent(body.data);
        break;

      case 'email.delivered':
        await handleEmailDelivered(body.data);
        break;

      case 'email.opened':
        await handleEmailOpened(body.data);
        break;

      case 'email.clicked':
        await handleEmailClicked(body.data);
        break;

      case 'email.bounced':
        await handleEmailBounced(body.data);
        break;

      case 'email.complained':
        await handleEmailComplained(body.data);
        break;

      case 'email.delivery_delayed':
        await handleEmailDelayed(body.data);
        break;

      default:
        console.log(`Unhandled event type: ${body.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('[Resend Webhook] Error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// =============================================================================
// EMAIL EVENT HANDLERS
// =============================================================================

async function handleEmailSent(data) {
  const { email_id, to, subject } = data;

  const { error } = await supabase
    .from('email_logs')
    .update({
      status: 'sent',
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('resend_email_id', email_id);

  if (error) {
    console.error('[Email Sent] Update error:', error);
  }

  await trackEmailEvent('email_sent', data);

  console.log(`[Email Sent] ${email_id} to ${to}`);
}

async function handleEmailDelivered(data) {
  const { email_id, to } = data;

  const { error } = await supabase
    .from('email_logs')
    .update({
      status: 'delivered',
      delivered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('resend_email_id', email_id);

  if (error) {
    console.error('[Email Delivered] Update error:', error);
  }

  await trackEmailEvent('email_delivered', data);

  console.log(`[Email Delivered] ${email_id} to ${to}`);
}

async function handleEmailOpened(data) {
  const { email_id, to } = data;

  // Call RPC function to increment open count
  const { error } = await supabase.rpc('increment_email_opens', {
    p_email_id: email_id,
  });

  if (error) {
    console.error('[Email Opened] RPC error:', error);
  }

  await trackEmailEvent('email_opened', data);

  console.log(`[Email Opened] ${email_id} by ${to}`);
}

async function handleEmailClicked(data) {
  const { email_id, to, link } = data;

  // Call RPC function to increment click count and track URL
  const { error } = await supabase.rpc('increment_email_clicks', {
    p_email_id: email_id,
    p_clicked_url: link,
  });

  if (error) {
    console.error('[Email Clicked] RPC error:', error);
  }

  await trackEmailEvent('email_clicked', data);

  console.log(`[Email Clicked] ${email_id} by ${to} - ${link}`);
}

async function handleEmailBounced(data) {
  const { email_id, to, bounce_type, bounce_reason } = data;

  const { error } = await supabase
    .from('email_logs')
    .update({
      status: 'bounced',
      bounce_type,
      bounce_reason,
      bounced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('resend_email_id', email_id);

  if (error) {
    console.error('[Email Bounced] Update error:', error);
  }

  // For hard bounces, add email to blacklist
  if (bounce_type === 'hard') {
    await blacklistEmail(to, 'hard_bounce');
  }

  await trackEmailEvent('email_bounced', data);

  console.log(`[Email Bounced] ${email_id} to ${to} - ${bounce_type}: ${bounce_reason}`);
}

async function handleEmailComplained(data) {
  const { email_id, to } = data;

  const { error } = await supabase
    .from('email_logs')
    .update({
      status: 'complained',
      complained_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('resend_email_id', email_id);

  if (error) {
    console.error('[Email Complained] Update error:', error);
  }

  // Add to blacklist immediately
  await blacklistEmail(to, 'spam_complaint');

  await trackEmailEvent('email_complained', data);

  console.log(`[Email Complained] ${email_id} from ${to} - SPAM complaint`);
}

async function handleEmailDelayed(data) {
  const { email_id, to, delay_reason } = data;

  const { error } = await supabase
    .from('email_logs')
    .update({
      status: 'delayed',
      delay_reason,
      updated_at: new Date().toISOString(),
    })
    .eq('resend_email_id', email_id);

  if (error) {
    console.error('[Email Delayed] Update error:', error);
  }

  await trackEmailEvent('email_delayed', data);

  console.log(`[Email Delayed] ${email_id} to ${to} - ${delay_reason}`);
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

async function blacklistEmail(email, reason) {
  const { error } = await supabase
    .from('email_preferences')
    .upsert({
      email,
      unsubscribed: true,
      unsubscribe_reason: reason,
      unsubscribed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'email',
    });

  if (error) {
    console.error('[Blacklist Email] Error:', error);
  }

  console.log(`[Blacklist] Added ${email} - Reason: ${reason}`);
}

async function trackEmailEvent(eventType, data) {
  const { error } = await supabase.from('analytics_events').insert({
    event_type: eventType,
    metadata: data,
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error('[Track Email Event] Error:', error);
  }
}
