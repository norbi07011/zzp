# 🗺️ DATABASE MIGRATION PLAN - Complete Overview

**Date:** 2025-10-31  
**Project:** ZZP Werkplaats (dtnotuyagygexmkyqtgb.supabase.co)  
**Author:** AI Copilot

---

## ✅ ISTNIEJĄCE TABELE Z RLS (Zweryfikowane)

### Core User Tables (z 001_complete_database_setup.sql):
1. **profiles** ✅ RLS enabled + policies
2. **workers** ✅ RLS enabled + policies
3. **employers** ✅ RLS enabled + policies
4. **certificates** ✅ RLS enabled + policies
5. **jobs** ✅ RLS enabled + policies
6. **applications** ✅ RLS enabled + policies
7. **reviews** ✅ RLS enabled + policies
8. **zzp_exam_applications** ✅ RLS enabled + policies

### Additional Tables (z późniejszych migracji):
9. **worker_skills** (z 20251024000004)
10. **messages** (z 20251024000005)
11. **worker_portfolio** (z 20251024000007)
12. **employer_saved_workers** (z 20251024000008)
13. **employer_stats** (z 20251024000009)
14. **notifications** (z 20251024000010)
15. **worker_availability** (z 20251024000011)
16. **earnings** (z 20251024000011)
17. **employer_search_history** (z 20251024000011)

---

## 🔍 TABELE WYMAGAJĄCE WERYFIKACJI RLS

### Project System Tables (z CREATE_COMPLETE_PROJECTS_SYSTEM.sql):
- **projects** - podstawowa tabela projektów
- **project_permissions** - uprawnienia członków
- **project_invitations** - zaproszenia do projektów  

### Team Communication (z 20251029_1400_complete_team_system.sql):
- **project_members** - członkowie zespołu
- **project_chat_messages** - wiadomości czatu
- **project_chat_groups** (z 20251029_1000_communication_system.sql)

### Task System (z 20251029_1245_create_task_system.sql):
- **project_tasks** - zadania projektowe

### Project Invites (z 20251030_2100_create_invites_system.sql):
- **project_invites** - zaproszenia do projektów (NOWA WERSJA)

### Communication Projects (z 20251029_1100_communication_projects.sql):
- **communication_projects**
- **communication_files**
- **project_communication_rooms**

### Other Tables:
- **portfolio_projects** (projekty portfolio pracowników)
- **saved_jobs** (zapisane oferty pracy)
- **profile_views** (wyświetlenia profilu)
- **team_activity_logs** (logi aktywności zespołu)

---

## 🚨 PROBLEMY DO NAPRAWIENIA

### 1. **Duplikacja struktur projektów**
   - ❌ **Problem:** Istnieją 3 różne systemy projektów:
     * `projects` (CREATE_COMPLETE_PROJECTS_SYSTEM.sql)
     * `communication_projects` (20251029_1100_communication_projects.sql)
     * Brak jasnej relacji między nimi
   - ✅ **Rozwiązanie:** Zunifikować do jednego systemu `projects`

### 2. **Duplikacja project_invites vs project_invitations**
   - ❌ **Problem:** Dwie tabele na to samo:
     * `project_invitations` (w CREATE_COMPLETE_PROJECTS_SYSTEM.sql)
     * `project_invites` (w 20251030_2100_create_invites_system.sql)
   - ✅ **Rozwiązanie:** Użyć `project_invites` (nowszy, prostszy)

### 3. **Brakujące Foreign Keys**
   - ❌ **Problem:** Tabele bez FK constraints:
     * jobs.employer_id → employers.id
     * messages.sender_id / receiver_id → profiles.id
     * project_tasks.project_id → projects.id
   - ✅ **Rozwiązanie:** Dodać FK po wyczyszczeniu orphaned data

### 4. **Brakujące RLS Policies**
   - ❌ **Problem:** Wiele tabel bez policies lub z niepełnymi
   - ✅ **Rozwiązanie:** Dodać policies dla każdej tabeli

### 5. **Brakujące Indexes**
   - ❌ **Problem:** Wolne queries na FK i często używanych kolumnach
   - ✅ **Rozwiązanie:** Dodać indeksy na FK i search fields

---

## 📋 MIGRATION SEQUENCE (Po kolei)

### FAZA 5.1: Database Diagnosis & Cleanup ⏳ IN PROGRESS
**Czas:** ~30 min  
**Cel:** Sprawdzić dokładnie co jest w bazie, wyczyścić orphaned data

**Kroki:**
1. ✅ Utworzyć skrypt diagnostyczny (COMPREHENSIVE_DATABASE_DIAGNOSIS.sql)
2. ⏳ Uruchomić diagnostykę przez Supabase Dashboard
3. ⏳ Przeanalizować wyniki
4. ⏳ Stworzyć cleanup script dla orphaned data

**Pliki:**
- `database-migrations/20251031_1000_DIAGNOSIS_RESULTS.md` (raport)
- `database-migrations/20251031_1100_CLEANUP_ORPHANED_DATA.sql`

---

### FAZA 5.2: Foreign Keys & Constraints
**Czas:** ~1 godzina  
**Cel:** Dodać brakujące FK i constraints

**Kroki:**
1. Cleanup orphaned data (z FAZY 5.1)
2. Dodać FK constraints:
   ```sql
   ALTER TABLE jobs 
   ADD CONSTRAINT fk_jobs_employer 
   FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE CASCADE;
   ```
3. Dodać NOT NULL gdzie potrzeba
4. Dodać UNIQUE constraints
5. Dodać CHECK constraints
6. Utworzyć indeksy na FK

**Pliki:**
- `database-migrations/20251031_1200_ADD_FOREIGN_KEYS.sql`
- `database-migrations/20251031_1300_ADD_CONSTRAINTS.sql`
- `database-migrations/20251031_1400_ADD_INDEXES.sql`

---

### FAZA 5.3: RLS Policies - Core Tables
**Czas:** ~1 godzina  
**Cel:** Dodać/naprawić RLS dla głównych tabel

**Tabele:**
- profiles (sprawdzić istniejące)
- workers (sprawdzić istniejące)
- employers (sprawdzić istniejące)
- jobs (dodać policies dla employer/worker)
- job_applications (dodać policies)

**Wzór policy:**
```sql
-- Employer może widzieć wszystkie jobs
CREATE POLICY "Employers can view all jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'employer'
    )
  );

-- Worker może widzieć tylko opublikowane jobs
CREATE POLICY "Workers can view published jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    status = 'published' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'worker'
    )
  );
```

**Pliki:**
- `database-migrations/20251031_1500_RLS_CORE_TABLES.sql`

---

### FAZA 5.4: RLS Policies - Communication
**Czas:** ~45 min  
**Cel:** RLS dla messages, notifications, communication_files

**Tabele:**
- messages (sender/receiver access)
- notifications (user access)
- communication_files (project member access)

**Pliki:**
- `database-migrations/20251031_1600_RLS_COMMUNICATION.sql`

---

### FAZA 5.5: RLS Policies - Projects
**Czas:** ~1 godzina  
**Cel:** RLS dla wszystkich tabel projektowych

**Tabele:**
- projects (owner + members)
- project_members (owner + member)
- project_invites (inviter + invitee)
- project_tasks (project members)
- project_chat_groups (project members)
- project_chat_messages (group members)

**Wzór policy:**
```sql
-- Project members mogą widzieć projekt
CREATE POLICY "Project members can view project"
  ON projects FOR SELECT
  TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = projects.id
      AND profile_id = auth.uid()
    )
  );
```

**Pliki:**
- `database-migrations/20251031_1700_RLS_PROJECTS.sql`

---

### FAZA 5.6: RLS Policies - Remaining Tables
**Czas:** ~1 godzina  
**Cel:** RLS dla pozostałych tabel

**Tabele:**
- saved_jobs
- certificates
- worker_portfolio
- employer_saved_workers
- employer_search_history
- profile_views
- team_activity_logs
- worker_availability
- earnings
- employer_stats
- reviews
- worker_skills
- portfolio_projects

**Pliki:**
- `database-migrations/20251031_1800_RLS_REMAINING.sql`

---

### FAZA 5.7: Verification & Testing
**Czas:** ~30 min  
**Cel:** Sprawdzić czy wszystko działa

**Kroki:**
1. Sprawdzić czy wszystkie tabele mają RLS enabled
2. Sprawdzić czy wszystkie FK działają
3. Testować queries jako różne role
4. Zweryfikować że orphaned data nie wraca
5. Sprawdzić indeksy (EXPLAIN ANALYZE)

**Pliki:**
- `database-migrations/20251031_1900_VERIFICATION.sql`
- `database-migrations/20251031_2000_FINAL_REPORT.md`

---

## 🎯 EXPECTED OUTCOMES

✅ **Bezpieczeństwo:**
- Wszystkie tabele z RLS enabled
- Policies dla każdej roli (worker, employer, admin)
- Brak public access do wrażliwych danych

✅ **Integralność:**
- Wszystkie FK constraints działają
- Brak orphaned data
- Cascading deletes poprawnie skonfigurowane

✅ **Wydajność:**
- Indeksy na FK i search fields
- Szybkie queries

✅ **Przejrzystość:**
- Jasna struktura bazy
- Dokumentacja każdej migracji
- Rollback plans

---

## 📊 CURRENT STATUS

- **FAZA 5.1:** ⏳ IN PROGRESS (diagnostyka)
- **FAZA 5.2-5.7:** ⏸️ PENDING

**Next Action:** Uruchomić COMPREHENSIVE_DATABASE_DIAGNOSIS.sql przez Supabase Dashboard
