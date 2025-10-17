import { z } from 'zod';

// 🛡️ **APPOINTMENT VALIDATION SCHEMAS**
// Complete input validation for appointment management

export const appointmentSchema = z.object({
  // Basic Information
  title: z
    .string()
    .min(5, 'Titel moet minimaal 5 tekens bevatten')
    .max(100, 'Titel mag maximaal 100 tekens bevatten')
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-\.\,\!\?]+$/, 'Titel bevat ongeldige tekens'),

  description: z
    .string()
    .min(20, 'Beschrijving moet minimaal 20 tekens bevatten')
    .max(2000, 'Beschrijving mag maximaal 2000 tekens bevatten'),

  // Timing
  startDate: z
    .string()
    .refine(date => {
      const selected = new Date(date);
      const now = new Date();
      return selected > now;
    }, 'Startdatum moet in de toekomst liggen'),

  endDate: z
    .string()
    .refine(date => {
      const selected = new Date(date);
      const now = new Date();
      return selected > now;
    }, 'Einddatum moet in de toekomst liggen'),

  // Work Details
  workType: z.enum(['maintenance', 'construction', 'installation', 'repair', 'inspection', 'other']),

  urgency: z.enum(['low', 'medium', 'high', 'urgent']),

  estimatedHours: z
    .number()
    .min(0.5, 'Geschatte uren moet minimaal 0.5 uur zijn')
    .max(168, 'Geschatte uren mag maximaal 168 uur (1 week) zijn'),

  maxHourlyRate: z
    .number()
    .min(10, 'Maximaal uurtarief moet minimaal €10 zijn')
    .max(500, 'Maximaal uurtarief mag maximaal €500 zijn'),

  // Location
  location: z.object({
    address: z
      .string()
      .min(5, 'Adres moet minimaal 5 tekens bevatten')
      .max(100, 'Adres mag maximaal 100 tekens bevatten'),

    zipCode: z
      .string()
      .regex(/^\d{4}\s?[a-zA-Z]{2}$/, 'Ongeldig Nederlandse postcode (bijv. 1234 AB)')
      .transform(zip => zip.replace(/\s/g, '').toUpperCase()),

    city: z
      .string()
      .min(2, 'Plaats moet minimaal 2 tekens bevatten')
      .max(50, 'Plaats mag maximaal 50 tekens bevatten'),
  }),

  // Requirements
  requiredSkills: z
    .array(z.string())
    .min(1, 'Selecteer minimaal één vereiste vaardigheid')
    .max(10, 'Maximaal 10 vaardigheden toegestaan'),

  requiredCertificates: z
    .array(z.string())
    .max(5, 'Maximaal 5 certificaten toegestaan'),

  minExperience: z
    .number()
    .min(0, 'Minimale ervaring kan niet negatief zijn')
    .max(30, 'Maximale ervaring is 30 jaar'),

  // Access & Safety
  accessRequirements: z
    .string()
    .max(500, 'Toegangseisen mogen maximaal 500 tekens bevatten')
    .optional(),

  safetyRequirements: z
    .string()
    .max(500, 'Veiligheidseisen mogen maximaal 500 tekens bevatten')
    .optional(),

  // Contact
  contactPerson: z
    .string()
    .min(2, 'Contactpersoon moet minimaal 2 tekens bevatten')
    .max(50, 'Contactpersoon mag maximaal 50 tekens bevatten'),

  contactPhone: z
    .string()
    .regex(/^(\+31|0)[1-9]\d{8}$/, 'Ongeldig Nederlands telefoonnummer'),

  // Status
  status: z.enum(['draft', 'published', 'in_progress', 'completed', 'cancelled']).default('draft'),
  isUrgent: z.boolean().default(false),
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'Einddatum moet na startdatum liggen',
  path: ['endDate'],
});

// 🔍 **APPOINTMENT SEARCH/FILTER VALIDATION**
export const appointmentSearchSchema = z.object({
  query: z
    .string()
    .max(100, 'Zoekterm mag maximaal 100 tekens bevatten')
    .optional(),

  workType: z.enum(['maintenance', 'construction', 'installation', 'repair', 'inspection', 'other']).optional(),
  
  urgency: z.enum(['low', 'medium', 'high', 'urgent']).optional(),

  zipCode: z
    .string()
    .regex(/^\d{4}\s?[a-zA-Z]{2}$/, 'Ongeldig Nederlandse postcode')
    .transform(zip => zip.replace(/\s/g, '').toUpperCase())
    .optional(),

  radius: z
    .number()
    .min(1, 'Radius moet minimaal 1 km zijn')
    .max(200, 'Radius mag maximaal 200 km zijn')
    .optional(),

  dateFrom: z
    .string()
    .refine(date => {
      if (!date) return true;
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, 'Datum kan niet in het verleden liggen')
    .optional(),

  dateTo: z
    .string()
    .optional(),

  minHourlyRate: z
    .number()
    .min(10, 'Minimaal uurtarief is €10')
    .max(500, 'Maximaal uurtarief is €500')
    .optional(),

  maxHourlyRate: z
    .number()
    .min(10, 'Minimaal uurtarief is €10')
    .max(500, 'Maximaal uurtarief is €500')
    .optional(),

  requiredSkill: z
    .string()
    .max(50, 'Vaardigheid mag maximaal 50 tekens bevatten')
    .optional(),

  status: z.enum(['draft', 'published', 'in_progress', 'completed', 'cancelled']).optional(),

  sortBy: z.enum(['date', 'urgency', 'hourlyRate', 'location']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).refine(data => {
  if (data.dateFrom && data.dateTo) {
    const from = new Date(data.dateFrom);
    const to = new Date(data.dateTo);
    return to >= from;
  }
  return true;
}, {
  message: 'Einddatum moet na of gelijk aan startdatum zijn',
  path: ['dateTo'],
}).refine(data => {
  if (data.minHourlyRate && data.maxHourlyRate) {
    return data.maxHourlyRate >= data.minHourlyRate;
  }
  return true;
}, {
  message: 'Maximaal uurtarief moet groter zijn dan minimaal uurtarief',
  path: ['maxHourlyRate'],
});

// 📱 **TYPES**
export type AppointmentData = z.infer<typeof appointmentSchema>;
export type AppointmentSearchData = z.infer<typeof appointmentSearchSchema>;

// 🛠️ **VALIDATION HELPERS**
export const validateAppointment = (data: any) => {
  try {
    appointmentSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err: any) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation error' } };
  }
};

export const validateAppointmentSearch = (data: any) => {
  try {
    appointmentSearchSchema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err: any) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Search validation error' } };
  }
};