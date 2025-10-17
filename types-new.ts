// ============================================
// NOWA ARCHITEKTURA - ROLE SYSTEM
// ============================================
// Admin: Tworzy konta pracowników PO teście
// Employer: Płaci abonament, dostęp do bazy
// Worker: Dostaje konto od Admina (NIE rejestruje się sam)
// ============================================

export type UserRole = 'admin' | 'employer' | 'worker';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  mustChangePassword?: boolean; // For first-time Worker login
  createdAt: string;
}

// ============================================
// EMPLOYER (Zleceniodawca) - PŁACI ABONAMENT
// ============================================

export interface Employer {
  id: number;
  companyName: string;
  vatNumber?: string;
  email: string;
  phone?: string;
  address?: string;
  contactPerson: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStartedAt?: string;
  subscriptionRenewAt?: string;
  createdAt: string;
}

export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly?: number;
  features: string[];
  maxSearchesPerMonth?: number;
  maxContacts?: number;
}

// ============================================
// WORKER (ZZP) - OTRZYMUJE KONTO PO TEŚCIE
// ============================================

export enum WorkerLevel {
  Junior = 'Junior',
  Mid = 'Mid',
  Senior = 'Senior',
}

export enum WorkerAvailability {
  Active = 'ACTIVE',
  Busy = 'BUSY',
}

export interface Worker {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  postalCode?: string;
  
  // Languages & Citizenship
  citizenship: string;
  languages: string[]; // ['NL', 'EN', 'PL']
  
  // Categories & Experience (from form)
  categories: WorkerCategory[];
  yearsOfExperience: number;
  
  // Tools & Equipment
  ownTools: string[];
  
  // Rates
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  
  // Work Preferences
  availableDays: string[]; // ['Monday', 'Tuesday', etc.]
  willingToTravel: boolean;
  maxTravelDistance?: number; // km
  
  // Verification & Certificate
  verifiedAt?: string;
  certificateId?: number;
  certificate?: Certificate;
  
  // Portfolio & Attachments
  recentProjects: RecentProject[];
  attachments: WorkerAttachment[];
  references: Reference[];
  
  // Qualifications
  qualifications: Qualification[];
  
  // Account Status
  accountEnabled: boolean;
  availability: WorkerAvailability;
  
  // Stats (visible to Employers)
  profileViews?: number;
  contactedBy?: number;
  
  createdAt: string;
  updatedAt?: string;
}

export interface WorkerCategory {
  category: BuildingCategory;
  level: WorkerLevel;
  yearsInCategory: number;
  description?: string;
}

// ============================================
// BUILDING CATEGORIES (Rozbudowana lista)
// ============================================

export enum BuildingCategory {
  // Podstawowe
  Bricklayer = 'Murarz',
  Plasterer = 'Tynkarz',
  FloorLayer = 'Posadzkarz',
  Tiler = 'Glazurnik',
  
  // Konstrukcje
  Carpenter = 'Cieśla',
  Roofer = 'Dekarz',
  Facades = 'Elewacje',
  Insulation = 'Docieplenia',
  
  // Instalacje
  Electrician = 'Elektryk',
  ElectricianIndustrial = 'Elektryk Przemysłowy',
  Plumber = 'Hydraulik',
  HVAC = 'HVAC',
  HeatPump = 'Pompy Ciepła',
  Solar = 'Fotowoltaika',
  
  // Wykończenia
  Painter = 'Malarz',
  Wallpaper = 'Tapetowanie',
  Decorative = 'Sztukateria',
  
  // Stolarka
  WindowDoor = 'Okna i Drzwi',
  CustomFurniture = 'Meble na wymiar',
  
  // Zabudowy
  Drywall = 'Sucha Zabudowa',
  Gypsum = 'Płyty GK',
  SuspendedCeiling = 'Sufity Podwieszane',
  
  // Zewnętrzne
  Fencing = 'Ogrodzenia',
  Paving = 'Kostka Brukowa',
  Landscaping = 'Mała Architektura',
  
  // Zarządzanie
  Foreman = 'Kierownik Robót',
  TeamLeader = 'Brygadzista',
  SafetyOfficer = 'Inspektor BHP',
}

export interface RecentProject {
  address: string;
  scope: string;
  year: number;
  category: BuildingCategory;
  description?: string;
}

export interface WorkerAttachment {
  id: string;
  type: 'portfolio' | 'qualification' | 'reference' | 'other';
  filename: string;
  url: string;
  uploadedAt: string;
}

export interface Reference {
  employerName: string;
  employerContact?: string;
  projectDescription: string;
  date: string;
  verified: boolean;
}

export interface Qualification {
  name: string; // e.g., 'SEP', 'VCA', 'UDT'
  number?: string;
  issuedAt: string;
  validUntil?: string;
  verified: boolean;
  fileUrl?: string;
}

// ============================================
// CERTIFICATE (Wystawiany przez Admina)
// ============================================

export interface Certificate {
  id: number;
  workerId: number;
  certificateNumber: string; // Unique number
  issuedAt: string;
  issuedBy: string; // Admin name
  pdfUrl?: string;
  qrCodeUrl?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
  validUntil?: string;
  categories: BuildingCategory[];
  level: WorkerLevel;
}

// ============================================
// APPOINTMENT (Zgłoszenie na test)
// ============================================

export interface Appointment {
  id: number;
  
  // Applicant Data (before Worker account created)
  applicantData: {
    fullName: string;
    email: string;
    phone: string;
    city: string;
    postalCode?: string;
    citizenship: string;
    languages: string[];
    availableDays: string[];
    categories: WorkerCategory[];
    yearsOfExperience: number;
    ownTools: string[];
    preferredRates?: {
      min: number;
      max: number;
    };
    recentProjects: RecentProject[];
    qualifications: Qualification[];
    references: Reference[];
    attachments: string[]; // URLs to uploaded files
    testLanguage: string;
    agreedToTerms: boolean;
    agreedToPrivacy: boolean;
  };
  
  // Slot Selection
  selectedCategory: BuildingCategory; // For practical test
  slotDatetime: string; // ISO datetime
  
  // Status
  status: AppointmentStatus;
  
  // Admin Actions
  confirmedAt?: string;
  confirmedBy?: number; // Admin ID
  testCompletedAt?: string;
  testResult?: 'PASS' | 'FAIL';
  testNotes?: string;
  
  // Created Worker ID (after PASS)
  createdWorkerId?: number;
  
  createdAt: string;
  updatedAt?: string;
}

export type AppointmentStatus = 
  | 'PENDING'        // Waiting for Admin confirmation
  | 'CONFIRMED'      // Admin confirmed, waiting for test date
  | 'DONE'           // Test completed
  | 'NO_SHOW'        // Candidate didn't show up
  | 'CANCELLED';     // Cancelled by Admin or Candidate

// ============================================
// TIME SLOTS (pn-pt: 09:00, 11:00, 14:00)
// ============================================

export interface TimeSlot {
  id: string;
  date: string; // YYYY-MM-DD
  time: '09:00' | '11:00' | '14:00';
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  maxCapacity: number;
  bookedCount: number;
  available: boolean;
}

// ============================================
// ADMIN USER
// ============================================

export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  roles: string[]; // ['SUPER_ADMIN', 'TEST_ADMIN', etc.]
  createdAt: string;
}

// ============================================
// AUDIT LOG (dla Admin)
// ============================================

export interface AuditLog {
  id: number;
  actorId: number;
  actorRole: UserRole;
  action: string; // 'CREATE_WORKER', 'ISSUE_CERTIFICATE', etc.
  entity: string; // 'Worker', 'Certificate', etc.
  entityId?: number;
  details?: any;
  timestamp: string;
}

// ============================================
// NOTIFICATION
// ============================================

export type NotificationType = 
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_REMINDER'
  | 'TEST_RESULT'
  | 'ACCOUNT_CREATED'
  | 'SUBSCRIPTION_EXPIRING'
  | 'SUBSCRIPTION_EXPIRED'
  | 'NEW_WORKER_AVAILABLE'
  | 'WORKER_CONTACTED';

export interface Notification {
  id: string;
  userId: number;
  userRole: UserRole;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ============================================
// SEARCH FILTERS (dla Employers)
// ============================================

export interface WorkerSearchFilters {
  categories?: BuildingCategory[];
  levels?: WorkerLevel[];
  city?: string;
  maxDistance?: number;
  languages?: string[];
  availability?: WorkerAvailability;
  minYearsExperience?: number;
  maxHourlyRate?: number;
  hasQualifications?: string[]; // ['SEP', 'VCA']
  hasOwnTools?: boolean;
  willingToTravel?: boolean;
  availableOn?: string[]; // Days of week
}

// ============================================
// LANGUAGES (wielojęzyczność)
// ============================================

export type SupportedLanguage = 'nl' | 'en' | 'tr' | 'pl' | 'bg' | 'ar' | 'de' | 'hu' | 'fr';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string; // emoji
  rtl?: boolean; // for Arabic
}

// ============================================
// FORM DATA (dla zgłoszenia)
// ============================================

export interface ExperienceCertificateFormData {
  // Personal Info
  fullName: string;
  phone: string;
  email: string;
  city: string;
  postalCode: string;
  citizenship: string;
  languages: string[];
  availableDays: string[];
  
  // Experience & Categories
  categories: Array<{
    category: BuildingCategory;
    level: WorkerLevel;
    yearsInCategory: number;
  }>;
  totalYearsExperience: number;
  
  // Tools & Rates
  ownTools: string;
  hourlyRateMin: number;
  hourlyRateMax: number;
  
  // Technical Questions
  recentProjects: string; // Text area
  qualificationsDescription: string;
  referencesDescription: string;
  
  // Practical Test
  agreedToPracticalTest: boolean;
  preferredTestCategory: BuildingCategory;
  testLanguage: SupportedLanguage;
  
  // Slot Selection
  selectedSlot: {
    date: string;
    time: '09:00' | '11:00' | '14:00';
  };
  
  // Agreements
  agreedToTerms: boolean;
  agreedToPrivacy: boolean;
  
  // Attachments (files will be uploaded separately)
  portfolioFiles?: File[];
  qualificationFiles?: File[];
  referenceFiles?: File[];
}
