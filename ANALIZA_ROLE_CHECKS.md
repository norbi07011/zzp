# 🔬 HIRURGICZNA ANALIZA: BŁĘDY LOGICZNE RÓL

**Data:** 31.10.2025 16:00  
**Problem zgłoszony:** Panel pracownika ma funkcje które nie powinny być dostępne dla worker

---

## 🎯 REGUŁY BIZNESOWE (Z ORYGINALNEGO PROMPTU)

### Worker (Pracownik):
- ✅ **MOŻE:** Być zapraszany do projektów
- ✅ **MOŻE:** Akceptować/odrzucać zaproszenia  
- ✅ **MOŻE:** Uczestniczyć w projektach (członek)
- ✅ **MOŻE:** Wykonywać zadania
- ✅ **MOŻE:** Komunikować się w czacie
- ❌ **NIE MOŻE:** Tworzyć projektów
- ❌ **NIE MOŻE:** Zapraszać innych do projektów
- ❌ **NIE MOŻE:** Usuwać członków z projektu
- ❌ **NIE MOŻE:** Zarządzać projektem (tylko uczestnictwo)

### Employer (Pracodawca):
- ✅ **MOŻE:** Tworzyć projekty
- ✅ **MOŻE:** Zapraszać workers i accountants
- ✅ **MOŻE:** Zarządzać projektami
- ✅ **MOŻE:** Usuwać członków
- ✅ **MOŻE:** Edytować projekty

### Accountant (Księgowy):
- ✅ **MOŻE:** Tworzyć projekty
- ✅ **MOŻE:** Zapraszać workers i employers
- ✅ **MOŻE:** Zarządzać projektami
- ✅ **MOŻE:** Dostęp do raportów finansowych

---

## 🔴 PROBLEM #1: TeamDashboard - BRAK ROLE CHECKS

### Lokalizacja: `components/TeamDashboard.tsx`

#### ❌ BUG 1: "Szybkie akcje" - dostępne dla WSZYSTKICH (linia 62-103)

**JEST:**
```typescript
const QuickActions = () => (
  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Szybkie akcje</h3>
      <div className="space-y-2">
        <button onClick={() => setViewMode('tasks')}>
          <span>Dodaj zadanie</span>  
        </button>
        <button onClick={() => setViewMode('calendar')}>
          <span>Zaplanuj spotkanie</span>
        </button>
        <button onClick={() => setViewMode('chat')}>
          <span>Napisz wiadomość</span>
        </button>
        <button onClick={() => setViewMode('invites')}>
          <span>Zaproś członka</span>  {/* ❌ WORKER NIE MOŻE! */}
        </button>
      </div>
    </div>
  </div>
);
```

**PROBLEM:**
- Worker widzi przycisk "Zaproś członka" ❌
- Worker może kliknąć i przejść do zakładki Invites ❌
- Worker może wysłać zaproszenie (jeśli nie ma check w InvitesManager) ❌

**POWINNO BYĆ:**
```typescript
import { useAuth } from '../contexts/AuthContext';

const TeamDashboard: React.FC = () => {
  const { user } = useAuth();  // ✅ Pobierz user
  const { projects, stats, activities, notifications, loading, error } = useTeamDashboard();
  // ...

  const QuickActions = () => (
    <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Szybkie akcje</h3>
        <div className="space-y-2">
          <button onClick={() => setViewMode('tasks')}>
            <span>Dodaj zadanie</span>  
          </button>
          <button onClick={() => setViewMode('calendar')}>
            <span>Zaplanuj spotkanie</span>
          </button>
          <button onClick={() => setViewMode('chat')}>
            <span>Napisz wiadomość</span>
          </button>
          
          {/* ✅ TYLKO DLA EMPLOYER/ACCOUNTANT */}
          {(user?.role === 'employer' || user?.role === 'accountant') && (
            <button onClick={() => setViewMode('invites')}>
              <span>Zaproś członka</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
```

---

#### ❌ BUG 2: Przycisk "Szybkie akcje" - widoczny dla WSZYSTKICH (linia 408-418)

**JEST:**
```typescript
<div className="flex items-center space-x-4">
  {/* Quick Actions */}
  <div className="relative" ref={quickActionsRef}>
    <button 
      onClick={() => setShowQuickActions(!showQuickActions)}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
    >
      <span>➕</span>
      <span>Szybkie akcje</span>  {/* ❌ POKAZUJE SIĘ WORKER! */}
    </button>
    {showQuickActions && <QuickActions />}
  </div>
</div>
```

**PROBLEM:**
- Worker widzi przycisk "Szybkie akcje" (duży niebieski przycisk) ❌
- Po kliknięciu może próbować zapraszać ❌

**POWINNO BYĆ:**
```typescript
<div className="flex items-center space-x-4">
  {/* Quick Actions - TYLKO dla employer/accountant */}
  {(user?.role === 'employer' || user?.role === 'accountant') && (
    <div className="relative" ref={quickActionsRef}>
      <button 
        onClick={() => setShowQuickActions(!showQuickActions)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
      >
        <span>➕</span>
        <span>Szybkie akcje</span>
      </button>
      {showQuickActions && <QuickActions />}
    </div>
  )}
</div>
```

---

#### ❌ BUG 3: Tab "Zaproszenia" - dostępny dla WSZYSTKICH (linia 428-437)

**JEST:**
```typescript
{[
  { id: 'overview', label: 'Przegląd', icon: '📊' },
  { id: 'projects', label: 'Projekty', icon: '📁' },
  { id: 'tasks', label: 'Zadania', icon: '✓' },
  { id: 'calendar', label: 'Kalendarz', icon: '📅' },
  { id: 'team', label: 'Zespół', icon: '👥' },
  { id: 'invites', label: 'Zaproszenia', icon: '✉️' },  {/* ❌ WORKER WIDZI! */}
  { id: 'chat', label: 'Czat', icon: '💬' },
  { id: 'files', label: 'Pliki', icon: '📎' }
].map((tab) => (
  <button
    key={tab.id}
    onClick={() => setViewMode(tab.id as ViewMode)}
    className={...}
  >
    <span>{tab.icon}</span>
    <span className="font-medium">{tab.label}</span>
  </button>
))}
```

**PROBLEM:**
- Worker widzi zakładkę "✉️ Zaproszenia" ❌
- Po kliknięciu otwiera InvitesManager ❌
- Może próbować wysyłać zaproszenia ❌

**POWINNO BYĆ:**
```typescript
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
  .filter(tab => !tab.roles || tab.roles.includes(user?.role || ''))  // ✅ FILTRUJ PO ROLI
  .map((tab) => (
    <button
      key={tab.id}
      onClick={() => setViewMode(tab.id as ViewMode)}
      className={...}
    >
      <span>{tab.icon}</span>
      <span className="font-medium">{tab.label}</span>
    </button>
  ))
}
```

---

#### ❌ BUG 4: InvitesManager - przycisk "Zaproś" - brak role check (linia 508-512)

**JEST:**
```typescript
{viewMode === 'invites' && (
  projects.length > 0 ? (
    <InvitesManager 
      projectId={projects[0].id} 
      projectName={projects[0].name}
      showInviteButton={true}  {/* ❌ POKAZUJE DLA WSZYSTKICH! */}
    />
  ) : (...)
)}
```

**PROBLEM:**
- Worker może otworzyć zakładkę Invites ❌
- Worker widzi przycisk "Zaproś członka" w InvitesManager ❌
- Może próbować wysyłać zaproszenia ❌

**POWINNO BYĆ:**
```typescript
{viewMode === 'invites' && (
  projects.length > 0 ? (
    <InvitesManager 
      projectId={projects[0].id} 
      projectName={projects[0].name}
      showInviteButton={user?.role === 'employer' || user?.role === 'accountant'}  // ✅ TYLKO DLA MANAGER ROLES
    />
  ) : (...)
)}
```

---

## 🔴 PROBLEM #2: InvitesManager - BRAK ROLE VALIDATION

### Lokalizacja: `components/InvitesManager.tsx`

#### ❌ BUG 5: Przycisk "Zaproś członka" - pokazuje się dla WSZYSTKICH (linia 147-154)

**JEST:**
```typescript
{showInviteButton && projectId && (
  <button
    onClick={() => setShowInviteModal(true)}
    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
  >
    <Mail className="w-4 h-4" />
    Zaproś członka
  </button>
)}
```

**PROBLEM:**
- Jeśli `showInviteButton=true` → pokazuje się ZAWSZE ❌
- Worker może kliknąć "Zaproś członka" ❌
- Nie ma sprawdzenia roli użytkownika ❌

**POWINNO BYĆ:**
```typescript
import { useAuth } from '../contexts/AuthContext';

export function InvitesManager({ projectId, projectName, showInviteButton = true }: InvitesManagerProps) {
  const { user } = useAuth();  // ✅ Dodaj useAuth
  
  // ...reszta hooka
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Zaproszenia</h3>
        
        {/* ✅ SPRAWDŹ ROLĘ + showInviteButton */}
        {showInviteButton && 
         projectId && 
         (user?.role === 'employer' || user?.role === 'accountant') && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Mail className="w-4 h-4" />
            Zaproś członka
          </button>
        )}
      </div>
      {/* ...reszta */}
    </div>
  );
}
```

---

## 🔴 PROBLEM #3: ROUTING - Worker ma dostęp do /team

### Lokalizacja: `App.tsx` (linia 162-164)

**JEST:**
```typescript
<Route element={<AuthenticatedLayout />}>
  <Route path="/feed" element={<FeedPage />} />
  <Route path="/team" element={<TeamDashboard />} />  {/* ❌ BEZ SPRAWDZENIA ROLI! */}
  <Route path="/accountants" element={<AccountantSearchPage />} />
  <Route path="/employers" element={<EmployerSearchPage />} />
  <Route path="/workers" element={
    <ProtectedRoute>
      <WorkerSearch />
    </ProtectedRoute>
  } />
</Route>
```

**PROBLEM:**
- `/team` dostępne dla WSZYSTKICH zalogowanych ✅ TO OK (worker może być członkiem)
- ALE: TeamDashboard pokazuje funkcje managera (zaproszenia etc) ❌

**ROZWIĄZANIE:**
- Routing OK (worker MOŻE mieć dostęp do teamów w których jest)
- ALE: TeamDashboard MUSI ukrywać funkcje managera
- Fix w TeamDashboard (BUG 1-4) ✅

---

## 🔴 PROBLEM #4: BRAK user.role W useAuth?

### Lokalizacja: `contexts/AuthContext.tsx`

**MUSZĘ SPRAWDZIĆ:**
```typescript
// Czy AuthContext ma:
interface User {
  id: string;
  email?: string;
  role?: 'worker' | 'employer' | 'accountant' | 'admin';  // ❓ CZY ISTNIEJE?
}

// Czy user.role jest ustawiony?
const { user } = useAuth();
console.log(user?.role);  // undefined? 'worker'? 'employer'?
```

**Jeśli NIE MA `user.role`:**
- Wszystkie role checks FAILUJĄ ❌
- Worker widzi WSZYSTKO bo `user?.role === 'employer'` = false dla WSZYSTKICH ❌

**FIX REQUIRED:** Dodaj `determineUserRole()` w AuthContext (zgodnie z FAZA 4 planu)

---

## 🔴 PROBLEM #5: TaskList - Czy worker może dodawać zadania?

### To zależy od REGUŁ BIZNESOWYCH:

**Opcja A: Worker NIE MOŻE tworzyć zadań**
- Tylko executor (wykonuje otrzymane zadania)
- TaskList musi ukryć przycisk "Dodaj zadanie" dla worker

**Opcja B: Worker MOŻE tworzyć zadania**
- Może proponować zadania w projekcie
- Przycisk "Dodaj zadanie" OK

**MUSZĘ SPRAWDZIĆ** TaskList.tsx - czy ma role check

---

## 🔴 PROBLEM #6: Calendar - Czy worker może planować spotkania?

**Podobnie jak TaskList:**

**Opcja A: Worker NIE MOŻE planować**
- Tylko uczestniczy w spotkaniach
- Calendar musi ukryć "Dodaj wydarzenie"

**Opcja B: Worker MOŻE planować**
- Może sugerować spotkania
- Przycisk OK

**MUSZĘ SPRAWDZIĆ** Calendar.tsx

---

## 📋 PODSUMOWANIE ZNALEZIONYCH BŁĘDÓW

| # | Błąd | Lokalizacja | Skutek | Fix |
|---|------|-------------|--------|-----|
| 1 | "Zaproś członka" w Quick Actions | TeamDashboard.tsx:97 | Worker może próbować zapraszać | Dodaj role check |
| 2 | Przycisk "Szybkie akcje" widoczny | TeamDashboard.tsx:408 | Worker widzi opcje managera | Ukryj dla worker |
| 3 | Tab "Zaproszenia" widoczny | TeamDashboard.tsx:433 | Worker ma dostęp do invites | Filtruj taby po roli |
| 4 | showInviteButton bez role check | TeamDashboard.tsx:510 | Worker widzi przycisk zaproś | Dodaj role check |
| 5 | InvitesManager bez role check | InvitesManager.tsx:147 | Worker może kliknąć zaproś | Dodaj useAuth check |
| 6 | Brak user.role? | AuthContext.tsx | Wszystkie checky failują | Dodaj determineUserRole() |

---

## 🛠️ PLAN NAPRAWY

### PRIORYTET #1: Sprawdź user.role (5 min)
```typescript
// W dowolnym komponencie:
import { useAuth } from './contexts/AuthContext';

const TestComponent = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    console.log('User role:', user?.role);
    console.log('User data:', user);
  }, [user]);
  
  return <div>Check console</div>;
};
```

**Jeśli `user.role` jest `undefined`:**
- STOP! Najpierw napraw AuthContext (FAZA 4)
- Potem napraw role checks

**Jeśli `user.role` działa:**
- Przejdź do naprawy TeamDashboard

---

### PRIORYTET #2: Napraw TeamDashboard (30 min)

1. **Dodaj useAuth** (linia 1)
2. **QuickActions** - ukryj "Zaproś" dla worker (linia 97)
3. **Przycisk "Szybkie akcje"** - ukryj dla worker (linia 408)
4. **Taby** - filtruj po roli (linia 428)
5. **InvitesManager** - `showInviteButton` z role check (linia 510)

---

### PRIORYTET #3: Napraw InvitesManager (15 min)

1. **Dodaj useAuth**
2. **Przycisk "Zaproś"** - sprawdź rolę (linia 147)

---

### PRIORYTET #4: Sprawdź TaskList i Calendar (20 min)

**DECYZJA BIZNESOWA:**
- Czy worker może dodawać zadania? ❓
- Czy worker może planować spotkania? ❓

**Jeśli NIE:**
- Ukryj przyciski "Dodaj zadanie" / "Dodaj wydarzenie"

---

## 🎯 CAŁKOWITY FIX TIME: ~2h

1. user.role check - 5 min
2. TeamDashboard role checks - 30 min  
3. InvitesManager role check - 15 min
4. TaskList/Calendar checks - 20 min
5. Testy - 30 min

**TOTAL: 1h 40min**

---

**KONIEC HIRURGICZNEJ ANALIZY** 🔬

**Następny krok:** Sprawdzić `user.role` - jeśli nie działa, FIX AuthContext najpierw!
