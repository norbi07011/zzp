/**
 * ZZP EXAM EMAIL NOTIFICATIONS
 * Helper functions for sending ZZP exam-related emails
 * Integrates with emailService.ts
 *
 * @version 1.0.0
 * @date December 2024
 */

import { emailService } from "./emailService";
import type {
  ZZPApplicationApprovedVariables,
  ZZPApplicationRejectedVariables,
  ZZPTestScheduledVariables,
  ZZPTestReminderVariables,
  ZZPCertificateIssuedVariables,
} from "../../types/email";

/**
 * Send approval email to worker after their ZZP exam application is approved
 */
export async function sendZZPApplicationApprovalEmail(
  workerEmail: string,
  workerName: string,
  specializations: string[]
): Promise<boolean> {
  try {
    const variables: ZZPApplicationApprovedVariables = {
      workerName,
      specializations: specializations.join(", "),
      nextSteps:
        "Oczekuj na przypisanie do terminu egzaminu. Otrzymasz email z potwierdzeniem.",
    };

    await emailService.sendTemplateEmail(
      { email: workerEmail, name: workerName },
      "zzp_application_approved",
      variables,
      { language: "pl" }
    );

    console.log(`✅ Approval email sent to ${workerEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send approval email to ${workerEmail}:`, error);
    return false;
  }
}

/**
 * Send rejection email to worker after their ZZP exam application is rejected
 */
export async function sendZZPApplicationRejectionEmail(
  workerEmail: string,
  workerName: string,
  rejectionReason: string
): Promise<boolean> {
  try {
    const variables: ZZPApplicationRejectedVariables = {
      workerName,
      rejectionReason,
      supportEmail: "support@zzpwerkplaats.nl",
    };

    await emailService.sendTemplateEmail(
      { email: workerEmail, name: workerName },
      "zzp_application_rejected",
      variables,
      { language: "pl" }
    );

    console.log(`✅ Rejection email sent to ${workerEmail}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Failed to send rejection email to ${workerEmail}:`,
      error
    );
    return false;
  }
}

/**
 * Send test scheduled email when worker is assigned to a test slot
 */
export async function sendZZPTestScheduledEmail(
  workerEmail: string,
  workerName: string,
  testDate: Date,
  location: string,
  duration: number = 60,
  examinerName?: string
): Promise<boolean> {
  try {
    const variables: ZZPTestScheduledVariables = {
      workerName,
      testDate: testDate.toLocaleDateString("pl-PL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      testTime: testDate.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      location,
      duration: `${duration} minut`,
      examiner: examinerName || "Egzaminator zostanie przypisany",
    };

    await emailService.sendTemplateEmail(
      { email: workerEmail, name: workerName },
      "zzp_test_scheduled",
      variables,
      { language: "pl" }
    );

    console.log(`✅ Test scheduled email sent to ${workerEmail}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Failed to send test scheduled email to ${workerEmail}:`,
      error
    );
    return false;
  }
}

/**
 * Send test reminder email 24 hours before scheduled test
 */
export async function sendZZPTestReminderEmail(
  workerEmail: string,
  workerName: string,
  testDate: Date,
  location: string
): Promise<boolean> {
  try {
    const now = new Date();
    const hoursUntilTest = Math.round(
      (testDate.getTime() - now.getTime()) / (1000 * 60 * 60)
    );

    const variables: ZZPTestReminderVariables = {
      workerName,
      testDate: testDate.toLocaleDateString("pl-PL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      testTime: testDate.toLocaleTimeString("pl-PL", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      location,
      hoursUntilTest: `${hoursUntilTest} godzin`,
    };

    await emailService.sendTemplateEmail(
      { email: workerEmail, name: workerName },
      "zzp_test_reminder",
      variables,
      { language: "pl" }
    );

    console.log(`✅ Test reminder email sent to ${workerEmail}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Failed to send test reminder email to ${workerEmail}:`,
      error
    );
    return false;
  }
}

/**
 * Send certificate issued email with download link
 */
export async function sendZZPCertificateIssuedEmail(
  workerEmail: string,
  workerName: string,
  certificateNumber: string,
  specializations: string[],
  pdfDownloadUrl: string
): Promise<boolean> {
  try {
    const variables: ZZPCertificateIssuedVariables = {
      workerName,
      certificateNumber,
      issueDate: new Date().toLocaleDateString("pl-PL", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      specializations: specializations.join(", "),
      downloadLink: pdfDownloadUrl,
    };

    await emailService.sendTemplateEmail(
      { email: workerEmail, name: workerName },
      "zzp_certificate_issued",
      variables,
      { language: "pl" }
    );

    console.log(`✅ Certificate issued email sent to ${workerEmail}`);
    return true;
  } catch (error) {
    console.error(
      `❌ Failed to send certificate issued email to ${workerEmail}:`,
      error
    );
    return false;
  }
}

/**
 * Exported helper object for easy imports
 */
export const zzpEmailNotifications = {
  sendApplicationApproval: sendZZPApplicationApprovalEmail,
  sendApplicationRejection: sendZZPApplicationRejectionEmail,
  sendTestScheduled: sendZZPTestScheduledEmail,
  sendTestReminder: sendZZPTestReminderEmail,
  sendCertificateIssued: sendZZPCertificateIssuedEmail,
};
