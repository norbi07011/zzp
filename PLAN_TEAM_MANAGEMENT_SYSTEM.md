# 📋 PLAN: System Zarządzania Drużynami/Projektami

## 🎯 WIZJA SYSTEMU
Kompleksowy system zarządzania projektami budowlanymi z funkcjami:
- Zarządzanie grupami/drużynami
- Zadania z dowodami wykonania
- Kalendarz i planowanie
- Komunikacja zespołowa
- Rejestr czasu pracy
- Kontrola jakości
- Inteligentne dashboardy

---

## 🏗️ ARCHITEKTURA SYSTEMU

### Core Entities
```typescript
interface Group {
  id: string
  name: string
  description?: string
  projectAddress?: string
  ownerId: string
  settings: GroupSettings
  createdAt: Date
  status: 'active' | 'archived'
}

interface Membership {
  id: string
  groupId: string
  userId: string
  role: 'owner' | 'manager' | 'member' | 'viewer'
  scopes: Permission[]
  joinedAt: Date
  status: 'active' | 'pending' | 'suspended'
}

interface GroupInvite {
  id: string
  groupId: string
  invitedBy: string
  email: string
  role: MemberRole
  scopes: Permission[]
  token: string
  expiresAt: Date
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
}
```

---

## 🚀 IMPLEMENTACJA - ETAPY

### 📍 ETAP 1: FUNDAMENT (MVP - 3-4 tygodnie)

#### 1.1 Database Schema
```sql
-- Groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  project_address TEXT,
  owner_id UUID REFERENCES auth.users(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active'
);

-- Memberships table
CREATE TABLE group_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'manager', 'member', 'viewer')),
  scopes JSONB DEFAULT '[]',
  joined_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active',
  UNIQUE(group_id, user_id)
);

-- Invites table
CREATE TABLE group_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL,
  scopes JSONB DEFAULT '[]',
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending'
);
```

#### 1.2 Core Services
- **GroupService**: CRUD dla grup
- **MembershipService**: Zarządzanie członkostwem
- **InviteService**: System zaproszeń
- **PermissionService**: Sprawdzanie uprawnień

#### 1.3 Podstawowy UI
- Lista grup użytkownika
- Tworzenie/edycja grupy
- Zarządzanie członkami
- System zaproszeń

### 📍 ETAP 2: ZADANIA (3-4 tygodnie)

#### 2.1 Database Schema - Tasks
```sql
CREATE TABLE group_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'done', 'blocked')),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  due_date TIMESTAMP,
  construction_address TEXT,
  room_location TEXT,
  square_meters DECIMAL,
  color_paint VARCHAR(100),
  client_order_number VARCHAR(100),
  completion_proof_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES group_tasks(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INTEGER,
  file_type VARCHAR(100),
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES group_tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.2 Features
- **TaskManager**: CRUD zadań z filtrami
- **FileUpload**: Obsługa załączników (zdjęcia z budowy)
- **Comments**: System komentarzy
- **TaskBoard**: Widok Kanban
- **TaskList**: Widok listy z filtrami

### 📍 ETAP 3: KALENDARZ I PLANOWANIE (2-3 tygodnie)

#### 3.1 Database Schema - Calendar
```sql
CREATE TABLE group_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  event_type VARCHAR(20) DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'deadline', 'event', 'vacation')),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES group_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  UNIQUE(event_id, user_id)
);
```

#### 3.2 Features
- **Calendar Views**: Miesiąc/Tydzień/Dzień
- **Event Management**: Tworzenie/edycja wydarzeń
- **Invitations**: Zaproszenia do wydarzeń
- **Team Availability**: Widok dostępności zespołu

### 📍 ETAP 4: KOMUNIKACJA (2-3 tygodnie)

#### 4.1 Database Schema - Chat
```sql
CREATE TABLE group_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) DEFAULT 'general',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE channel_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES group_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text',
  attachments JSONB DEFAULT '[]',
  mentions JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE message_read_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES channel_messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);
```

#### 4.2 Features
- **Real-time Chat**: Supabase Realtime
- **@Mentions**: System wzmianek
- **File Sharing**: Udostępnianie plików
- **Read Receipts**: Potwierdzenia przeczytania

### 📍 ETAP 5: REJESTR CZASU PRACY (2 tygodnie)

#### 5.1 Database Schema - Time Tracking
```sql
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  group_id UUID REFERENCES groups(id),
  task_id UUID REFERENCES group_tasks(id),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_minutes INTEGER,
  description TEXT,
  mood_emoji VARCHAR(10),
  location JSONB, -- GPS coordinates
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE daily_work_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  group_id UUID REFERENCES groups(id),
  work_date DATE NOT NULL,
  planned_start TIME,
  planned_end TIME,
  actual_start TIME,
  actual_end TIME,
  break_minutes INTEGER DEFAULT 0,
  notes TEXT,
  UNIQUE(user_id, group_id, work_date)
);
```

#### 5.2 Features
- **Timer**: Start/Stop przy zadaniach
- **Daily Schedule**: Planowanie dnia pracy
- **Mood Tracking**: Emoji nastroju
- **Location Tracking**: GPS (opcjonalnie)

### 📍 ETAP 6: KONTROLA JAKOŚCI (2 tygodnie)

#### 6.1 Database Schema - Quality Control
```sql
CREATE TABLE quality_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  checklist_items JSONB NOT NULL, -- array of checklist items
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES group_tasks(id),
  template_id UUID REFERENCES quality_templates(id),
  checked_by UUID REFERENCES auth.users(id),
  checklist_results JSONB NOT NULL, -- results for each item
  overall_score DECIMAL(3,2), -- 0.00-1.00
  notes TEXT,
  photos JSONB DEFAULT '[]',
  checked_at TIMESTAMP DEFAULT NOW()
);
```

### 📍 ETAP 7: BEZPIECZEŃSTWO I INCYDENTY (1-2 tygodnie)

#### 7.1 Database Schema - Safety
```sql
CREATE TABLE safety_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id),
  reported_by UUID REFERENCES auth.users(id),
  incident_type VARCHAR(50) NOT NULL, -- accident, hazard, malfunction
  severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  location TEXT,
  incident_date TIMESTAMP NOT NULL,
  photos JSONB DEFAULT '[]',
  actions_taken TEXT,
  status VARCHAR(20) DEFAULT 'open',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 📍 ETAP 8: ZAAWANSOWANE FUNKCJE (3-4 tygodnie)

#### 8.1 Features
- **Advanced Dashboard**: KPI, wykresy, analityka
- **Automation Rules**: Reguły automatyzacji
- **Templates**: Szablony grup i zadań
- **Export/Reports**: PDF, CSV exports
- **Notifications**: Email, Push, SMS
- **Webhooks**: Integracje zewnętrzne

### 📍 ETAP 9: INTEGRACJE (2-3 tygodnie)

#### 9.1 External Integrations
- **WhatsApp/Telegram**: Powiadomienia
- **Google Calendar**: Sync kalendarza
- **Email**: Resend integration
- **File Storage**: Enhanced file management
- **GPS/Maps**: Geolocation features

---

## 🎨 UI/UX STRUKTURA

### Main Navigation
```
📊 Dashboard
📋 Zadania
📅 Kalendarz
👥 Zespół
💬 Chat
⚙️ Ustawienia
```

### Dashboard Layout
```
┌─────────────────────────────────────────┐
│ 🚀 Szybkie Akcje                       │
│ [+ Zadanie] [+ Wydarzenie] [+ Zdjęcie]  │
├─────────────────────────────────────────┤
│ 📊 KPI Summary                         │
│ Tasks: 15 open | Events: 3 today       │
├─────────────────────────────────────────┤
│ 📈 Activity Chart                      │
│ ████████████████████                    │
├─────────────────────────────────────────┤
│ 🔥 Urgent Items                        │
│ • Task XYZ (due tomorrow)              │
│ • Meeting at 14:00                     │
└─────────────────────────────────────────┘
```

---

## 🧪 TESTOWANIE

### Unit Tests
- Services logic
- Permission checks
- Data validation

### Integration Tests
- API endpoints
- Database operations
- Real-time features

### E2E Tests
- User workflows
- Cross-browser compatibility
- Mobile responsiveness

---

## 📱 MOBILE CONSIDERATIONS

### Progressive Web App (PWA)
- Offline capability
- Push notifications
- Camera access (zdjęcia z budowy)
- GPS location

### Native Features
- Photo capture with metadata
- Background location tracking
- Voice notes
- Biometric authentication

---

## 🔐 SECURITY & PERMISSIONS

### Permission Matrix
```
                Owner Manager Member Viewer
Create Group      ✅     ❌     ❌     ❌
Invite Users      ✅     ✅     ❌     ❌
Create Tasks      ✅     ✅     ✅     ❌
Edit Tasks        ✅     ✅     ✅*    ❌
View Reports      ✅     ✅     ✅*    ✅
Manage Settings   ✅     ❌     ❌     ❌

*Only own tasks
```

### Data Security
- Row Level Security (RLS)
- Encrypted file storage
- Audit logging
- GDPR compliance

---

## 📊 METRYKI SUKCESU

### KPIs do monitorowania
- **Adoption Rate**: % użytkowników aktywnych
- **Task Completion**: Średni czas realizacji zadań
- **Team Engagement**: Aktywność w komunikacji
- **Quality Score**: Średnie wyniki kontroli jakości
- **Time Tracking**: Dokładność rejestracji czasu
- **User Satisfaction**: NPS score

---

## 🚀 DEPLOYMENT STRATEGY

### Phases
1. **Alpha**: Internal testing (1-2 groups)
2. **Beta**: Selected clients (5-10 groups)
3. **Soft Launch**: Limited public access
4. **Full Launch**: Complete rollout

### Infrastructure
- Supabase for backend
- Vercel for frontend hosting
- CDN for file storage
- Monitoring & logging setup

---

## 💰 BUSINESS MODEL

### Pricing Tiers
- **Free**: 1 group, 5 members, basic features
- **Pro**: Unlimited groups, advanced features, €29/month
- **Enterprise**: Custom features, SLA, custom pricing

### Revenue Streams
- Subscription fees
- Premium integrations
- Professional services
- White-label solutions

---

## 🔮 ROADMAPA PRZYSZŁOŚCI

### Phase 2 Features
- AI-powered task assignment
- Predictive analytics
- IoT sensor integration
- AR/VR support for construction
- Blockchain for contract management
- Machine learning for quality prediction

### Long-term Vision
Stać się liderem w zarządzaniu projektami budowlanymi w Polsce i Europie, z pełną automatyzacją procesów i AI-powered insights.

---

## ✅ NEXT STEPS

1. **Approve Plan**: Review and confirm approach
2. **Setup Project**: Initialize repository structure
3. **Design Database**: Finalize schema design
4. **Create Wireframes**: UI/UX mockups
5. **Start Development**: Begin with MVP (Etap 1)

---

*Plan stworzony: 29 października 2025*
*Estimated Timeline: 20-25 tygodni (5-6 miesięcy)*
*Team Size: 2-4 developers*