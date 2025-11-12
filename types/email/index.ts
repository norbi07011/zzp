/**
 * EMAIL SYSTEM TYPES
 * Complete TypeScript types for email functionality
 * Supports transactional emails, templates, tracking
 */

export type EmailProvider = "resend" | "sendgrid" | "ses" | "smtp";

export type EmailLanguage = "nl" | "en" | "pl";

export type EmailTemplateType =
  | "welcome"
  | "email_verification"
  | "password_reset"
  | "invoice"
  | "payment_success"
  | "payment_failed"
  | "subscription_activated"
  | "subscription_cancelled"
  | "subscription_expiring"
  | "worker_application"
  | "worker_hired"
  | "worker_rejected"
  | "appointment_booked"
  | "appointment_reminder"
  | "appointment_cancelled"
  | "certificate_expiring"
  | "certificate_expired"
  | "message_received"
  | "review_request"
  | "platform_update"
  | "security_alert"
  | "zzp_application_approved"
  | "zzp_application_rejected"
  | "zzp_test_scheduled"
  | "zzp_test_reminder"
  | "zzp_certificate_issued";

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface EmailAttachment {
  filename: string;
  content: string; // Base64 encoded
  contentType: string;
  size?: number;
}

export interface EmailTemplate {
  id: string;
  type: EmailTemplateType;
  language: EmailLanguage;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[]; // List of variables used in template
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface EmailData {
  to: EmailAddress | EmailAddress[];
  from?: EmailAddress;
  replyTo?: EmailAddress;
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  html?: string;
  text?: string;
  templateType?: EmailTemplateType;
  templateVariables?: Record<string, string | number>;
  attachments?: EmailAttachment[];
  language?: EmailLanguage;
  metadata?: Record<string, unknown>;
}

export interface EmailJob {
  id: string;
  userId?: string;
  companyId?: string;
  workerId?: string;
  emailData: EmailData;
  status: EmailJobStatus;
  provider: EmailProvider;
  providerId?: string; // ID from email provider (Resend, etc.)
  attempts: number;
  maxAttempts: number;
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  bouncedAt?: Date;
  complainedAt?: Date;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EmailJobStatus =
  | "pending"
  | "scheduled"
  | "sending"
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "complained"
  | "failed";

export interface EmailEvent {
  id: string;
  emailJobId: string;
  type: EmailEventType;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  location?: string;
}

export type EmailEventType =
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "complained"
  | "unsubscribed";

export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalComplaints: number;
  deliveryRate: number; // percentage
  openRate: number; // percentage
  clickRate: number; // percentage
  bounceRate: number; // percentage
  period: {
    from: Date;
    to: Date;
  };
}

export interface EmailPreferences {
  userId: string;
  marketing: boolean;
  transactional: boolean; // Always true (required emails)
  productUpdates: boolean;
  newsletter: boolean;
  weeklyDigest: boolean;
  appointmentReminders: boolean;
  messageNotifications: boolean;
  preferredLanguage: EmailLanguage;
  unsubscribedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Template variable helpers
export interface WelcomeEmailVariables {
  userName: string;
  userEmail: string;
  verificationLink: string;
  supportEmail: string;
}

export interface InvoiceEmailVariables {
  invoiceNumber: string;
  companyName: string;
  amount: string;
  dueDate: string;
  downloadLink: string;
  paymentLink?: string;
}

export interface PasswordResetVariables {
  userName: string;
  resetLink: string;
  expiresIn: string; // e.g., "24 uur"
}

export interface PaymentSuccessVariables {
  userName: string;
  amount: string;
  transactionId: string;
  receiptLink: string;
}

export interface AppointmentReminderVariables {
  workerName: string;
  companyName: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  rescheduleLink: string;
  cancelLink: string;
}

export interface ZZPApplicationApprovedVariables {
  workerName: string;
  specializations: string;
  nextSteps: string;
  [key: string]: string | number;
}

export interface ZZPApplicationRejectedVariables {
  workerName: string;
  rejectionReason: string;
  supportEmail: string;
  [key: string]: string | number;
}

export interface ZZPTestScheduledVariables {
  workerName: string;
  testDate: string;
  testTime: string;
  location: string;
  duration: string;
  examiner: string;
  [key: string]: string | number;
}

export interface ZZPTestReminderVariables {
  workerName: string;
  testDate: string;
  testTime: string;
  location: string;
  hoursUntilTest: string;
  [key: string]: string | number;
}

export interface ZZPCertificateIssuedVariables {
  workerName: string;
  certificateNumber: string;
  issueDate: string;
  specializations: string;
  downloadLink: string;
  [key: string]: string | number;
}

// Email service configuration
export interface EmailServiceConfig {
  provider: EmailProvider;
  apiKey: string;
  apiSecret?: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  webhookSecret?: string;
  defaultLanguage: EmailLanguage;
  retryAttempts: number;
  retryDelay: number; // milliseconds
}

// Batch email sending
export interface BatchEmailJob {
  id: string;
  name: string;
  templateType: EmailTemplateType;
  recipients: EmailAddress[];
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  status: "pending" | "processing" | "completed" | "failed";
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}
