# 🚀 QUICK START GUIDE - Baza Danych ZZP Werkplaats

**Ostatnia aktualizacja:** 24 października 2025

---

## ✅ CO ZOSTAŁO ZROBIONE

### 📊 Tabele (18 utworzonych i wdrożonych):
- ✅ `profiles`, `workers`, `employers`, `jobs`
- ✅ `applications`, `worker_skills`, `worker_portfolio`, `worker_availability`
- ✅ `employer_saved_workers`, `employer_search_history`, `employer_stats`
- ✅ `messages`, `notifications`, `reviews`
- ✅ `earnings`, `certificates`
- ✅ `admin_logs`, `analytics_events`

### 🔐 Bezpieczeństwo:
- ✅ RLS (Row Level Security) włączone na wszystkich tabelach
- ✅ Polityki dostępu dla workers, employers, admins
- ✅ Triggery automatyzujące aktualizacje

### 📁 Dokumentacja:
- ✅ `DATABASE_ANALYSIS.md` - pełna analiza wymagań
- ✅ `DATABASE_COMPLETE.md` - szczegółowe podsumowanie
- ✅ `QUICK_START.md` - ten dokument

---

## 🛠️ NARZĘDZIA TERMINALA

Stworzone pomocnicze skrypty PowerShell:

### `db-exec.ps1` - Zarządzanie bazą
```powershell
# Pokaż wszystkie tabele
.\db-exec.ps1 -Tables

# Eksportuj schemat
.\db-exec.ps1 -Schema
```

### `view-data.ps1` - Przeglądanie danych
```powershell
# Zobacz dane z tabeli
.\view-data.ps1 profiles
.\view-data.ps1 workers
.\view-data.ps1 employers
.\view-data.ps1 applications
```

### `new-migration.ps1` - Tworzenie migracji
```powershell
# Dodaj nową kolumnę
.\new-migration.ps1 "add_column_name" "ALTER TABLE workers ADD COLUMN test TEXT;"

# Wstaw dane
.\new-migration.ps1 "insert_data" "INSERT INTO ..."
```

---

## 📋 NASTĘPNE KROKI DLA DEVELOPERA

### 1. Regeneruj typy TypeScript
```powershell
supabase gen types typescript --local > src/lib/database.types.ts
```
**LUB** (dla remote database):
```powershell
supabase gen types typescript --project-id dtnotuyagygexmkyqtgb > src/lib/database.types.ts
```

### 2. Zaktualizuj Services

#### `workerProfileService.ts` - już gotowe, ale sprawdź:
- ✅ `getWorkerProfile()` - pobiera workers z nowymi kolumnami
- ✅ `updateWorkerProfile()` - aktualizuje rozszerzone pola
- 🔄 Dodaj funkcje dla worker_skills, worker_portfolio

#### `employerService.ts` - już gotowe, ale sprawdź:
- ✅ `getEmployerStats()` - używa employer_stats
- ✅ `getSavedWorkers()` - używa employer_saved_workers
- 🔄 Dodaj funkcje dla employer_search_history

#### Nowe serwisy do utworzenia:
- 📝 `applicationService.ts` - zarządzanie aplikacjami
- 📝 `messageService.ts` - system wiadomości
- 📝 `notificationService.ts` - powiadomienia
- 📝 `reviewService.ts` - recenzje

### 3. Przykład użycia - Worker Skills

```typescript
// services/workerSkillsService.ts
import { supabase } from '@/lib/supabase';

export async function getWorkerSkills(workerId: string) {
  const { data, error } = await supabase
    .from('worker_skills')
    .select('*')
    .eq('worker_id', workerId)
    .order('proficiency', { ascending: false });
  
  return { data, error };
}

export async function addWorkerSkill(workerId: string, skill: {
  skill_name: string;
  proficiency: number;
  years_experience?: number;
}) {
  const { data, error } = await supabase
    .from('worker_skills')
    .insert({
      worker_id: workerId,
      ...skill
    })
    .select()
    .single();
  
  return { data, error };
}

export async function updateWorkerSkill(skillId: string, updates: {
  proficiency?: number;
  years_experience?: number;
}) {
  const { data, error } = await supabase
    .from('worker_skills')
    .update(updates)
    .eq('id', skillId)
    .select()
    .single();
  
  return { data, error };
}

export async function deleteWorkerSkill(skillId: string) {
  const { error } = await supabase
    .from('worker_skills')
    .delete()
    .eq('id', skillId);
  
  return { error };
}
```

### 4. Przykład użycia w komponencie

```tsx
// components/WorkerSkillsManager.tsx
import { useState, useEffect } from 'react';
import { getWorkerSkills, addWorkerSkill } from '../services/workerSkillsService';

export function WorkerSkillsManager({ workerId }: { workerId: string }) {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: '', proficiency: 3 });

  useEffect(() => {
    loadSkills();
  }, [workerId]);

  async function loadSkills() {
    const { data } = await getWorkerSkills(workerId);
    if (data) setSkills(data);
  }

  async function handleAddSkill() {
    await addWorkerSkill(workerId, {
      skill_name: newSkill.name,
      proficiency: newSkill.proficiency
    });
    loadSkills();
  }

  return (
    <div>
      <h3>My Skills</h3>
      {skills.map(skill => (
        <div key={skill.id}>
          {skill.skill_name} - Level {skill.proficiency}/5
        </div>
      ))}
      {/* Add skill form */}
    </div>
  );
}
```

---

## 🔍 SPRAWDZANIE STANU BAZY

### Szybkie sprawdzenie tabel:
```powershell
.\db-exec.ps1 -Tables
```

### Eksport pełnego schematu:
```powershell
supabase db dump --schema public -f database/current_schema.sql
```

### Sprawdź dane w tabeli:
```powershell
.\view-data.ps1 profiles
.\view-data.ps1 workers
.\view-data.ps1 employer_stats
```

---

## 📊 STRUKTURA DANYCH DLA KAŻDEGO PANELU

### Worker Dashboard - Co jest dostępne:

**Profil:**
- `workers.*` - wszystkie dane pracownika
- `worker_skills` - umiejętności
- `worker_portfolio` - portfolio projektów
- `worker_availability` - kalendarz
- `certificates` - certyfikaty

**Aktywność:**
- `applications` - aplikacje na oferty
- `earnings` - historia zarobków
- `reviews` - otrzymane oceny (jako reviewee)
- `messages` - wiadomości
- `notifications` - powiadomienia

### Employer Dashboard - Co jest dostępne:

**Profil:**
- `employers.*` - wszystkie dane firmy
- `employer_stats` - statystyki dashboardu

**Zarządzanie:**
- `jobs` - opublikowane oferty
- `applications` - otrzymane aplikacje
- `employer_saved_workers` - zapisani pracownicy
- `employer_search_history` - historia wyszukiwań

**Komunikacja:**
- `messages` - wiadomości
- `notifications` - powiadomienia
- `reviews` - wystawione oceny (jako reviewer)

### Admin Dashboard - Co jest dostępne:

**Wszystko + dodatkowe:**
- `admin_logs` - logi akcji administracyjnych
- `analytics_events` - zdarzenia analityczne
- Pełny dostęp do wszystkich tabel przez RLS policies

---

## 🎯 ROADMAP INTEGRACJI

### Krok 1: Podstawowa integracja (PRIORYTET)
- [ ] Regeneruj `database.types.ts`
- [ ] Zaktualizuj `workerProfileService.ts`
- [ ] Zaktualizuj `employerService.ts`
- [ ] Przetestuj login i rejestrację

### Krok 2: Worker Dashboard
- [ ] Dodaj zarządzanie skills
- [ ] Dodaj zarządzanie portfolio
- [ ] Dodaj system aplikacji
- [ ] Dodaj widok zarobków

### Krok 3: Employer Dashboard
- [ ] Dodaj publikowanie ofert
- [ ] Dodaj przeglądanie aplikacji
- [ ] Dodaj zapisywanie pracowników
- [ ] Dodaj statystyki dashboardu

### Krok 4: Komunikacja
- [ ] System wiadomości
- [ ] System powiadomień
- [ ] System recenzji

### Krok 5: Admin Panel
- [ ] Moderacja użytkowników
- [ ] Moderacja recenzji
- [ ] Logi audytowe
- [ ] Analityka

---

## 🐛 TROUBLESHOOTING

### Problem: "relation does not exist"
**Rozwiązanie:** Sprawdź czy migracje zostały zastosowane:
```powershell
supabase db push
```

### Problem: "permission denied for table"
**Rozwiązanie:** Sprawdź RLS policies. Możesz tymczasowo wyłączyć RLS (tylko dev):
```sql
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
```

### Problem: Nie widzisz danych
**Rozwiązanie:** Sprawdź czy user jest zalogowany i ma odpowiednią rolę:
```typescript
const { data: { user } } = await supabase.auth.getUser();
console.log('User:', user?.id, 'Role:', user?.role);
```

---

## 📞 KLUCZOWE POLECENIA

```powershell
# Sprawdź połączenie z bazą
supabase db ping

# Zobacz tabele
.\db-exec.ps1 -Tables

# Eksportuj schemat
.\db-exec.ps1 -Schema

# Zobacz dane
.\view-data.ps1 [table_name]

# Zastosuj migracje
supabase db push

# Generuj typy
supabase gen types typescript --project-id dtnotuyagygexmkyqtgb > src/lib/database.types.ts
```

---

## ✅ CHECKLIST PRZED ROZPOCZĘCIEM PRACY

- [x] Baza danych utworzona i wdrożona
- [x] 18 tabel z pełną funkcjonalnością
- [x] RLS policies aktywne
- [x] Dokumentacja kompletna
- [ ] `database.types.ts` zaktualizowane
- [ ] Serwisy zaktualizowane
- [ ] Komponenty zintegrowane
- [ ] Testy napisane

---

## 🎉 GOTOWE DO UŻYCIA!

Baza danych jest **w pełni funkcjonalna i gotowa do integracji z frontendem**.

Wszystkie tabele są wdrożone na produkcji Supabase i chronione przez RLS.

**Możesz rozpocząć pracę nad komponentami frontend!** 🚀
