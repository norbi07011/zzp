# 🗄️ ANALIZA BAZY DANYCH - ZZP WERKPLAATS

**Data:** 24 października 2025  
**Status:** Analiza kompletna - gotowy do implementacji

---

## 📊 EXECUTIVE SUMMARY

### Istniejące tabele (już w bazie):
- ✅ `profiles` - podstawowe dane użytkowników
- ✅ `employers` - profile pracodawców + subskrypcje
- ✅ `workers` - profile pracowników + subskrypcje + certyfikaty ZZP
- ✅ `jobs` - oferty pracy (kompleksowa tabela)

### Brakujące tabele (do utworzenia):
- ❌ `applications` - aplikacje na oferty pracy
- ❌ `worker_skills` - umiejętności pracowników
- ❌ `worker_portfolio` - portfolio/projekty pracowników
- ❌ `worker_availability` - kalendarz dostępności
- ❌ `reviews` - recenzje/oceny
- ❌ `messages` - system wiadomości
- ❌ `notifications` - powiadomienia
- ❌ `employer_stats` - statystyki pracodawców
- ❌ `employer_search_history` - historia wyszukiwań
- ❌ `employer_saved_workers` - zapisani pracownicy
- ❌ `admin_logs` - logi administracyjne
- ❌ `certificates` - certyfikaty/kursy
- ❌ `earnings` - zarobki pracowników
- ❌ `analytics_events` - zdarzenia analityczne

---

## 🎯 ANALIZA WEDŁUG PANELI

### 1️⃣ PANEL PRACOWNIKA (Worker Dashboard)

#### Wymagane funkcjonalności (z kodu):
```typescript
// Z WorkerDashboard.tsx - lines 1-100
- Profil pracownika (edycja, zdjęcia)
- Portfolio projektów
- Umiejętności (skills)
- Certyfikaty
- Dostępność/kalendarz
- Aplikacje na oferty
- Zarobki (earnings)
- Recenzje (reviews)
- Analityka
- Subskrypcja
```

#### Potrzebne tabele:

**1.1 WORKERS (✅ istnieje - wymaga rozszerzenia)**
```sql
-- ISTNIEJĄCE KOLUMNY:
id, profile_id, specialization, experience_years, verified,
subscription_tier, subscription_status, zzp_certificate_*

-- DO DODANIA:
avatar_url, phone, location_city, location_postal_code,
hourly_rate, hourly_rate_max, radius_km, available_from,
rating, rating_count, bio, languages[], kvk_number, btw_number,
profile_visibility, show_email, show_phone, show_location,
email_notifications, sms_notifications, push_notifications,
own_tools[], own_vehicle, vehicle_type, response_time,
total_jobs_completed, profile_views, last_active
```

**1.2 WORKER_SKILLS (❌ nowa tabela)**
```sql
CREATE TABLE worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency INTEGER CHECK (proficiency BETWEEN 1 AND 5),
  years_experience INTEGER,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, skill_name)
);
```

**1.3 WORKER_PORTFOLIO (❌ nowa tabela)**
```sql
CREATE TABLE worker_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  project_url TEXT,
  images TEXT[],
  tags TEXT[],
  start_date DATE,
  end_date DATE,
  client_name TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**1.4 WORKER_AVAILABILITY (❌ nowa tabela)**
```sql
CREATE TABLE worker_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_booked BOOLEAN DEFAULT false,
  booking_job_id UUID REFERENCES jobs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, date, start_time)
);
```

**1.5 APPLICATIONS (❌ nowa tabela)**
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employers(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  proposed_rate NUMERIC(10,2),
  available_from DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, worker_id)
);
```

**1.6 EARNINGS (❌ nowa tabela)**
```sql
CREATE TABLE earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id),
  employer_id UUID REFERENCES employers(id),
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  payment_date DATE NOT NULL,
  payment_method TEXT,
  invoice_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 2️⃣ PANEL PRACODAWCY (Employer Dashboard)

#### Wymagane funkcjonalności (z kodu):
```typescript
// Z EmployerDashboard.tsx - lines 1-100
- Profil firmy
- Publikowanie ofert pracy
- Przeglądanie aplikacji
- Wyszukiwanie pracowników
- Zapisani pracownicy
- Historia wyszukiwań
- Wiadomości
- Statystyki
```

#### Potrzebne tabele:

**2.1 EMPLOYERS (✅ istnieje - wymaga rozszerzenia)**
```sql
-- ISTNIEJĄCE:
id, profile_id, company_name, kvk_number, subscription_*

-- DO DODANIA:
logo_url, website, description, industry, company_size,
address, city, postal_code, country,
contact_person, contact_phone, contact_email,
verified BOOLEAN DEFAULT false,
verified_at TIMESTAMPTZ,
total_jobs_posted INTEGER DEFAULT 0,
total_hires INTEGER DEFAULT 0,
avg_rating NUMERIC(3,2),
created_at (już jest), updated_at
```

**2.2 EMPLOYER_STATS (❌ nowa tabela)**
```sql
CREATE TABLE employer_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE UNIQUE,
  total_searches INTEGER DEFAULT 0,
  searches_this_month INTEGER DEFAULT 0,
  total_saved_workers INTEGER DEFAULT 0,
  total_contacts INTEGER DEFAULT 0,
  contacts_this_month INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**2.3 EMPLOYER_SEARCH_HISTORY (❌ nowa tabela)**
```sql
CREATE TABLE employer_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  search_date TIMESTAMPTZ DEFAULT NOW(),
  category TEXT,
  subcategory TEXT,
  level TEXT,
  location_city TEXT,
  radius_km INTEGER,
  min_rate NUMERIC(10,2),
  max_rate NUMERIC(10,2),
  skills TEXT[],
  results_count INTEGER,
  filters JSONB
);
```

**2.4 EMPLOYER_SAVED_WORKERS (❌ nowa tabela)**
```sql
CREATE TABLE employer_saved_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  tags TEXT[],
  UNIQUE(employer_id, worker_id)
);
```

**2.5 JOBS (✅ istnieje - doskonała tabela, nie wymaga zmian)**
```sql
-- Ta tabela jest już kompleksowa i zawiera wszystko co potrzebne:
-- - Podstawowe info (title, description, location)
-- - Wynagrodzenie (salary_min, salary_max, salary_period)
-- - Wymagania (required_skills, required_certificates, experience_level)
-- - Status (draft, active, paused, closed, filled, expired)
-- - Statystyki (views_count, applications_count)
-- - Flagowanie (urgent, featured)
-- ✅ NIE TRZEBA NIC DODAWAĆ
```

---

### 3️⃣ PANEL ADMINA (Admin Dashboard)

#### Wymagane funkcjonalności (z kodu):
```typescript
// Z AdminDashboard.tsx - lines 1-100
- Zarządzanie pracownikami
- Zarządzanie pracodawcami
- Zarządzanie ofertami pracy
- Certyfikaty/zatwierdzanie
- Wiadomości systemowe
- Raporty
- Analityka
- Bezpieczeństwo
- SEO/Marketing
- Płatności
```

#### Potrzebne tabele:

**3.1 ADMIN_LOGS (❌ nowa tabela)**
```sql
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  target_type TEXT, -- 'worker', 'employer', 'job', 'certificate', etc.
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**3.2 CERTIFICATES (❌ nowa tabela)**
```sql
CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  certificate_type TEXT NOT NULL, -- 'VCA', 'BHV', 'Custom'
  certificate_name TEXT NOT NULL,
  certificate_number TEXT UNIQUE,
  issuer TEXT,
  issue_date DATE,
  expiry_date DATE,
  file_url TEXT,
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**3.3 ZZP_EXAM_APPLICATIONS (✅ prawdopodobnie istnieje)**
```sql
-- Ta tabela jest wspomniana w schema_20251024_224353.sql
-- Sprawdzić czy istnieje i ewentualnie rozszerzyć
```

---

## 💬 WSPÓLNE TABELE (dla wszystkich paneli)

**4.1 REVIEWS (❌ nowa tabela)**
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id),
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id), -- kto wystawia recenzję
  reviewee_id UUID REFERENCES profiles(id), -- kto dostaje recenzję
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  photos TEXT[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  verified_by_platform BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, reviewer_id, reviewee_id)
);
```

**4.2 MESSAGES (❌ nowa tabela)**
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  subject TEXT,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  job_id UUID REFERENCES jobs(id), -- opcjonalne powiązanie z ofertą
  attachments TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**4.3 NOTIFICATIONS (❌ nowa tabela)**
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**4.4 ANALYTICS_EVENTS (❌ nowa tabela)**
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  properties JSONB,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📋 PODSUMOWANIE - PLAN IMPLEMENTACJI

### Priorytety:

**P0 - KRYTYCZNE (potrzebne natychmiast):**
1. ✅ Rozszerzenie tabeli `workers` (dodać brakujące kolumny)
2. ✅ Rozszerzenie tabeli `employers` (dodać brakujące kolumny)
3. ✅ Tabela `applications` (aplikacje na oferty pracy)
4. ✅ Tabela `worker_skills` (umiejętności)
5. ✅ Tabela `messages` (wiadomości)

**P1 - WYSOKIE (potrzebne dla pełnej funkcjonalności):**
6. ✅ Tabela `reviews` (recenzje)
7. ✅ Tabela `worker_portfolio` (portfolio)
8. ✅ Tabela `employer_saved_workers` (zapisani pracownicy)
9. ✅ Tabela `employer_stats` (statystyki pracodawców)
10. ✅ Tabela `notifications` (powiadomienia)

**P2 - ŚREDNIE (nice-to-have):**
11. ✅ Tabela `worker_availability` (kalendarz)
12. ✅ Tabela `earnings` (zarobki)
13. ✅ Tabela `employer_search_history` (historia wyszukiwań)
14. ✅ Tabela `certificates` (certyfikaty)
15. ✅ Tabela `admin_logs` (logi admina)

**P3 - NISKIE (przyszłość):**
16. ✅ Tabela `analytics_events` (analityka)

---

## 🔐 ROW LEVEL SECURITY (RLS)

Każda tabela będzie miała polityki RLS:
- Workers mogą czytać/edytować tylko swoje dane
- Employers mogą czytać/edytować tylko swoje dane
- Admin ma pełny dostęp
- Public może czytać publiczne profile (jeśli visibility = 'public')

---

## 🎯 NASTĘPNE KROKI

1. ✅ Analiza zakończona
2. 🔄 Tworzenie migracji dla każdej tabeli/grupy tabel
3. 🔄 Testowanie każdej migracji
4. 🔄 Dodanie RLS policies
5. 🔄 Dodanie funkcji pomocniczych i triggerów
6. 🔄 Aktualizacja database.types.ts
7. 🔄 Testy integracyjne

**Status:** Gotowy do rozpoczęcia tworzenia migracji 🚀
