import { z } from 'zod';

// 🛡️ **EMPLOYER REGISTRATION VALIDATION SCHEMA**
// Complete input validation with Dutch business rules

export const employerRegistrationSchema = z.object({
  // STEP 1: Company Information
  companyName: z
    .string()
    .min(2, 'Bedrijfsnaam moet minimaal 2 tekens bevatten')
    .max(100, 'Bedrijfsnaam mag maximaal 100 tekens bevatten')
    .regex(/^[a-zA-Z0-9\s\-\.\&]+$/, 'Bedrijfsnaam bevat ongeldige tekens')
    .transform(name => name.trim()),

  vatNumber: z
    .string()
    .regex(/^NL\d{9}B\d{2}$/, 'BTW-nummer moet format NL123456789B01 hebben')
    .refine(vat => {
      // Dutch VAT number validation algorithm
      const digits = vat.substring(2, 11);
      const checksum = digits
        .split('')
        .reduce((sum, digit, index) => sum + parseInt(digit) * (9 - index), 0);
      return checksum % 11 !== 1;
    }, 'Ongeldig BTW-nummer'),

  // STEP 2: Contact Information  
  contactPerson: z
    .string()
    .min(2, 'Contactpersoon moet minimaal 2 tekens bevatten')
    .max(50, 'Contactpersoon mag maximaal 50 tekens bevatten')
    .regex(/^[a-zA-ZÀ-ÿ\s\-\.]+$/, 'Naam mag alleen letters, spaties en - bevatten')
    .transform(name => name.trim()),

  email: z
    .string()
    .email('Ongeldig e-mailadres')
    .max(100, 'E-mailadres mag maximaal 100 tekens bevatten')
    .toLowerCase()
    .refine(email => !email.includes('+'), 'Plus-adressen zijn niet toegestaan'),

  phone: z
    .string()
    .regex(/^(\+31|0)[1-9]\d{8}$/, 'Ongeldig Nederlands telefoonnummer')
    .transform(phone => phone.replace(/\s/g, '')), // Remove spaces

  // STEP 3: Account Security
  password: z
    .string()
    .min(8, 'Wachtwoord moet minimaal 8 tekens bevatten')
    .max(128, 'Wachtwoord mag maximaal 128 tekens bevatten')
    .regex(/[a-z]/, 'Wachtwoord moet een kleine letter bevatten')
    .regex(/[A-Z]/, 'Wachtwoord moet een hoofdletter bevatten')
    .regex(/[0-9]/, 'Wachtwoord moet een cijfer bevatten')
    .regex(/[^a-zA-Z0-9]/, 'Wachtwoord moet een speciaal teken bevatten'),

  confirmPassword: z.string(),

  agreedToTerms: z
    .boolean()
    .refine(agreed => agreed === true, 'U moet akkoord gaan met de voorwaarden'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Wachtwoorden komen niet overeen',
  path: ['confirmPassword'],
});

// 🔍 **INDIVIDUAL STEP SCHEMAS** 
export const step1Schema = employerRegistrationSchema.pick({
  companyName: true,
  vatNumber: true,
});

export const step2Schema = employerRegistrationSchema.pick({
  contactPerson: true,
  email: true,
  phone: true,
});

export const step3Schema = employerRegistrationSchema.pick({
  password: true,
  confirmPassword: true,
  agreedToTerms: true,
}).refine(data => data.password === data.confirmPassword, {
  message: 'Wachtwoorden komen niet overeen',
  path: ['confirmPassword'],
});

// 📱 **TYPES**
export type EmployerRegistrationData = z.infer<typeof employerRegistrationSchema>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;

// 🛠️ **VALIDATION HELPERS**
export const validateStep = (step: number, data: any) => {
  try {
    switch (step) {
      case 1:
        step1Schema.parse(data);
        return { success: true, errors: {} };
      case 2:
        step2Schema.parse(data);
        return { success: true, errors: {} };
      case 3:
        step3Schema.parse(data);
        return { success: true, errors: {} };
      default:
        return { success: false, errors: { general: 'Invalid step' } };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err: any) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation error' } };
  }
};

export const validateFull = (data: any) => {
  try {
    employerRegistrationSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err: any) => {
        if (err.path.length > 0) {
          errors[err.path[0] as string] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation error' } };
  }
};