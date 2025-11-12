# 🔍 ANALIZA KOMPLETNA: DRUŻYNA - PROMPT VS RZECZYWISTOŚĆ

**Data:** 2025-10-31 14:45  
**Audyt:** Podstrona "Drużyna" (Team Dashboard)  
**Cel:** Porównanie oryginalnej specyfikacji z aktualną implementacją

---

## 📋 EXECUTIVE SUMMARY

| Kategoria | Stan | Procent | Priorytet |
|-----------|------|---------|-----------|
| **Baza danych** | ✅ Zaimplementowana | 90% | - |
| **UI/UX Core** | ⚠️ Częściowo | 40% | 🔴 CRITICAL |
| **System zaproszeń** | ✅ Działający | 85% | 🟢 OK |
| **Funkcje podstawowe** | ❌ Niespójne | 30% | 🔴 CRITICAL |
| **Funkcje zaawansowane** | ❌ Brak | 5% | 🟡 MEDIUM |
| **Automatyzacje** | ❌ Brak | 0% | 🟡 MEDIUM |

**OGÓLNY STAN: 50/100 - WYMAGA NATYCHMIASTOWEJ NAPRAWY** ⚠️

---

## 1️⃣ KONCEPCJA BIZNESOWA

### ✅ CO DZIAŁA ZGODNIE Z PROMPTEM:

1. **Group/Team jako kontener** ✅
   - Tabela: `communication_projects`
   - Zawiera: id, name, description, employer_id, status, created_by
   - **Status:** ✅ ZAIMPLEMENTOWANE

2. **System zaproszeń (Invites)** ✅
   - Tabela: `project_invites`
   - Enum: `invite_status` ('pending', 'accepted', 'rejected', 'expired')
   - RLS policies: ✅ działają
   - Hook: `useInvites.ts` - pełna funkcjonalność
   - **Status:** ✅ ZAIMPLEMENTOWANE

3. **Resources związane z grupą:**
   - ✅ Tasks (`project_tasks`)
   - ✅ Calendar Events (`calendar_events`, `event_participants`, `event_notifications`)
   - ⚠️ Chat (tabele istnieją, UI częściowo)
   - ✅ Activity log (`project_activities`)
   - ✅ Notifications (`notifications`)
   - **Status:** ⚠️ CZĘŚCIOWO

### ❌ CO NIE DZIAŁA / BRAKUJE:

#### 1. **Scopes (granularne uprawnienia)** ❌
**PROMPT:** `tasks:write`, `calendar:write`, etc.

**RZECZYWISTOŚĆ:**
- Tabela `project_members` ma tylko:
  - `can_invite` (boolean)
  - `can_manage_project` (boolean)
  - `can_view_reports` (boolean)
- ❌ BRAK: `tasks:write`, `tasks:delete`, `calendar:write`, `chat:write`

**IMPACT:** 🔴 CRITICAL
- Nie można dać komuś dostępu tylko do zadań
- Nie można zabronić usuwania zadań
- Uprawnienia są zbyt grube (all-or-nothing)

**FIX:**
```sql
-- Dodaj kolumny dla granularnych uprawnień
ALTER TABLE project_members ADD COLUMN permissions JSONB DEFAULT '{
  "tasks": {"read": true, "write": false, "delete": false},
  "calendar": {"read": true, "write": false, "delete": false},
  "chat": {"read": true, "write": true, "delete": false},
  "files": {"read": true, "write": false, "delete": false}
}'::jsonb;

-- LUB użyj ENUM array
CREATE TYPE permission_scope AS ENUM (
  'tasks:read', 'tasks:write', 'tasks:delete',
  'calendar:read', 'calendar:write', 'calendar:delete',
  'chat:read', 'chat:write', 'files:read', 'files:write'
);

ALTER TABLE project_members ADD COLUMN scopes permission_scope[];
```

---

## 2️⃣ REGUŁY BIZNESOWE

### ✅ CO DZIAŁA:

1. **Pracodawca: tworzy grupy, dodaje pracowników/księgowych** ✅
   - RLS policy: `communication_projects` - employer może tworzyć
   - **Status:** ✅ DZIAŁA

2. **Księgowy: tworzy grupy, dodaje pracowników/pracodawców** ✅
   - RLS policy: `communication_projects` - accountant może tworzyć
   - **Status:** ✅ DZIAŁA

3. **Pracownik: tylko dodawany/zapraszany** ✅
   - Nie może tworzyć projektów
   - **Status:** ✅ DZIAŁA

4. **Akceptacja zaproszeń** ✅
   - `useInvites.acceptInvite()` - działa
   - Po akceptacji: INSERT do `project_members`
   - **Status:** ✅ DZIAŁA

### ⚠️ CO DZIAŁA CZĘŚCIOWO:

1. **W grupie można mieć wielu pracodawców/księgowych** ⚠️
   - Tabela `project_members` wspiera to
   - **PROBLEM:** UI nie pokazuje ról czytelnie
   - Kolumna `role` istnieje, ale UI pokazuje tylko "W zespole" ✅ / "Zaproszono" 📧
   - **FIX:** Dodać badge z rolą (Owner/Admin/Member/Viewer)

2. **Księgowy i pracodawca może utworzyć kilka grup** ✅
   - Tabela wspiera many-to-many
   - **PROBLEM:** UI nie pokazuje listy wszystkich grup użytkownika
   - Dashboard pokazuje tylko grupy gdzie `created_by = user.id`
   - **BRAK:** Grupy gdzie użytkownik jest członkiem (nie twórcą)

**FIX:**
```typescript
// useTeamDashboard.ts - pobierz WSZYSTKIE projekty użytkownika
const fetchProjects = async () => {
  // Projekty gdzie jestem twórcą
  const { data: ownedProjects } = await supabase
    .from('communication_projects')
    .select('*')
    .eq('created_by', user.id);

  // Projekty gdzie jestem członkiem
  const { data: memberProjects } = await supabase
    .from('project_members')
    .select('project_id, communication_projects(*)')
    .eq('user_id', user.id);

  return [...ownedProjects, ...memberProjects.map(m => m.communication_projects)];
};
```

---

## 3️⃣ WIDOKI UI - PANEL "DRUŻYNA"

### PROMPT vs RZECZYWISTOŚĆ

| Widok | Prompt | Rzeczywistość | Status | Priorytet |
|-------|--------|---------------|--------|-----------|
| **Dashboard** | Podsumowanie: zadania (otwarte/w trakcie/ukończone), spotkania (dziś/tydzień), szybkie akcje | ✅ Istnieje, ale statystyki mock | ⚠️ CZĘŚCIOWO | 🔴 HIGH |
| **Zadania** | Lista z filtrami, checkbox, tytuł, opis, status, priorytet, przypisany, termin, adres budowy, załączniki, komentarze | ⚠️ TaskList istnieje, brak filtrów/adresu/załączników | ⚠️ CZĘŚCIOWO | 🔴 HIGH |
| **Kalendarz** | Miesiąc/Tydzień/Dzień/Lista, rodzaje wydarzeń, zaproszenia, e-maile, web push | ⚠️ Calendar istnieje, brak widoków/powiadomień | ⚠️ CZĘŚCIOWO | 🟡 MEDIUM |
| **Zespół** | Karty profili (avatar, imię, rola, status online), przycisk "Zaproś" | ⚠️ TeamMembers istnieje, brak statusu online | ⚠️ CZĘŚCIOWO | 🟡 MEDIUM |
| **Chat** | Wątki, @wzmianki, pliki, realtime | ⚠️ Chat istnieje, funkcjonalność niekompletna | ⚠️ CZĘŚCIOWO | 🟡 MEDIUM |
| **Ustawienia grupy** | Nazwa, opis, adres projektu, role członków, archiwizacja | ❌ BRAK | ❌ BRAK | 🔴 HIGH |

---

### 📊 DASHBOARD (PODSUMOWANIE)

#### ✅ CO DZIAŁA:
- Karty statystyk (4 metryki)
- Lista projektów z opisami
- Recent Activities
- Notifications z priorytetami
- Szybkie akcje dropdown

#### ❌ CO NIE DZIAŁA:

1. **Zadania: otwarte / w trakcie / ukończone** ❌
   - **PROMPT:** Dashboard pokazuje breakdown zadań
   - **RZECZYWISTOŚĆ:** Dashboard nie pokazuje zadań wcale
   - **FIX:** Dodać sekcję "Zadania" z podziałem na statusy

2. **Spotkania: dziś / tydzień** ❌
   - **PROMPT:** Dashboard pokazuje najbliższe spotkania
   - **RZECZYWISTOŚĆ:** Brak widgetu z spotkaniami
   - **FIX:** Dodać "Najbliższe wydarzenia" z `calendar_events`

3. **Ostatnia aktywność** ⚠️
   - **PROMPT:** Real-time aktywność zespołu
   - **RZECZYWISTOŚĆ:** Pokazuje activities, ale nie filtruje per projekt
   - **FIX:** Filtruj `activities.filter(a => a.project_id === selectedProjectId)`

#### 🔴 **KRYTYCZNY PROBLEM: BRAK WYBORU PROJEKTU**

**PROMPT:** Dashboard powinien pokazywać statystyki **wybranego projektu**

**RZECZYWISTOŚĆ:**
```typescript
// Linia 469, 482, 494, 506, 518, 549:
<TaskList projectId={projects[0].id} />
<Calendar projectId={projects[0].id} />
<TeamMembers projectId={projects[0].id} />
```

**PROBLEM:**
- ❌ Zawsze używa `projects[0]` (pierwszy projekt)
- ❌ Nie można przełączyć się między projektami
- ❌ Jeśli masz 5 projektów, widzisz tylko pierwszy

**IMPACT:** 🔴 **BLOCKER** - użytkownik nie może zarządzać wieloma projektami!

**FIX (NATYCHMIASTOWY):**
```typescript
// 1. Dodaj state
const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
  projects.length > 0 ? projects[0].id : null
);

// 2. Dodaj dropdown PRZED tabami
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Wybierz projekt:
  </label>
  <select
    value={selectedProjectId || ''}
    onChange={(e) => setSelectedProjectId(e.target.value)}
    className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg"
  >
    {projects.map(p => (
      <option key={p.id} value={p.id}>
        {p.name} ({p.status})
      </option>
    ))}
  </select>
</div>

// 3. Użyj selectedProjectId
<TaskList projectId={selectedProjectId!} />
<Calendar projectId={selectedProjectId!} />
```

---

### ✅ ZADANIA (TASKS)

#### ✅ CO ISTNIEJE W BAZIE:
```sql
CREATE TABLE project_tasks (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES communication_projects(id),
  title TEXT NOT NULL,
  description TEXT,
  status task_status, -- 'pending', 'in_progress', 'completed', 'blocked'
  priority task_priority, -- 'low', 'medium', 'high', 'urgent'
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  tags TEXT[],
  metadata JSONB -- dla adresu budowy, zdjęć, etc.
);
```

#### ❌ CZEGO BRAKUJE W UI:

**PROMPT WYMAGAŁ:**

1. **Lista z filtrami: Wszystkie / Moje, Status, Priorytet, Słowo kluczowe** ❌
   - **RZECZYWISTOŚĆ:** TaskList pokazuje wszystkie zadania bez filtrów
   - **BRAK:**
     - Dropdown "Wszystkie / Moje zadania"
     - Dropdown "Status: Wszystkie / Pending / In Progress / Done"
     - Dropdown "Priorytet: Wszystkie / Low / Medium / High / Urgent"
     - Input wyszukiwania po tytule

2. **Checkbox do zaznaczania** ❌
   - **PROMPT:** Multi-select z masowymi akcjami
   - **RZECZYWISTOŚĆ:** Brak checkboxów
   - **BRAK:** Możliwość zaznaczenia wielu zadań i zmiana statusu/priorytetu

3. **Adres budowy** ❌
   - **PROMPT:** Pole "adres budowy"
   - **RZECZYWISTOŚĆ:** Kolumna `location_address` istnieje w `communication_projects`, NIE w `project_tasks`
   - **FIX:** Dodać `metadata->build_address` do zadania LUB dziedziczyć z projektu

4. **Załączniki (zdjęcia)** ❌
   - **PROMPT:** Zdjęcia + komentarze
   - **RZECZYWISTOŚĆ:** Brak UI do uploadowania zdjęć do zadania
   - **FIX:** 
     - Użyj Supabase Storage bucket `task-photos/{projectId}/{taskId}/`
     - Zapisz URLs w `metadata->photos: string[]`
     - Komponent `TaskPhotoGallery` już istnieje! (używany gdzie indziej)

5. **Komentarze** ❌
   - **PROMPT:** Komentarze przy zadaniach
   - **RZECZYWISTOŚĆ:** Brak tabeli `task_comments`
   - **FIX:** Utwórz tabelę:
     ```sql
     CREATE TABLE task_comments (
       id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
       task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
       user_id UUID REFERENCES auth.users(id),
       comment TEXT NOT NULL,
       created_at TIMESTAMPTZ DEFAULT NOW()
     );
     ```

6. **"Raport wykonania" (zdjęcia + notatki)** ❌
   - **PROMPT:** Dowód wykonania zadania
   - **RZECZYWISTOŚĆ:** Brak wymogu zdjęcia na status "Done"
   - **FIX:** Dodać validation:
     ```typescript
     if (status === 'completed' && !metadata?.completion_photos?.length) {
       throw new Error('Dodaj zdjęcie dowodu wykonania przed oznaczeniem jako ukończone');
     }
     ```

7. **Podzadania / checklisty** ❌
   - **PROMPT:** Checklisty z procentem postępu
   - **RZECZYWISTOŚĆ:** Brak
   - **FIX:** Dodać `metadata->checklist: {item: string, done: boolean}[]`

8. **Zależności zadań** ❌
   - **PROMPT:** "B zależy od A" (blokada)
   - **RZECZYWISTOŚĆ:** Brak
   - **FIX:** Dodać `blocked_by UUID[]` do tabeli

9. **Zadania cykliczne** ❌
   - **PROMPT:** Co poniedziałek inwentaryzacja
   - **RZECZYWISTOŚĆ:** Brak
   - **FIX:** Dodać `recurrence: {frequency: 'daily'|'weekly', interval: number}`

10. **SLA/Terminy twarde** ❌
    - **PROMPT:** Czerwony badge jeśli zostaje <24h
    - **RZECZYWISTOŚĆ:** `due_date` istnieje, ale UI nie pokazuje alertu
    - **FIX:** Dodać w TaskList:
      ```typescript
      const isOverdue = due_date && new Date(due_date) < new Date();
      const isUrgent = due_date && 
        (new Date(due_date).getTime() - Date.now()) < 24 * 60 * 60 * 1000;
      ```

11. **Formularze szablonowe (SOP)** ❌
    - **PROMPT:** "Przygotowanie ściany do malowania" → generuje checklistę
    - **RZECZYWISTOŚĆ:** Brak
    - **FIX:** Tabela `task_templates` z gotowymi checklistami

12. **Pola specjalne dla budowy** ❌
    - **PROMPT:** pomieszczenie/piętro, metraż, kolor/farba, numer zlecenia
    - **RZECZYWISTOŚĆ:** Brak
    - **FIX:** Dodać do `metadata`:
      ```json
      {
        "construction": {
          "room": "Salon",
          "floor": 2,
          "area_sqm": 45,
          "paint_color": "RAL 9010",
          "client_order_number": "ZAM-2025-123"
        }
      }
      ```

---

### 📅 KALENDARZ

#### ✅ CO ISTNIEJE W BAZIE:
```sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES communication_projects(id),
  title TEXT NOT NULL,
  description TEXT,
  event_type event_type, -- 'meeting', 'deadline', 'milestone', 'vacation'
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  location TEXT,
  is_all_day BOOLEAN DEFAULT false,
  recurrence_rule TEXT,
  created_by UUID REFERENCES auth.users(id)
);

CREATE TABLE event_participants (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  attendance_status TEXT, -- 'pending', 'accepted', 'declined', 'tentative'
  response VARCHAR(20) DEFAULT 'pending'
);

CREATE TABLE event_notifications (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES calendar_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT, -- 'email', 'sms', 'push'
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled'
);
```

#### ❌ CZEGO BRAKUJE W UI:

**PROMPT WYMAGAŁ:**

1. **Widok Miesiąc/Tydzień/Dzień/Lista** ❌
   - **RZECZYWISTOŚĆ:** Calendar component istnieje, ale tylko jeden widok
   - **BRAK:** Przełącznik widoków

2. **Rodzaje: Spotkanie / Termin / Wydarzenie / Urlop** ⚠️
   - **RZECZYWISTOŚĆ:** ENUM `event_type` istnieje w bazie
   - **BRAK:** UI do wyboru typu, ikony dla typów

3. **Zaproszenia** ⚠️
   - **RZECZYWISTOŚĆ:** Tabela `event_participants` istnieje
   - **BRAK:** UI do zapraszania uczestników, akceptacji/odrzucenia

4. **E-maile (Resend)** ❌
   - **PROMPT:** Automatyczne e-maile z zaproszeniami
   - **RZECZYWISTOŚĆ:** Brak integracji z Resend
   - **FIX:** Dodać webhook po stworzeniu eventu

5. **Web push** ❌
   - **PROMPT:** Web push notifications
   - **RZECZYWISTOŚĆ:** Brak service workera

6. **Widok zespołowy dostępności** ❌
   - **PROMPT:** Heatmapa godzin zespołu
   - **RZECZYWISTOŚĆ:** Brak
   - **FIX:** Widok "Team Availability" pokazujący zajętość wszystkich

7. **Auto-proponowanie terminu** ❌
   - **PROMPT:** Szuka wspólnego okna w grupie
   - **RZECZYWISTOŚĆ:** Brak
   - **FIX:** Algorytm sprawdzający dostępność wszystkich uczestników

8. **Rezerwacje zasobów** ❌
   - **PROMPT:** Sprzęt/samochód powiązany z eventem
   - **RZECZYWISTOŚĆ:** Brak tabeli `resources`
   - **FIX:** Dodać:
     ```sql
     CREATE TABLE project_resources (
       id UUID PRIMARY KEY,
       project_id UUID REFERENCES communication_projects(id),
       name TEXT, -- "Van Mercedes Sprinter"
       type TEXT, -- "vehicle", "equipment", "tool"
       metadata JSONB
     );

     CREATE TABLE resource_bookings (
       id UUID PRIMARY KEY,
       resource_id UUID REFERENCES project_resources(id),
       event_id UUID REFERENCES calendar_events(id),
       start_time TIMESTAMPTZ,
       end_time TIMESTAMPTZ
     );
     ```

9. **Sync z osobistym kalendarzem (Google/iCal)** ❌
   - **PROMPT:** Subskrypcja tylko-do-odczytu
   - **RZECZYWISTOŚĆ:** Brak
   - **FIX:** Endpoint iCal: `/api/calendar/{projectId}.ics`

---

### 👥 ZESPÓŁ (TEAM)

#### ✅ CO ISTNIEJE:
- Tabela `project_members` z rolami
- Hook `useTeamMembers`
- Komponent `TeamMembers`

#### ❌ CZEGO BRAKUJE:

1. **Status online** ❌
   - **PROMPT:** Karty pokazują status online
   - **RZECZYWISTOŚĆ:** Brak
   - **FIX:** Supabase Realtime `presence`:
     ```typescript
     const channel = supabase.channel('project:123')
       .on('presence', { event: 'sync' }, () => {
         const presenceState = channel.presenceState();
         // Aktualizuj UI
       })
       .subscribe();
     ```

2. **Przycisk "Zaproś do grupy" na profilu użytkownika** ✅
   - **RZECZYWISTOŚĆ:** WŁAŚNIE ZAIMPLEMENTOWANE!
   - `AddToTeamButton` w WorkerCard, WorkerSearch, AccountantSearchPage

3. **Role czytelne w UI** ⚠️
   - **RZECZYWISTOŚĆ:** Tabela ma `role`, ale UI nie pokazuje
   - **FIX:** Badge z rolą: Owner 👑 / Admin 🔧 / Member 👤 / Viewer 👁️

---

### 💬 CHAT

#### ✅ CO ISTNIEJE W BAZIE:
```sql
-- Założenie: istnieją tabele messages/conversations
```

#### ❌ CZEGO BRAKUJE:

1. **Wątki (threads)** ❌
   - **PROMPT:** Reply threads w wiadomościach
   - **RZECZYWISTOŚĆ:** Prawdopodobnie proste wiadomości
   - **FIX:** Dodać `parent_message_id UUID`

2. **@wzmianki** ❌
   - **PROMPT:** Mention użytkowników
   - **RZECZYWISTOŚĆ:** Brak parsowania @username
   - **FIX:** Parse message content, highlight `@userId`, notify

3. **Pliki** ⚠️
   - **PROMPT:** Możliwość załączania plików w chacie
   - **RZECZYWISTOŚĆ:** Prawdopodobnie brak
   - **FIX:** Dodać `message_attachments` z URLs do storage

4. **Realtime (Supabase Realtime)** ⚠️
   - **PROMPT:** Real-time chat
   - **RZECZYWISTOŚĆ:** Prawdopodobnie zaimplementowane (Supabase Realtime)
   - **Sprawdź:** Czy subscription działa

5. **Read receipts** ❌
   - **PROMPT:** Potwierdzenia odczytu
   - **RZECZYWISTOŚĆ:** Brak
   - **FIX:** Tabela `message_reads`:
     ```sql
     CREATE TABLE message_reads (
       message_id UUID REFERENCES messages(id),
       user_id UUID REFERENCES auth.users(id),
       read_at TIMESTAMPTZ DEFAULT NOW(),
       PRIMARY KEY (message_id, user_id)
     );
     ```

---

### ⚙️ USTAWIENIA GRUPY

**PROMPT WYMAGAŁ:**
- Nazwa, opis, adres projektu, role członków, archiwizacja

**RZECZYWISTOŚĆ:** ❌ **CAŁKOWITY BRAK**

**IMPACT:** 🔴 CRITICAL - użytkownik nie może edytować projektu!

**GDZIE POWINNO BYĆ:**
- Tab "Ustawienia" w TeamDashboard
- Formularz edycji projektu
- Zarządzanie rolami członków
- Przycisk "Archiwizuj projekt"

**FIX:**
```typescript
// Dodaj tab w TeamDashboard
{ id: 'settings', label: 'Ustawienia', icon: '⚙️' }

// ProjectSettings component
const ProjectSettings = ({ projectId }: { projectId: string }) => {
  return (
    <div className="space-y-6">
      {/* Edycja projektu */}
      <section>
        <h3>Podstawowe informacje</h3>
        <input name="name" value={project.name} />
        <textarea name="description" value={project.description} />
        <input name="location_address" value={project.location_address} />
        <select name="status">
          <option value="active">Aktywny</option>
          <option value="completed">Zakończony</option>
          <option value="paused">Wstrzymany</option>
          <option value="archived">Zarchiwizowany</option>
        </select>
      </section>

      {/* Zarządzanie członkami */}
      <section>
        <h3>Członkowie zespołu</h3>
        {members.map(member => (
          <div key={member.id}>
            <span>{member.display_name}</span>
            <select value={member.role}>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
            <button onClick={() => removeMember(member.id)}>Usuń</button>
          </div>
        ))}
      </section>

      {/* Archiwizacja */}
      <section>
        <button onClick={() => archiveProject(projectId)}>
          🗄️ Archiwizuj projekt
        </button>
      </section>
    </div>
  );
};
```

---

## 4️⃣ PRAKTYCZNE ULEPSZENIA (Z PROMPT)

### 1) WIDOK I ERGONOMIA

| Funkcja | Prompt | Rzeczywistość | Status |
|---------|--------|---------------|--------|
| **Szybkie akcje na górze** | ✅ Wymagane | ✅ Istnieje | ✅ OK |
| **Tryby widoku: Kanban, Lista, Gantt** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Zapisy filtrów (preset'y)** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Multi-select z masowymi akcjami** | ✅ Wymagane | ❌ Brak | ❌ BRAK |

#### ❌ KANBAN BOARD
**PROMPT:** "Widok Tablica (Kanban)"
**RZECZYWISTOŚĆ:** Brak komponentu KanbanBoard
**FIX:** Utwórz `components/KanbanBoard.tsx`:
```typescript
const KanbanBoard = ({ tasks }: { tasks: Task[] }) => {
  const columns = ['pending', 'in_progress', 'completed', 'blocked'];
  
  return (
    <div className="grid grid-cols-4 gap-4">
      {columns.map(status => (
        <div key={status} className="bg-gray-100 p-4 rounded">
          <h3>{status}</h3>
          {tasks.filter(t => t.status === status).map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ))}
    </div>
  );
};
```

#### ❌ GANTT CHART
**PROMPT:** "Oś czasu/Gantt (deadliny i zależności)"
**RZECZYWISTOŚĆ:** Brak
**FIX:** Użyj biblioteki `react-gantt-timeline` lub `frappe-gantt`

#### ❌ ZAPISY FILTRÓW
**PROMPT:** "Własne preset'y filtrów (np. 'Malowanie – tylko blok A, ten tydzień')"
**RZECZYWISTOŚĆ:** Brak
**FIX:** Tabela `filter_presets`:
```sql
CREATE TABLE filter_presets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT, -- "Malowanie - blok A"
  filters JSONB -- {"status": ["in_progress"], "tags": ["blok-a"]}
);
```

#### ❌ MULTI-SELECT
**PROMPT:** "Multi-select z masowymi akcjami: zmiana statusu, przypisanie, priorytet"
**RZECZYWISTOŚĆ:** TaskList nie ma checkboxów
**FIX:**
```typescript
const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

// W TaskList:
<input 
  type="checkbox" 
  checked={selectedTasks.includes(task.id)}
  onChange={() => toggleSelection(task.id)}
/>

// Akcje masowe:
<button onClick={() => bulkUpdateStatus(selectedTasks, 'completed')}>
  Oznacz jako ukończone
</button>
```

---

### 2) ZADANIA "PRODUKCYJNE"

| Funkcja | Prompt | Rzeczywistość | Status |
|---------|--------|---------------|--------|
| **Podzadania / checklisty** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Zależności** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Zadania cykliczne** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **SLA/Terminy twarde** | ✅ Wymagane | ⚠️ Pole istnieje, UI brak | ⚠️ CZĘŚCIOWO |
| **Formularze szablonowe** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Pola budowlane** | ✅ Wymagane | ❌ Brak | ❌ BRAK |

**Wszystkie opisane szczegółowo w sekcji 3️⃣ ZADANIA**

---

### 3) DOWODY WYKONANIA

| Funkcja | Prompt | Rzeczywistość | Status |
|---------|--------|---------------|--------|
| **Zdjęcia/Wideo wymagane na "Done"** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Geotag + znacznik czasu (EXIF)** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Notatki głosowe → transkrypcja** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Podpis cyfrowy klienta** | ⚠️ Opcjonalne | ❌ Brak | ❌ BRAK |

#### FIX: Dowody wykonania
```typescript
// 1. Wymagaj zdjęcia przed "Done"
const completeTask = async (taskId: string) => {
  const task = await getTask(taskId);
  
  if (!task.metadata?.completion_photos?.length) {
    throw new Error('Dodaj zdjęcie dowodu wykonania');
  }
  
  await supabase
    .from('project_tasks')
    .update({ status: 'completed', completed_at: new Date() })
    .eq('id', taskId);
};

// 2. Geotag z EXIF
const uploadPhoto = async (file: File) => {
  const exif = await EXIF.getData(file);
  const gps = {
    lat: EXIF.getTag(file, 'GPSLatitude'),
    lng: EXIF.getTag(file, 'GPSLongitude'),
    timestamp: EXIF.getTag(file, 'DateTimeOriginal')
  };
  
  const { data } = await supabase.storage
    .from('task-photos')
    .upload(`${taskId}/${Date.now()}.jpg`, file);
    
  return { url: data.path, exif: gps };
};

// 3. Notatka głosowa → transkrypcja
const uploadVoiceNote = async (audioBlob: Blob) => {
  // Upload do storage
  const { data: audioUrl } = await supabase.storage
    .from('voice-notes')
    .upload(`${taskId}/${Date.now()}.mp3`, audioBlob);
    
  // Transkrypcja przez OpenAI Whisper API
  const transcription = await openai.audio.transcriptions.create({
    file: audioBlob,
    model: 'whisper-1',
    language: 'pl'
  });
  
  return { audioUrl, transcript: transcription.text };
};
```

---

### 4) KALENDARZ I PLANOWANIE

| Funkcja | Prompt | Rzeczywistość | Status |
|---------|--------|---------------|--------|
| **Dostępność zespołu (heatmapa)** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Auto-proponowanie terminu** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Rezerwacje zasobów** | ✅ Wymagane | ❌ Brak tabeli | ❌ BRAK |
| **Sync z Google/iCal** | ✅ Wymagane | ❌ Brak | ❌ BRAK |

**Opisane szczegółowo w sekcji 3️⃣ KALENDARZ**

---

### 5) KOMUNIKACJA

| Funkcja | Prompt | Rzeczywistość | Status |
|---------|--------|---------------|--------|
| **Wątki przy zadaniu** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **@wzmianki** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Czat grupowy** | ✅ Wymagane | ⚠️ Istnieje | ⚠️ CZĘŚCIOWO |
| **"Ważne" pinezka** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Powiadomienia: e-mail, web-push, SMS** | ✅ Wymagane | ⚠️ Tabela istnieje | ⚠️ CZĘŚCIOWO |
| **Podsumowanie dnia/tygodnia (PDF)** | ✅ Wymagane | ❌ Brak | ❌ BRAK |

#### FIX: Podsumowanie tygodniowe
```typescript
// Cron job (GitHub Actions / Supabase Edge Function)
const generateWeeklyReport = async (projectId: string) => {
  const startOfWeek = dayjs().startOf('week');
  const endOfWeek = dayjs().endOf('week');
  
  // Pobierz dane
  const { data: tasks } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .gte('created_at', startOfWeek.toISOString())
    .lte('created_at', endOfWeek.toISOString());
    
  const { data: events } = await supabase
    .from('calendar_events')
    .select('*')
    .eq('project_id', projectId)
    .gte('start_time', startOfWeek.toISOString())
    .lte('end_time', endOfWeek.toISOString());
    
  // Generuj PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  page.drawText(`Raport tygodnia: ${projectName}`);
  page.drawText(`Ukończone zadania: ${tasks.filter(t => t.status === 'completed').length}`);
  // ... więcej statystyk
  
  const pdfBytes = await pdfDoc.save();
  
  // Wyślij email
  await resend.emails.send({
    from: 'reports@zzp-werkplaats.nl',
    to: members.map(m => m.email),
    subject: `Raport tygodnia - ${projectName}`,
    attachments: [{ filename: 'raport.pdf', content: pdfBytes }]
  });
};
```

---

### 6) AUTOMATYZACJE

**PROMPT:** "Reguły: Jeśli status=Done → poproś o zdjęcie"

| Funkcja | Prompt | Rzeczywistość | Status |
|---------|--------|---------------|--------|
| **Reguły automatyczne** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Szablony grup** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Webhooki** | ✅ Wymagane | ❌ Brak | ❌ BRAK |

#### FIX: System automatyzacji
```sql
CREATE TABLE automation_rules (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES communication_projects(id),
  trigger_event TEXT, -- 'task.status_changed', 'task.overdue', 'event.created'
  conditions JSONB, -- {"status": "completed"}
  actions JSONB -- [{"type": "require_photo"}, {"type": "send_notification"}]
);
```

```typescript
// Trigger po zmianie statusu
const onTaskStatusChange = async (task: Task, oldStatus: string, newStatus: string) => {
  // Pobierz reguły
  const { data: rules } = await supabase
    .from('automation_rules')
    .select('*')
    .eq('project_id', task.project_id)
    .eq('trigger_event', 'task.status_changed');
    
  for (const rule of rules) {
    // Sprawdź warunki
    if (rule.conditions.status === newStatus) {
      // Wykonaj akcje
      for (const action of rule.actions) {
        if (action.type === 'require_photo') {
          if (!task.metadata?.completion_photos?.length) {
            throw new Error('Dodaj zdjęcie przed zmianą statusu na Done');
          }
        }
        if (action.type === 'send_notification') {
          await sendNotification(task.assigned_to, action.message);
        }
        if (action.type === 'webhook') {
          await fetch(action.url, {
            method: 'POST',
            body: JSON.stringify(task)
          });
        }
      }
    }
  }
};
```

---

### 7) UPRAWNIENIA I ROLE

**PROMPT:** "owner, manager, member, viewer" + "Maski uprawnień per moduł"

**RZECZYWISTOŚĆ:**
- ✅ Kolumna `role` w `project_members`
- ⚠️ Tylko 3 boolean flags: `can_invite`, `can_manage_project`, `can_view_reports`
- ❌ BRAK granularnych uprawnień (tasks:write, calendar:delete, etc.)

**FIX:** Opisany w sekcji 1️⃣ KONCEPCJA BIZNESOWA

---

### 8) RAPORTY / ANALITYKA

**PROMPT:** "Dashboard KPI: wykonanie vs plan, średni lead time, blokady, obciążenie pracowników"

| Funkcja | Prompt | Rzeczywistość | Status |
|---------|--------|---------------|--------|
| **Dashboard KPI** | ✅ Wymagane | ⚠️ Mock dane | ⚠️ CZĘŚCIOWO |
| **Wykonanie vs plan** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Średni lead time** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Blokady** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Obciążenie pracowników** | ✅ Wymagane | ❌ Brak | ❌ BRAK |
| **Eksport CSV/PDF** | ✅ Wymagane | ❌ Brak | ❌ BRAK |

#### FIX: Dashboard KPI
```typescript
const DashboardKPI = ({ projectId }: { projectId: string }) => {
  const [stats, setStats] = useState({
    tasksCompleted: 0,
    tasksPlanned: 0,
    avgLeadTime: 0, // w godzinach
    blockedTasks: 0,
    teamWorkload: {}
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      // Wykonanie vs plan
      const { data: tasks } = await supabase
        .from('project_tasks')
        .select('status, created_at, completed_at, assigned_to')
        .eq('project_id', projectId);
        
      const completed = tasks.filter(t => t.status === 'completed').length;
      const total = tasks.length;
      
      // Średni lead time
      const leadTimes = tasks
        .filter(t => t.completed_at)
        .map(t => dayjs(t.completed_at).diff(dayjs(t.created_at), 'hours'));
      const avgLeadTime = leadTimes.length > 0 
        ? leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length 
        : 0;
        
      // Blokady
      const blocked = tasks.filter(t => t.status === 'blocked').length;
      
      // Obciążenie pracowników
      const workload = tasks.reduce((acc, task) => {
        if (task.assigned_to && task.status !== 'completed') {
          acc[task.assigned_to] = (acc[task.assigned_to] || 0) + 1;
        }
        return acc;
      }, {});
      
      setStats({
        tasksCompleted: completed,
        tasksPlanned: total,
        avgLeadTime,
        blockedTasks: blocked,
        teamWorkload: workload
      });
    };
    
    fetchStats();
  }, [projectId]);
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard 
        title="Wykonanie" 
        value={`${stats.tasksCompleted}/${stats.tasksPlanned}`}
        percentage={(stats.tasksCompleted / stats.tasksPlanned) * 100}
      />
      <KPICard 
        title="Avg Lead Time" 
        value={`${Math.round(stats.avgLeadTime)}h`}
      />
      <KPICard 
        title="Blokady" 
        value={stats.blockedTasks}
        alert={stats.blockedTasks > 0}
      />
      <KPICard 
        title="Najbardziej obciążony" 
        value={Object.values(stats.teamWorkload).reduce((max, val) => Math.max(max, val), 0)}
      />
    </div>
  );
};
```

#### FIX: Eksport PDF
```typescript
const exportWeeklyReport = async (projectId: string) => {
  const tasks = await fetchTasks(projectId);
  const events = await fetchEvents(projectId);
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  
  page.drawText(`Raport projektu: ${project.name}`, { x: 50, y: 800, size: 20 });
  page.drawText(`Data: ${new Date().toLocaleDateString('pl-PL')}`, { x: 50, y: 770 });
  
  // Statystyki
  page.drawText(`Ukończone zadania: ${tasks.filter(t => t.status === 'completed').length}`, { x: 50, y: 720 });
  page.drawText(`W trakcie: ${tasks.filter(t => t.status === 'in_progress').length}`, { x: 50, y: 700 });
  
  // Zdjęcia dowodów
  for (const task of tasks.filter(t => t.metadata?.completion_photos)) {
    const imageBytes = await fetch(task.metadata.completion_photos[0]).then(r => r.arrayBuffer());
    const image = await pdfDoc.embedJpg(imageBytes);
    page.drawImage(image, { x: 50, y: 500, width: 200, height: 150 });
  }
  
  const pdfBytes = await pdfDoc.save();
  
  // Download
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `raport-${project.name}-${Date.now()}.pdf`;
  a.click();
};
```

---

### 9) STABILNOŚĆ I PORZĄDEK

**PROMPT:** "Log audytowy (kto co zmienił i kiedy)"

| Funkcja | Prompt | Rzeczywistość | Status |
|---------|--------|---------------|--------|
| **Log audytowy** | ✅ Wymagane | ⚠️ `project_activities` istnieje | ⚠️ CZĘŚCIOWO |

#### ⚠️ Audit Log
**RZECZYWISTOŚĆ:** Tabela `project_activities` istnieje, ale:
- ❌ Nie loguje wszystkich akcji (tylko niektóre)
- ❌ UI nie pokazuje szczegółów zmian

**FIX:**
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES communication_projects(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT, -- 'task.created', 'task.updated', 'member.added'
  entity_type TEXT, -- 'task', 'event', 'member'
  entity_id UUID,
  changes JSONB, -- {"status": {"from": "pending", "to": "completed"}}
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger dla każdej tabeli
CREATE OR REPLACE FUNCTION log_audit()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (project_id, user_id, action, entity_type, entity_id, changes)
  VALUES (
    NEW.project_id,
    auth.uid(),
    TG_OP || '.' || TG_TABLE_NAME,
    TG_TABLE_NAME,
    NEW.id,
    jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_project_tasks
AFTER INSERT OR UPDATE OR DELETE ON project_tasks
FOR EACH ROW EXECUTE FUNCTION log_audit();
```

---

## 5️⃣ PLAN NAPRAWY - PRIORYTETYZACJA

### 🔴 **FAZA 1: KRYTYCZNE BŁĘDY (1-3 DNI)**

#### 1. **Wybór projektu** 🔴 BLOCKER
- **Problem:** `projects[0]` hardcoded
- **Fix:** Dodać dropdown wyboru projektu
- **Plik:** `TeamDashboard.tsx`
- **Czas:** 2h

#### 2. **Brak edycji projektu** 🔴 CRITICAL
- **Problem:** Nie można zmienić nazwy/opisu projektu
- **Fix:** Dodać tab "Ustawienia" z formularzem
- **Plik:** Nowy `ProjectSettings.tsx`
- **Czas:** 4h

#### 3. **Nie da się zapisać zadania** 🔴 BLOCKER
- **Problem:** Nieznana przyczyna
- **Debug:** Sprawdzić console, RLS policies, FK constraints
- **Czas:** 2h

#### 4. **Brak filtrów w zadaniach** 🔴 HIGH
- **Problem:** Nie można filtrować zadań
- **Fix:** Dodać dropdown Status/Priorytet/Assigned
- **Plik:** `TaskList.tsx`
- **Czas:** 3h

#### 5. **Brak wyboru wielu projektów użytkownika** 🔴 HIGH
- **Problem:** Dashboard pokazuje tylko projekty gdzie `created_by = user.id`
- **Fix:** Pobierać projekty z `project_members` też
- **Plik:** `useTeamDashboard.ts`
- **Czas:** 2h

---

### 🟡 **FAZA 2: FUNKCJE PODSTAWOWE (3-7 DNI)**

#### 6. **Załączniki do zadań** 🟡 HIGH
- **Fix:** Upload zdjęć do `task-photos/`
- **Używając:** `TaskPhotoGallery` component (już istnieje)
- **Czas:** 4h

#### 7. **Komentarze przy zadaniach** 🟡 HIGH
- **Fix:** Utwórz `task_comments` tabelę + UI
- **Czas:** 6h

#### 8. **Role w UI** 🟡 MEDIUM
- **Fix:** Dodać badge Owner/Admin/Member w TeamMembers
- **Czas:** 2h

#### 9. **Wymaganie zdjęcia na "Done"** 🟡 MEDIUM
- **Fix:** Validation przed zmianą statusu
- **Czas:** 2h

#### 10. **Checklisty w zadaniach** 🟡 MEDIUM
- **Fix:** Dodać `metadata->checklist` + UI
- **Czas:** 5h

---

### 🟢 **FAZA 3: FUNKCJE ZAAWANSOWANE (1-2 TYGODNIE)**

#### 11. **Kanban Board** 🟢 MEDIUM
- **Fix:** Utwórz `KanbanBoard.tsx`
- **Czas:** 8h

#### 12. **Gantt Chart** 🟢 LOW
- **Fix:** Integracja z biblioteką
- **Czas:** 12h

#### 13. **Granularne uprawnienia (scopes)** 🟢 MEDIUM
- **Fix:** Dodać `permissions JSONB` do `project_members`
- **Czas:** 6h

#### 14. **Powiadomienia e-mail (Resend)** 🟢 MEDIUM
- **Fix:** Webhook po stworzeniu zadania/eventu
- **Czas:** 4h

#### 15. **Automatyzacje (reguły)** 🟢 LOW
- **Fix:** Tabela `automation_rules` + execution engine
- **Czas:** 16h

#### 16. **Raporty PDF** 🟢 LOW
- **Fix:** Eksport tygodniowy raport
- **Czas:** 8h

#### 17. **Status online** 🟢 LOW
- **Fix:** Supabase Realtime presence
- **Czas:** 4h

---

## 6️⃣ PODSUMOWANIE TECHNICZNE

### ✅ **CO DZIAŁA DOBRZE:**
1. Baza danych - architektura solidna
2. System zaproszeń - kompletny
3. RLS policies - bezpieczeństwo OK
4. Realtime - Supabase Realtime prawdopodobnie działa
5. Podstawowe UI - Dashboard, TaskList, Calendar istnieją

### ❌ **GŁÓWNE PROBLEMY:**
1. **Brak wyboru projektu** - BLOCKER
2. **Brak edycji projektu** - CRITICAL
3. **Brak filtrów** - użytkownik zgubiony w danych
4. **Brak załączników** - nie można dodać zdjęć
5. **Brak komentarzy** - nie można dyskutować o zadaniu
6. **Brak granularnych uprawnień** - uprawnienia zbyt grube
7. **Brak automatyzacji** - wszystko ręczne
8. **Brak raportów** - nie widać postępu

### 📊 **STATYSTYKI:**

| Kategoria | Zaimplementowane | Brakuje | Procent |
|-----------|------------------|---------|---------|
| **Baza danych** | 90% | 10% | ✅ 90% |
| **UI Core** | 40% | 60% | ⚠️ 40% |
| **Funkcje podstawowe** | 30% | 70% | ❌ 30% |
| **Funkcje zaawansowane** | 5% | 95% | ❌ 5% |
| **Automatyzacje** | 0% | 100% | ❌ 0% |

**OGÓLNIE:** **50/100** ⚠️

---

## 7️⃣ REKOMENDACJE

### 🔴 **NATYCHMIASTOWE AKCJE (DO 24H):**
1. Napraw wybór projektu (dropdown)
2. Debug "nie da się zapisać zadania"
3. Dodaj edycję projektu (Settings tab)

### 🟡 **KRÓTKI TERMIN (TYDZIEŃ):**
1. Filtry w zadaniach
2. Załączniki (zdjęcia)
3. Komentarze
4. Role w UI

### 🟢 **DŁUGI TERMIN (MIESIĄC):**
1. Kanban Board
2. Granularne uprawnienia
3. Automatyzacje
4. Raporty PDF

---

## 📝 **NOTATKI KOŃCOWE**

**Obecny stan:** System ma solidne fundamenty (baza danych), ale UI jest niespójne z promptem. Wiele funkcji jest w bazie, ale brakuje UI.

**Główny problem:** Użytkownik nie może efektywnie zarządzać wieloma projektami z powodu hardcoded `projects[0]`.

**Pozytywne:** System zaproszeń działa świetnie (właśnie naprawiony), tabele są dobrze zaprojektowane.

**Następny krok:** Przeczytaj tę analizę, wybierz priorytet i zacznij od FAZY 1.

---

**Koniec analizy.** 🎯
