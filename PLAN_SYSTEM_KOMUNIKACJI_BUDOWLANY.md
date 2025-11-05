# 🏗️ SYSTEM KOMUNIKACJI BUDOWLANEJ - Plan Wdrożenia

## 🎯 ANALIZA LOGIKI Z SYSTEMU KSIĘGOWEGO

### ✅ CO KOPIUJEMY Z accountant-team-cale:

#### 1. **ARCHITEKTURA CZATU ZESPOŁOWEGO**
```typescript
// Adaptacja ChatMessage z kontekstem budowlanym
interface BuildingChatMessage {
  id: string
  sender: string
  message: string
  timestamp: number
  projectId: string          // ➕ NOWE: Powiązanie z projektem
  taskId?: string           // ➕ NOWE: Powiązanie z zadaniem
  locationId?: string       // ➕ NOWE: Lokalizacja na budowie
  type: 'message' | 'progress_update' | 'safety_alert' | 'quality_check' | 'voice' | 'image' | 'file'
  attachment?: {
    url: string
    name: string
    size: number
    type: string
    location?: {             // ➕ NOWE: GPS coords dla zdjęć
      lat: number
      lng: number
    }
  }
  reactions?: {
    [emoji: string]: string[]
  }
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  replyTo?: string
  isPinned?: boolean
  priority?: 'low' | 'normal' | 'high' | 'urgent'  // ➕ NOWE: Priorytet
  requiresApproval?: boolean   // ➕ NOWE: Wymaga akceptacji kierownika
  approvedBy?: string          // ➕ NOWE: Kto zatwierdził
}
```

#### 2. **GRUPY KOMUNIKACYJNE (Adaptacja ChatGroup)**
```typescript
interface BuildingChatGroup {
  id: string
  name: string
  description?: string
  icon?: string
  members: string[]
  createdAt: number
  createdBy: string
  color?: string
  projectId?: string        // ➕ NOWE: Powiązanie z projektem
  type: 'project' | 'team' | 'safety' | 'quality' | 'logistics' | 'admin'
  autoJoinRoles?: string[]  // ➕ NOWE: Role które automatycznie dołączają
  location?: string         // ➕ NOWE: Strefa budowy
}

// Domyślne grupy dla każdego projektu:
const DEFAULT_BUILDING_GROUPS = [
  {
    name: 'Główny Projekt',
    type: 'project',
    icon: '🏗️',
    color: 'blue',
    autoJoinRoles: ['worker', 'supervisor', 'manager']
  },
  {
    name: 'BHP i Bezpieczeństwo', 
    type: 'safety',
    icon: '⚠️',
    color: 'red',
    autoJoinRoles: ['all']
  },
  {
    name: 'Kontrola Jakości',
    type: 'quality', 
    icon: '✅',
    color: 'green',
    autoJoinRoles: ['supervisor', 'manager', 'quality_inspector']
  },
  {
    name: 'Logistyka',
    type: 'logistics',
    icon: '📦',
    color: 'orange',
    autoJoinRoles: ['logistics_coordinator', 'manager']
  }
]
```

#### 3. **SYSTEM POWIADOMIEŃ (Adaptacja NotificationCenter)**
```typescript
interface BuildingNotification {
  id: string
  type: 'task_assigned' | 'task_completed' | 'task_overdue' | 'safety_alert' | 
        'quality_issue' | 'weather_warning' | 'material_delivery' | 'approval_needed' |
        'shift_reminder' | 'inspection_scheduled'
  title: string
  message: string
  timestamp: Date
  read: boolean
  urgent: boolean
  projectId: string         // ➕ NOWE: Projekt
  taskId?: string          // ➕ NOWE: Zadanie
  locationId?: string      // ➕ NOWE: Lokalizacja
  actionable?: boolean
  actionType?: 'approve' | 'reject' | 'acknowledge' | 'view_details'
  expiresAt?: Date         // ➕ NOWE: Powiadomienie wygasa
  geofenceTriggered?: boolean  // ➕ NOWE: Wywołane przez geofencing
}
```

---

## 🏗️ NOWE FUNKCJE DLA BRANŻY BUDOWLANEJ

### 1. **KOMUNIKACJA KONTEKSTOWA PROJEKTÓW**
```typescript
interface ProjectCommunicationHub {
  // Komunikacja zawsze w kontekście konkretnego projektu/budowy
  currentProject: Project
  
  // Automatyczne kanały dla każdego projektu:
  channels: {
    general: BuildingChatGroup          // Ogólna komunikacja
    safety: BuildingChatGroup           // BHP i bezpieczeństwo  
    quality: BuildingChatGroup          // Kontrola jakości
    logistics: BuildingChatGroup        // Dostawy i logistyka
    progress: BuildingChatGroup         // Raporty postępu
    issues: BuildingChatGroup           // Problemy i błędy
  }
  
  // Komunikacja per strefa budowy:
  locationChannels: {
    [locationId: string]: BuildingChatGroup
  }
}
```

### 2. **RAPORTOWANIE POSTĘPU PRAC**
```typescript
interface ProgressReport {
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
    quantity: number
    unit: string
  }[]
  workersPresent?: string[]
  weatherConditions?: string
  qualityCheckPassed?: boolean
  supervisorApproval?: {
    status: 'pending' | 'approved' | 'rejected'
    approvedBy?: string
    comments?: string
  }
}

// Komponenty do raportowania:
// ProgressReportDialog.tsx - Dialog raportowania
// ProgressPhotoCapture.tsx - Zdjęcia z GPS
// MaterialUsageTracker.tsx - Tracking materiałów
// QualityCheckForm.tsx - Sprawdzenie jakości
```

### 3. **SYSTEM ALERTÓW BHP**
```typescript
interface SafetyAlert {
  id: string
  type: 'accident' | 'near_miss' | 'unsafe_condition' | 'equipment_issue' | 'weather_warning'
  severity: 'low' | 'medium' | 'high' | 'critical'
  reportedBy: string
  location: {
    lat: number
    lng: number
    description: string  // "Rusztowanie sektor A3"
  }
  description: string
  photos?: string[]
  immediateAction?: string
  status: 'reported' | 'acknowledged' | 'investigating' | 'resolved'
  assignedTo?: string[]
  resolvedAt?: Date
  followUpRequired?: boolean
}

// Automatyczne powiadomienia:
// - Wszyscy pracownicy w promieniu 100m
// - Kierownik/supervisor natychmiast
// - BHP officer zawsze
// - Pracodawca przy high/critical
```

### 4. **WORKFLOW ZATWIERDZANIA ZADAŃ**
```typescript
interface TaskApprovalWorkflow {
  taskId: string
  submittedBy: string
  submittedAt: Date
  progressPhotos: string[]
  qualityCheckPhotos: string[]
  completionNote: string
  
  approvalSteps: {
    stepName: string
    requiredRole: 'supervisor' | 'quality_inspector' | 'manager'
    status: 'pending' | 'approved' | 'rejected' | 'skipped'
    approvedBy?: string
    comments?: string
    approvedAt?: Date
  }[]
  
  finalStatus: 'pending' | 'approved' | 'rejected' | 'revision_needed'
  paymentApproved?: boolean  // Czy można płacić za zadanie
}

// Przykładowy flow:
// 1. Pracownik: "Ukończone" + zdjęcia
// 2. Supervisor: Sprawdza jakość → Approve/Reject  
// 3. Quality Inspector: Kontrola → Approve/Reject
// 4. Manager: Finalne zatwierdzenie → Approve/Reject
// 5. Księgowy: Może wystawić fakturę/zapłacić
```

### 5. **KOMUNIKACJA Z GEOLOKALIZACJĄ**
```typescript
interface GeolocationContext {
  // Automatyczne tagowanie lokalizacji
  autoTagLocation: boolean
  currentLocation: {
    lat: number
    lng: number
    accuracy: number
    timestamp: Date
  }
  
  // Strefy budowy
  buildingSites: {
    id: string
    name: string
    polygon: { lat: number; lng: number }[]  // Granice budowy
    safetyZones: {
      id: string
      name: string
      type: 'restricted' | 'danger' | 'equipment' | 'materials'
      polygon: { lat: number; lng: number }[]
    }[]
  }[]
  
  // Geofencing notifications
  geofenceRules: {
    zoneId: string
    triggerType: 'enter' | 'exit' | 'dwell'
    action: 'notify_supervisor' | 'safety_reminder' | 'check_in_required'
    message: string
  }[]
}
```

---

## 🚀 IMPLEMENTACJA KROK PO KROKU

### **FAZA 1: PODSTAWY KOMUNIKACJI (2 tygodnie)**

#### **Krok 1.1: Adaptacja struktury czatu**
```bash
# Stworzenie nowych typów
src/types/communication.ts      # Nowe typy dla building communication
src/types/projects.ts          # Rozszerzenie projektów o komunikację

# Komponenty bazowe
src/components/ProjectChat/
  ├── ProjectChatContainer.tsx    # Główny kontener czatu projektu
  ├── ProjectChatMessage.tsx      # Wiadomość z kontekstem budowy
  ├── ProjectChannelSidebar.tsx   # Sidebar z kanałami
  ├── ProgressReportDialog.tsx    # Dialog raportowania postępu
  └── SafetyAlertDialog.tsx       # Dialog alertów BHP
```

#### **Krok 1.2: System powiadomień budowlanych**
```bash
src/components/BuildingNotifications/
  ├── BuildingNotificationCenter.tsx  # Centrum powiadomień
  ├── SafetyAlertNotification.tsx     # Alerty BHP
  ├── TaskApprovalNotification.tsx    # Powiadomienia o zatwierdzeniach
  └── WeatherWarningNotification.tsx  # Ostrzeżenia pogodowe
```

### **FAZA 2: RAPORTOWANIE I DOKUMENTACJA (2 tygodnie)**

#### **Krok 2.1: System raportowania postępu**
```bash
src/components/ProgressReporting/
  ├── ProgressReportForm.tsx       # Formularz raportu
  ├── PhotoCapture.tsx            # Robienie zdjęć z GPS
  ├── MaterialUsageInput.tsx      # Input materiałów
  ├── QualityCheckForm.tsx        # Formularz kontroli jakości
  └── ProgressTimeline.tsx        # Timeline postępu zadania
```

#### **Krok 2.2: Workflow zatwierdzania**
```bash
src/components/ApprovalWorkflow/
  ├── TaskSubmissionDialog.tsx    # Zgłoszenie ukończenia
  ├── ApprovalRequestCard.tsx     # Karta prośby o approval
  ├── ApprovalActionButtons.tsx   # Przyciski Approve/Reject
  ├── ApprovalTimeline.tsx        # Timeline procesu zatwierdzania
  └── PaymentApprovalBadge.tsx    # Badge czy można płacić
```

### **FAZA 3: BEZPIECZEŃSTWO I GEOLOKALIZACJA (2 tygodnie)**

#### **Krok 3.1: System alertów BHP**
```bash
src/components/Safety/
  ├── SafetyAlertForm.tsx         # Formularz alertu BHP
  ├── SafetyIncidentTracker.tsx   # Tracking incydentów
  ├── SafetyZoneIndicator.tsx     # Wskaźnik stref bezpieczeństwa
  └── EmergencyContactButton.tsx  # Przycisk emergency
```

#### **Krok 3.2: Integracja geolokalizacji**
```bash
src/services/
  ├── geolocation.ts             # Service geolokalizacji
  ├── geofencing.ts              # Geofencing logic
  └── weatherService.ts          # API pogodowe

src/components/Location/
  ├── LocationTracker.tsx        # Tracking lokalizacji
  ├── BuildingSiteMap.tsx        # Mapa budowy
  ├── GeofenceAlerts.tsx         # Alerty geofencing
  └── LocationTaggedMessage.tsx  # Wiadomości z tagiem lokalizacji
```

### **FAZA 4: ROLE I UPRAWNIENIA (1 tydzień)**

#### **Krok 4.1: System ról dla budowy**
```typescript
// Rozszerzenie istniejących ról o kontekst budowlany
type BuildingRole = 
  | 'worker'                    // Pracownik budowlany
  | 'supervisor'                // Kierownik/brygadzista
  | 'project_manager'           // Kierownik projektu
  | 'quality_inspector'         // Inspektor jakości
  | 'safety_officer'            // Oficer BHP
  | 'logistics_coordinator'     // Koordynator logistyki
  | 'client_representative'     // Przedstawiciel klienta
  | 'accountant'                // Księgowy (istniejący)
  | 'admin'                     // Admin (istniejący)

interface BuildingPermissions {
  canCreateProject: boolean
  canAssignTasks: boolean
  canApproveTaskCompletion: boolean
  canAccessSafetyReports: boolean
  canApprovePayments: boolean
  canAccessAllProjects: boolean
  canManageTeam: boolean
  canViewFinancialData: boolean
}
```

### **FAZA 5: INTEGRACJE (1 tydzień)**

#### **Krok 5.1: Integracja z istniejącymi modułami**
```bash
# Integracja z systemem zadań
src/integrations/
  ├── taskCommunication.ts       # Komunikacja powiązana z zadaniami
  ├── projectNotifications.ts    # Powiadomienia projektu
  └── teamSync.ts                # Sync z zarządzaniem zespołem

# Rozszerzenie istniejących komponentów
src/components/TaskCard.tsx      # ➕ Dodanie czatu do TaskCard
src/components/Dashboard.tsx     # ➕ Widget komunikacji na dashboard
src/pages/ProjectDetails.tsx     # ➕ Tab komunikacji w szczegółach projektu
```

---

## 💻 KLUCZOWE KOMPONENTY DO STWORZENIA

### **1. ProjectChatContainer.tsx** (Główny komponent)
```tsx
interface ProjectChatContainerProps {
  projectId: string
  currentUser: User
  teamMembers: User[]
}

export function ProjectChatContainer({ projectId, currentUser, teamMembers }: Props) {
  // Stan
  const [activeChannel, setActiveChannel] = useState('general')
  const [messages, setMessages] = useState<BuildingChatMessage[]>([])
  const [notifications, setNotifications] = useState<BuildingNotification[]>([])
  
  // Hooks
  const { location } = useGeolocation()
  const { sendMessage, subscribeToProject } = useProjectCommunication(projectId)
  const { createProgressReport } = useProgressReporting()
  const { createSafetyAlert } = useSafetyReporting()
  
  return (
    <div className="flex h-full">
      {/* Sidebar z kanałami */}
      <ProjectChannelSidebar 
        channels={channels}
        activeChannel={activeChannel}
        onChannelChange={setActiveChannel}
        unreadCounts={unreadCounts}
      />
      
      {/* Główny czat */}
      <div className="flex-1 flex flex-col">
        <ProjectChatHeader 
          channel={channels[activeChannel]}
          project={project}
          onCreateProgressReport={() => setShowProgressDialog(true)}
          onCreateSafetyAlert={() => setShowSafetyDialog(true)}
        />
        
        <ProjectChatMessages 
          messages={filteredMessages}
          currentUser={currentUser}
          onReaction={handleReaction}
          onReply={handleReply}
          onApprovalRequest={handleApprovalRequest}
        />
        
        <ProjectChatInput 
          onSendMessage={handleSendMessage}
          location={location}
          supportedTypes={['text', 'image', 'file', 'voice', 'progress_report']}
        />
      </div>
      
      {/* Dialogi */}
      <ProgressReportDialog 
        open={showProgressDialog}
        onClose={() => setShowProgressDialog(false)}
        taskId={selectedTaskId}
        location={location}
      />
      
      <SafetyAlertDialog 
        open={showSafetyDialog}
        onClose={() => setShowSafetyDialog(false)}
        location={location}
      />
    </div>
  )
}
```

### **2. ProgressReportDialog.tsx** (Raportowanie postępu)
```tsx
export function ProgressReportDialog({ taskId, location, open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>📊 Raport Postępu Prac</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {/* Procent ukończenia */}
          <div className="space-y-2">
            <Label>Procent ukończenia</Label>
            <Slider 
              value={[progress]} 
              onValueChange={([value]) => setProgress(value)}
              max={100}
              step={5}
            />
            <div className="text-center text-lg font-semibold">{progress}%</div>
          </div>
          
          {/* Opis prac */}
          <div className="space-y-2">
            <Label>Opis wykonanych prac</Label>
            <Textarea 
              placeholder="Opisz co zostało wykonane..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          {/* Zdjęcia przed/po */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Zdjęcia PRZED</Label>
              <PhotoCapture 
                photos={photosBefore}
                onPhotosChange={setPhotosBefore}
                location={location}
                maxPhotos={5}
              />
            </div>
            <div>
              <Label>Zdjęcia PO</Label>
              <PhotoCapture 
                photos={photosAfter}
                onPhotosChange={setPhotosAfter}
                location={location}
                maxPhotos={5}
              />
            </div>
          </div>
          
          {/* Materiały użyte */}
          <MaterialUsageInput 
            materials={materialsUsed}
            onMaterialsChange={setMaterialsUsed}
          />
          
          {/* Problemy/uwagi */}
          <div className="space-y-2">
            <Label>Problemy lub uwagi</Label>
            <Textarea 
              placeholder="Opcjonalnie: opisz napotkane problemy..."
              value={issues}
              onChange={(e) => setIssues(e.target.value)}
            />
          </div>
          
          {/* Kontrola jakości */}
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={qualityOK}
              onCheckedChange={setQualityOK}
            />
            <Label>Potwierdzam zgodność z wymaganiami jakości</Label>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Anuluj</Button>
            <Button type="submit">📊 Wyślij Raport</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

### **3. SafetyAlertDialog.tsx** (Alerty BHP)
```tsx
export function SafetyAlertDialog({ location, open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-red-600">⚠️ Alert BHP</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {/* Typ incydentu */}
          <div className="space-y-2">
            <Label>Typ incydentu</Label>
            <Select value={alertType} onValueChange={setAlertType}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz typ..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="accident">🚨 Wypadek</SelectItem>
                <SelectItem value="near_miss">⚠️ Sytuacja niebezpieczna</SelectItem>
                <SelectItem value="unsafe_condition">🔧 Niebezpieczny stan</SelectItem>
                <SelectItem value="equipment_issue">⚙️ Problem z sprzętem</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Poziom ważności */}
          <div className="space-y-2">
            <Label>Poziom ważności</Label>
            <RadioGroup value={severity} onValueChange={setSeverity}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" />
                <Label>🟢 Niski</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" />
                <Label>🟡 Średni</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" />
                <Label>🟠 Wysoki</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="critical" />
                <Label>🔴 Krytyczny</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Lokalizacja */}
          <div className="space-y-2">
            <Label>Lokalizacja na budowie</Label>
            <Input 
              placeholder="np. Rusztowanie sektor A3, Piętro 2..."
              value={locationDescription}
              onChange={(e) => setLocationDescription(e.target.value)}
            />
            {location && (
              <div className="text-sm text-gray-600">
                📍 GPS: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </div>
            )}
          </div>
          
          {/* Opis */}
          <div className="space-y-2">
            <Label>Opis sytuacji</Label>
            <Textarea 
              placeholder="Opisz szczegółowo co się stało..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          {/* Zdjęcia */}
          <div className="space-y-2">
            <Label>Zdjęcia (dowody)</Label>
            <PhotoCapture 
              photos={photos}
              onPhotosChange={setPhotos}
              location={location}
              maxPhotos={10}
            />
          </div>
          
          {/* Natychmiastowe działania */}
          <div className="space-y-2">
            <Label>Podjęte natychmiastowe działania</Label>
            <Textarea 
              placeholder="Opisz co zostało już zrobione..."
              value={immediateAction}
              onChange={(e) => setImmediateAction(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Anuluj</Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              🚨 Wyślij Alert
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 🔄 HOOKS I SERVICES

### **1. useProjectCommunication.ts**
```typescript
export function useProjectCommunication(projectId: string) {
  const [messages, setMessages] = useState<BuildingChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  
  // Subscribe do real-time komunikacji projektu
  useEffect(() => {
    const channel = supabase
      .channel(`project-${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public', 
        table: 'project_messages',
        filter: `project_id=eq.${projectId}`
      }, (payload) => {
        setMessages(current => [...current, payload.new])
        
        // Automatyczne powiadomienia
        if (payload.new.type === 'safety_alert') {
          showSafetyNotification(payload.new)
        }
      })
      .subscribe()
      
    return () => supabase.removeChannel(channel)
  }, [projectId])
  
  const sendMessage = async (message: Partial<BuildingChatMessage>) => {
    const { data, error } = await supabase
      .from('project_messages')
      .insert({
        ...message,
        project_id: projectId,
        sender: user.email,
        timestamp: new Date().toISOString()
      })
      
    if (error) throw error
    return data
  }
  
  const createProgressReport = async (report: ProgressReport) => {
    // Tworzenie raportu + wiadomość
    const message = await sendMessage({
      type: 'progress_update',
      message: `📊 Raport postępu: ${report.progressPercentage}% ukończone`,
      taskId: report.taskId,
      requiresApproval: true
    })
    
    // Powiadomienie supervisora
    await notifySupervisor(report)
    
    return message
  }
  
  return {
    messages,
    loading,
    sendMessage,
    createProgressReport
  }
}
```

### **2. useGeofencing.ts**
```typescript
export function useGeofencing(buildingSites: BuildingSite[]) {
  const [currentZone, setCurrentZone] = useState<SafetyZone | null>(null)
  const { location } = useGeolocation()
  
  useEffect(() => {
    if (!location) return
    
    // Sprawdź czy jesteś w strefie bezpieczeństwa
    const zone = findCurrentZone(location, buildingSites)
    
    if (zone && zone !== currentZone) {
      setCurrentZone(zone)
      
      // Trigger geofence notifications
      if (zone.type === 'danger') {
        showSafetyWarning(`⚠️ Weszłeś w strefę niebezpieczną: ${zone.name}`)
      }
      
      if (zone.type === 'restricted') {
        showAccessWarning(`🚫 Strefa o ograniczonym dostępie: ${zone.name}`)
      }
    }
  }, [location, buildingSites])
  
  return { currentZone }
}
```

---

## 📱 INTEGRACJA Z ISTNIEJĄCĄ APLIKACJĄ

### **1. Rozszerzenie TaskCard.tsx**
```tsx
// Dodanie komunikacji do istniejącego TaskCard
export function TaskCard({ task }: { task: Task }) {
  const [showChat, setShowChat] = useState(false)
  const { messages } = useTaskCommunication(task.id)
  const unreadCount = messages.filter(m => !m.read).length
  
  return (
    <Card>
      {/* Istniejący content TaskCard */}
      
      {/* NOWY: Sekcja komunikacji */}
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">💬 Komunikacja</h4>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowChat(true)}
            >
              Otwórz czat
            </Button>
          </div>
        </div>
        
        {/* Ostatnie wiadomości (preview) */}
        {messages.slice(-2).map(msg => (
          <div key={msg.id} className="text-sm text-gray-600 mt-2">
            <strong>{msg.sender}:</strong> {msg.message.substring(0, 50)}...
          </div>
        ))}
      </div>
      
      {/* Dialog czatu zadania */}
      <TaskChatDialog 
        open={showChat}
        onClose={() => setShowChat(false)}
        taskId={task.id}
      />
    </Card>
  )
}
```

### **2. Rozszerzenie Dashboard.tsx**
```tsx
// Dodanie widget'u komunikacji do Dashboard
export function Dashboard() {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Istniejące widget'y */}
      
      {/* NOWY: Widget komunikacji */}
      <Card className="col-span-6">
        <CardHeader>
          <CardTitle>💬 Najnowsze Komunikaty</CardTitle>
        </CardHeader>
        <CardContent>
          <CommunicationWidget />
        </CardContent>
      </Card>
      
      {/* NOWY: Widget alertów BHP */}
      <Card className="col-span-6">
        <CardHeader>
          <CardTitle>⚠️ Alerty BHP</CardTitle>
        </CardHeader>
        <CardContent>
          <SafetyAlertsWidget />
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🎯 REZULTAT KOŃCOWY

Po implementacji będziemy mieli:

### **✅ DLA PRACOWNIKÓW BUDOWLANYCH:**
- 📱 Czat zespołowy per projekt z kanałami (Główny, BHP, Jakość, Logistyka)
- 📊 Łatwe raportowanie postępu z telefonu (zdjęcia + opis + % ukończenia)
- ⚠️ Szybkie zgłaszanie problemów BHP z lokalizacją GPS
- 🔔 Powiadomienia push o nowych zadaniach, alertach, przypomnieniach
- 📸 Dokumentacja fotograficzna z automatycznym tagowaniem lokalizacji

### **✅ DLA KIEROWNIKÓW/SUPERVISORÓW:**
- 👀 Real-time podgląd postępu wszystkich zadań
- ✅ System zatwierdzania ukończonych prac (workflow approval)
- 📋 Dashboard z alertami wymagającymi uwagi
- 📊 Raporty jakości i compliance
- 🎯 Zarządzanie zespołem z poziomu komunikatora

### **✅ DLA PRACODAWCÓW/MANAGERÓW:**
- 📈 Podgląd postępu wszystkich projektów
- 💰 Kontrola nad płatnościami (tylko zatwierdzone zadania)
- 📊 Analizy produktywności i jakości
- ⚠️ Monitoring bezpieczeństwa i compliance
- 💼 Integration z systemem księgowym

### **✅ DLA KSIĘGOWYCH:**
- 📄 Automatyczne dokumenty do rozliczenia (raporty postępu + zdjęcia)
- ✅ Lista zatwierdzonych zadań gotowych do zapłaty
- 📊 Raporty godzin pracy i materiałów
- 💸 Integration z systemem płatności
- 📋 Compliance dokumentacja

---

## 🚀 HARMONOGRAM WDROŻENIA

**Tydzień 1-2:** Podstawy komunikacji (czat + powiadomienia)
**Tydzień 3-4:** Raportowanie postępu + workflow zatwierdzania  
**Tydzień 5-6:** System BHP + geolokalizacja
**Tydzień 7:** Role i uprawnienia + integracje
**Tydzień 8:** Testy i optymalizacja

**CAŁKOWITY CZAS:** 8 tygodni (2 miesiące)

**PRZEWAGA KONKURENCYJNA:** 
🎯 Pierwszy system w Polsce łączący komunikację zespołową z zarządzaniem projektami budowlanymi + compliance + geolokalizacja!

To jest game-changer dla branży budowlanej! 🏗️🚀