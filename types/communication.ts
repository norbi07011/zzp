// Typy dla systemu komunikacji budowlanej

export interface BuildingChatMessage {
  id: string
  sender: string
  message: string
  timestamp: number
  projectId: string          // Powiązanie z projektem
  taskId?: string           // Powiązanie z zadaniem
  locationId?: string       // Lokalizacja na budowie
  type: 'message' | 'progress_update' | 'safety_alert' | 'quality_check' | 'voice' | 'image' | 'file'
  attachment?: {
    url: string
    name: string
    size: number
    type: string
    location?: {             // GPS coords dla zdjęć
      lat: number
      lng: number
    }
  }
  voiceNote?: {
    url: string
    duration: number
  }
  reactions?: {
    [emoji: string]: string[] // emoji -> array of user names who reacted
  }
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  replyTo?: string
  isPinned?: boolean
  pinnedBy?: string
  pinnedAt?: number
  editedAt?: number
  threads?: string[] // IDs of thread messages
  priority?: 'low' | 'normal' | 'high' | 'urgent'  // Priorytet wiadomości
  requiresApproval?: boolean   // Wymaga akceptacji kierownika
  approvedBy?: string          // Kto zatwierdził
  approvedAt?: number
  location?: {
    lat: number
    lng: number
    description: string        // "Rusztowanie sektor A3"
  }
}

export interface BuildingChatGroup {
  id: string
  name: string
  description?: string
  icon?: string
  members: string[]
  createdAt: number
  createdBy: string
  color?: string
  projectId?: string        // Powiązanie z projektem
  type: 'project' | 'team' | 'safety' | 'quality' | 'logistics' | 'admin'
  autoJoinRoles?: string[]  // Role które automatycznie dołączają
  location?: string         // Strefa budowy
}

export interface BuildingNotification {
  id: string
  type: 'task_assigned' | 'task_completed' | 'task_overdue' | 'safety_alert' | 
        'quality_issue' | 'weather_warning' | 'material_delivery' | 'approval_needed' |
        'shift_reminder' | 'inspection_scheduled' | 'geofence_entry' | 'geofence_exit'
  title: string
  message: string
  timestamp: Date
  read: boolean
  urgent: boolean
  projectId: string         // Projekt
  taskId?: string          // Zadanie
  locationId?: string      // Lokalizacja
  actionable?: boolean
  actionType?: 'approve' | 'reject' | 'acknowledge' | 'view_details' | 'navigate_to_location'
  expiresAt?: Date         // Powiadomienie wygasa
  geofenceTriggered?: boolean  // Wywołane przez geofencing
  targetUserId?: string    // Do kogo skierowane
  relatedData?: any        // Dodatkowe dane
}

export interface ProgressReport {
  id: string
  taskId: string
  reportedBy: string
  timestamp: Date
  progressPercentage: number
  description: string
  photosBeforeAfter: {
    before: string[]
    after: string[]
    location: { lat: number; lng: number }
  }
  issues?: string[]
  materialsUsed?: {
    materialId: string
    materialName: string
    quantity: number
    unit: string
    cost?: number
  }[]
  workersPresent?: string[]
  weatherConditions?: {
    temperature: number
    humidity: number
    condition: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'snow'
    description?: string
  }
  qualityCheckPassed?: boolean
  qualityScore?: number // 1-5 stars
  supervisorApproval?: {
    status: 'pending' | 'approved' | 'rejected'
    approvedBy?: string
    comments?: string
    approvedAt?: Date
  }
  estimatedCompletionTime?: Date
  nextSteps?: string
}

export interface SafetyAlert {
  id: string
  type: 'accident' | 'near_miss' | 'unsafe_condition' | 'equipment_issue' | 'weather_warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
  reportedBy: string
  reportedAt: Date
  location: {
    lat: number
    lng: number
    description: string  // "Rusztowanie sektor A3"
    zone?: string       // "A3", "B1", etc.
  }
  description: string
  photos?: string[]
  immediateAction?: string
  status: 'reported' | 'acknowledged' | 'investigating' | 'resolved'
  assignedTo?: string[]
  resolvedAt?: Date
  resolutionNotes?: string
  followUpRequired?: boolean
  incidentNumber?: string  // Unikalny numer incydentu
  witnessesPresent?: string[]
  equipmentInvolved?: string[]
  injuriesReported?: boolean
  emergencyServicesContacted?: boolean
  preventiveMeasures?: string[]
}

export interface TaskApprovalWorkflow {
  taskId: string
  submittedBy: string
  submittedAt: Date
  progressPhotos: string[]
  qualityCheckPhotos: string[]
  completionNote: string
  completionPercentage: number
  
  approvalSteps: {
    stepId: string
    stepName: string
    requiredRole: 'supervisor' | 'quality_inspector' | 'project_manager' | 'client_representative'
    status: 'pending' | 'approved' | 'rejected' | 'skipped'
    approvedBy?: string
    comments?: string
    approvedAt?: Date
    requiredDocuments?: string[]
    completedDocuments?: string[]
  }[]
  
  finalStatus: 'pending' | 'approved' | 'rejected' | 'revision_needed'
  paymentApproved?: boolean  // Czy można płacić za zadanie
  invoiceGenerated?: boolean
  finalApprovedBy?: string
  finalApprovedAt?: Date
  rejectionReason?: string
  revisionNotes?: string[]
}

export interface GeolocationContext {
  autoTagLocation: boolean
  currentLocation?: {
    lat: number
    lng: number
    accuracy: number
    timestamp: Date
  }
  
  // Strefy budowy
  buildingSites: {
    id: string
    name: string
    address: string
    polygon: { lat: number; lng: number }[]  // Granice budowy
    safetyZones: {
      id: string
      name: string
      type: 'restricted' | 'danger' | 'equipment' | 'materials' | 'office' | 'parking'
      polygon: { lat: number; lng: number }[]
      description?: string
      requiredPermissions?: string[]
    }[]
    checkpoints: {
      id: string
      name: string
      lat: number
      lng: number
      type: 'entry' | 'exit' | 'safety' | 'quality' | 'equipment'
    }[]
  }[]
  
  // Geofencing notifications
  geofenceRules: {
    id: string
    zoneId: string
    triggerType: 'enter' | 'exit' | 'dwell'
    dwellTimeMinutes?: number  // Dla typu 'dwell'
    action: 'notify_supervisor' | 'safety_reminder' | 'check_in_required' | 'access_warning'
    message: string
    targetRoles?: string[]
    enabled: boolean
  }[]
}

export interface ProjectCommunicationHub {
  projectId: string
  currentProject: {
    id: string
    name: string
    status: string
    location: string
  }
  
  // Automatyczne kanały dla każdego projektu
  channels: {
    general: BuildingChatGroup          // Ogólna komunikacja
    safety: BuildingChatGroup           // BHP i bezpieczeństwo  
    quality: BuildingChatGroup          // Kontrola jakości
    logistics: BuildingChatGroup        // Dostawy i logistyka
    progress: BuildingChatGroup         // Raporty postępu
    issues: BuildingChatGroup           // Problemy i błędy
  }
  
  // Komunikacja per strefa budowy
  locationChannels: {
    [locationId: string]: BuildingChatGroup
  }
  
  // Ustawienia
  settings: {
    autoCreateLocationChannels: boolean
    allowDirectMessages: boolean
    requireApprovalForCompletion: boolean
    enableGeofencing: boolean
    workingHours: {
      start: string  // "08:00"
      end: string    // "16:00"
    }
    emergencyContacts: {
      name: string
      phone: string
      role: string
    }[]
  }
}

// Role użytkowników w kontekście budowlanym
export type BuildingRole = 
  | 'worker'                    // Pracownik budowlany
  | 'specialist'                // Specjalista (elektryk, hydraulik)
  | 'supervisor'                // Kierownik/brygadzista
  | 'project_manager'           // Kierownik projektu
  | 'quality_inspector'         // Inspektor jakości
  | 'safety_officer'            // Oficer BHP
  | 'logistics_coordinator'     // Koordynator logistyki
  | 'client_representative'     // Przedstawiciel klienta
  | 'architect'                 // Architekt
  | 'engineer'                  // Inżynier
  | 'accountant'                // Księgowy
  | 'admin'                     // Administrator systemu

export interface BuildingPermissions {
  canCreateProject: boolean
  canAssignTasks: boolean
  canApproveTaskCompletion: boolean
  canAccessSafetyReports: boolean
  canCreateSafetyAlerts: boolean
  canApprovePayments: boolean
  canAccessAllProjects: boolean
  canManageTeam: boolean
  canViewFinancialData: boolean
  canModifyGeofencing: boolean
  canAccessEmergencyContacts: boolean
  canOverrideApprovals: boolean
  canDeleteMessages: boolean
  canBanUsers: boolean
  canExportData: boolean
}

// Utility types
export type MessageType = BuildingChatMessage['type']
export type NotificationType = BuildingNotification['type']
export type SafetyAlertType = SafetyAlert['type']
export type SafetyAlertSeverity = SafetyAlert['severity']
export type ApprovalStatus = TaskApprovalWorkflow['finalStatus']
export type ChatGroupType = BuildingChatGroup['type']

// Domyślne grupy dla każdego projektu budowlanego
export const DEFAULT_BUILDING_GROUPS: Omit<BuildingChatGroup, 'projectId' | 'members'>[] = [
  {
    id: 'general',
    name: 'Główny Projekt',
    description: 'Ogólna komunikacja zespołu',
    type: 'project',
    icon: '🏗️',
    color: 'blue',
    createdAt: Date.now(),
    createdBy: 'system',
    autoJoinRoles: ['worker', 'supervisor', 'project_manager']
  },
  {
    id: 'safety',
    name: 'BHP i Bezpieczeństwo', 
    description: 'Sprawy bezpieczeństwa i incydenty',
    type: 'safety',
    icon: '⚠️',
    color: 'red',
    createdAt: Date.now(),
    createdBy: 'system',
    autoJoinRoles: ['worker', 'supervisor', 'project_manager', 'safety_officer']
  },
  {
    id: 'quality',
    name: 'Kontrola Jakości',
    description: 'Sprawdzanie jakości i standardów',
    type: 'quality', 
    icon: '✅',
    color: 'green',
    createdAt: Date.now(),
    createdBy: 'system',
    autoJoinRoles: ['supervisor', 'project_manager', 'quality_inspector']
  },
  {
    id: 'logistics',
    name: 'Logistyka',
    description: 'Dostawy materiałów i sprzętu',
    type: 'logistics',
    icon: '📦',
    color: 'orange',
    createdAt: Date.now(),
    createdBy: 'system',
    autoJoinRoles: ['logistics_coordinator', 'project_manager', 'supervisor']
  },
  {
    id: 'progress',
    name: 'Postęp Prac',
    description: 'Raporty i aktualizacje postępu',
    type: 'project',
    icon: '📊',
    color: 'purple',
    createdAt: Date.now(),
    createdBy: 'system',
    autoJoinRoles: ['worker', 'supervisor', 'project_manager']
  }
]

// Emoji dla reakcji w kontekście budowlanym
export const BUILDING_EMOJI_LIST = [
  '👍', '👎', '❤️', '🔥', '🎉', '😂',
  '✅', '❌', '⚠️', '🔧', '🏗️', '📐',
  '💯', '👀', '🙏', '💪', '🎯', '💡',
  '🚨', '🛠️', '📏', '🔨', '⚡', '🌟'
]

// Funkcje pomocnicze
export function getGroupColor(color?: string): string {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    red: 'bg-red-100 text-red-800 border-red-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
  }
  return colors[color || 'blue'] || colors.blue
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function getPriorityColor(priority?: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-600 text-white'
    case 'high':
      return 'bg-orange-500 text-white'
    case 'normal':
      return 'bg-blue-500 text-white'
    case 'low':
      return 'bg-gray-400 text-white'
    default:
      return 'bg-gray-400 text-white'
  }
}

export function getSeverityColor(severity?: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-600 text-white'
    case 'high':
      return 'bg-orange-500 text-white'
    case 'medium':
      return 'bg-yellow-500 text-black'
    case 'low':
      return 'bg-green-500 text-white'
    default:
      return 'bg-gray-400 text-white'
  }
}