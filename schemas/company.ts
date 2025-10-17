import { z } from 'zod';

// 🛡️ **COMPANY VALIDATION SCHEMAS**
// Complete input validation for company management

export const companySchema = z.object({
  // Basic Information
  name: z
    .string()
    .min(2, 'Bedrijfsnaam moet minimaal 2 tekens bevatten')
    .max(100, 'Bedrijfsnaam mag maximaal 100 tekens bevatten')
    .regex(/^[a-zA-Z0-9\s\-\.\&\(\)]+$/, 'Bedrijfsnaam bevat ongeldige tekens')
    .transform(name => name.trim()),

  // Legal Information
  kvkNumber: z
    .string()
    .regex(/^\d{8}$/, 'KvK-nummer moet 8 cijfers bevatten')
    .refine(kvk => {
      // Basic validation - could be enhanced with actual KvK API check
      return kvk !== '00000000' && kvk !== '12345678';
    }, 'Ongeldig KvK-nummer'),

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

  // Company Type & Industry
  companyType: z.enum([
    'eenmanszaak',
    'vof',
    'cv',
    'bv',
    'nv',
    'stichting',
    'vereniging',
    'cooperative',
    'other'
  ]),

  industry: z.enum([
    'construction',
    'installation',
    'maintenance',
    'renovation',
    'landscaping',
    'electrical',
    'plumbing',
    'hvac',
    'security',
    'cleaning',
    'logistics',
    'it',
    'consultancy',
    'other'
  ]),

  // Contact Information
  contactPerson: z
    .string()
    .min(2, 'Contactpersoon moet minimaal 2 tekens bevatten')
    .max(50, 'Contactpersoon mag maximaal 50 tekens bevatten')
    .regex(/^[a-zA-ZÀ-ÿ\s\-\.]+$/, 'Naam mag alleen letters, spaties en - bevatten'),

  email: z
    .string()
    .email('Ongeldig e-mailadres')
    .max(100, 'E-mailadres mag maximaal 100 tekens bevatten')
    .toLowerCase(),

  phone: z
    .string()
    .regex(/^(\+31|0)[1-9]\d{8}$/, 'Ongeldig Nederlands telefoonnummer')
    .transform(phone => phone.replace(/\s/g, '')),

  // Address Information
  address: z.object({
    street: z
      .string()
      .min(5, 'Straat moet minimaal 5 tekens bevatten')
      .max(100, 'Straat mag maximaal 100 tekens bevatten'),

    zipCode: z
      .string()
      .regex(/^\d{4}\s?[a-zA-Z]{2}$/, 'Ongeldig Nederlandse postcode (bijv. 1234 AB)')
      .transform(zip => zip.replace(/\s/g, '').toUpperCase()),

    city: z
      .string()
      .min(2, 'Plaats moet minimaal 2 tekens bevatten')
      .max(50, 'Plaats mag maximaal 50 tekens bevatten')
      .regex(/^[a-zA-ZÀ-ÿ\s\-]+$/, 'Plaats mag alleen letters, spaties en - bevatten'),

    country: z
      .string()
      .default('Nederland'),
  }),

  // Business Information
  foundedYear: z
    .number()
    .min(1900, 'Oprichtingsjaar moet na 1900 zijn')
    .max(new Date().getFullYear(), 'Oprichtingsjaar kan niet in de toekomst liggen'),

  employeeCount: z
    .number()
    .min(1, 'Aantal medewerkers moet minimaal 1 zijn')
    .max(10000, 'Aantal medewerkers mag maximaal 10.000 zijn'),

  description: z
    .string()
    .min(50, 'Beschrijving moet minimaal 50 tekens bevatten')
    .max(2000, 'Beschrijving mag maximaal 2000 tekens bevatten'),

  website: z
    .string()
    .url('Ongeldig website adres')
    .optional()
    .or(z.literal('')),

  // Service Areas
  serviceAreas: z
    .array(z.string())
    .min(1, 'Selecteer minimaal één servicegebied')
    .max(20, 'Maximaal 20 servicegebieden toegestaan'),

  // Work Types
  workTypes: z
    .array(z.string())
    .min(1, 'Selecteer minimaal één type werk')
    .max(15, 'Maximaal 15 werktypes toegestaan'),

  // Certifications & Quality
  certifications: z
    .array(z.string())
    .max(10, 'Maximaal 10 certificaten toegestaan'),

  insuranceTypes: z
    .array(z.string())
    .min(1, 'Selecteer minimaal één type verzekering')
    .max(5, 'Maximaal 5 verzekeringen toegestaan'),

  // Financial Information
  subscriptionPlan: z.enum(['basic', 'professional', 'enterprise']).default('basic'),

  // Status & Verification
  isActive: z.boolean().default(true),
  isVerified: z.boolean().default(false),
  verificationLevel: z.enum(['none', 'basic', 'verified', 'premium']).default('none'),

  // Agreement
  agreedToTerms: z
    .boolean()
    .refine(agreed => agreed === true, 'Akkoord met voorwaarden is verplicht'),

  privacyPolicyAccepted: z
    .boolean()
    .refine(accepted => accepted === true, 'Akkoord met privacybeleid is verplicht'),
});

// 🔍 **COMPANY SEARCH/FILTER VALIDATION**
export const companySearchSchema = z.object({
  query: z
    .string()
    .max(100, 'Zoekterm mag maximaal 100 tekens bevatten')
    .optional(),

  industry: z.enum([
    'construction',
    'installation',
    'maintenance',
    'renovation',
    'landscaping',
    'electrical',
    'plumbing',
    'hvac',
    'security',
    'cleaning',
    'logistics',
    'it',
    'consultancy',
    'other'
  ]).optional(),

  companyType: z.enum([
    'eenmanszaak',
    'vof',
    'cv',
    'bv',
    'nv',
    'stichting',
    'vereniging',
    'cooperative',
    'other'
  ]).optional(),

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

  minEmployees: z
    .number()
    .min(1, 'Minimaal aantal medewerkers is 1')
    .max(1000, 'Maximaal aantal medewerkers is 1000')
    .optional(),

  maxEmployees: z
    .number()
    .min(1, 'Minimaal aantal medewerkers is 1')
    .max(10000, 'Maximaal aantal medewerkers is 10.000')
    .optional(),

  serviceArea: z
    .string()
    .max(50, 'Servicegebied mag maximaal 50 tekens bevatten')
    .optional(),

  workType: z
    .string()
    .max(50, 'Werktype mag maximaal 50 tekens bevatten')
    .optional(),

  isVerified: z.boolean().optional(),
  verificationLevel: z.enum(['none', 'basic', 'verified', 'premium']).optional(),
  subscriptionPlan: z.enum(['basic', 'professional', 'enterprise']).optional(),

  sortBy: z.enum(['name', 'foundedYear', 'employeeCount', 'verificationLevel']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
}).refine(data => {
  if (data.minEmployees && data.maxEmployees) {
    return data.maxEmployees >= data.minEmployees;
  }
  return true;
}, {
  message: 'Maximaal aantal medewerkers moet groter zijn dan minimaal aantal',
  path: ['maxEmployees'],
});

// 📱 **TYPES**
export type CompanyData = z.infer<typeof companySchema>;
export type CompanySearchData = z.infer<typeof companySearchSchema>;

// 🛠️ **VALIDATION HELPERS**
export const validateCompany = (data: any) => {
  try {
    companySchema.parse(data);
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

export const validateCompanySearch = (data: any) => {
  try {
    companySearchSchema.parse(data);
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