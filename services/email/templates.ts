/**
 * EMAIL HTML TEMPLATES
 * Professional, responsive email templates for ZZP Werkplaats
 * Dutch market focused with multi-language support
 */

import type { EmailLanguage } from '../../types/email';

/**
 * Base HTML template with branding
 */
export const getBaseTemplate = (content: string, language: EmailLanguage = 'nl') => {
  const translations = {
    nl: {
      footer: 'Met vriendelijke groet',
      team: 'Het ZZP Werkplaats Team',
      unsubscribe: 'Afmelden',
      privacy: 'Privacybeleid',
      contact: 'Contact',
      copyright: '© 2025 ZZP Werkplaats. Alle rechten voorbehouden.',
    },
    en: {
      footer: 'Best regards',
      team: 'The ZZP Werkplaats Team',
      unsubscribe: 'Unsubscribe',
      privacy: 'Privacy Policy',
      contact: 'Contact',
      copyright: '© 2025 ZZP Werkplaats. All rights reserved.',
    },
    pl: {
      footer: 'Z poważaniem',
      team: 'Zespół ZZP Werkplaats',
      unsubscribe: 'Wypisz się',
      privacy: 'Polityka prywatności',
      contact: 'Kontakt',
      copyright: '© 2025 ZZP Werkplaats. Wszelkie prawa zastrzeżone.',
    },
  };

  const t = translations[language];

  return `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ZZP Werkplaats</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
      padding: 30px 20px;
      text-align: center;
    }
    .logo {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      text-decoration: none;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
      color: #ffffff;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    .footer-links {
      margin: 15px 0;
    }
    .footer-links a {
      color: #9333ea;
      text-decoration: none;
      margin: 0 10px;
      font-size: 14px;
    }
    .footer-text {
      color: #6b7280;
      font-size: 12px;
      margin-top: 15px;
    }
    .alert {
      padding: 16px;
      border-radius: 8px;
      margin: 20px 0;
    }
    .alert-info {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      color: #1e40af;
    }
    .alert-success {
      background-color: #f0fdf4;
      border-left: 4px solid #22c55e;
      color: #166534;
    }
    .alert-warning {
      background-color: #fffbeb;
      border-left: 4px solid #f59e0b;
      color: #92400e;
    }
    .text-muted {
      color: #6b7280;
      font-size: 14px;
    }
    h1 {
      color: #111827;
      font-size: 24px;
      margin-bottom: 20px;
    }
    h2 {
      color: #374151;
      font-size: 20px;
      margin: 25px 0 15px;
    }
    p {
      margin-bottom: 15px;
    }
    .divider {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="https://zzpwerkplaats.nl" class="logo">
        ZZP Werkplaats
      </a>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>${t.footer},<br><strong>${t.team}</strong></p>
      <div class="footer-links">
        <a href="https://zzpwerkplaats.nl/unsubscribe">${t.unsubscribe}</a>
        <a href="https://zzpwerkplaats.nl/privacy">${t.privacy}</a>
        <a href="https://zzpwerkplaats.nl/contact">${t.contact}</a>
      </div>
      <p class="footer-text">${t.copyright}</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Welcome Email Template
 */
export const welcomeTemplate = (language: EmailLanguage = 'nl') => {
  const content = {
    nl: {
      subject: 'Welkom bij ZZP Werkplaats! 🎉',
      greeting: 'Hallo {{ userName }},',
      intro: 'Welkom bij ZZP Werkplaats - het platform dat werkgevers en gekwalificeerde zzp\'ers verbindt!',
      nextSteps: 'Volgende stappen:',
      step1: 'Verifieer je e-mailadres',
      step2: 'Maak je profiel compleet',
      step3: 'Begin met zoeken naar opdrachten of medewerkers',
      cta: 'Verifieer E-mailadres',
      help: 'Heb je vragen? Neem gerust contact met ons op via {{ supportEmail }}',
    },
    en: {
      subject: 'Welcome to ZZP Werkplaats! 🎉',
      greeting: 'Hello {{ userName }},',
      intro: 'Welcome to ZZP Werkplaats - the platform connecting employers with qualified freelancers!',
      nextSteps: 'Next steps:',
      step1: 'Verify your email address',
      step2: 'Complete your profile',
      step3: 'Start searching for projects or workers',
      cta: 'Verify Email Address',
      help: 'Questions? Feel free to contact us at {{ supportEmail }}',
    },
    pl: {
      subject: 'Witamy w ZZP Werkplaats! 🎉',
      greeting: 'Cześć {{ userName }},',
      intro: 'Witamy w ZZP Werkplaats - platformie łączącej pracodawców z wykwalifikowanymi freelancerami!',
      nextSteps: 'Następne kroki:',
      step1: 'Zweryfikuj swój adres e-mail',
      step2: 'Uzupełnij swój profil',
      step3: 'Zacznij szukać projektów lub pracowników',
      cta: 'Zweryfikuj E-mail',
      help: 'Pytania? Skontaktuj się z nami pod adresem {{ supportEmail }}',
    },
  };

  const t = content[language];

  return {
    subject: t.subject,
    html: getBaseTemplate(`
      <h1>${t.greeting}</h1>
      <p>${t.intro}</p>
      <div class="alert alert-info">
        <strong>${t.nextSteps}</strong>
        <ol>
          <li>${t.step1}</li>
          <li>${t.step2}</li>
          <li>${t.step3}</li>
        </ol>
      </div>
      <a href="{{ verificationLink }}" class="button">${t.cta}</a>
      <hr class="divider">
      <p class="text-muted">${t.help}</p>
    `, language),
    text: `
${t.greeting}

${t.intro}

${t.nextSteps}
1. ${t.step1}
2. ${t.step2}
3. ${t.step3}

${t.cta}: {{ verificationLink }}

${t.help}
    `,
    variables: ['userName', 'verificationLink', 'supportEmail'],
  };
};

/**
 * Password Reset Template
 */
export const passwordResetTemplate = (language: EmailLanguage = 'nl') => {
  const content = {
    nl: {
      subject: 'Wachtwoord resetten - ZZP Werkplaats',
      greeting: 'Hallo {{ userName }},',
      intro: 'Je hebt een verzoek ingediend om je wachtwoord te resetten.',
      instruction: 'Klik op de knop hieronder om een nieuw wachtwoord in te stellen. Deze link is {{ expiresIn }} geldig.',
      cta: 'Wachtwoord Resetten',
      ignore: 'Als je dit verzoek niet hebt ingediend, kun je deze e-mail negeren.',
      warning: 'Deel deze link nooit met anderen!',
    },
    en: {
      subject: 'Reset Password - ZZP Werkplaats',
      greeting: 'Hello {{ userName }},',
      intro: 'You have requested to reset your password.',
      instruction: 'Click the button below to set a new password. This link is valid for {{ expiresIn }}.',
      cta: 'Reset Password',
      ignore: 'If you did not request this, you can safely ignore this email.',
      warning: 'Never share this link with others!',
    },
    pl: {
      subject: 'Resetowanie hasła - ZZP Werkplaats',
      greeting: 'Cześć {{ userName }},',
      intro: 'Poprosiłeś o zresetowanie hasła.',
      instruction: 'Kliknij przycisk poniżej, aby ustawić nowe hasło. Ten link jest ważny przez {{ expiresIn }}.',
      cta: 'Resetuj Hasło',
      ignore: 'Jeśli nie wysyłałeś tego żądania, możesz zignorować tę wiadomość.',
      warning: 'Nigdy nie udostępniaj tego linku innym!',
    },
  };

  const t = content[language];

  return {
    subject: t.subject,
    html: getBaseTemplate(`
      <h1>${t.greeting}</h1>
      <p>${t.intro}</p>
      <p>${t.instruction}</p>
      <a href="{{ resetLink }}" class="button">${t.cta}</a>
      <div class="alert alert-warning">
        <strong>⚠️ ${t.warning}</strong>
      </div>
      <p class="text-muted">${t.ignore}</p>
    `, language),
    text: `
${t.greeting}

${t.intro}

${t.instruction}

${t.cta}: {{ resetLink }}

⚠️ ${t.warning}

${t.ignore}
    `,
    variables: ['userName', 'resetLink', 'expiresIn'],
  };
};

/**
 * Invoice Email Template
 */
export const invoiceTemplate = (language: EmailLanguage = 'nl') => {
  const content = {
    nl: {
      subject: 'Nieuwe factuur {{ invoiceNumber }} - ZZP Werkplaats',
      greeting: 'Beste {{ companyName }},',
      intro: 'Bedankt voor uw vertrouwen in ZZP Werkplaats!',
      details: 'Hierbij ontvangt u factuur <strong>{{ invoiceNumber }}</strong>:',
      amount: 'Bedrag',
      dueDate: 'Vervaldatum',
      cta: 'Download Factuur',
      payment: 'Betaal Nu',
      footer: 'De factuur is ook beschikbaar in uw dashboard.',
    },
    en: {
      subject: 'New invoice {{ invoiceNumber }} - ZZP Werkplaats',
      greeting: 'Dear {{ companyName }},',
      intro: 'Thank you for your trust in ZZP Werkplaats!',
      details: 'Please find invoice <strong>{{ invoiceNumber }}</strong>:',
      amount: 'Amount',
      dueDate: 'Due Date',
      cta: 'Download Invoice',
      payment: 'Pay Now',
      footer: 'The invoice is also available in your dashboard.',
    },
    pl: {
      subject: 'Nowa faktura {{ invoiceNumber }} - ZZP Werkplaats',
      greeting: 'Szanowni {{ companyName }},',
      intro: 'Dziękujemy za zaufanie do ZZP Werkplaats!',
      details: 'Przesyłamy fakturę <strong>{{ invoiceNumber }}</strong>:',
      amount: 'Kwota',
      dueDate: 'Termin płatności',
      cta: 'Pobierz Fakturę',
      payment: 'Zapłać Teraz',
      footer: 'Faktura jest również dostępna w Twoim panelu.',
    },
  };

  const t = content[language];

  return {
    subject: t.subject,
    html: getBaseTemplate(`
      <h1>${t.greeting}</h1>
      <p>${t.intro}</p>
      <p>${t.details}</p>
      <div class="alert alert-info">
        <p><strong>${t.amount}:</strong> € {{ amount }}</p>
        <p><strong>${t.dueDate}:</strong> {{ dueDate }}</p>
      </div>
      <a href="{{ downloadLink }}" class="button">${t.cta}</a>
      {{#if paymentLink}}
        <a href="{{ paymentLink }}" class="button">${t.payment}</a>
      {{/if}}
      <hr class="divider">
      <p class="text-muted">${t.footer}</p>
    `, language),
    text: `
${t.greeting}

${t.intro}

${t.details}

${t.amount}: € {{ amount }}
${t.dueDate}: {{ dueDate }}

${t.cta}: {{ downloadLink }}
${t.payment}: {{ paymentLink }}

${t.footer}
    `,
    variables: ['companyName', 'invoiceNumber', 'amount', 'dueDate', 'downloadLink', 'paymentLink'],
  };
};

/**
 * Payment Success Template
 */
export const paymentSuccessTemplate = (language: EmailLanguage = 'nl') => {
  const content = {
    nl: {
      subject: '✅ Betaling ontvangen - ZZP Werkplaats',
      greeting: 'Hallo {{ userName }},',
      intro: 'We hebben je betaling succesvol ontvangen!',
      details: 'Betalingsdetails:',
      amount: 'Bedrag',
      transaction: 'Transactie ID',
      cta: 'Bekijk Ontvangstbewijs',
      thanks: 'Bedankt voor je betaling!',
    },
    en: {
      subject: '✅ Payment received - ZZP Werkplaats',
      greeting: 'Hello {{ userName }},',
      intro: 'We have successfully received your payment!',
      details: 'Payment details:',
      amount: 'Amount',
      transaction: 'Transaction ID',
      cta: 'View Receipt',
      thanks: 'Thank you for your payment!',
    },
    pl: {
      subject: '✅ Płatność otrzymana - ZZP Werkplaats',
      greeting: 'Cześć {{ userName }},',
      intro: 'Pomyślnie otrzymaliśmy Twoją płatność!',
      details: 'Szczegóły płatności:',
      amount: 'Kwota',
      transaction: 'ID transakcji',
      cta: 'Zobacz Pokwitowanie',
      thanks: 'Dziękujemy za płatność!',
    },
  };

  const t = content[language];

  return {
    subject: t.subject,
    html: getBaseTemplate(`
      <h1>${t.greeting}</h1>
      <div class="alert alert-success">
        <p><strong>✅ ${t.intro}</strong></p>
      </div>
      <p>${t.details}</p>
      <p><strong>${t.amount}:</strong> € {{ amount }}</p>
      <p><strong>${t.transaction}:</strong> {{ transactionId }}</p>
      <a href="{{ receiptLink }}" class="button">${t.cta}</a>
      <p>${t.thanks}</p>
    `, language),
    text: `
${t.greeting}

✅ ${t.intro}

${t.details}
${t.amount}: € {{ amount }}
${t.transaction}: {{ transactionId }}

${t.cta}: {{ receiptLink }}

${t.thanks}
    `,
    variables: ['userName', 'amount', 'transactionId', 'receiptLink'],
  };
};

/**
 * Appointment Reminder Template
 */
export const appointmentReminderTemplate = (language: EmailLanguage = 'nl') => {
  const content = {
    nl: {
      subject: '📅 Herinnering: Afspraak morgen - ZZP Werkplaats',
      greeting: 'Hallo {{ workerName }},',
      intro: 'Dit is een herinnering voor je afspraak morgen!',
      details: 'Afspraakdetails:',
      company: 'Bedrijf',
      date: 'Datum',
      time: 'Tijd',
      location: 'Locatie',
      actions: 'Acties:',
      reschedule: 'Verzetten',
      cancel: 'Annuleren',
    },
    en: {
      subject: '📅 Reminder: Appointment tomorrow - ZZP Werkplaats',
      greeting: 'Hello {{ workerName }},',
      intro: 'This is a reminder for your appointment tomorrow!',
      details: 'Appointment details:',
      company: 'Company',
      date: 'Date',
      time: 'Time',
      location: 'Location',
      actions: 'Actions:',
      reschedule: 'Reschedule',
      cancel: 'Cancel',
    },
    pl: {
      subject: '📅 Przypomnienie: Spotkanie jutro - ZZP Werkplaats',
      greeting: 'Cześć {{ workerName }},',
      intro: 'To przypomnienie o Twoim spotkaniu jutro!',
      details: 'Szczegóły spotkania:',
      company: 'Firma',
      date: 'Data',
      time: 'Godzina',
      location: 'Lokalizacja',
      actions: 'Akcje:',
      reschedule: 'Przełóż',
      cancel: 'Anuluj',
    },
  };

  const t = content[language];

  return {
    subject: t.subject,
    html: getBaseTemplate(`
      <h1>${t.greeting}</h1>
      <p><strong>📅 ${t.intro}</strong></p>
      <div class="alert alert-info">
        <p><strong>${t.details}</strong></p>
        <p><strong>${t.company}:</strong> {{ companyName }}</p>
        <p><strong>${t.date}:</strong> {{ appointmentDate }}</p>
        <p><strong>${t.time}:</strong> {{ appointmentTime }}</p>
        <p><strong>${t.location}:</strong> {{ location }}</p>
      </div>
      <p><strong>${t.actions}</strong></p>
      <a href="{{ rescheduleLink }}" class="button">${t.reschedule}</a>
      <a href="{{ cancelLink }}" class="button" style="background: #ef4444;">${t.cancel}</a>
    `, language),
    text: `
${t.greeting}

📅 ${t.intro}

${t.details}
${t.company}: {{ companyName }}
${t.date}: {{ appointmentDate }}
${t.time}: {{ appointmentTime }}
${t.location}: {{ location }}

${t.actions}
${t.reschedule}: {{ rescheduleLink }}
${t.cancel}: {{ cancelLink }}
    `,
    variables: ['workerName', 'companyName', 'appointmentDate', 'appointmentTime', 'location', 'rescheduleLink', 'cancelLink'],
  };
};

// Export all templates
export const emailTemplates = {
  welcome: welcomeTemplate,
  password_reset: passwordResetTemplate,
  invoice: invoiceTemplate,
  payment_success: paymentSuccessTemplate,
  appointment_reminder: appointmentReminderTemplate,
};
