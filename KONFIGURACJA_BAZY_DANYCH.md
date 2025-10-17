# ✅ Konfiguracja Bazy Danych - ZAKOŃCZONA

## 🎯 Co zostało zrobione

### 1. Struktura Bazy Danych ✅

Utworzono **8 głównych tabel** z pełnym systemem bezpieczeństwa (RLS):

#### **profiles** - Profile użytkowników
- Główna tabela dla wszystkich użytkowników
- Role: `worker`, `employer`, `admin`
- Pola: email, full_name, avatar_url, phone, language, role, is_premium
- **RLS**: Użytkownicy widzą swoje profile, admini widzą wszystko

#### **workers** - Pracownicy (ZZP)
- Szczegółowe dane pracowników
- Pola: kvk_number, specialization, hourly_rate, location, skills, certifications
- **Subskrypcje**: subscription_tier (basic/plus), subscription_status
- **Nowe funkcje**: worker_type, team_size, is_on_demand_available
- **RLS**: Pracownicy edytują swoje dane, pracodawcy widzą wszystkich

#### **employers** - Pracodawcy
- Szczegółowe dane firm
- Pola: company_name, kvk_number, industry, location, description
- **Subskrypcje**: subscription_tier (basic/pro), subscription_status
- **RLS**: Pracodawcy edytują swoje dane, pracownicy widzą wszystkich

#### **certificates** - Certyfikaty
- Certyfikaty pracowników (VCA, BHV, etc.)
- Pola: certificate_type, certificate_number, issuer, issue_date, expiry_date
- Weryfikacja: verified (boolean), ocr_data (jsonb)
- **RLS**: Pracownicy zarządzają swoimi, pracodawcy widzą wszystkie

#### **jobs** - Oferty pracy
- Ogłoszenia o pracę od pracodawców
- Pola: title, description, specialization, location, hourly_rate_min/max
- Status: open, closed, filled
- **RLS**: Wszyscy widzą otwarte oferty, pracodawcy zarządzają swoimi

#### **applications** - Aplikacje
- Aplikacje pracowników na oferty
- Pola: job_id, worker_id, status, cover_letter, hourly_rate
- Status: pending, accepted, rejected, withdrawn
- **RLS**: Pracownicy widzą swoje, pracodawcy widzą aplikacje do swoich ofert

#### **reviews** - Opinie
- Oceny pracowników przez pracodawców
- Pola: worker_id, employer_id, job_id, rating (1-5), comment
- **RLS**: Wszyscy widzą opinie, tylko pracodawcy mogą tworzyć

#### **zzp_exam_applications** - Egzaminy ZZP
- Aplikacje na egzamin certyfikacyjny ZZP
- Pola: full_name, email, phone, specialization, preferred_date
- Status płatności: pending, paid, failed
- Status egzaminu: scheduled, completed, passed, failed, cancelled
- **RLS**: Pracownicy widzą swoje aplikacje, admini zarządzają wszystkimi

### 2. Bezpieczeństwo (RLS) ✅

**Row Level Security włączone na wszystkich tabelach:**

- ✅ Użytkownicy widzą tylko swoje dane
- ✅ Admini mają pełny dostęp
- ✅ Pracodawcy widzą pracowników i mogą tworzyć oferty
- ✅ Pracownicy widzą pracodawców i mogą aplikować na oferty
- ✅ Opinie są publiczne, ale tylko pracodawcy mogą je tworzyć

### 3. Automatyzacja ✅

**Trigger `handle_new_user()`:**
- Automatycznie tworzy profil w tabeli `profiles` po rejestracji
- Wykorzystuje dane z `auth.users.raw_user_meta_data`
- Bezpieczna funkcja (SECURITY DEFINER)

### 4. Indeksy dla Wydajności ✅

Utworzono indeksy na kluczowych polach:
- profiles: email, role
- workers: profile_id, specialization, location_city
- employers: profile_id
- certificates: worker_id
- jobs: employer_id, status
- applications: job_id, worker_id
- reviews: worker_id, employer_id

---

## 🚀 Jak Uruchomić Projekt

### Krok 1: Konfiguracja .env

W pliku `.env` dodaj brakujący klucz:

```bash
VITE_SUPABASE_URL=https://fldquchnitwsybkhrnns.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# WAŻNE: Dodaj ten klucz z Supabase Dashboard!
SUPABASE_SERVICE_ROLE_KEY=twoj_service_role_key_tutaj
```

**Gdzie znaleźć SERVICE_ROLE_KEY:**
1. Otwórz: https://supabase.com/dashboard/project/fldquchnitwsybkhrnns/settings/api
2. Sekcja "Project API keys"
3. Skopiuj klucz **"service_role"** (NIE "anon"!)
4. Wklej do `.env` jako `SUPABASE_SERVICE_ROLE_KEY`

### Krok 2: Utwórz Konto Testowe Admina

```bash
node create-test-admin.mjs
```

**Dane logowania:**
- Email: `admin@zzpwerkplaats.nl`
- Hasło: `Admin123!@#`

### Krok 3: Uruchom Aplikację

```bash
npm run dev
```

Aplikacja będzie dostępna na: http://localhost:5173

### Krok 4: Zaloguj się jako Admin

1. Przejdź do: http://localhost:5173/login
2. Email: `admin@zzpwerkplaats.nl`
3. Hasło: `Admin123!@#`
4. Po zalogowaniu zostaniesz przekierowany do: `/admin`

---

## 🧪 Testowanie Systemu

### Test 1: Rejestracja Pracownika
1. Przejdź do: http://localhost:5173/register/worker
2. Wypełnij formularz
3. Po rejestracji profil zostanie automatycznie utworzony
4. Zostaniesz przekierowany do: `/worker`

### Test 2: Rejestracja Pracodawcy
1. Przejdź do: http://localhost:5173/register/employer
2. Wypełnij formularz (wymagana nazwa firmy i KVK)
3. Po rejestracji profil zostanie automatycznie utworzony
4. Zostaniesz przekierowany do: `/employer/subscription`

### Test 3: Panel Admina
1. Zaloguj się jako admin
2. Sprawdź wszystkie moduły w `/admin`:
   - Workers Manager
   - Employers Manager
   - Certificates Manager
   - Jobs Manager
   - ZZP Exam Management

---

## 🔍 Rozwiązane Problemy

### ✅ Problem 1: Brak tabel w bazie danych
**Rozwiązanie:** Utworzono kompletną migrację z wszystkimi tabelami

### ✅ Problem 2: Błędy 406 przy logowaniu
**Rozwiązanie:**
- Używamy `maybeSingle()` zamiast `single()` w AuthContext
- Profile są tworzone automatycznie przez trigger

### ✅ Problem 3: Brak profili po rejestracji
**Rozwiązanie:** Trigger `handle_new_user()` automatycznie tworzy profil

### ✅ Problem 4: Problemy z wyświetlaniem profili
**Rozwiązanie:** Poprawne RLS policies dla wszystkich tabel

### ✅ Problem 5: Routing między panelami
**Rozwiązanie:**
- Admin: `/admin`
- Employer: `/employer` (wymaga subskrypcji)
- Worker: `/worker`
- Subscription page: `/employer/subscription` (bez wymagania subskrypcji)

---

## 📊 Struktura Routingu

```
/ - Homepage
/login - Logowanie
/register/worker - Rejestracja pracownika
/register/employer - Rejestracja pracodawcy

/admin/* - Panel admina (role: admin)
  - /admin - Dashboard
  - /admin/workers - Zarządzanie pracownikami
  - /admin/employers - Zarządzanie pracodawcami
  - /admin/certificates - Zarządzanie certyfikatami
  - /admin/zzp-exams - Zarządzanie egzaminami

/employer/* - Panel pracodawcy (role: employer + subscription)
  - /employer - Dashboard
  - /employer/search - Wyszukiwanie pracowników
  - /employer/subscription - Zarządzanie subskrypcją (NO subscription required)

/worker/* - Panel pracownika (role: worker)
  - /worker - Dashboard
  - /worker/zzp-exam-application - Aplikacja na egzamin
```

---

## 🛠️ Kolejne Kroki

### 1. Dodanie Danych Testowych
Utwórz dodatkowe konta testowe:
- 2-3 pracodawców
- 5-10 pracowników
- Kilka ofert pracy
- Przykładowe aplikacje

### 2. Konfiguracja Stripe (Płatności)
- Dodaj klucze Stripe do `.env`
- Skonfiguruj produkty subskrypcji
- Przetestuj płatności

### 3. Upload Avatarów
- Skonfiguruj Storage Bucket w Supabase
- Przetestuj upload zdjęć profilowych

### 4. Testy E2E
- Zaloguj się jako każda rola
- Sprawdź wszystkie funkcjonalności
- Upewnij się, że routing działa poprawnie

---

## 📞 Potrzebujesz Pomocy?

Jeśli coś nie działa:

1. **Sprawdź logi w konsoli przeglądarki** (F12)
2. **Sprawdź logi w konsoli Node.js**
3. **Sprawdź Supabase Dashboard** -> Table Editor
4. **Sprawdź Supabase Logs** -> Logs Explorer

**Najczęstsze problemy:**
- Brak `SUPABASE_SERVICE_ROLE_KEY` w `.env`
- Nieprawidłowe klucze API w `.env`
- Problem z siecią podczas `npm install`
- RLS policies blokują dostęp (sprawdź role użytkownika)

---

## ✨ Status Projektu

| Moduł | Status | Notatki |
|-------|--------|---------|
| Baza danych | ✅ 100% | Wszystkie tabele utworzone |
| RLS Security | ✅ 100% | Policies dla wszystkich tabel |
| Auth System | ✅ 100% | Supabase Auth + Auto-create profile |
| Workers Panel | ✅ 90% | Dashboard gotowy, dodać więcej funkcji |
| Employers Panel | ✅ 90% | Dashboard + paywall gotowy |
| Admin Panel | ✅ 85% | Większość modułów gotowa |
| Subscriptions | ✅ 80% | Struktura gotowa, brak Stripe |
| Certificates | ✅ 75% | Tabela gotowa, dodać upload |
| Jobs System | ✅ 70% | Struktura gotowa, dodać UI |

---

**Data konfiguracji:** 2025-10-17
**Wersja migracji:** 001_complete_database_setup
