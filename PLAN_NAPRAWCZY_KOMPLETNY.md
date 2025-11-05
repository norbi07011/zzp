# 🎯 PLAN NAPRAWCZY ZZP WERKPLAATS - PAŹDZIERNIK 2025

**Data utworzenia:** 31.10.2025  
**Status:** 🔴 AKTYWNY - DO ZREALIZOWANIA

---

## 📊 STAN OBECNY

### ✅ CO DZIAŁA:
- Database: 101 tabel, podstawowa struktura OK
- Invite system: Zaproszenia do projektów działają
- AddToTeamButton: Komponent gotowy (3 statusy: członek/zaproszony/dodaj)
- Integracje: WorkerSearch ✅, AccountantSearchPage ✅

### ❌ CO NIE DZIAŁA:
- **Worker widzi funkcje które nie powinien mieć** ← NOWY BUG!
- Brak przycisku w 80% miejsc gdzie powinien być
- Księgowy nie może wyszukiwać pracowników
- Pracownik nie może wyszukiwać pracodawców
- Brak komunikacji bezpośredniej (wiadomości)
- 27 tabel bez RLS
- **TeamDashboard używa projects[0] zamiast selektora** ← KRYTYCZNY BUG!
- Chat pokazuje tylko wiadomości z 1. projektu
- **Brak role checks w TeamDashboard** ← SECURITY BUG!

---

## 🔥 FAZA -1: ROLE CHECKS (SUPER PRIORYTET!) ⏱️ 1h

### -1.1 Sprawdź user.role w AuthContext ⏱️ 5 min
**Problem:** Nie wiadomo czy `user.role` w ogóle istnieje i działa!

**Lokalizacja:** `contexts/AuthContext.tsx`

**Test:**
```typescript
// W dowolnym komponencie dodaj tymczasowo:
import { useAuth } from './contexts/AuthContext';

const { user } = useAuth();

useEffect(() => {
  console.log('🔍 User role test:', user?.role);
  console.log('🔍 User data:', user);
}, [user]);
```

**Jeśli `user.role` = undefined:**
- ❌ WSZYSTKIE role checks failują!
- ❌ Worker widzi funkcje employer/accountant!
- 🛠️ NAPRAW NAJPIERW - dodaj `determineUserRole()` (patrz FAZA 4.1)

**Jeśli `user.role` działa (np. "worker", "employer"):**
- ✅ Możemy przejść do naprawy role checks
- ✅ Przejdź do FAZA -1.2

---

### -1.2 TeamDashboard - Dodaj role checks ⏱️ 30 min
**Problem:** Worker widzi przyciski "Zaproś członka", "Szybkie akcje", zakładkę "Zaproszenia"

**Lokalizacja:** `components/TeamDashboard.tsx`

**REGUŁY BIZNESOWE:**
- Worker: ❌ NIE MOŻE zapraszać, ❌ NIE MOŻE zarządzać projektem
- Employer/Accountant: ✅ MOŻE zapraszać, ✅ MOŻE zarządzać

**Fix - KROK 1: Dodaj useAuth (linia 1):**
```typescript
import React, { useState, useEffect, useRef } from 'react';
import { useTeamDashboard, Project as TeamProject } from '../hooks/useTeamDashboard';
import { useAuth } from '../contexts/AuthContext';  // ✅ DODAJ
```

**Fix - KROK 2: Pobierz user (linia 38):**
```typescript
const TeamDashboard: React.FC = () => {
  const { user } = useAuth();  // ✅ DODAJ
  const { projects, stats, activities, notifications, loading, error } = useTeamDashboard();
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  // ...
```

**Fix - KROK 3: QuickActions - ukryj "Zaproś" dla worker (linia 97):**
```typescript
// BYŁO:
<button onClick={() => { setViewMode('invites'); setShowQuickActions(false); }}>
  <span>Zaproś członka</span>
</button>

// POWINNO BYĆ:
{(user?.role === 'employer' || user?.role === 'accountant') && (
  <button onClick={() => { setViewMode('invites'); setShowQuickActions(false); }}>
    <span>Zaproś członka</span>
  </button>
)}
```

**Fix - KROK 4: Ukryj przycisk "Szybkie akcje" dla worker (linia 408):**
```typescript
// BYŁO:
<div className="flex items-center space-x-4">
  <div className="relative" ref={quickActionsRef}>
    <button onClick={() => setShowQuickActions(!showQuickActions)}>
      <span>Szybkie akcje</span>
    </button>
  </div>
</div>

// POWINNO BYĆ:
<div className="flex items-center space-x-4">
  {(user?.role === 'employer' || user?.role === 'accountant') && (
    <div className="relative" ref={quickActionsRef}>
      <button onClick={() => setShowQuickActions(!showQuickActions)}>
        <span>Szybkie akcje</span>
      </button>
    </div>
  )}
</div>
```

**Fix - KROK 5: Filtruj taby po roli (linia 428):**
```typescript
// BYŁO:
{[
  { id: 'overview', label: 'Przegląd', icon: '📊' },
  { id: 'projects', label: 'Projekty', icon: '📁' },
  { id: 'tasks', label: 'Zadania', icon: '✓' },
  { id: 'calendar', label: 'Kalendarz', icon: '📅' },
  { id: 'team', label: 'Zespół', icon: '👥' },
  { id: 'invites', label: 'Zaproszenia', icon: '✉️' },  // ❌ WORKER WIDZI!
  { id: 'chat', label: 'Czat', icon: '💬' },
  { id: 'files', label: 'Pliki', icon: '📎' }
].map((tab) => (...))}

// POWINNO BYĆ:
{[
  { id: 'overview', label: 'Przegląd', icon: '📊', roles: ['worker', 'employer', 'accountant'] },
  { id: 'projects', label: 'Projekty', icon: '📁', roles: ['worker', 'employer', 'accountant'] },
  { id: 'tasks', label: 'Zadania', icon: '✓', roles: ['worker', 'employer', 'accountant'] },
  { id: 'calendar', label: 'Kalendarz', icon: '📅', roles: ['worker', 'employer', 'accountant'] },
  { id: 'team', label: 'Zespół', icon: '👥', roles: ['worker', 'employer', 'accountant'] },
  { id: 'invites', label: 'Zaproszenia', icon: '✉️', roles: ['employer', 'accountant'] },  // ✅ BEZ WORKER!
  { id: 'chat', label: 'Czat', icon: '💬', roles: ['worker', 'employer', 'accountant'] },
  { id: 'files', label: 'Pliki', icon: '📎', roles: ['worker', 'employer', 'accountant'] }
]
  .filter(tab => !tab.roles || tab.roles.includes(user?.role || ''))  // ✅ FILTRUJ!
  .map((tab) => (...))}
```

**Fix - KROK 6: InvitesManager - showInviteButton z role check (linia 508):**
```typescript
// BYŁO:
<InvitesManager 
  projectId={projects[0].id} 
  projectName={projects[0].name}
  showInviteButton={true}  // ❌ ZAWSZE TRUE
/>

// POWINNO BYĆ:
<InvitesManager 
  projectId={projects[0].id} 
  projectName={projects[0].name}
  showInviteButton={user?.role === 'employer' || user?.role === 'accountant'}  // ✅ TYLKO DLA MANAGER
/>
```

**Weryfikacja:**
- [ ] Worker NIE WIDZI przycisku "Szybkie akcje"
- [ ] Worker NIE WIDZI zakładki "Zaproszenia"
- [ ] Worker NIE WIDZI opcji "Zaproś członka" w Quick Actions
- [ ] Employer/Accountant WIDZI wszystkie funkcje
- [ ] Console bez błędów TypeScript

---

### -1.3 InvitesManager - Dodaj role check ⏱️ 15 min
**Problem:** Przycisk "Zaproś członka" pokazuje się bez sprawdzenia roli użytkownika

**Lokalizacja:** `components/InvitesManager.tsx`

**Fix - KROK 1: Dodaj useAuth (linia 1):**
```typescript
import React from 'react';
import { useInvites, type ProjectInvite } from '../hooks/useInvites';
import { InviteMemberModal } from './InviteMemberModal';
import { useAuth } from '../contexts/AuthContext';  // ✅ DODAJ
```

**Fix - KROK 2: Pobierz user (linia 20):**
```typescript
export function InvitesManager({ projectId, projectName, showInviteButton = true }: InvitesManagerProps) {
  const { user } = useAuth();  // ✅ DODAJ
  const {
    sentInvites,
    receivedInvites,
    // ...
```

**Fix - KROK 3: Sprawdź rolę przed pokazaniem przycisku (linia 147):**
```typescript
// BYŁO:
{showInviteButton && projectId && (
  <button onClick={() => setShowInviteModal(true)}>
    Zaproś członka
  </button>
)}

// POWINNO BYĆ:
{showInviteButton && 
 projectId && 
 (user?.role === 'employer' || user?.role === 'accountant') && (  // ✅ SPRAWDŹ ROLĘ
  <button onClick={() => setShowInviteModal(true)}>
    Zaproś członka
  </button>
)}
```

**Weryfikacja:**
- [ ] Worker NIE WIDZI przycisku "Zaproś członka" nawet jeśli showInviteButton=true
- [ ] Employer/Accountant WIDZI przycisk gdy showInviteButton=true
- [ ] Console bez błędów

---

### -1.4 TaskList/Calendar - Sprawdź role checks ⏱️ 20 min
**Problem:** Nie wiadomo czy worker może dodawać zadania/wydarzenia

**PYTANIE BIZNESOWE:**
- Czy worker MOŻE dodawać zadania do projektu? ❓
- Czy worker MOŻE planować spotkania? ❓

**DECYZJA (do potwierdzenia z użytkownikiem):**
- **Opcja A:** Worker MOŻE dodawać zadania (współpraca w projekcie)
- **Opcja B:** Worker NIE MOŻE (tylko executor, otrzymuje zadania)

**Jeśli Opcja B (worker nie może):**

**Lokalizacja 1:** `components/TaskList.tsx` - sprawdź czy jest przycisk "Dodaj zadanie"
**Lokalizacja 2:** `components/Calendar.tsx` - sprawdź czy jest przycisk "Dodaj wydarzenie"

**Fix (jeśli trzeba ukryć):**
```typescript
// W TaskList.tsx:
import { useAuth } from '../contexts/AuthContext';

const { user } = useAuth();

// Przycisk "Dodaj zadanie":
{(user?.role === 'employer' || user?.role === 'accountant') && (
  <button onClick={openAddTaskModal}>
    Dodaj zadanie
  </button>
)}

// Podobnie w Calendar.tsx
```

**Weryfikacja:**
- [ ] Worker widzi tylko READ-ONLY view (jeśli Opcja B)
- [ ] Worker może dodawać (jeśli Opcja A)
- [ ] Employer/Accountant może dodawać (zawsze)

---

## 🔴 FAZA 0: SELEKTOR PROJEKTU (PRIORYTET #2!) ⏱️ 30 min

### 0.1 TeamDashboard - Dodaj selektor projektu
**Problem:** Wszystkie komponenty używają `projects[0]` - pokazują dane tylko z pierwszego projektu!

**Lokalizacja:** `components/TeamDashboard.tsx`

**Bug dotyczy:**
- Zadania (TaskList) - linia 471
- Kalendarz (Calendar) - linia 483
- Zespół (TeamMembers) - linia 495
- Zaproszenia (InvitesManager) - linia 508-509
- **💬 Czat (Chat)** - linia 523 ← TUTAJ WIADOMOŚCI!
- Pliki (FileManagerSimple) - linia 544

**Fix - KROK 1: Dodaj state dla wybranego projektu:**
```typescript
// Na początku komponentu TeamDashboard (po useState dla viewMode)
const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

// Auto-select first project
useEffect(() => {
  if (projects.length > 0 && !selectedProjectId) {
    setSelectedProjectId(projects[0].id);
  }
}, [projects, selectedProjectId]);
```

**Fix - KROK 2: Dodaj dropdown nad tabami:**
```typescript
// Po nagłówku "Panel Drużyny", przed tabami
{projects.length > 1 && (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Aktywny projekt:
    </label>
    <select
      value={selectedProjectId || ''}
      onChange={(e) => setSelectedProjectId(e.target.value)}
      className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          📁 {project.name} {project.status === 'active' ? '🟢' : '⚪'}
        </option>
      ))}
    </select>
  </div>
)}
```

**Fix - KROK 3: Zamień projects[0] na selectedProjectId (7 miejsc):**

```typescript
// BYŁO (linia 471):
<TaskList projectId={projects[0].id} />

// POWINNO BYĆ:
{selectedProjectId && <TaskList projectId={selectedProjectId} />}

// BYŁO (linia 483):
<Calendar projectId={projects[0].id} />

// POWINNO BYĆ:
{selectedProjectId && <Calendar projectId={selectedProjectId} />}

// BYŁO (linia 495):
<TeamMembers projectId={projects[0].id} />

// POWINNO BYĆ:
{selectedProjectId && <TeamMembers projectId={selectedProjectId} />}

// BYŁO (linia 508-509):
<InvitesManager 
  projectId={projects[0].id} 
  projectName={projects[0].name}
/>

// POWINNO BYĆ:
{selectedProjectId && (
  <InvitesManager 
    projectId={selectedProjectId} 
    projectName={projects.find(p => p.id === selectedProjectId)?.name || ''}
  />
)}

// BYŁO (linia 523) - ← WIADOMOŚCI CZATU!
<Chat projectId={projects[0].id} />

// POWINNO BYĆ:
{selectedProjectId && <Chat projectId={selectedProjectId} />}

// BYŁO (linia 544):
<FileManagerSimple projectId={projects.length > 0 ? projects[0].id : "..."} />

// POWINNO BYĆ:
{selectedProjectId && <FileManagerSimple projectId={selectedProjectId} />}
```

**Weryfikacja:**
- [ ] Dropdown widoczny gdy jest >1 projekt
- [ ] Zmiana projektu w dropdown aktualizuje wszystkie zakładki
- [ ] Chat pokazuje wiadomości z wybranego projektu
- [ ] Zadania/kalendarz/zespół z wybranego projektu
- [ ] Auto-select pierwszego projektu przy załadowaniu

**UWAGA:** To KRYTYCZNA naprawa - bez tego użytkownik NIE MA DOSTĘPU do danych z 2. projektu!

---

## 🔴 FAZA 1: PRZYCISKI "DODAJ DO DRUŻYNY" (3-4h)

### 1.1 WorkerProfilePage.tsx ⏱️ 30 min
**Problem:** Pracodawca/Księgowy otwiera profil pracownika, nie może go dodać do zespołu

**Lokalizacja:** `src/pages/profile/WorkerProfilePage.tsx` (816 linii)

**KROK 1: Dodaj importy (linia ~10, po innych importach):**
```typescript
// BYŁO (linia 10):
import { supabase, getCurrentUser } from '@/lib/supabase';

// DODAJ PO TYM:
import { AddToTeamButton } from '@/components/AddToTeamButton';
import { useAuth } from '@/contexts/AuthContext';
```

**KROK 2: Pobierz auth context (linia ~13, w komponencie):**
```typescript
// BYŁO (linia 12-13):
export const WorkerProfilePage: React.FC = () => {
  const navigate = useNavigate();

// DODAJ:
export const WorkerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();  // ✅ pobierz zalogowanego użytkownika
```

**KROK 3: Znajdź gdzie renderuje się profil (szukaj sekcji "Kontakt" lub "O pracowniku"):**
```bash
# Sprawdź strukturę:
grep -n "Kontakt\|Contact" src/pages/profile/WorkerProfilePage.tsx
```

**KROK 4: Dodaj przycisk "Dodaj do zespołu" (PRZED sekcją kontaktu):**
```typescript
{/* NOWA SEKCJA - Zarządzanie zespołem */}
{(authUser?.role === 'employer' || authUser?.role === 'accountant') && profile.user_id && (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      Zarządzanie zespołem
    </h3>
    <p className="text-sm text-gray-600 mb-4">
      Zaproś {profile.first_name} do projektu zespołowego
    </p>
    <AddToTeamButton 
      userId={profile.user_id}
      userEmail={profile.email}
      userType="worker"
      displayName={`${profile.first_name} ${profile.last_name}`}
      avatarUrl={profile.avatar_url}
      className="w-full"
    />
  </div>
)}

{/* Istniejąca sekcja kontaktu poniżej... */}
```

**UWAGA:** Sprawdź czy pole nazywa się `user_id` czy `profile_id` - możliwe że WorkerProfilePage używa innej konwencji!

**Weryfikacja:**
- [ ] Import AddToTeamButton bez błędów TypeScript
- [ ] Import useAuth bez błędów TypeScript
- [ ] Przycisk widoczny dla employer/accountant (test w przeglądarce)
- [ ] Przycisk NIE widoczny dla worker (zaloguj się jako worker i sprawdź)
- [ ] Kliknięcie pokazuje modal z listą projektów
- [ ] Zaproszenie wysyłane poprawnie (sprawdź w tabeli project_invites)
- [ ] Console bez błędów

---

### 1.2 AccountantProfilePage.tsx ⏱️ 30 min
**Problem:** Pracodawca/Inny księgowy nie może dodać księgowego do zespołu

**Lokalizacja:** `pages/public/AccountantProfilePage.tsx` (498 linii)

**KROK 1: Dodaj importy (linia ~1-23, po innych importach):**
```typescript
// BYŁO (linia 1-23):
import { 
  Star, 
  MapPin, 
  Mail, 
  // ... inne ikony
} from '../../components/icons';

// DODAJ PO IMPORTACH:
import { AddToTeamButton } from '../../src/components/AddToTeamButton';
import { useAuth } from '../../src/contexts/AuthContext';
```

**KROK 2: Pobierz auth context (linia ~27, w komponencie):**
```typescript
// BYŁO (linia 27-30):
export default function AccountantProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [accountant, setAccountant] = useState<Accountant | null>(null);

// DODAJ:
export default function AccountantProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();  // ✅ auth context
  const [accountant, setAccountant] = useState<Accountant | null>(null);
```

**KROK 3: Znajdź sekcję akcji/przycisków (szukaj "Contact", "Message", itp.):**
```bash
# Sprawdź gdzie są przyciski akcji:
grep -n "MessageSquare\|Mail\|Phone" pages/public/AccountantProfilePage.tsx
```

**KROK 4: Dodaj przycisk po innych akcjach:**
```typescript
{/* Istniejące przyciski (Mail, Phone, itp.) */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
  {/* ... istniejące przyciski ... */}
</div>

{/* NOWA SEKCJA - Dodaj do zespołu */}
{(authUser?.role === 'employer' || authUser?.role === 'accountant') && accountant?.id && (
  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 mb-6">
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-gray-900 mb-1">
          Współpraca w projekcie
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          Zaproś {accountant.company_name || accountant.full_name} do projektu zespołowego
        </p>
        <AddToTeamButton 
          userId={accountant.profile_id || accountant.id}
          userEmail={accountant.email}
          userType="accountant"
          displayName={accountant.company_name || accountant.full_name}
          avatarUrl={accountant.logo_url || accountant.avatar_url}
          className="w-full"
        />
      </div>
    </div>
  </div>
)}
```

**UWAGA:** Sprawdź czy accountant object ma:
- `profile_id` czy `id`
- `company_name` czy `full_name`
- `email`
- `logo_url` czy `avatar_url`

**Debug helper - sprawdź strukturę:**
```typescript
// Tymczasowo dodaj w useEffect po loadAccountantData:
console.log('Accountant object keys:', Object.keys(accountantData));
console.log('Accountant data:', accountantData);
```

**Weryfikacja:**
- [ ] Przycisk widoczny dla employer/accountant
- [ ] Dane księgowego poprawnie przekazane (sprawdź DevTools → Console)
- [ ] Zaproszenie tworzy się z role='admin' (sprawdź tabele project_invites)
- [ ] Modal pokazuje listę projektów
- [ ] Console bez błędów TypeScript
- [ ] Przycisk NIE widoczny dla worker

---

### 1.3 EmployerProfile.tsx ⏱️ 30 min
**Problem:** Księgowy nie może dodać pracodawcy do swojego projektu konsultacyjnego

**Lokalizacja:** `pages/employer/EmployerProfile.tsx`

**KROK 1: Sprawdź strukturę pliku:**
```bash
# Sprawdź czy to profil WŁASNY czy PODGLĄD CUDZEGO:
grep -n "getCurrentUser\|useParams" pages/employer/EmployerProfile.tsx

# Sprawdź czy są przyciski akcji:
grep -n "button\|Button" pages/employer/EmployerProfile.tsx
```

**CASE A: Jeśli to własny profil pracodawcy (currentUser):**
→ **NIE DODAWAJ** przycisku (nie można dodać siebie do zespołu!)

**CASE B: Jeśli to podgląd profilu innego pracodawcy:**

**KROK 2: Dodaj importy:**
```typescript
import { AddToTeamButton } from '@/components/AddToTeamButton';
import { useAuth } from '@/contexts/AuthContext';
```

**KROK 3: Pobierz auth context:**
```typescript
export default function EmployerProfile() {
  const { user: authUser } = useAuth();
  // ... reszta kodu
```

**KROK 4: Dodaj przycisk (TYLKO dla księgowego przeglądającego profil):**
```typescript
{/* Sprawdź czy to NIE własny profil */}
{authUser?.role === 'accountant' && 
 employer?.profile_id && 
 employer.profile_id !== authUser.id && (  // ✅ NIE własny profil
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      Współpraca biznesowa
    </h3>
    <p className="text-sm text-gray-600 mb-4">
      Zaproś {employer.company_name || employer.contact_person} do projektu konsultacyjnego
    </p>
    <AddToTeamButton 
      userId={employer.profile_id}
      userEmail={employer.contact_email}
      userType="employer"
      displayName={employer.company_name || employer.contact_person}
      avatarUrl={employer.logo_url}
      className="w-full"
    />
  </div>
)}
```

**KROK 5: Sprawdź strukturę employer object:**
```typescript
// Debug - sprawdź co jest w employer:
useEffect(() => {
  if (employer) {
    console.log('Employer fields:', Object.keys(employer));
    console.log('Employer data:', employer);
  }
}, [employer]);
```

**Możliwe nazwy pól (sprawdź!):**
- `profile_id` vs `id`
- `company_name` vs `name` vs `business_name`
- `contact_email` vs `email`
- `contact_person` vs `owner_name` vs `full_name`
- `logo_url` vs `avatar_url`

**Weryfikacja:**
- [ ] Przycisk widoczny TYLKO dla accountant
- [ ] Przycisk NIE widoczny dla własnego profilu (employer patrzy na swój profil)
- [ ] Przycisk NIE widoczny dla worker
- [ ] Dane pracodawcy (company_name, contact_email) poprawnie przekazane
- [ ] Zaproszenie z role='admin' (sprawdź w DB)
- [ ] Console bez błędów

---

### 1.4 EmployerSearchPage.tsx ⏱️ 45 min
**Problem:** Księgowy/Pracownik wyszukuje pracodawców, nie może ich dodać do zespołu

**Lokalizacja:** `pages/public/EmployerSearchPage.tsx` (210 linii)

**ANALIZA:** Plik używa `<Link to={...}>` dla całej karty (linia 145-210) → trzeba WYDZIELIĆ sekcję akcji POZA Link

**KROK 1: Dodaj importy (linia ~6, po innych importach):**
```typescript
// BYŁO (linia 1-6):
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { LoadingOverlay } from '../../components/Loading';
import { MapPin, Briefcase, Star, User } from '../../components/icons';

// DODAJ:
import { AddToTeamButton } from '@/components/AddToTeamButton';
import { useAuth } from '@/contexts/AuthContext';
```

**KROK 2: Pobierz auth context (linia ~32, w komponencie):**
```typescript
// BYŁO (linia 32-35):
export default function EmployerSearchPage() {
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

// DODAJ:
export default function EmployerSearchPage() {
  const { user: authUser } = useAuth();  // ✅ auth context
  const [employers, setEmployers] = useState<Employer[]>([]);
```

**KROK 3: ZREFAKTORUJ strukturę karty (linia 143-210):**

**BYŁO (całość w <Link>):**
```typescript
{filteredEmployers.map((employer) => (
  <Link to={`/employer/${employer.id}`} className="...">
    {/* Cała karta */}
  </Link>
))}
```

**POWINNO BYĆ (rozdziel na clickable + akcje):**
```typescript
{filteredEmployers.map((employer) => (
  <div key={employer.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden">
    {/* Clickable część */}
    <Link to={`/employer/${employer.id}`} className="block group">
      {/* Logo/Header - POZOSTAW BEZ ZMIAN (linia 149-166) */}
      <div className="h-32 bg-gradient-to-br from-amber-500 to-orange-600 relative">
        {/* ... logo content ... */}
      </div>

      {/* Content - POZOSTAW BEZ ZMIAN (linia 169-203) */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-amber-600 transition-colors">
          {employer.company_name || 'Nazwa firmy niedostępna'}
        </h3>
        {/* ... company details ... */}
      </div>
    </Link>

    {/* NOWA SEKCJA - Akcje (POZA Link!) */}
    {authUser?.role === 'accountant' && employer.profile_id && (
      <div className="px-6 pb-4 pt-0 border-t border-gray-100">
        <AddToTeamButton 
          userId={employer.profile_id}
          userEmail={employer.contact_email || ''}
          userType="employer"
          displayName={employer.company_name || employer.contact_person || 'Pracodawca'}
          avatarUrl={employer.logo_url || undefined}
          className="w-full text-sm"
        />
      </div>
    )}
  </div>
))}
```

**KROK 4: Zaktualizuj key attribute:**
```typescript
// BYŁO:
<Link key={employer.id} ...>

// POWINNO BYĆ:
<div key={employer.id} ...>  // key przeniesiony na wrapper div
```

**UWAGA:**
- Employer interface już ma `profile_id`, `contact_email`, `logo_url` (linie 7-30) ✅
- Przycisk TYLKO dla accountant (księgowy może zapraszać pracodawców)
- Worker NIE widzi (na razie - może się zmienić business-wise)

**Weryfikacja:**
- [ ] Kliknięcie w kartę (poza przyciskiem) → przekierowuje do profilu
- [ ] Przycisk "Dodaj do zespołu" widoczny TYLKO dla accountant
- [ ] Przycisk NIE przerywa navigation (działa onClick, nie preventDefault)
- [ ] Modal pokazuje listę projektów księgowego
- [ ] Zaproszenie z role='admin' (sprawdź DB: project_invites)
- [ ] Console bez błędów TypeScript

---

### 1.5 WorkerCard.tsx - FIX mock data ⏱️ 30 min
**Problem:** Komponent używa mock interface `Profile`, nie prawdziwych danych z bazy workers

**Lokalizacja:** `components/WorkerCard.tsx` (117 linii)

**ANALIZA OBECNEJ STRUKTURY:**
```typescript
// Linia 2: Import mock type
import { Profile } from '../types';

// Linia 7-10: Mock interface
interface WorkerCardProps {
  profile: Profile;  // ❌ Mock type (firstName, lastName, category, avatarUrl...)
  onReview: (profile: Profile) => void;
}

// Linia 12: Komponent używa profile.firstName, profile.lastName itp.
```

**PROBLEM:** `Profile` type to mock data, NIE prawdziwa struktura z tabeli `workers`!

**KROK 1: Sprawdź prawdziwą strukturę workers table:**
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'workers'
ORDER BY ordinal_position;
```

**Prawdziwa struktura (z poprzednich analiz):**
- `id` - UUID (primary key)
- `profile_id` - UUID (foreign key → profiles)
- `email` - TEXT
- `full_name` - TEXT (NIE firstName/lastName!)
- `avatar_url` - TEXT
- `specialization` - TEXT (zamiast category)
- `hourly_rate` - NUMERIC
- `location_city` - TEXT (zamiast location)
- `skills` - TEXT[]
- `is_verified` - BOOLEAN (zamiast isVerified)

**KROK 2: Utwórz PRAWDZIWY interface:**
```typescript
// ZAMIAST import { Profile } from '../types';

// Prawdziwy typ Worker z bazy
interface Worker {
  id: string;
  profile_id: string;      // ✅ KLUCZOWE dla AddToTeamButton
  email: string;           // ✅ KLUCZOWE dla AddToTeamButton
  full_name: string;       // zamiast firstName + lastName
  avatar_url?: string | null;
  specialization?: string | null;
  hourly_rate?: number | null;
  location_city?: string | null;
  skills?: string[] | null;
  is_verified?: boolean;
  rating?: number | null;
  years_of_experience?: number | null;
}

interface WorkerCardProps {
  worker: Worker;  // ✅ użyj prawdziwego typu
  onReview?: (worker: Worker) => void;
}
```

**KROK 3: Zaktualizuj renderowanie (linie 13-117):**
```typescript
// BYŁO:
export const WorkerCard: React.FC<WorkerCardProps> = ({ profile, onReview }) => {
  return (
    // ...
    <h3>{profile.firstName} {profile.lastName}</h3>
    <p>{profile.category}</p>
    <span>{profile.location}</span>
    // ...
  );
};

// POWINNO BYĆ:
export const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onReview }) => {
  return (
    // ...
    <h3>{worker.full_name}</h3>
    <p>{worker.specialization}</p>
    <span>{worker.location_city}</span>
    <img src={worker.avatar_url || '/default-avatar.png'} />
    {worker.is_verified && <VerifiedBadge />}
    // ...
  );
};
```

**KROK 4: Aktualizuj AddToTeamButton (jeśli jest w WorkerCard):**
```typescript
// Sprawdź czy WorkerCard MA już AddToTeamButton (linia ~5 import)
import { AddToTeamButton } from './AddToTeamButton';

// Jeśli TAK - zaktualizuj wywołanie:
<AddToTeamButton 
  userId={worker.profile_id}    // BYŁO: profile.id
  userEmail={worker.email}      // DODANE (wymagane!)
  userType="worker"             // DODANE (wymagane!)
  displayName={worker.full_name} // BYŁO: profile.firstName + lastName
  avatarUrl={worker.avatar_url} // OK
/>
```

**KROK 5: Zaktualizuj WSZYSTKIE miejsca używające WorkerCard:**
```bash
# Znajdź gdzie WorkerCard jest używany:
grep -rn "WorkerCard" src/ pages/

# Prawdopodobne miejsca:
# - WorkerSearch.tsx
# - WorkerList.tsx
# - Dashboard*.tsx
```

**Dla każdego miejsca - zaktualizuj przekazywane dane:**
```typescript
// BYŁO:
<WorkerCard 
  profile={{
    firstName: worker.first_name,  // ❌ mapowanie mock → real
    lastName: worker.last_name,
    // ...
  }}
/>

// POWINNO BYĆ:
<WorkerCard 
  worker={worker}  // ✅ bezpośrednio z bazy (SELECT * FROM workers)
/>
```

**Weryfikacja:**
- [ ] Interface `Worker` zgodny z prawdziwą strukturą DB
- [ ] Usuń import `Profile` type (mock)
- [ ] Zaktualizuj wszystkie odwołania: firstName → full_name, category → specialization
- [ ] `profile_id` i `email` ZAWSZE przekazywane do AddToTeamButton
- [ ] Console bez błędów TypeScript (sprawdź wszystkie miejsca używające WorkerCard)
- [ ] Aplikacja się kompiluje (npm run build)
- [ ] Test wizualny - karty wyświetlają prawdziwe dane

---

## 🟡 FAZA 2: ROUTING I DOSTĘPY (2-3h)

### 2.1 WorkerSearch - dostęp dla księgowego ⏱️ 30 min
**Problem:** Księgowy nie może wyszukiwać pracowników (tylko employer ma dostęp w route /workers)

**Lokalizacja:** `App.tsx` linia 152-157

**OBECNY STAN:**
```typescript
// Linia 152-157:
<Route path="/workers" element={
  <ProtectedRoute>    {/* ✅ Wymaga logowania, ale NIE sprawdza roli */}
    <WorkerSearch />
  </ProtectedRoute>
} />
```

**ANALIZA:**
- `/workers` wymaga tylko logowania (ProtectedRoute bez requiredRole)
- Teoretycznie dostępne dla WSZYSTKICH zalogowanych
- ALE: WorkerSearch może wewnętrznie blokować accountant (sprawdź plik!)

**KROK 1: Sprawdź WorkerSearch.tsx wewnętrzne checks:**
```bash
grep -n "role.*accountant\|useAuth" pages/employer/WorkerSearch.tsx
```

**Jeśli WorkerSearch MA internal role check:**
```typescript
// Usuń ten check lub dodaj accountant
if (user?.role === 'employer') { ... }  // ❌ blokuje accountant
// Zmień na:
if (user?.role === 'employer' || user?.role === 'accountant') { ... }
```

**Jeśli WorkerSearch NIE MA role check:**
→ Nie trzeba nic zmieniać w routing! Route już działa dla wszystkich.

**KROK 2: Dodaj link w nawigacji accountant:**

**Znajdź plik z nawigacją (AuthenticatedLayout?):**
```bash
# Szukaj gdzie są linki menu dla accountant:
grep -rn "accountant.*dashboard\|AccountantDashboard" src/ pages/ components/
```

**Prawdopodobnie w `components/AuthenticatedLayout.tsx` lub `pages/accountant/AccountantDashboard.tsx`:**
```typescript
// Dla roli accountant - dodaj link:
{user?.role === 'accountant' && (
  <>
    <Link to="/accountants" className="nav-link">
      <Calculator className="w-5 h-5" />
      <span>Księgowi</span>
    </Link>
    <Link to="/workers" className="nav-link">  {/* ✅ NOWY LINK */}
      <Users className="w-5 h-5" />
      <span>Pracownicy</span>
    </Link>
    <Link to="/employers" className="nav-link">
      <Briefcase className="w-5 h-5" />
      <span>Pracodawcy</span>
    </Link>
  </>
)}
```

**KROK 3: Sprawdź czy WorkerSearch używa AddToTeamButton (FAZA 1):**
```bash
grep -n "AddToTeamButton" pages/employer/WorkerSearch.tsx
```

**Jeśli TAK → OK** (FAZA 1.5 już to naprawiła)
**Jeśli NIE → Dodaj** zgodnie z FAZA 1 instrukcjami

**Weryfikacja:**
- [ ] Księgowy widzi link "Pracownicy" w menu
- [ ] Księgowy może otworzyć /workers (bez błędu 403/redirect)
- [ ] WorkerSearch wyświetla listę pracowników dla accountant
- [ ] AddToTeamButton widoczny na kartach pracowników (z FAZA 1)
- [ ] Console bez błędów

---

### 2.2 EmployerSearch - link dla pracownika ⏱️ 20 min
**Problem:** Pracownik nie może wyszukiwać pracodawców (brak linku w menu)

**OBECNY STAN:**
```typescript
// App.tsx linia 151 - route JUŻ ISTNIEJE:
<Route path="/employers" element={<EmployerSearchPage />} />
// ✅ Dostępne dla WSZYSTKICH zalogowanych (w AuthenticatedLayout)
```

**Problem:** NIE ma linku w nawigacji dla worker!

**KROK 1: Znajdź nawigację dla worker:**
```bash
# Szukaj gdzie worker ma swoje linki:
grep -rn "worker.*dashboard\|WorkerDashboard" src/ pages/ components/
```

**KROK 2: Dodaj link "Pracodawcy" dla worker:**
```typescript
// W nawigacji dla roli worker:
{user?.role === 'worker' && (
  <>
    <Link to="/feed" className="nav-link">
      <Home className="w-5 h-5" />
      <span>Feed</span>
    </Link>
    <Link to="/employers" className="nav-link">  {/* ✅ NOWY LINK */}
      <Briefcase className="w-5 h-5" />
      <span>Znajdź pracodawców</span>
    </Link>
    <Link to="/team" className="nav-link">
      <Users className="w-5 h-5" />
      <span>Moje zespoły</span>
    </Link>
  </>
)}
```

**UWAGA BIZNESOWA:**
- Worker przegląda pracodawców → szuka pracy ✅
- Ale NIE MOŻE dodawać do zespołu (to tylko employer/accountant mogą)
- EmployerSearchPage już filtruje przycisk w FAZA 1.4 (tylko accountant widzi)

**Weryfikacja:**
- [ ] Pracownik widzi "Znajdź pracodawców" w menu
- [ ] Pracownik może przeglądać oferty firm
- [ ] Pracownik NIE WIDZI przycisku "Dodaj do zespołu" (bo nie accountant)
- [ ] (Opcjonalnie) Przycisk "Aplikuj" / "Kontakt" zamiast "Dodaj do zespołu"
- [ ] Console bez błędów

---

### 2.3 "Moje zespoły" - link dla WSZYSTKICH ⏱️ 45 min
**Problem:** Brak dostępu do TeamDashboard z nawigacji (users don't know /team exists)

**OBECNY STAN:**
```typescript
// App.tsx linia 150 - route JUŻ ISTNIEJE:
<Route path="/team" element={<TeamDashboard />} />
// ✅ Dostępne dla WSZYSTKICH w AuthenticatedLayout (OK)
```

**Problem:** NIE ma linku w głównej nawigacji!

**KROK 1: Utwórz hook useInvites dla licznika:**

**Lokalizacja:** `src/hooks/useInvites.ts` (NOWY PLIK)
```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export const useInvites = () => {
  const { user } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchPendingInvites = async () => {
      const { data, error } = await supabase
        .from('project_invites')
        .select('id')
        .eq('invitee_profile_id', user.id)
        .eq('status', 'pending');

      if (!error && data) {
        setPendingCount(data.length);
      }
    };

    fetchPendingInvites();

    // Realtime subscription dla nowych zaproszeń
    const subscription = supabase
      .channel('invites-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'project_invites',
          filter: `invitee_profile_id=eq.${user.id}`
        }, 
        () => {
          fetchPendingInvites();  // Refresh count
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return { pendingCount };
};
```

**KROK 2: Dodaj link w nawigacji dla WSZYSTKICH ról:**
```typescript
// Import hooka:
import { useInvites } from '@/hooks/useInvites';

// W komponencie nawigacji:
const { pendingCount } = useInvites();

// Dla WORKER:
{user?.role === 'worker' && (
  <>
    {/* ... inne linki ... */}
    <Link to="/team" className="nav-link relative">
      <Users className="w-5 h-5" />
      <span>Moje zespoły</span>
      {pendingCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {pendingCount}
        </span>
      )}
    </Link>
  </>
)}

// Dla EMPLOYER:
{user?.role === 'employer' && (
  <>
    {/* ... inne linki ... */}
    <Link to="/team" className="nav-link relative">
      <Folder className="w-5 h-5" />
      <span>Projekty</span>
      {pendingCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {pendingCount}
        </span>
      )}
    </Link>
  </>
)}

// Dla ACCOUNTANT:
{user?.role === 'accountant' && (
  <>
    {/* ... inne linki ... */}
    <Link to="/team" className="nav-link relative">
      <Folder className="w-5 h-5" />
      <span>Projekty</span>
      {pendingCount > 0 && (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {pendingCount}
        </span>
      )}
    </Link>
  </>
)}
```

**KROK 3: Style dla badge:**
```css
/* Jeśli używasz Tailwind - klasy już gotowe */
/* Jeśli custom CSS - dodaj: */
.nav-link {
  position: relative;
}

.nav-link .badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 9999px;
  min-width: 18px;
  text-align: center;
}
```

**Weryfikacja:**
- [ ] Link "Moje zespoły" / "Projekty" widoczny dla worker
- [ ] Link widoczny dla employer
- [ ] Link widoczny dla accountant
- [ ] Badge pokazuje liczbę oczekujących zaproszeń (test: wyślij zaproszenie)
- [ ] Badge aktualizuje się real-time (test: wyślij z innego konta)
- [ ] Kliknięcie przekierowuje do /team (TeamDashboard)
- [ ] Console bez błędów

---

## 🟢 FAZA 3: KOMUNIKACJA BEZPOŚREDNIA (3-4h)

### 3.1 Sprawdź strukturę conversations ⏱️ 15 min
**Zadanie:** Zweryfikuj czy tabela conversations istnieje w bazie

**SQL:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'conversations';

-- Jeśli istnieje, sprawdź strukturę:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'conversations';
```

**Jeśli NIE ISTNIEJE:**
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  participant2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ,
  UNIQUE(participant1_id, participant2_id)
);

CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their conversations"
  ON conversations FOR SELECT
  USING (
    auth.uid() = participant1_id 
    OR auth.uid() = participant2_id
  );

CREATE POLICY "Users can see messages in their conversations"
  ON conversation_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND (participant1_id = auth.uid() OR participant2_id = auth.uid())
    )
  );
```

---

### 3.2 Dodaj przycisk "Wyślij wiadomość" ⏱️ 2h
**Lokalizacje:** WorkerProfilePage, AccountantProfilePage, EmployerProfile

**Komponent ContactButton.tsx:**
```typescript
import { MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ContactButtonProps {
  recipientId: string;
  recipientName: string;
  className?: string;
}

export const ContactButton = ({ 
  recipientId, 
  recipientName,
  className = '' 
}: ContactButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const startConversation = async () => {
    if (!user) {
      toast.error('Musisz być zalogowany');
      return;
    }
    
    try {
      // Sprawdź czy konwersacja już istnieje
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${recipientId}),and(participant1_id.eq.${recipientId},participant2_id.eq.${user.id})`)
        .single();
        
      if (existing) {
        navigate(`/messages/${existing.id}`);
        return;
      }
      
      // Utwórz nową konwersację
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          participant1_id: user.id,
          participant2_id: recipientId
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success(`Rozpoczęto rozmowę z ${recipientName}`);
      navigate(`/messages/${newConversation.id}`);
      
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error('Nie udało się rozpocząć rozmowy');
    }
  };
  
  return (
    <button 
      onClick={startConversation}
      className={`btn-secondary flex items-center gap-2 ${className}`}
    >
      <MessageSquare className="w-5 h-5" />
      Wyślij wiadomość
    </button>
  );
};
```

**Integracja w profilach:**
```typescript
// W każdym profilu - obok innych przycisków akcji
<ContactButton 
  recipientId={profile.profile_id}
  recipientName={profile.full_name || profile.company_name}
  className="w-full"
/>
```

**Weryfikacja:**
- [ ] Przycisk widoczny na profilach
- [ ] Kliknięcie sprawdza existing conversation
- [ ] Tworzy nową jeśli nie istnieje
- [ ] Przekierowuje do /messages/:id

---

### 3.3 Strona Messages ⏱️ 1-2h
**Lokalizacja:** `pages/Messages.tsx` (jeśli nie istnieje - utwórz)

**Podstawowa struktura:**
```typescript
// Lista konwersacji + okno czatu
// Real-time subscriptions dla nowych wiadomości
// Możliwość wysyłania wiadomości
```

**TO DO LATER** - zbyt dużo na teraz

---

## 🔵 FAZA 4: ROLE I TYPY (1-2h)

### 4.1 Sprawdź user.role w AuthContext ⏱️ 30 min
**Problem:** Nie wiadomo czy `user.role` istnieje i jak jest ustawiany

**Lokalizacja:** `contexts/AuthContext.tsx`

**Sprawdź:**
```typescript
// Czy AuthContext ma:
interface User {
  id: string;
  email?: string;
  role?: 'worker' | 'employer' | 'accountant';  // ❓
}
```

**Jeśli NIE MA:**
```typescript
// Dodaj funkcję determineUserRole
const determineUserRole = async (userId: string): Promise<UserRole> => {
  // Sprawdź workers
  const { data: worker } = await supabase
    .from('workers')
    .select('id')
    .eq('profile_id', userId)
    .single();
  if (worker) return 'worker';
  
  // Sprawdź employers
  const { data: employer } = await supabase
    .from('employers')
    .select('id')
    .eq('profile_id', userId)
    .single();
  if (employer) return 'employer';
  
  // Sprawdź accountants
  const { data: accountant } = await supabase
    .from('accountants')
    .select('id')
    .eq('profile_id', userId)
    .single();
  if (accountant) return 'accountant';
  
  // Default: worker (albo throw error)
  return 'worker';
};

// W useEffect gdzie loadujesz user:
const loadUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const role = await determineUserRole(user.id);
    setUser({ ...user, role });
  }
};
```

**Weryfikacja:**
- [ ] user.role poprawnie ustawiony po zalogowaniu
- [ ] Rolę można odczytać w komponentach
- [ ] Zmiana roli (jeśli ktoś ma 2 profile?) działa

---

### 4.2 Dodaj userType do AddToTeamButton ⏱️ 45 min
**Problem:** Nie wiadomo jakiego typu jest zapraszany użytkownik (worker/employer/accountant)

**Lokalizacja:** `components/AddToTeamButton.tsx`

**Fix interface:**
```typescript
interface AddToTeamButtonProps {
  userId: string;
  userEmail?: string;
  userType: 'worker' | 'employer' | 'accountant';  // ✅ NEW
  displayName?: string;
  avatarUrl?: string;
  className?: string;
}
```

**Fix sendInviteToProject:**
```typescript
const sendInviteToProject = async (projectId, inviteeProfileId, displayName, avatarUrl) => {
  // Mapowanie: typ użytkownika → rola w projekcie
  const roleMapping = {
    worker: 'member',      // pracownik = zwykły członek
    accountant: 'admin',   // księgowy = admin
    employer: 'admin'      // pracodawca = admin
  };
  
  const { error } = await supabase
    .from('project_invites')
    .insert({
      project_id: projectId,
      invitee_profile_id: inviteeProfileId,
      role: roleMapping[userType],  // ✅ użyj mappingu
      status: 'pending',
      invited_by: user.id,
      invitee_name: displayName,
      invitee_avatar: avatarUrl
    });
    
  // ...
};
```

**Aktualizuj WSZYSTKIE wywołania:**
- WorkerSearch: `userType="worker"`
- AccountantSearchPage: `userType="accountant"`
- WorkerProfilePage: `userType="worker"`
- AccountantProfilePage: `userType="accountant"`
- EmployerProfile: `userType="employer"`
- EmployerSearchPage: `userType="employer"`

**Weryfikacja:**
- [ ] Prop userType wymagany
- [ ] Role mapping działa (worker→member, accountant→admin)
- [ ] Wszystkie wywołania zaktualizowane
- [ ] Brak błędów TypeScript

---

## 🟣 FAZA 5: BEZPIECZEŃSTWO (późniejszy priorytet)

### 5.1 Napraw 27 tabel bez RLS ⏱️ 3-5h
**Problem:** 27 tabel bez Row Level Security (security risk!)

**Lista tabel bez RLS:** (z poprzedniej analizy)
- communication_files
- communication_comments
- project_tasks_old
- saved_jobs
- saved_workers
- job_applications
- applications
- i inne...

**Plan:**
1. Dla każdej tabeli zdefiniuj policies:
   - SELECT: kto może czytać?
   - INSERT: kto może dodawać?
   - UPDATE: kto może edytować?
   - DELETE: kto może usuwać?

2. Przykład dla communication_files:
```sql
ALTER TABLE communication_files ENABLE ROW LEVEL SECURITY;

-- Użytkownicy mogą widzieć pliki w projektach gdzie są członkami
CREATE POLICY "Users can view files in their projects"
  ON communication_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = communication_files.project_id
      AND user_id = auth.uid()
    )
  );

-- Członkowie mogą dodawać pliki
CREATE POLICY "Members can upload files"
  ON communication_files FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = communication_files.project_id
      AND user_id = auth.uid()
    )
  );

-- Tylko owner/admin może usuwać
CREATE POLICY "Only owners can delete files"
  ON communication_files FOR DELETE
  USING (
    uploaded_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = communication_files.project_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
```

**Weryfikacja:**
- [ ] RLS enabled na wszystkich tabelach
- [ ] Policies nie blokują legalnych operacji
- [ ] Test z różnymi rolami

---

## 📋 CHECKLIST IMPLEMENTACJI

### 🔥 PRIORYTET #1 - Dzisiaj (30 min):
- [ ] **0.1 Selektor projektu w TeamDashboard** ← FIX KRYTYCZNY!
  - [ ] Dodaj state selectedProjectId
  - [ ] Dodaj dropdown wyboru projektu
  - [ ] Zamień 7x projects[0] → selectedProjectId
  - [ ] Test: Chat pokazuje wiadomości z wybranego projektu

### Dzisiaj (3-4h):
- [ ] 1.1 WorkerProfilePage - AddToTeamButton
- [ ] 1.2 AccountantProfilePage - AddToTeamButton
- [ ] 1.3 EmployerProfile - AddToTeamButton
- [ ] 4.1 Sprawdź user.role w AuthContext
- [ ] 4.2 Dodaj userType do AddToTeamButton

### Jutro (3-4h):
- [ ] 1.4 EmployerSearchPage - AddToTeamButton
- [ ] 1.5 WorkerCard - fix mock data
- [ ] 2.1 WorkerSearch - routing dla accountant
- [ ] 2.2 EmployerSearch - link dla worker
- [ ] 2.3 "Moje zespoły" - link dla wszystkich

### Pojutrze (4-5h):
- [ ] 3.1 Sprawdź conversations table
- [ ] 3.2 ContactButton komponent
- [ ] 3.2 Integracja ContactButton w profilach
- [ ] Test całości komunikacji

### Później (kiedy czas):
- [ ] 3.3 Strona Messages (pełny czat)
- [ ] 5.1 RLS dla 27 tabel
- [ ] TeamDashboard - edycja projektów
- [ ] Task filters
- [ ] Attachments system

---

## 🎯 PRIORYTETY

**CRITICAL (NATYCHMIAST!):**
1. ✅ **Selektor projektu** - bez tego NIE MA DOSTĘPU do 2. projektu!

**HIGHEST (CRITICAL):**
2. ✅ user.role w AuthContext
3. ✅ userType w AddToTeamButton
4. ✅ AddToTeamButton w WorkerProfilePage
5. ✅ AddToTeamButton w AccountantProfilePage

**HIGH:**
6. ✅ WorkerSearch routing dla accountant
7. ✅ "Moje zespoły" w nawigacji
8. ✅ ContactButton komponent
9. ✅ EmployerProfile - AddToTeamButton

**MEDIUM:**
10. EmployerSearch link dla worker
11. WorkerCard fix
12. Messages page (basic)

**LOW (BACKLOG):**
- RLS policies
- TeamDashboard improvements
- Advanced features

---

## 📞 KONTAKT W RAZIE PYTAŃ

**Błędy? Problemy?**
1. Sprawdź console (F12) - jakie błędy?
2. Sprawdź Supabase logs - czy RLS blokuje?
3. Sprawdź network tab - czy request się wysyła?

**Pytania biznesowe:**
- Czy pracownik może tworzyć projekty?
- Czy employer może dodać employer (B2B)?
- Czy accountant może dodać accountant?

---

**KONIEC PLANU** 🎯

Czas trwania całości: **11-16h** (rozłożone na 3-4 dni)

**UWAGA:** Selektor projektu to FAZA 0 (PRIORYTET #1) - musi być zrobiona PRZED resztą!
