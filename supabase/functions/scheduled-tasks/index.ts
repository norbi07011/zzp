// @ts-nocheck
// Deno Edge Function - TypeScript checking disabled for Deno runtime
// Supabase Edge Function: Scheduled Tasks (Cron Jobs)
// Runs automated background tasks on a schedule
// Deploy: supabase functions deploy scheduled-tasks
// Configure: Supabase Dashboard → Edge Functions → scheduled-tasks → Add cron schedule

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { Resend } from 'https://esm.sh/resend@2.0.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

serve(async (req) => {
  try {
    // Verify cron secret (security)
    const authHeader = req.headers.get('authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const url = new URL(req.url);
    const task = url.searchParams.get('task');

    console.log(`[Scheduled Tasks] Running task: ${task}`);

    let result;
    switch (task) {
      case 'cleanup-notifications':
        result = await cleanupExpiredNotifications();
        break;

      case 'cleanup-files':
        result = await cleanupExpiredFiles();
        break;

      case 'send-email-digests':
        result = await sendEmailDigests();
        break;

      case 'update-daily-metrics':
        result = await updateDailyBusinessMetrics();
        break;

      case 'check-subscription-renewals':
        result = await checkSubscriptionRenewals();
        break;

      case 'send-appointment-reminders':
        result = await sendAppointmentReminders();
        break;

      case 'archive-old-data':
        result = await archiveOldData();
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown task' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
    }

    return new Response(
      JSON.stringify({ success: true, task, result }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[Scheduled Tasks] Error:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

// =============================================================================
// TASK 1: CLEANUP EXPIRED NOTIFICATIONS (Daily at 2 AM)
// =============================================================================

async function cleanupExpiredNotifications() {
  const { data, error } = await supabase.rpc('cleanup_expired_notifications');

  if (error) {
    console.error('[Cleanup Notifications] Error:', error);
    throw error;
  }

  console.log(`[Cleanup Notifications] Deleted ${data} notifications`);
  return { deleted: data };
}

// =============================================================================
// TASK 2: CLEANUP EXPIRED FILES (Daily at 3 AM)
// =============================================================================

async function cleanupExpiredFiles() {
  const { data, error } = await supabase.rpc('cleanup_expired_files');

  if (error) {
    console.error('[Cleanup Files] Error:', error);
    throw error;
  }

  console.log(`[Cleanup Files] Deleted ${data} files`);
  return { deleted: data };
}

// =============================================================================
// TASK 3: SEND EMAIL DIGESTS (Daily at 8 AM)
// =============================================================================

async function sendEmailDigests() {
  // Get users with digest enabled
  const { data: users, error: usersError } = await supabase
    .from('notification_preferences')
    .select('user_id, email, digest_frequency')
    .eq('digest_enabled', true);

  if (usersError) {
    console.error('[Send Digests] Error fetching users:', usersError);
    throw usersError;
  }

  let sentCount = 0;

  for (const user of users) {
    // Get unread notifications for user
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.user_id)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (notifError || !notifications || notifications.length === 0) {
      continue;
    }

    // Send digest email
    try {
      await resend.emails.send({
        from: 'ZZP Werkplaats <noreply@zzpwerkplaats.nl>',
        to: user.email,
        subject: `📬 Je hebt ${notifications.length} nieuwe notificaties`,
        html: generateDigestEmailHTML(notifications),
      });

      sentCount++;
    } catch (emailError) {
      console.error('[Send Digests] Email error:', emailError);
    }
  }

  console.log(`[Send Digests] Sent ${sentCount} digests`);
  return { sent: sentCount };
}

// =============================================================================
// TASK 4: UPDATE DAILY BUSINESS METRICS (Daily at 1 AM)
// =============================================================================

async function updateDailyBusinessMetrics() {
  const { data, error } = await supabase.rpc('calculate_daily_business_metrics');

  if (error) {
    console.error('[Update Metrics] Error:', error);
    throw error;
  }

  console.log('[Update Metrics] Daily metrics calculated');
  return { success: true, data };
}

// =============================================================================
// TASK 5: CHECK SUBSCRIPTION RENEWALS (Daily at 6 AM)
// =============================================================================

async function checkSubscriptionRenewals() {
  // Find subscriptions expiring in 7 days
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const { data: expiring, error } = await supabase
    .from('subscriptions')
    .select('*, profiles(email, full_name)')
    .eq('status', 'active')
    .lte('current_period_end', sevenDaysFromNow.toISOString())
    .is('renewal_reminder_sent', false);

  if (error) {
    console.error('[Check Renewals] Error:', error);
    throw error;
  }

  let sentCount = 0;

  for (const sub of expiring) {
    try {
      await resend.emails.send({
        from: 'ZZP Werkplaats <noreply@zzpwerkplaats.nl>',
        to: sub.profiles.email,
        subject: '⏰ Je abonnement wordt binnenkort verlengd',
        html: `
          <h2>Hallo ${sub.profiles.full_name},</h2>
          <p>Je ${sub.plan} abonnement wordt over 7 dagen automatisch verlengd.</p>
          <p>Geen actie vereist - alles gaat automatisch.</p>
        `,
      });

      // Mark reminder as sent
      await supabase
        .from('subscriptions')
        .update({ renewal_reminder_sent: true })
        .eq('id', sub.id);

      sentCount++;
    } catch (emailError) {
      console.error('[Check Renewals] Email error:', emailError);
    }
  }

  console.log(`[Check Renewals] Sent ${sentCount} renewal reminders`);
  return { sent: sentCount };
}

// =============================================================================
// TASK 6: SEND APPOINTMENT REMINDERS (Every hour)
// =============================================================================

async function sendAppointmentReminders() {
  // Find appointments in next 24 hours that haven't sent reminder
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*, worker:worker_id(email, full_name), client:client_id(email, full_name)')
    .eq('status', 'confirmed')
    .gte('start_time', now.toISOString())
    .lte('start_time', tomorrow.toISOString())
    .is('reminder_sent_at', null)
    .eq('reminder_email', true);

  if (error) {
    console.error('[Send Reminders] Error:', error);
    throw error;
  }

  let sentCount = 0;

  for (const apt of appointments) {
    try {
      // Send to both worker and client
      await resend.emails.send({
        from: 'ZZP Werkplaats <noreply@zzpwerkplaats.nl>',
        to: [apt.worker.email, apt.client.email],
        subject: `🔔 Herinnering: Afspraak over ${Math.round((new Date(apt.start_time) - now) / (1000 * 60 * 60))} uur`,
        html: `
          <h2>Herinnering voor je afspraak</h2>
          <p><strong>Datum:</strong> ${new Date(apt.start_time).toLocaleString('nl-NL')}</p>
          <p><strong>Locatie:</strong> ${apt.location || 'Online'}</p>
          <p><strong>Notities:</strong> ${apt.notes || 'Geen'}</p>
        `,
      });

      // Mark reminder as sent
      await supabase
        .from('appointments')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', apt.id);

      sentCount++;
    } catch (emailError) {
      console.error('[Send Reminders] Email error:', emailError);
    }
  }

  console.log(`[Send Reminders] Sent ${sentCount} appointment reminders`);
  return { sent: sentCount };
}

// =============================================================================
// TASK 7: ARCHIVE OLD DATA (Weekly - Sunday at 4 AM)
// =============================================================================

async function archiveOldData() {
  // Archive jobs older than 1 year that are completed
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const { data, error } = await supabase
    .from('jobs')
    .update({ archived: true })
    .eq('status', 'completed')
    .lt('completed_at', oneYearAgo.toISOString())
    .eq('archived', false);

  if (error) {
    console.error('[Archive Data] Error:', error);
    throw error;
  }

  console.log(`[Archive Data] Archived old jobs`);
  return { archived: data?.length || 0 };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateDigestEmailHTML(notifications) {
  const notifList = notifications
    .map(
      (n) => `
    <li style="margin-bottom: 10px;">
      <strong>${n.title}</strong><br>
      <small>${n.body}</small><br>
      <small style="color: #666;">${new Date(n.created_at).toLocaleString('nl-NL')}</small>
    </li>
  `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Notificaties Digest</title>
      </head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #1e40af;">📬 Je Notificaties</h1>
        <p>Je hebt ${notifications.length} nieuwe notificaties:</p>
        <ul style="list-style: none; padding: 0;">
          ${notifList}
        </ul>
        <hr>
        <p style="color: #666; font-size: 12px;">
          ZZP Werkplaats - De Nederlandse Freelance Marketplace
        </p>
      </body>
    </html>
  `;
}
