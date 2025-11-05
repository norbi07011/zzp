# 🔍 ANALIZA BŁĘDÓW - PODSTRONA DRUŻYNA

**Data:** 2025-10-31  
**Status:** ❌ WIELE KRYTYCZNYCH BŁĘDÓW

---

## 🚨 KRYTYCZNE PROBLEMY

### 1. ❌ BRAK WYBORU PROJEKTU
**Problem:** Wszystkie widoki używają `projects[0].id` (pierwszy projekt)

**Lokalizacja:** `TeamDashboard.tsx` linie:
- 469: `<TaskList projectId={projects[0].id} />`
- 482: `<Calendar projectId={projects[0].id} />`
- 494: `<TeamMembers projectId={projects[0].id} />`
- 506: `<InvitesManager projectId={projects[0].id} ... />`
- 518: `<Chat projectId={projects[0].id} />`
- 549: `<FileManagerSimple projectId={projects[0].id} ... />`

**Impact:**
- ❌ Nie można wybrać którego projektu zadania/kalendarz/chat chcesz zobaczyć
- ❌ Zawsze pokazuje pierwszy projekt z listy
- ❌ Jeśli masz 5 projektów, widzisz tylko zadania z pierwszego

**Rozwiązanie:**
```typescript
// Dodaj state
const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

// Dodaj dropdown wyboru projektu
<select onChange={(e) => setSelectedProjectId(e.target.value)}>
  {projects.map(p => <option value={p.id}>{p.name}</option>)}
</select>

// Użyj selectedProjectId zamiast projects[0].id
<TaskList projectId={selectedProjectId || projects[0].id} />
```

---

### 2. ❌ BRAK EDYCJI PROJEKTU
**Problem:** Nie ma UI do edytowania istniejącego projektu

**Gdzie brakuje:**
- Widok 'projects' (linia 454-466) - tylko wyświetla listę
- Brak przycisku "Edytuj"
- Brak modala do edycji
- Brak funkcji `updateProject()` w `useTeamDashboard`

**Impact:**
- ❌ Nie można zmienić nazwy projektu
- ❌ Nie można zmienić opisu projektu
- ❌ Nie można zmienić statusu projektu
- ❌ Nie można usunąć projektu

**Rozwiązanie:**
```typescript
// 1. Dodaj funkcję updateProject w useTeamDashboard.ts
const updateProject = async (projectId: string, updates: Partial<Project>) => {
  const { data, error } = await supabase
    .from('communication_projects')
    .update(updates)
    .eq('id', projectId)
    .eq('created_by', user.id) // tylko własne projekty
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

// 2. Dodaj UI w TeamDashboard
{projects.map((project) => (
  <div className="...">
    <h4>{project.name}</h4>
    <p>{project.description}</p>
    <button onClick={() => handleEdit(project)}>Edytuj</button>
    <button onClick={() => handleDelete(project.id)}>Usuń</button>
  </div>
))}
```

---

### 3. ❌ UNDEFINED USER W INVITES
**Problem:** Console error: `Email notification would be sent to: undefined@email.com`

**Lokalizacja:** `useInvites.ts` linia 137

**Przyczyna:**
- `useInvites` hook używa `useAuth()` ✅
- PROBLEM: Wywołanie `createInvite()` prawdopodobnie z komponentu który nie jest w AuthContext

**Debug:**
```typescript
// Dodaj logowanie w createInvite (linia 100)
const createInvite = async (data: CreateInviteData) => {
  console.log('🔍 DEBUG createInvite:', {
    user: user,
    userId: user?.id,
    userEmail: user?.email,
    inviteeEmail: data.inviteeEmail
  });
  
  // ... rest of code
}
```

**Możliwe przyczyny:**
1. InviteMemberModal wywołany poza AuthContext
2. User jeszcze nie załadowany (loading state)
3. Session wygasła

---

### 4. ❌ NIE DA SIĘ ZAPISAĆ ZADANIA
**Problem:** "nie da się zapisać zadania"

**Możliwe przyczyny:**

#### A. RLS Policy blokuje INSERT
```sql
-- Sprawdź:
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'project_tasks';

-- Jeśli rls_enabled = true, dodaj policy:
CREATE POLICY "Users can create tasks in their projects" 
ON project_tasks FOR INSERT 
WITH CHECK (
  project_id IN (
    SELECT id FROM communication_projects 
    WHERE created_by = auth.uid()
    OR id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  )
);
```

#### B. Brak projectId
```typescript
// W TaskFormModal sprawdź czy projectId jest przekazane
console.log('TaskFormModal projectId:', projectId);

// Jeśli undefined, TaskList nie przekazuje:
<TaskList projectId={selectedProjectId} /> // sprawdź czy to nie null
```

#### C. FK constraint violation
```sql
-- Sprawdź czy assigned_to istnieje w profiles:
SELECT assigned_to FROM project_tasks 
WHERE assigned_to NOT IN (SELECT id FROM profiles);

-- Dodaj FK (jeśli nie istnieje):
ALTER TABLE project_tasks 
ADD CONSTRAINT fk_task_assigned_to 
FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL;
```

#### D. ValidationError
```typescript
// W TaskFormModal sprawdź validation:
if (!formData.title?.trim()) {
  throw new Error('Title is required');
}

if (!projectId) {
  throw new Error('ProjectId is required'); // ✅ sprawdź czy to nie błokuje
}
```

---

### 5. ⚠️ PROJECTS[0] MOŻE BYĆ UNDEFINED
**Problem:** Co jeśli `projects.length === 0`?

**Lokalizacja:** Wszędzie gdzie jest `projects[0]`

**Błąd runtime:**
```
Cannot read property 'id' of undefined
```

**Rozwiązanie:**
```typescript
// Dodaj guard
const currentProject = projects.length > 0 ? projects[0] : null;

{viewMode === 'tasks' && (
  currentProject ? (
    <TaskList projectId={currentProject.id} />
  ) : (
    <EmptyState message="Utwórz projekt aby zarządzać zadaniami" />
  )
)}
```

---

### 6. ⚠️ BRAK WALIDACJI SELECTED PROJECT
**Problem:** Co jeśli user usunie aktualnie wybrany projekt?

**Scenariusz:**
1. User wybiera Projekt A
2. User usuwa Projekt A
3. `selectedProjectId` nadal wskazuje na usunięty projekt
4. Wszystkie zapytania zwracają 0 results

**Rozwiązanie:**
```typescript
// Dodaj useEffect
useEffect(() => {
  if (selectedProjectId && !projects.find(p => p.id === selectedProjectId)) {
    // Projekt został usunięty, wybierz pierwszy dostępny
    setSelectedProjectId(projects.length > 0 ? projects[0].id : null);
  }
}, [projects, selectedProjectId]);
```

---

### 7. ❌ BRAK FEEDBACK PO AKCJACH
**Problem:** Brak komunikatów sukcesu/błędu

**Przykłady:**
- Utworzono zadanie → brak "Zadanie utworzone ✅"
- Zaproszono członka → brak "Zaproszenie wysłane ✅"
- Błąd zapisu → generyczny error

**Rozwiązanie:**
```typescript
// Dodaj toast notifications
import { toast } from 'react-hot-toast'; // lub inna lib

const handleCreateTask = async () => {
  try {
    await createTask(data);
    toast.success('Zadanie utworzone pomyślnie! ✅');
  } catch (error) {
    toast.error(`Błąd: ${error.message}`);
  }
};
```

---

## 📋 FUNKCJE KTÓRE NIE DZIAŁAJĄ

### 1. ❌ Edycja projektu
- **Gdzie:** Widok 'projects'
- **Co nie działa:** Brak przycisku "Edytuj"
- **Fix:** Dodaj EditProjectModal + updateProject function

### 2. ❌ Usuwanie projektu
- **Gdzie:** Widok 'projects'
- **Co nie działa:** Brak przycisku "Usuń"
- **Fix:** Dodaj deleteProject function + confirm dialog

### 3. ❌ Wybór projektu
- **Gdzie:** Wszystkie widoki (tasks, calendar, team, etc.)
- **Co nie działa:** Zawsze pierwszy projekt
- **Fix:** Dodaj dropdown selector

### 4. ⚠️ Zapisywanie zadania
- **Gdzie:** TaskFormModal
- **Co może nie działać:** RLS policy lub brak projectId
- **Fix:** Debug console logs + sprawdź RLS

### 5. ⚠️ Zaproszenia (undefined email)
- **Gdzie:** InvitesManager
- **Co nie działa:** user?.email = undefined
- **Fix:** Debug AuthContext propagation

---

## 🔧 QUICK FIXES (PRIORYTET)

### FIX 1: Dodaj wybór projektu (30 min)
```typescript
// TeamDashboard.tsx linia 38
const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

// Po załadowaniu projektów, wybierz pierwszy
useEffect(() => {
  if (projects.length > 0 && !selectedProjectId) {
    setSelectedProjectId(projects[0].id);
  }
}, [projects]);

// Dodaj UI selecta (po headerze, linia ~410)
{projects.length > 0 && (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Wybierz projekt:
    </label>
    <select
      value={selectedProjectId || ''}
      onChange={(e) => setSelectedProjectId(e.target.value)}
      className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg"
    >
      {projects.map(project => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
  </div>
)}

// Zamień wszystkie projects[0].id na:
const activeProjectId = selectedProjectId || (projects.length > 0 ? projects[0].id : null);

{viewMode === 'tasks' && activeProjectId && (
  <TaskList projectId={activeProjectId} />
)}
```

### FIX 2: Dodaj edycję projektu (1h)
```typescript
// useTeamDashboard.ts
const updateProject = async (projectId: string, updates: Partial<Project>) => {
  const { data, error } = await supabaseRaw
    .from('communication_projects')
    .update(updates)
    .eq('id', projectId)
    .eq('created_by', user.id)
    .select()
    .single();
  
  if (error) throw error;
  setProjects(prev => prev.map(p => p.id === projectId ? data : p));
  return data;
};

const deleteProject = async (projectId: string) => {
  const { error } = await supabaseRaw
    .from('communication_projects')
    .delete()
    .eq('id', projectId)
    .eq('created_by', user.id);
  
  if (error) throw error;
  setProjects(prev => prev.filter(p => p.id !== projectId));
};

return { ..., updateProject, deleteProject };
```

```typescript
// TeamDashboard.tsx - widok projektów (linia 454)
{viewMode === 'projects' && (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Projekty</h2>
      <button 
        onClick={() => setViewMode('overview')} // lub otwórz modal tworzenia
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        + Nowy projekt
      </button>
    </div>
    {projects.length > 0 && (
      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{project.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-xs text-gray-500">
                    Status: {project.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    Utworzono: {new Date(project.created_at).toLocaleDateString('pl-PL')}
                  </span>
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEditProject(project)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edytuj"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDeleteProject(project.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Usuń"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}
```

### FIX 3: Debug zapisywania zadania (20 min)
```typescript
// components/Tasks/TaskFormModal.tsx
// Dodaj logowanie na początku handleSubmit

const handleSubmit = async () => {
  console.log('🔍 DEBUG TaskFormModal submit:', {
    projectId,
    formData,
    user: user?.id,
    hasProjectId: !!projectId,
    hasTitle: !!formData.title?.trim()
  });

  if (!projectId) {
    console.error('❌ ProjectId is missing!');
    alert('Błąd: Brak ID projektu');
    return;
  }

  if (!formData.title?.trim()) {
    console.error('❌ Title is missing!');
    alert('Błąd: Tytuł jest wymagany');
    return;
  }

  try {
    const result = await createTask({
      ...formData,
      project_id: projectId,
      created_by: user?.id || ''
    });
    console.log('✅ Task created:', result);
  } catch (error) {
    console.error('❌ Error creating task:', error);
    alert(`Błąd zapisu: ${error.message}`);
  }
};
```

---

## 🎯 PLAN NAPRAWY (4-6h)

### FAZA 1: Krytyczne (2h)
```
□ 1. Dodaj selectedProjectId state
□ 2. Dodaj dropdown wyboru projektu w headerze
□ 3. Zamień wszystkie projects[0].id na selectedProjectId
□ 4. Dodaj guard dla undefined projects
□ 5. Debug zapisywanie zadania (console logs)
```

### FAZA 2: Edycja projektów (2h)
```
□ 1. Dodaj updateProject() w useTeamDashboard
□ 2. Dodaj deleteProject() w useTeamDashboard
□ 3. Dodaj przyciski Edytuj/Usuń w widoku projektów
□ 4. Utworz EditProjectModal
□ 5. Dodaj confirm dialog dla usuwania
```

### FAZA 3: User experience (1-2h)
```
□ 1. Dodaj toast notifications (sukces/błąd)
□ 2. Dodaj loading states podczas operacji
□ 3. Fix undefined user w InvitesManager
□ 4. Walidacja selected project po usunięciu
```

---

## ✅ CO DZIAŁA DOBRZE

1. ✅ Nawigacja między widokami
2. ✅ Quick actions menu
3. ✅ Empty states (komunikaty gdy brak projektów)
4. ✅ Loading states
5. ✅ Error handling dla useTeamDashboard
6. ✅ Wyświetlanie listy projektów
7. ✅ Statystyki dashboardu
8. ✅ Aktywności (jeśli są dane)
9. ✅ Powiadomienia (jeśli są dane)

---

**NAJWAŻNIEJSZY FIX:** Dodaj `selectedProjectId` i zamień wszystkie `projects[0].id` → już rozwiąże 50% problemów!
