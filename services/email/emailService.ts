/**
 * EMAIL SERVICE
 * Handles sending emails via Resend.com (best for Dutch market)
 * Supports templates, tracking, retries, and multi-language
 */

import type {
  EmailData,
  EmailJob,
  EmailJobStatus,
  EmailProvider,
  EmailServiceConfig,
  EmailTemplateType,
  EmailLanguage,
} from '../../types/email';
import { supabase } from '@/lib/supabase';

// Resend SDK would be imported here
// import { Resend } from 'resend';

class EmailService {
  private config: EmailServiceConfig;
  private provider: EmailProvider;

  constructor(config?: Partial<EmailServiceConfig>) {
    this.config = {
      provider: config?.provider || 'resend',
      apiKey: config?.apiKey || import.meta.env.VITE_RESEND_API_KEY || '',
      fromEmail: config?.fromEmail || 'noreply@zzpwerkplaats.nl',
      fromName: config?.fromName || 'ZZP Werkplaats',
      replyToEmail: config?.replyToEmail || 'support@zzpwerkplaats.nl',
      defaultLanguage: config?.defaultLanguage || 'nl',
      retryAttempts: config?.retryAttempts || 3,
      retryDelay: config?.retryDelay || 5000,
      webhookSecret: config?.webhookSecret,
    };
    this.provider = this.config.provider;
  }

  /**
   * Send email using configured provider
   */
  async sendEmail(emailData: EmailData): Promise<EmailJob> {
    // Create email job in database
    const emailJob = await this.createEmailJob(emailData);

    try {
      // Send via provider
      const providerId = await this.sendViaProvider(emailData);

      // Update job status
      await this.updateEmailJob(emailJob.id, {
        status: 'sent',
        providerId,
        sentAt: new Date(),
      });

      return {
        ...emailJob,
        status: 'sent',
        providerId,
        sentAt: new Date(),
      };
    } catch (error) {
      // Handle failure
      await this.handleEmailFailure(emailJob.id, error as Error);
      throw error;
    }
  }

  /**
   * Send templated email
   */
  async sendTemplateEmail(
    to: EmailData['to'],
    templateType: EmailTemplateType,
    variables: Record<string, string | number>,
    options?: {
      language?: EmailLanguage;
      attachments?: EmailData['attachments'];
      metadata?: EmailData['metadata'];
    }
  ): Promise<EmailJob> {
    // Get template
    const template = await this.getTemplate(
      templateType,
      options?.language || this.config.defaultLanguage
    );

    if (!template) {
      throw new Error(`Template not found: ${templateType}`);
    }

    // Replace variables in template
    const html = this.replaceVariables(template.htmlContent, variables);
    const text = this.replaceVariables(template.textContent, variables);
    const subject = this.replaceVariables(template.subject, variables);

    return this.sendEmail({
      to,
      subject,
      html,
      text,
      templateType,
      templateVariables: variables,
      attachments: options?.attachments,
      language: options?.language,
      metadata: options?.metadata,
    });
  }

  /**
   * Send via Resend.com
   */
  private async sendViaProvider(emailData: EmailData): Promise<string> {
    if (this.provider === 'resend') {
      return this.sendViaResend(emailData);
    }
    // Add other providers here (SendGrid, SES, etc.)
    throw new Error(`Provider not supported: ${this.provider}`);
  }

  /**
   * Send via Resend.com API
   */
  private async sendViaResend(emailData: EmailData): Promise<string> {
    const apiKey = this.config.apiKey;

    if (!apiKey) {
      throw new Error('Resend API key not configured');
    }

    // Prepare recipients
    const to = Array.isArray(emailData.to)
      ? emailData.to.map((addr) => addr.email)
      : emailData.to.email;

    const requestBody = {
      from: `${this.config.fromName} <${this.config.fromEmail}>`,
      to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      reply_to: this.config.replyToEmail,
      cc: emailData.cc?.map((addr) => addr.email),
      bcc: emailData.bcc?.map((addr) => addr.email),
      attachments: emailData.attachments,
      tags: emailData.metadata
        ? Object.entries(emailData.metadata).map(([key, value]) => ({
            name: key,
            value: String(value),
          }))
        : undefined,
    };

    // Make API call
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend API error: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    return data.id; // Resend email ID
  }

  /**
   * Create email job in database
   */
  private async createEmailJob(emailData: EmailData): Promise<EmailJob> {
    const emailJob: Partial<EmailJob> = {
      emailData,
      status: 'pending' as EmailJobStatus,
      provider: this.provider,
      attempts: 0,
      maxAttempts: this.config.retryAttempts,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const { data, error } = await supabase
      .from('email_jobs')
      .insert(emailJob as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create email job: ${error.message}`);
    }

    return data as EmailJob;
  }

  /**
   * Update email job status
   */
  private async updateEmailJob(
    id: string,
    updates: Partial<EmailJob>
  ): Promise<void> {
    const { error } = await supabase
      .from('email_jobs')
      .update({ ...updates, updatedAt: new Date() } as any)
      .eq('id', id);

    if (error) {
      console.error('Failed to update email job:', error);
    }
  }

  /**
   * Handle email failure with retry logic
   */
  private async handleEmailFailure(id: string, error: Error): Promise<void> {
    const { data: job } = await supabase
      .from('email_jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (!job) return;

    const jobData = job as any; // Type assertion
    const attempts = jobData.attempts + 1;
    const shouldRetry = attempts < jobData.maxAttempts;

    if (shouldRetry) {
      // Schedule retry
      await this.updateEmailJob(id, {
        status: 'pending',
        attempts,
        error: error.message,
        scheduledFor: new Date(Date.now() + this.config.retryDelay * attempts),
      } as any);
    } else {
      // Mark as failed
      await this.updateEmailJob(id, {
        status: 'failed',
        attempts,
        error: error.message,
      } as any);
    }
  }

  /**
   * Get email template
   */
  private async getTemplate(
    type: EmailTemplateType,
    language: EmailLanguage
  ) {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('type', type)
      .eq('language', language)
      .eq('isActive', true)
      .single();

    if (error) {
      console.error('Failed to get template:', error);
      return null;
    }

    return data as any; // Type assertion for Supabase
  }

  /**
   * Replace variables in template
   */
  private replaceVariables(
    content: string,
    variables: Record<string, string | number>
  ): string {
    let result = content;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value));
    }

    return result;
  }

  /**
   * Get email statistics
   */
  async getEmailStats(userId?: string, period?: { from: Date; to: Date }) {
    let query = supabase
      .from('email_jobs')
      .select('status, sentAt, deliveredAt, openedAt, clickedAt, bouncedAt');

    if (userId) {
      query = query.eq('userId', userId);
    }

    if (period) {
      query = query
        .gte('createdAt', period.from.toISOString())
        .lte('createdAt', period.to.toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get email stats: ${error.message}`);
    }

    const total = data.length;
    const sent = data.filter((job: any) => job.sentAt).length;
    const delivered = data.filter((job: any) => job.deliveredAt).length;
    const opened = data.filter((job: any) => job.openedAt).length;
    const clicked = data.filter((job: any) => job.clickedAt).length;
    const bounced = data.filter((job: any) => job.bouncedAt).length;
    const complained = data.filter((job: any) => job.complainedAt).length;

    return {
      totalSent: sent,
      totalDelivered: delivered,
      totalOpened: opened,
      totalClicked: clicked,
      totalBounced: bounced,
      totalComplaints: complained,
      deliveryRate: total > 0 ? (delivered / sent) * 100 : 0,
      openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
      clickRate: delivered > 0 ? (clicked / delivered) * 100 : 0,
      bounceRate: sent > 0 ? (bounced / sent) * 100 : 0,
      period: period || {
        from: new Date(0),
        to: new Date(),
      },
    };
  }

  /**
   * Process webhook from email provider
   */
  async handleWebhook(payload: any, signature?: string): Promise<void> {
    // Verify webhook signature
    if (this.config.webhookSecret && signature) {
      const isValid = await this.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }
    }

    // Process webhook based on provider
    if (this.provider === 'resend') {
      await this.handleResendWebhook(payload);
    }
  }

  /**
   * Handle Resend webhook events
   */
  private async handleResendWebhook(payload: any): Promise<void> {
    const { type, data } = payload;
    const emailId = data.email_id;

    // Find email job by provider ID
    const { data: job } = await supabase
      .from('email_jobs')
      .select('id')
      .eq('providerId', emailId)
      .single();

    if (!job) {
      console.warn(`Email job not found for provider ID: ${emailId}`);
      return;
    }

    const jobData = job as any; // Type assertion

    // Update job based on event type
    const updates: Partial<EmailJob> = {};

    switch (type) {
      case 'email.delivered':
        updates.status = 'delivered';
        updates.deliveredAt = new Date(data.created_at);
        break;
      case 'email.opened':
        updates.openedAt = new Date(data.created_at);
        if (updates.status !== 'clicked') {
          updates.status = 'opened';
        }
        break;
      case 'email.clicked':
        updates.status = 'clicked';
        updates.clickedAt = new Date(data.created_at);
        break;
      case 'email.bounced':
        updates.status = 'bounced';
        updates.bouncedAt = new Date(data.created_at);
        updates.error = data.bounce?.reason || 'Email bounced';
        break;
      case 'email.complained':
        updates.status = 'complained';
        updates.complainedAt = new Date(data.created_at);
        break;
    }

    await this.updateEmailJob(jobData.id, updates as any);

    // Create email event
    await supabase.from('email_events').insert({
      emailJobId: jobData.id,
      type: type.replace('email.', ''),
      timestamp: new Date(data.created_at),
      metadata: data,
    } as any);
  }

  /**
   * Verify webhook signature
   */
  private async verifyWebhookSignature(
    payload: any,
    signature: string
  ): Promise<boolean> {
    // Implementation depends on provider
    // For Resend, use their signature verification
    return true; // Placeholder
  }
}

// Export singleton instance
export const emailService = new EmailService();
