export type UserRole = 'client' | 'worker' | 'admin';

export interface Subscription {
  planId: 'worker-basic' | 'worker-plus' | 'client-basic' | 'client-pro';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  subscription?: Subscription;
}

export enum Level {
  Junior = 'Junior',
  Regular = 'Regular',
  Senior = 'Senior',
}

export enum Availability {
  Available = 'Dostępny',
  AvailableFrom = 'Dostępny od',
  Busy = 'Zajęty',
}

export enum JobRateType {
    Hourly = 'h',
    Daily = 'dzień',
    Fixed = 'ryczałt',
}

export interface Skill {
  name: string;
  proficiency: 1 | 2 | 3 | 4 | 5;
}

export interface Experience {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Project {
  title: string;
  description: string;
  images: string[];
  tags: string[];
  date: string;
}

export interface Certificate {
  name: string;
  number?: string;
  validUntil: string;
  fileUrl?: string;
  verified: boolean;
}

// Extended Types for Rich Profiles
export interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedDate: string;
  level?: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface Testimonial {
  id: string;
  clientName: string;
  clientCompany?: string;
  text: string;
  date: string;
  rating: number;
  projectType?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: number;
  recipientId: number;
  text: string;
  timestamp: string;
  isRead: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document' | 'pdf';
  url: string;
  filename: string;
  size: number;
}

export interface Conversation {
  id: string;
  participants: number[]; // User IDs
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  jobRelated?: number; // Job ID if related to a job
}

export interface JobMilestone {
  id: string;
  jobId: number;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'paid';
  completedDate?: string;
}

export interface Invoice {
  id: string;
  jobId: number;
  workerId: number;
  clientId: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  paidDate?: string;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface PaymentMethod {
  id: string;
  type: 'ideal' | 'creditcard' | 'sepa' | 'paypal';
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
}

export interface Analytics {
  userId: number;
  period: 'week' | 'month' | 'quarter' | 'year';
  
  // Worker Analytics
  jobsCompleted?: number;
  totalEarnings?: number;
  averageRating?: number;
  profileViews?: number;
  applicationsSent?: number;
  acceptanceRate?: number;
  
  // Client Analytics
  jobsPosted?: number;
  totalSpent?: number;
  workersHired?: number;
  averageJobCost?: number;
  satisfactionRate?: number;
  
  // Chart Data
  earningsOverTime?: ChartDataPoint[];
  jobsByCategory?: { category: string; count: number }[];
  ratingTrend?: ChartDataPoint[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  date?: string;
}

export interface SavedSearch {
  id: string;
  userId: number;
  name: string;
  filters: SearchFilters;
  createdAt: string;
  notifyOnMatch: boolean;
}

export interface SearchFilters {
  category?: string;
  location?: string;
  radius?: number;
  rateMin?: number;
  rateMax?: number;
  availability?: Availability;
  level?: Level;
  hasVca?: boolean;
  isVerified?: boolean;
  languages?: string[];
  skills?: string[];
}

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type NotificationType = 'NEW_JOB' | 'NEW_APPLICATION' | 'STATUS_CHANGE' | 'REVIEW_APPROVED' | 'REVIEW_REJECTED' | 'VERIFICATION_BOOKED' | 'COURSE_REMINDER' | 'NEW_MESSAGE' | 'PAYMENT_RECEIVED' | 'MILESTONE_COMPLETED';



export interface Review {
  id: string;
  workerId: number;
  clientId: number;
  clientName: string;
  isProClient?: boolean;
  date: string;
  rating: number;
  comment: string;
  jobScope: string;
  checklist: {
    quality: boolean;
    punctuality: boolean;
    safety: boolean;
  };
  photos: string[];
  status: ReviewStatus;
  verifiedByPlatform: boolean;
}

export interface Profile {
  id: number; // Corresponds to User ID
  avatarUrl: string;
  firstName: string;
  lastName: string;
  category: string;
  level: Level;
  location: string;
  availability: Availability;
  availableFrom?: string;
  rate?: number;
  hasVca: boolean;
  isVerified: boolean;
  verifiedUntil?: string;
  bio: string;
  languages: string[];
  skills: Skill[];
  experience: Experience[];
  gallery: Project[];
  certificates: Certificate[];
  reviews: Review[];
  reviewCount: number;
  avgRating: number;
  
  // Extended Profile Fields
  phone?: string;
  website?: string;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  yearsOfExperience?: number;
  completionRate?: number;
  responseTime?: string; // e.g. "< 2h"
  profileViews?: number;
  savedByClients?: number;
  
  // Company Details (for registered businesses)
  companyName?: string;
  kvkNumber?: string;
  vatNumber?: string;
  insuranceProvider?: string;
  insuranceNumber?: string;
  
  // Tools & Equipment
  ownTools?: string[];
  ownVehicle?: boolean;
  vehicleType?: string;
  
  // Availability Details
  availabilityCalendar?: AvailabilitySlot[];
  preferredWorkRadius?: number; // in km
  willingToTravel?: boolean;
  
  // Social Proof
  badges?: Badge[];
  featuredWork?: string[]; // Featured project IDs
  testimonials?: Testimonial[];
  
  // Settings
  profileVisibility?: 'public' | 'private' | 'clients-only';
  allowDirectMessages?: boolean;
  emailNotifications?: boolean;
  
  // Stats
  joinedDate?: string;
  lastActive?: string;
  totalJobsCompleted?: number;
  repeatClientRate?: number;
}

export interface Job {
    id: number;
    clientId: number;
    title: string;
    clientName: string;
    logoUrl: string;
    location: string;
    startDate: string;
    endDate: string;
    rateType: JobRateType;
    rateValue: number;
    peopleNeeded: number;
    requiredCerts: string[];
    description: string;
    isPriority: boolean;
}

export enum ApplicationStatus {
    New = 'NEW',
    Shortlisted = 'SHORTLISTED',
    Accepted = 'ACCEPTED',
    Declined = 'DECLINED'
}

export interface Application {
    id: number;
    jobId: number;
    workerId: number;
    date: string;
    status: ApplicationStatus;
}

export interface VerificationSlot {
    id: string;
    dateTime: string;
    isBooked: boolean;
}

export interface VerificationBooking {
    id: string;
    workerId: number;
    slotId: string;
    status: 'BOOKED' | 'COMPLETED' | 'CANCELED';
    assessment?: {
        finalLevel: Level;
        verifiedUntil: string;
        reportUrl: string;
        assessedSkills: Skill[];
    };
}

export type CourseType = 'VCA_BASIS' | 'VCA_VOL' | 'BHV' | 'GPI';

export interface Course {
    id: string;
    title: string;
    type: CourseType;
    price: number;
    dates: string[];
    seatLimit: number;
}

export interface Enrollment {
    id: string;
    courseId: string;
    workerId: number;
    status: 'ENROLLED' | 'PASSED' | 'FAILED';
}

export interface Plan {
    id: 'worker-basic' | 'worker-plus' | 'client-basic' | 'client-pro';
    name: string;
    role: UserRole;
    price: number;
    perks: string[];
}

export interface Notification {
    id: string;
    userId: number; // The user who receives the notification
    type: NotificationType;
    message: string;
    isRead: boolean;
    timestamp: string;
    link?: string;
}
