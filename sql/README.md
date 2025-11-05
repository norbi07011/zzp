# SQL Files - Instrukcja Użycia

## 📋 Przygotowane pliki SQL do wklejenia w Supabase Dashboard

### 1️⃣ **00-insert-ALL-test-jobs.sql** ⭐ RECOMMENDED
**Co robi:** Dodaje 3 testowe oferty pracy (Metselaar, Elektricien, Timmerman)  
**Kiedy użyć:** Aby szybko dodać wszystkie test jobs jednocześnie

**Jak użyć:**
1. Otwórz https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql/new
2. Skopiuj całą zawartość pliku `00-insert-ALL-test-jobs.sql`
3. Wklej w SQL Editor
4. Kliknij **Run** (lub Ctrl+Enter)
5. Sprawdź wyniki - powinny pokazać 3 nowe jobs

**Rezultat:**
- Job 1: Metselaar - Amsterdam (Featured, Fulltime, Onsite)
- Job 2: Elektricien - Rotterdam (Urgent, Fulltime, Onsite)  
- Job 3: Timmerman - Utrecht (Featured, Part-time, Hybrid)

---

### 2️⃣ **01-insert-test-job.sql**
**Co robi:** Dodaje 1 job - Metselaar Amsterdam  
**Kiedy użyć:** Jeśli chcesz dodać tylko Metselaar job

---

### 3️⃣ **02-insert-test-job-electrician.sql**
**Co robi:** Dodaje 1 job - Elektricien Rotterdam  
**Kiedy użyć:** Jeśli chcesz dodać tylko Elektricien job

---

### 4️⃣ **03-insert-test-job-carpenter.sql**
**Co robi:** Dodaje 1 job - Timmerman Utrecht (hybride)  
**Kiedy użyć:** Jeśli chcesz dodać tylko Timmerman job

---

### 5️⃣ **check-enum-constraints.sql** 🔍
**Co robi:** Sprawdza jakie wartości są dozwolone w check constraints  
**Kiedy użyć:** Jeśli dostajesz błąd "violates check constraint" i chcesz zobaczyć dozwolone wartości

**Jak użyć:**
1. Wklej w SQL Editor
2. Run
3. Zobacz constraint definitions (np. employment_type IN ('fulltime', 'parttime', 'contract'))

---

### 6️⃣ **setup-jobs-rls-policies.sql** 🔐
**Co robi:** Konfiguruje Row Level Security policies dla jobs table  
**Kiedy użyć:** Jeśli JobBrowser nie widzi jobs (anon key blocked by RLS)

**Policies:**
- ✅ Anyone can view active jobs (public read)
- ✅ Employers can create their own jobs
- ✅ Employers can update their own jobs
- ✅ Employers can delete their own jobs

**UWAGA:** To może już być skonfigurowane! Sprawdź najpierw czy jobs są widoczne.

---

### 7️⃣ **add-foreign-key-jobs-employer.sql** 🔗
**Co robi:** Sprawdza/dodaje foreign key constraint jobs.employer_id → employers.id  
**Kiedy użyć:** Jeśli relationship w database.types.ts jest pusty

**UWAGA:** Foreign key prawdopodobnie już istnieje - ten plik służy do weryfikacji.

---

## 🚀 Quick Start - Najprostszy sposób

### Krok 1: Dodaj test jobs
```sql
-- Wklej zawartość: 00-insert-ALL-test-jobs.sql
-- W: https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql/new
```

### Krok 2: Sprawdź czy działa
```sql
SELECT COUNT(*) FROM jobs;
-- Powinno pokazać: 3
```

### Krok 3: Test w UI
```
Otwórz: http://localhost:3003
Login jako worker (test-worker@example.com)
Przejdź do: Worker Dashboard → Job Browser
Powinieneś widzieć 3 oferty!
```

---

## ⚠️ Troubleshooting

### Problem: "violates check constraint"
**Rozwiązanie:** Użyj `check-enum-constraints.sql` aby zobaczyć dozwolone wartości

### Problem: "foreign key constraint violation"
**Rozwiązanie:**
1. Sprawdź czy employer_id istnieje: `SELECT id FROM employers WHERE id = '66bb0aef-c74c-4bbc-9705-43d9e4c35042';`
2. Jeśli nie - użyj innego employer_id lub stwórz nowego employera

### Problem: "Jobs table empty po INSERT"
**Rozwiązanie:** Sprawdź RLS policies - użyj `setup-jobs-rls-policies.sql`

### Problem: "Permission denied"
**Rozwiązanie:** Upewnij się że jesteś zalogowany jako Owner projektu w Supabase Dashboard

---

## 📊 Verification Queries

### Sprawdź wszystkie jobs
```sql
SELECT id, title, city, status, employment_type, urgent, featured 
FROM jobs 
ORDER BY created_at DESC;
```

### Sprawdź employer
```sql
SELECT id, company_name, city 
FROM employers 
WHERE id = '66bb0aef-c74c-4bbc-9705-43d9e4c35042';
```

### Sprawdź RLS policies
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'jobs';
```

---

## ✅ Expected Result

Po wklejeniu `00-insert-ALL-test-jobs.sql` powinieneś zobaczyć:

```
| id                                   | title                              | city      | employment_type | urgent | featured |
|--------------------------------------|-------------------------------------|-----------|-----------------|--------|----------|
| <uuid>                               | Metselaar gezocht - Amsterdam       | Amsterdam | fulltime        | false  | true     |
| <uuid>                               | Elektricien - Woningbouw Rotterdam  | Rotterdam | fulltime        | true   | false    |
| <uuid>                               | Timmerman - Meubelmaker (Hybride)   | Utrecht   | parttime        | false  | true     |
```

**Total:** 3 jobs
**Status:** All 'active'
**Employer:** Test Bouwbedrijf BV

---

## 🎯 Next Steps After SQL Insert

1. ✅ Test JobBrowser UI (http://localhost:3003)
2. ✅ Test filtering (city, employment type, etc.)
3. ✅ Test application flow (Apply button)
4. ✅ Create CreateJob.tsx for employers
5. ✅ Configure RLS for storage (avatar/certificate upload)

---

**Potrzebujesz pomocy?** Daj znać jeśli coś nie działa! 🚀
