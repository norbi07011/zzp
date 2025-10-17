# 🚀 INSTRUKCJA DEPLOYMENT - KROK PO KROKU

**Data:** 2025-01-12  
**Status:** GOTOWE DO WDROŻENIA  
**Czas:** ~45 minut

---

## 📋 PODSUMOWANIE ZROBIONYCH ZMIAN

### ✅ CO ZOSTAŁO DODANE DO SYSTEMU ABONAMENTOWEGO:

#### 1. **Baza Danych (Supabase)**
- ✅ **3 nowe tabele:**
  - `subscription_payments` - historia płatności (€13/miesiąc)
  - `certificate_applications` - wnioski o certyfikat Premium
  - `subscription_events` - audit log wszystkich zdarzeń
  
- ✅ **12 nowych kolumn w tabeli `workers`:**
  ```sql
  subscription_tier           -- 'basic' | 'premium'
  subscription_status         -- 'active' | 'cancelled' | 'expired'
  subscription_start_date
  subscription_end_date
  last_payment_date
  monthly_fee                 -- €13.00
  stripe_customer_id          -- Link do Stripe
  stripe_subscription_id      -- Link do Stripe
  zzp_certificate_issued      -- Czy ma certyfikat
  zzp_certificate_date
  zzp_certificate_number      -- ZZP-00000001
  zzp_certificate_expires_at
  ```

- ✅ **RLS Policies (bezpieczeństwo):**
  - Workers widzą tylko swoje płatności i aplikacje
  - Admins widzą wszystko
  - Automatyczna ochrona danych

- ✅ **View dla Admin Dashboard:**
  - `v_active_subscriptions` - szybki przegląd aktywnych subskrypcji

#### 2. **Stripe Configuration**
- ✅ 4 produkty do utworzenia w Stripe:
  - Worker Premium: **€13/miesiąc** (recurring subscription)
  - ZZP Exam: **€230 jednorazowo** (one-time payment)
  - Employer Basic: **€13/miesiąc**
  - Employer Premium: **€25/miesiąc**

#### 3. **Frontend Components**
- ✅ `SubscriptionPanel.tsx` - panel abonamentu w Worker Dashboard
- ✅ `EmployerPaywall.tsx` - blokada dla employers bez abonamentu
- ✅ `ZZPExamApplicationForm.tsx` - formularz zgłoszeniowy na egzamin
- ✅ `ZZPCertificateBadge.tsx` - badge certyfikatu na profilu
- ✅ `CheckoutButton.tsx` - przycisk płatności Stripe

#### 4. **Backend (Supabase Edge Functions)**
- ✅ `create-checkout-session` - tworzy Stripe Checkout URL
- ✅ `stripe-webhook` - obsługuje webhooks z Stripe
- ✅ `create-exam-payment` - obsługuje płatność za egzamin (€230)

#### 5. **Routing & Protection**
- ✅ `ProtectedRoute` - blokuje dostęp bez aktywnego abonamentu
- ✅ Employer routes wymagają `subscription_status = 'active'`
- ✅ Workers z `basic` tier niewidoczni dla employers

---

## 🗄️ KROK 1: MIGRACJA BAZY DANYCH SUPABASE

### A) Otwórz Supabase Dashboard

1. Idź na: **https://supabase.com/dashboard**
2. Zaloguj się
3. Wybierz swój projekt **ZZP Werkplaats**
4. Kliknij **SQL Editor** w lewym menu bocznym

### B) Uruchom migrację SQL

1. **Skopiuj CAŁĄ zawartość** pliku:
   ```
   SUBSCRIPTION_SYSTEM_MIGRATION.sql
   ```
   (455 linii kodu SQL)

2. **Wklej** do SQL Editor w Supabase

3. **Kliknij RUN** (lub naciśnij `Ctrl + Enter`)

### C) Sprawdź wynik

Powinieneś zobaczyć komunikat:
```
✅ MIGRACJA ZAKOŃCZONA POMYŚLNIE!
========================================
Workers ogółem: X
Basic tier: Y
Premium tier: Z

📋 Utworzone tabele:
  ✅ subscription_payments
  ✅ certificate_applications
  ✅ subscription_events

🔒 RLS Policies: ✅ Aktywne
📊 Views: ✅ v_active_subscriptions
```

### D) Weryfikacja ręczna

1. Kliknij **Table Editor** w lewym menu
2. Sprawdź czy istnieją tabele:
   - ✅ `subscription_payments`
   - ✅ `certificate_applications`
   - ✅ `subscription_events`

3. Otwórz tabelę `workers`
4. Sprawdź czy widzisz nowe kolumny:
   - `subscription_tier`
   - `subscription_status`
   - `stripe_customer_id`
   - `zzp_certificate_issued`
   - itd.

### ⚠️ Jeśli pojawi się błąd:

- **Błąd: "column already exists"**
  → To normalne! Część kolumn już istniała. Migracja bezpiecznie je pomija.

- **Błąd: "table does not exist"**
  → Sprawdź czy tabela `workers` i `profiles` istnieją w Database

- **Inny błąd:**
  → Skopiuj treść błędu i napisz do mnie, naprawię

---

## 💳 KROK 2: KONFIGURACJA STRIPE

### A) Utwórz konto Stripe (Test Mode)

1. Idź na: **https://dashboard.stripe.com/register**
2. Zarejestruj się (wybierz kraj: **Netherlands**)
3. **NIE AKTYWUJ LIVE MODE** - zostań w **Test Mode** (przełącznik w prawym górnym rogu)

### B) Pobierz klucze API

1. Idź na: **https://dashboard.stripe.com/test/apikeys**
2. Skopiuj:
   - **Publishable key** → zaczyna się od `pk_test_...`
   - **Secret key** → kliknij "Reveal", zaczyna się od `sk_test_...`

### C) Utwórz produkty w Stripe

#### Produkt 1: Worker Premium Subscription

1. Idź na: **https://dashboard.stripe.com/test/products/create**
2. Wypełnij formularz:
   ```
   Name: Premium Worker Subscription
   Description: Maandelijks abonnement voor meer zichtbaarheid
   Price: €13.00
   Billing period: Monthly
   ```
3. Kliknij **Save product**
4. **SKOPIUJ `Price ID`** (zaczyna się od `price_...`)
   → Zapisz jako: `VITE_STRIPE_PRICE_WORKER_PREMIUM`

#### Produkt 2: ZZP Exam & Certification

1. **Create new product**:
   ```
   Name: ZZP Exam & Certification
   Description: Eenmalige betaling voor praktijkexamen + certificaat
   Price: €230.00
   Billing period: One time
   ```
2. Kliknij **Save product**
3. **SKOPIUJ `Price ID`**
   → Zapisz jako: `VITE_STRIPE_PRICE_ZZP_EXAM`

#### Produkt 3: Employer Basic

1. **Create new product**:
   ```
   Name: Employer Basic Plan
   Description: Basis toegang - 50 zoekopdrachten, 5 contacten per maand
   Price: €13.00
   Billing period: Monthly
   ```
2. **SKOPIUJ `Price ID`**
   → Zapisz jako: `VITE_STRIPE_PRICE_EMPLOYER_BASIC`

#### Produkt 4: Employer Premium

1. **Create new product**:
   ```
   Name: Employer Premium Plan
   Description: Volledige toegang - Unlimited searches en contacten
   Price: €25.00
   Billing period: Monthly
   ```
2. **SKOPIUJ `Price ID`**
   → Zapisz jako: `VITE_STRIPE_PRICE_EMPLOYER_PREMIUM`

### D) Skonfiguruj Webhook

1. Idź na: **https://dashboard.stripe.com/test/webhooks/create**
2. Kliknij **Add endpoint**
3. Endpoint URL:
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/functions/v1/stripe-webhook
   ```
   (Zastąp `YOUR_SUPABASE_PROJECT_ID` swoim ID projektu)

4. **Select events to listen to:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

5. Kliknij **Add endpoint**
6. **SKOPIUJ `Signing secret`** (zaczyna się od `whsec_...`)
   → Zapisz jako: `STRIPE_WEBHOOK_SECRET`

---

## 🔧 KROK 3: KONFIGURACJA ENVIRONMENT VARIABLES

### A) Utwórz plik `.env` w głównym katalogu projektu

```bash
# =====================================================
# ZZP WERKPLAATS - Environment Variables
# =====================================================

# ----------------
# Supabase Config
# ----------------
VITE_SUPABASE_URL=https://TWOJ_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhb... (twój anon key)

# ----------------
# Stripe Payment Config
# ----------------
# Frontend Keys (prefix VITE_)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... (z KROKU 2B)

# Price IDs (z KROKU 2C)
VITE_STRIPE_PRICE_WORKER_PREMIUM=price_... (Worker Premium)
VITE_STRIPE_PRICE_ZZP_EXAM=price_... (ZZP Exam)
VITE_STRIPE_PRICE_EMPLOYER_BASIC=price_... (Employer Basic)
VITE_STRIPE_PRICE_EMPLOYER_PREMIUM=price_... (Employer Premium)

# Backend Keys (DO NOT prefix VITE_)
STRIPE_SECRET_KEY=sk_test_... (z KROKU 2B)
STRIPE_WEBHOOK_SECRET=whsec_... (z KROKU 2D)

# ----------------
# Application Config
# ----------------
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=ZZP Werkplaats
```

### B) Dodaj `.env` do Supabase Edge Functions

1. Otwórz Supabase Dashboard
2. Idź na: **Edge Functions** → **Settings**
3. Dodaj zmienne środowiskowe:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   SUPABASE_URL=https://TWOJ_PROJECT_ID.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhb... (service role key z Settings > API)
   ```

---

## 🚀 KROK 4: DEPLOY SUPABASE EDGE FUNCTIONS

### A) Zainstaluj Supabase CLI

```bash
# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Mac
brew install supabase/tap/supabase

# Weryfikacja instalacji
supabase --version
```

### B) Zaloguj się do Supabase

```bash
supabase login
```
(Otworzy przeglądarkę do autoryzacji)

### C) Link projektu

```bash
supabase link --project-ref YOUR_PROJECT_ID
```
(Znajdź PROJECT_ID w Settings > General)

### D) Deploy funkcji

```bash
# Deploy wszystkich funkcji
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy create-exam-payment

# Sprawdź status
supabase functions list
```

### E) Ustaw environment variables dla funkcji

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SUPABASE_URL=https://...
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJhb...
```

---

## ✅ KROK 5: TESTOWANIE SYSTEMU

### A) Test płatności Worker Premium (€13/miesiąc)

1. Uruchom aplikację lokalnie:
   ```bash
   npm run dev
   ```

2. Zaloguj się jako **Worker**

3. Idź do: **Dashboard** → **Subskrypcja**

4. Kliknij **"Upgrade naar Premium"**

5. Zostaniesz przekierowany do Stripe Checkout

6. Użyj **testowej karty** Stripe:
   ```
   Card number: 4242 4242 4242 4242
   Expiry: 12/34
   CVC: 123
   ZIP: 12345
   ```

7. Dokończ płatność

8. Sprawdź w Supabase:
   - **Table Editor** → `workers` → twój rekord
   - `subscription_status` = `'active'`
   - `subscription_tier` = `'premium'`
   - `stripe_customer_id` = `cus_...`
   - `stripe_subscription_id` = `sub_...`

9. Sprawdź w Stripe Dashboard:
   - **https://dashboard.stripe.com/test/subscriptions**
   - Powinna być nowa subskrypcja

### B) Test płatności ZZP Exam (€230 jednorazowo)

1. Jako Worker, idź do: **/worker/zzp-exam-application**

2. Wypełnij formularz zgłoszeniowy

3. Kliknij **"Betaal €230"**

4. Dokończ płatność testową

5. Sprawdź w Supabase:
   - **Table Editor** → `zzp_exam_applications`
   - Nowy rekord z `status = 'pending_payment'` lub `'scheduled'`

### C) Test Admin Panel

1. Zaloguj się jako **Admin**

2. Idź do: **/admin/zzp-exams**

3. Powinieneś zobaczyć zgłoszenie z poprzedniego testu

4. Kliknij **"Oceń egzamin"**

5. Wpisz ocenę (1-10), notatki

6. Kliknij **"Pass" + "Wystaw Certyfikat"**

7. Sprawdź w Supabase:
   - **Table Editor** → `workers`
   - Worker powinien mieć:
     - `zzp_certificate_issued = true`
     - `zzp_certificate_number = 'ZZP-2025-00001'`
     - `subscription_tier = 'premium'` (auto-upgrade)

### D) Test Employer Paywall

1. Zaloguj się jako **Employer** (BEZ aktywnego abonamentu)

2. Spróbuj wejść na: **/employer/search**

3. Powinieneś zostać przekierowany na: **/employer/subscription**

4. Zobaczyć ładny **EmployerPaywall** z cenami:
   - Basic: €13/miesiąc
   - Premium: €25/miesiąc

5. Kliknij **"Start Basic Plan"**

6. Dokończ płatność testową

7. Teraz powinieneś mieć dostęp do search

---

## 📊 WERYFIKACJA KOŃCOWA

### Checklist - Co powinno działać:

- [ ] ✅ Baza danych: 3 nowe tabele utworzone
- [ ] ✅ Workers: 12 nowych kolumn w tabeli
- [ ] ✅ Stripe: 4 produkty utworzone (Premium, Exam, Basic, Premium Employer)
- [ ] ✅ Environment: wszystkie klucze API ustawione
- [ ] ✅ Edge Functions: 3 funkcje deployed
- [ ] ✅ Test płatności Worker Premium: działa
- [ ] ✅ Test płatności ZZP Exam: działa
- [ ] ✅ Test Admin Panel: działa
- [ ] ✅ Test Employer Paywall: blokuje dostęp bez subskrypcji
- [ ] ✅ Stripe Dashboard: płatności widoczne
- [ ] ✅ Supabase: dane zapisują się poprawnie

---

## 🎯 CO DOKŁADNIE MUSISZ WKLEIĆ/SKONFIGUROWAĆ:

### 1️⃣ **W SUPABASE SQL EDITOR:**
```sql
-- Wklej całą zawartość pliku:
SUBSCRIPTION_SYSTEM_MIGRATION.sql
```
**Gdzie:** Supabase Dashboard → SQL Editor → Run

---

### 2️⃣ **W STRIPE DASHBOARD:**

**Produkty do utworzenia (4 sztuki):**

| Nazwa | Cena | Typ | Price ID → zapisz jako |
|-------|------|-----|------------------------|
| Premium Worker Subscription | €13 | Monthly | `VITE_STRIPE_PRICE_WORKER_PREMIUM` |
| ZZP Exam & Certification | €230 | One-time | `VITE_STRIPE_PRICE_ZZP_EXAM` |
| Employer Basic Plan | €13 | Monthly | `VITE_STRIPE_PRICE_EMPLOYER_BASIC` |
| Employer Premium Plan | €25 | Monthly | `VITE_STRIPE_PRICE_EMPLOYER_PREMIUM` |

**Gdzie:** https://dashboard.stripe.com/test/products/create

---

### 3️⃣ **W PLIKU `.env` (główny katalog projektu):**

```bash
# Supabase (z Dashboard → Settings → API)
VITE_SUPABASE_URL=https://TWOJ_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...

# Stripe API Keys (z Dashboard → Developers → API keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Stripe Price IDs (z poprzedniego kroku - produkty)
VITE_STRIPE_PRICE_WORKER_PREMIUM=price_...
VITE_STRIPE_PRICE_ZZP_EXAM=price_...
VITE_STRIPE_PRICE_EMPLOYER_BASIC=price_...
VITE_STRIPE_PRICE_EMPLOYER_PREMIUM=price_...

# Stripe Webhook (z Dashboard → Webhooks → po dodaniu endpointu)
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

### 4️⃣ **W SUPABASE EDGE FUNCTIONS (Dashboard → Edge Functions → Settings):**

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_URL=https://TWOJ_PROJECT_ID.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... (z Settings → API → service_role)
```

---

### 5️⃣ **W STRIPE WEBHOOK ENDPOINT:**

**Endpoint URL:**
```
https://TWOJ_PROJECT_ID.supabase.co/functions/v1/stripe-webhook
```

**Events (zaznacz te checkboxy):**
- ✅ `checkout.session.completed`
- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_succeeded`
- ✅ `invoice.payment_failed`

**Gdzie:** https://dashboard.stripe.com/test/webhooks/create

---

## 🆘 TROUBLESHOOTING

### Problem: "Stripe publishable key not found"
**Rozwiązanie:**
1. Sprawdź czy `.env` istnieje w głównym katalogu
2. Sprawdź czy klucz zaczyna się od `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_`
3. Zrestartuj dev server: `npm run dev`

### Problem: "Payment failed - no price ID"
**Rozwiązanie:**
1. Sprawdź czy wszystkie 4 Price IDs są w `.env`
2. Sprawdź czy zaczynają się od `price_`
3. Sprawdź w Stripe Dashboard czy produkty są utworzone

### Problem: "Webhook signature verification failed"
**Rozwiązanie:**
1. Sprawdź czy `STRIPE_WEBHOOK_SECRET` jest w Supabase Edge Functions settings
2. Sprawdź czy webhook endpoint URL jest poprawny
3. Sprawdź czy events są zaznaczone

### Problem: "Subscription not updating in database"
**Rozwiązanie:**
1. Sprawdź logi w Supabase: Edge Functions → stripe-webhook → Logs
2. Sprawdź czy `SUPABASE_SERVICE_ROLE_KEY` jest ustawiony
3. Sprawdź RLS policies w tabeli `workers`

---

## 📞 WSPARCIE

Jeśli coś nie działa:
1. Sprawdź logi Supabase: **Edge Functions** → **Logs**
2. Sprawdź logi Stripe: **Dashboard** → **Developers** → **Events**
3. Sprawdź console przeglądarki (F12)
4. Napisz dokładny komunikat błędu

---

## 🎉 GRATULACJE!

Jeśli wszystkie testy przeszły pomyślnie, masz w pełni działający system abonamentowy! 🚀

### Następne kroki:
1. Przejdź na **Stripe LIVE mode** (gdy będziesz gotowy do produkcji)
2. Zmień klucze API na production (`pk_live_...`, `sk_live_...`)
3. Przetestuj z prawdziwymi płatnościami (małe kwoty)
4. Uruchom marketing! 💰

---

**POWERED BY:** Supabase + Stripe + React + TypeScript  
**CZAS WDROŻENIA:** ~45 minut  
**TRUDNOŚĆ:** Średnia  
**STATUS:** ✅ GOTOWE DO UŻYCIA
