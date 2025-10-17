# 🔴 FIX: 408 TIMEOUT ERRORS - RLS POLICY ISSUE

**Data:** 2025-01-29  
**Problem:** Wszystkie zapytania do Supabase REST API zwracają **408 Request Timeout**  
**Root Cause:** Row Level Security (RLS) policies **blokują dostęp** do tabel lub **tabele nie istnieją**

---

## 🚨 BŁĘDY W KONSOLI

```
GET https://dtnotuyagygexmkyqtgb.supabase.co/rest/v1/earnings?select=*&worker_id=eq.xxx → 408
GET https://dtnotuyagygexmkyqtgb.supabase.co/rest/v1/portfolio_projects?select=*&worker_id=eq.xxx → 408
GET https://dtnotuyagygexmkyqtgb.supabase.co/rest/v1/reviews?select=*&worker_id=eq.xxx → 408
GET https://dtnotuyagygexmkyqtgb.supabase.co/rest/v1/job_applications?select=*&worker_id=eq.xxx → 408
```

**Wszystkie endpointy → 408** = Problem z **RLS policies** w Supabase

---

## ✅ CO NAPRAWIONO (TYMCZASOWO)

### `pages/WorkerDashboard.tsx` (Linie 145-185)

**ZAKOMENTOWANO wszystkie zapytania do Supabase:**

```typescript
// BEFORE (BŁĘDNE - powodowało 408):
const portfolioProjects = await workerProfileService.getPortfolioProjects(user.id);
const apps = await workerProfileService.getApplications(user.id);
const earningsData = await workerProfileService.getEarnings(user.id);
const reviewsData = await workerProfileService.getReviews(user.id);
const analyticsData = await workerProfileService.getAnalytics(user.id);

// AFTER (POPRAWIONE - mock data):
// const portfolioProjects = await workerProfileService.getPortfolioProjects(user.id);
setPortfolio([]); // Mock: empty until DB fixed

// const apps = await workerProfileService.getApplications(user.id);
setApplications([]); // Mock: empty until DB fixed

// const earningsData = await workerProfileService.getEarnings(user.id);
setEarnings([]); // Mock: empty until DB fixed

// const reviewsData = await workerProfileService.getReviews(user.id);
setReviews([]); // Mock: empty until DB fixed

// const analyticsData = await workerProfileService.getAnalytics(user.id);
setAnalytics({ 
  profile_views: 0, 
  job_views: 0, 
  applications_sent: 0, 
  applications_accepted: 0,
  total_earnings: 0,
  average_rating: 0,
  completed_jobs: 0,
  response_rate: 0
}); // Mock: zeros until DB fixed
```

**REZULTAT:** Worker Dashboard ładuje się bez 408 errors (używa pustych danych)

---

## 🔍 DLACZEGO TO SIĘ STAŁO?

### Możliwe przyczyny:

1. **Tabele nie istnieją w Supabase:**
   - `portfolio_projects`
   - `job_applications`
   - `earnings`
   - `reviews`

2. **RLS policies są zbyt restrykcyjne:**
   - Policies blokują `SELECT` dla authenticated users
   - `auth.uid()` nie pasuje do `worker_id` w zapytaniach

3. **Foreign keys są źle skonfigurowane:**
   - `worker_id` w tabelach może wskazywać na nieistniejącą kolumnę w `workers`

4. **Migration nie został wykonany:**
   - Plik `WORKER_PROFILE_DATABASE_MIGRATION.sql` (455 linii) **może nie być uruchomiony**

---

## 🛠️ JAK NAPRAWIĆ (KROK PO KROKU)

### KROK 1: Sprawdź czy tabele istnieją

**Uruchom w Supabase SQL Editor:**

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('portfolio_projects', 'job_applications', 'earnings', 'reviews');
```

**Oczekiwany wynik:**
```
portfolio_projects
job_applications
earnings
reviews
```

**Jeśli brakuje tabel → Uruchom migration:**
```sql
-- Uruchom cały plik:
c:\AI PROJEKT\zzp-werkplaats (3)\WORKER_PROFILE_DATABASE_MIGRATION.sql
```

---

### KROK 2: Sprawdź RLS policies

**Uruchom w Supabase SQL Editor:**

```sql
SELECT tablename, policyname, permissive, cmd
FROM pg_policies
WHERE tablename IN ('portfolio_projects', 'job_applications', 'earnings', 'reviews');
```

**Oczekiwane policies:**

#### `portfolio_projects`:
- ✅ "Workers can view own portfolio" → `SELECT` → `worker_id = auth.uid()`
- ✅ "Workers can insert own portfolio" → `INSERT` → `worker_id = auth.uid()`
- ✅ "Public can view portfolios" → `SELECT` → `true`

#### `job_applications`:
- ✅ "Workers can view own applications" → `SELECT` → `worker_id = auth.uid()`
- ✅ "Workers can insert own applications" → `INSERT` → `worker_id = auth.uid()`

#### `earnings`:
- ✅ "Workers can view own earnings" → `SELECT` → `worker_id = auth.uid()`

#### `reviews`:
- ✅ "Workers can view own reviews" → `SELECT` → `worker_id = auth.uid()`

**Jeśli brakuje policies → Uruchom sekcję RLS z migration file**

---

### KROK 3: Sprawdź czy `auth.uid()` działa

**Uruchom w Supabase SQL Editor (jako zalogowany user):**

```sql
SELECT auth.uid() as my_user_id;
```

**Oczekiwany wynik:**
```
my_user_id
------------------------------------------
a1b2c3d4-1234-5678-90ab-cdef12345678
```

**Jeśli `NULL` → Problem z authentication context w RLS**

---

### KROK 4: Sprawdź foreign keys

**Uruchom w Supabase SQL Editor:**

```sql
-- Sprawdź strukturę tabeli workers:
\d workers

-- Sprawdź czy worker_id istnieje:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'workers' 
  AND column_name IN ('id', 'profile_id');
```

**Oczekiwany wynik:**
```
profile_id | uuid  ← To jest prawdopodobnie to co powinno być worker_id
```

**BŁĄD:** `portfolio_projects.worker_id` może wskazywać na `workers.id`, ale powinno być `workers.profile_id`

**FIX:**
```sql
-- Zmień foreign key constraint:
ALTER TABLE portfolio_projects
DROP CONSTRAINT fk_portfolio_worker,
ADD CONSTRAINT fk_portfolio_worker
  FOREIGN KEY (worker_id)
  REFERENCES workers(profile_id)
  ON DELETE CASCADE;

-- Powtórz dla pozostałych tabel:
ALTER TABLE job_applications DROP CONSTRAINT fk_applications_worker;
ALTER TABLE job_applications ADD CONSTRAINT fk_applications_worker
  FOREIGN KEY (worker_id) REFERENCES workers(profile_id) ON DELETE CASCADE;

ALTER TABLE earnings DROP CONSTRAINT fk_earnings_worker;
ALTER TABLE earnings ADD CONSTRAINT fk_earnings_worker
  FOREIGN KEY (worker_id) REFERENCES workers(profile_id) ON DELETE CASCADE;

ALTER TABLE reviews DROP CONSTRAINT fk_reviews_worker;
ALTER TABLE reviews ADD CONSTRAINT fk_reviews_worker
  FOREIGN KEY (worker_id) REFERENCES workers(profile_id) ON DELETE CASCADE;
```

---

### KROK 5: Test query ręcznie

**Uruchom w Supabase SQL Editor (jako zalogowany worker):**

```sql
-- Test SELECT z RLS enabled:
SELECT * FROM portfolio_projects WHERE worker_id = auth.uid();
SELECT * FROM job_applications WHERE worker_id = auth.uid();
SELECT * FROM earnings WHERE worker_id = auth.uid();
SELECT * FROM reviews WHERE worker_id = auth.uid();
```

**Oczekiwany wynik:** Brak timeout, zwraca dane (lub puste jeśli brak rekordów)

**Jeśli nadal timeout → Sprawdź czy RLS jest enabled:**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('portfolio_projects', 'job_applications', 'earnings', 'reviews');
```

Wszystkie powinny mieć `rowsecurity = true`

---

## 🚀 PRZYWRÓCENIE FUNKCJONALNOŚCI

Po naprawieniu RLS policies, **odkomentuj zapytania** w `WorkerDashboard.tsx`:

```typescript
// REMOVE comments:
const portfolioProjects = await workerProfileService.getPortfolioProjects(user.id);
setPortfolio(portfolioProjects);

const apps = await workerProfileService.getApplications(user.id);
setApplications(apps);

const earningsData = await workerProfileService.getEarnings(user.id);
setEarnings(earningsData);

const stats = await workerProfileService.getEarningsStats(user.id);
setEarningsStats(stats);

const reviewsData = await workerProfileService.getReviews(user.id);
setReviews(reviewsData);

const analyticsData = await workerProfileService.getAnalytics(user.id);
setAnalytics(analyticsData);

// DELETE mock lines:
// setPortfolio([]); ← DELETE
// setApplications([]); ← DELETE
// setEarnings([]); ← DELETE
// setEarningsStats({ total: 0, ... }); ← DELETE
// setReviews([]); ← DELETE
// setAnalytics({ profile_views: 0, ... }); ← DELETE
```

---

## 📊 VERIFICATION CHECKLIST

Po naprawie, sprawdź:

- [ ] Supabase SQL Editor: `SELECT * FROM portfolio_projects` → zwraca dane
- [ ] Supabase SQL Editor: `SELECT * FROM earnings WHERE worker_id = auth.uid()` → brak timeout
- [ ] Console w przeglądarce: **BRAK 408 errors**
- [ ] Worker Dashboard: **Loading spinner znika po <3 sekundach**
- [ ] Worker Dashboard: **Dane się wyświetlają** (portfolio, earnings, reviews)

---

## 📝 PLIKI DO SPRAWDZENIA

1. **Migration SQL:**
   - `WORKER_PROFILE_DATABASE_MIGRATION.sql` (455 linii)
   - `QUICK_SQL_MIGRATION.sql` (59 linii)

2. **Service Layer:**
   - `services/workerProfileService.ts` (939 linii)

3. **Dashboard:**
   - `pages/WorkerDashboard.tsx` (1945 linii)

---

## ✅ STATUS

- ✅ **408 Timeout errors → FIXED (tymczasowo przez wyłączenie zapytań)**
- ✅ **Worker Dashboard → Loading działa (bez crashu)**
- ❌ **Dane z Supabase → NIE DZIAŁAJĄ (czekają na fix RLS)**

**NEXT STEP:** Uruchom diagnostykę w Supabase SQL Editor (KROK 1-5 powyżej)

---

**UWAGA:** Ten fix jest **TYMCZASOWY**. Worker Dashboard działa ale **nie pokazuje prawdziwych danych** z bazy. Aby to naprawić, musisz **uruchomić migration SQL** i **zweryfikować RLS policies** w Supabase Dashboard.
