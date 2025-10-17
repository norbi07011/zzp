import { z } from 'zod';

// 🛡️ **WORKER VALIDATION SCHEMAS**
// Complete input validation for worker management

export const workerSchema = z.object({
  // Personal Information
  fullName: z
    .string()
    .min(2, 'Naam moet minimaal 2 tekens bevatten')
    .max(50, 'Naam mag maximaal 50 tekens bevatten')
    .regex(/^[a-zA-ZÀ-ÿ\s\-\.]+$/, 'Naam mag alleen letters, spaties en - bevatten')
    .transform(name => name.trim()),

  email: z
    .string()
    .email('Ongeldig e-mailadres')
    .max(100, 'E-mailadres mag maximaal 100 tekens bevatten')
    .toLowerCase(),

  phone: z
    .string()
    .regex(/^(\+31|0)[1-9]\d{8}$/, 'Ongeldig Nederlands telefoonnummer')
    .transform(phone => phone.replace(/\s/g, '')),

  // Work Information
  profession: z
    .string()
    .min(2, 'Vak moet minimaal 2 tekens bevatten')
    .max(100, 'Vak mag maximaal 100 tekens bevatten'),

  specializations: z
    .array(z.string())
    .min(1, 'Selecteer minimaal één specialisatie')
    .max(10, 'Maximaal 10 specialisaties toegestaan'),

  experience: z
    .number()
    .min(0, 'Ervaring kan niet negatief zijn')
    .max(50, 'Ervaring mag maximaal 50 jaar zijn'),

  hourlyRate: z
    .number()
    .min(10, 'Uurtarief moet minimaal €10 zijn')
    .max(500, 'Uurtarief mag maximaal €500 zijn'),

  // Location Information
  zipCode: z
    .string()
    .regex(/^\d{4}\s?[a-zA-Z]{2}$/, 'Ongeldig Nederlandse postcode (bijv. 1234 AB)')
    .transform(zip => zip.replace(/\s/g, '').toUpperCase()),

  city: z
    .string()
    .min(2, 'Plaats moet minimaal 2 tekens bevatten')
    .max(50, 'Plaats mag maximaal 50 tekens bevatten')
    .regex(/^[a-zA-ZÀ-ÿ\s\-]+$/, 'Plaats mag alleen letters, spaties en - bevatten'),

  workRadius: z
    .number()
    .min(1, 'Werkradius moet minimaal 1 km zijn')
    .max(200, 'Werkradius mag maximaal 200 km zijn'),

  // Availability
  availableFrom: z
    .string()
    .refine(date => {
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, 'Beschikbaarheid kan niet in het verleden liggen'),

  // Business Information (for ZZP)
  kvkNumber: z
    .string()
    .regex(/^\d{8}$/, 'KvK-nummer moet 8 cijfers bevatten')
    .optional(),

  vatNumber: z
    .string()
    .regex(/^NL\d{9}B\d{2}$/, 'BTW-nummer moet format NL123456789B01 hebben')
    .optional(),

  // Documents
  hasValidCertificates: z
    .boolean()
    .refine(val => val === true, 'Geldige certificaten zijn verplicht'),

  // Status
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
});

// 🔍 **WORKER SEARCH/FILTER VALIDATION**
export const workerSearchSchema = z.object({
  query: z
    .string()
    .max(100, 'Zoekterm mag maximaal 100 tekens bevatten')
    .optional(),

  profession: z
    .string()
    .max(50, 'Vak mag maximaal 50 tekens bevatten')
    .optional(),

  specialization: z
    .string()
    .max(50, 'Specialisatie mag maximaal 50 tekens bevatten')
    .optional(),

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

  minExperience: z
    .number()
    .min(0, 'Minimale ervaring kan niet negatief zijn')
    .max(50, 'Maximale ervaring is 50 jaar')
    .optional(),

  maxHourlyRate: z
    .number()
    .min(10, 'Minimaal uurtarief is €10')
    .max(500, 'Maximaal uurtarief is €500')
    .optional(),

  availableFrom: z
    .string()
    .refine(date => {
      if (!date) return true; // Optional field
      const selected = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    }, 'Beschikbaarheid kan niet in het verleden liggen')
    .optional(),

  isVerified: z.boolean().optional(),
  sortBy: z.enum(['name', 'experience', 'hourlyRate', 'distance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// 📱 **TYPES**
export type WorkerData = z.infer<typeof workerSchema>;
export type WorkerSearchData = z.infer<typeof workerSearchSchema>;

// 🛠️ **VALIDATION HELPERS**
export const validateWorker = (data: any) => {
  try {
    workerSchema.parse(data);
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

export const validateWorkerSearch = (data: any) => {
  try {
    workerSearchSchema.parse(data);
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
    return { success: false, errors: { general: 'Search validation error' } };
  }
};