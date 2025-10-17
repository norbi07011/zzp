# 🚀 ZZP EXAM & CERTIFICATION SYSTEM - DEPLOYMENT GUIDE

## 📋 PRZEGLĄD ZMIAN

Ten przewodnik opisuje deployment **poprawionego systemu certyfikacji ZZP**:

### ❌ STARY (BŁĘDNY) MODEL:
- €13/miesiąc = Premium Subscription **+ automatyczny certyfikat** (BŁĄD!)

### ✅ NOWY (POPRAWNY) MODEL:
- **€13/miesiąc** = Premium Worker Subscription (więcej widoczności, **BEZ certyfikatu**)
- **€230 jednorazowo** (€190 + 21% BTW) = ZZP Exam + Certification
  - Pracownik zgłasza się przez formularz
  - Płaci €230 przez Stripe
  - Przychodzi na magazyn na fizyczny egzamin
  - Właściciel ocenia umiejętności (1-10)
  - Właściciel ręcznie zatwierdza certyfikat
  - Certyfikat ważny **7 lat** (format: ZZP-2025-00123)

---

## 📦 PLIKI UTWORZONE/ZMIENIONE

### 1. **Database Migration**
- `supabase/migrations/20250111_zzp_exam_system.sql` (220 linii)
  - DROP TABLE `certificates`, `premium_certificates` (stare błędne tabele)
  - CREATE TABLE `zzp_exam_applications` (kompletny workflow)
  - Function `generate_certificate_number()` - generuje ZZP-YYYY-XXXXX
  - RLS policies (workers view own, admins view all)

### 2. **Stripe Configuration**
- `src/config/stripe.ts` - zaktualizowane produkty:
  - `workerPremium`: €13/month recurring (subscription, NIE certyfikat!)
  - `zzpExam`: €230 one-time payment (egzamin + certyfikacja)
  - `employerBasic`: €13/month (bez zmian)
  - `employerPremium`: €25/month (bez zmian)

### 3. **Supabase Edge Functions**
- `supabase/functions/create-exam-payment/index.ts` (NOWY)
  - Obsługuje płatność €230 za egzamin
  - Tworzy rekord w `zzp_exam_applications` (status: pending_payment)
  - Zwraca Stripe Checkout URL (mode: 'payment', nie 'subscription')

### 4. **React Components**
- `src/components/certificates/ZZPExamApplicationForm.tsx` (265 linii)
  - Formularz zgłoszeniowy dla pracownika
  - Pola: data egzaminu, lokalizacja magazynu, specjalizacje, opis doświadczenia
  - Płatność €230 przez Stripe

- `src/components/certificates/ZZPCertificateBadge.tsx` (200+ linii)
  - Badge certyfikatu na profilu pracownika
  - Wyświetla: numer certyfikatu, data wydania, wygaśnięcia, status
  - 3 rozmiary: small, medium, large

- `src/components/subscription/SubscriptionPanel.tsx` (zaktualizowany)
  - **2 ODDZIELNE SEKCJE:**
    1. Premium Subscription (€13/miesiąc - widoczność, NIE certyfikat!)
    2. ZZP Exam & Certification (€230 - fizyczny egzamin + certyfikat)

- `src/components/payment/CheckoutButton.tsx` (zaktualizowany)
  - Zmieniono tekst: "Upgrade naar Premium Abonnement" (jasne rozróżnienie)

### 5. **Admin Panel**
- `src/pages/admin/ZZPExamManagementPage.tsx` (350+ linii)
  - Lista nadchodzących egzaminów (z datą, lokalizacją, specjalizacjami)
  - Formularz oceny egzaminu (slider 1-10, notatki, Pass/Fail)
  - Przycisk "Wystaw Certyfikat" (generuje ZZP-2025-XXXXX)

### 6. **Worker Pages**
- `src/pages/ZZPExamApplicationPage.tsx` (NOWY)
  - Strona zgłoszeniowa z formularzem egzaminu
  - Instrukcje, FAQ, lista lokalizacji

- `src/pages/ExamPaymentSuccess.tsx` (NOWY)
  - Strona potwierdzenia po płatności €230
  - Wyświetla detale egzaminu, kolejne kroki

### 7. **Routing**
- `App.tsx` (zaktualizowany)
  - `/worker/zzp-exam-application` - formularz zgłoszeniowy (ProtectedRoute: worker)
  - `/exam-success` - potwierdzenie płatności (public)
  - `/admin/zzp-exams` - panel zarządzania egzaminami (ProtectedRoute: admin)

### 8. **Admin Pages Cleanup**
- `src/pages/admin/DataAnalyticsManagementPage.tsx` - usunięto referencje VCA
- `src/pages/admin/AdvancedSearchManagementPage.tsx` - usunięto referencje VCA
- `src/components/admin/CertificateApprovalPanel.tsx` - usunięto referencje VCA

---

## 🗄️ DEPLOYMENT KROK PO KROKU

### **KROK 1: Database Migration**

#### 1.1 Otwórz Supabase SQL Editor
```
https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql
```

#### 1.2 Wykonaj migrację
Skopiuj zawartość pliku `supabase/migrations/20250111_zzp_exam_system.sql` i wklej w SQL Editor, następnie kliknij **RUN**.

**Co robi ta migracja:**
- ❌ Usuwa stare tabele: `certificates`, `premium_certificates`
- ✅ Tworzy nową tabelę: `zzp_exam_applications`
  - Pola: worker_id, exam_date, warehouse_location, specializations[], payment_status, payment_amount (€230), practical_score (1-10), exam_result, certificate_number, status
  - Statusy: draft → pending_payment → paid → scheduled → completed → passed/failed → certified/expired/revoked
- ✅ Tworzy funkcję: `generate_certificate_number()` (zwraca ZZP-YYYY-00001, ZZP-YYYY-00002, etc.)
- ✅ Tworzy RLS policies: pracownicy widzą swoje, admin widzi wszystkie

#### 1.3 Weryfikacja
```sql
-- Sprawdź czy tabela istnieje
SELECT * FROM zzp_exam_applications LIMIT 1;

-- Sprawdź funkcję generowania numerów
SELECT generate_certificate_number();
-- Oczekiwany output: ZZP-2025-00001
```

---

### **KROK 2: Stripe Product Configuration**

#### 2.1 Zaloguj się do Stripe Dashboard
```
https://dashboard.stripe.com/test/products
```

#### 2.2 Utwórz Produkt 1: **Premium Worker Subscription**
- **Name:** Premium Worker Subscription
- **Description:** Maandelijks abonnement: Meer zichtbaarheid, prioriteit in zoekresultaten (GEEN certificaat!)
- **Pricing Model:** Recurring
- **Price:** €13.00 EUR
- **Billing Period:** Monthly
- **Payment Type:** Card, iDEAL, Bancontact

**Po utworzeniu skopiuj Price ID** (format: `price_xxxxxxxxxxxxx`)

#### 2.3 Utwórz Produkt 2: **ZZP Exam & Certification**
- **Name:** ZZP Exam & Certification
- **Description:** Egzamin praktyczny + Certyfikat Doświadczenia ZZP (ważny 7 lat)
- **Pricing Model:** One-time
- **Price:** €230.00 EUR (€190 + 21% BTW)
- **Payment Type:** Card, iDEAL, Bancontact

**Po utworzeniu skopiuj Price ID** (format: `price_xxxxxxxxxxxxx`)

---

### **KROK 3: Environment Variables (.env)**

Dodaj **2 NOWE zmienne** do pliku `.env`:

```env
# Stripe Price IDs
VITE_STRIPE_PRICE_WORKER_PREMIUM=price_xxxxxxxxxxxxx  # €13/month subscription
VITE_STRIPE_PRICE_ZZP_EXAM=price_xxxxxxxxxxxxx        # €230 one-time exam

# Pozostałe (bez zmian)
VITE_STRIPE_PRICE_EMPLOYER_BASIC=price_xxxxxxxxxxxxx  # €13/month
VITE_STRIPE_PRICE_EMPLOYER_PREMIUM=price_xxxxxxxxxxxxx # €25/month
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxxxxxxxxxxxx
VITE_SUPABASE_FUNCTIONS_URL=https://xxxxxxxxxxxxx.supabase.co/functions/v1
```

**⚠️ WAŻNE:** Zaktualizuj też `.env.example` i `.env.local` (jeśli używasz).

---

### **KROK 4: Deploy Supabase Edge Functions**

#### 4.1 Deploy funkcji `create-exam-payment`

**PowerShell:**
```powershell
# Zaloguj się do Supabase CLI (jeśli jeszcze nie)
npx supabase login

# Link do projektu (jeśli jeszcze nie)
npx supabase link --project-ref YOUR_PROJECT_ID

# Deploy funkcji
npx supabase functions deploy create-exam-payment

# Ustaw secrets (Stripe Secret Key)
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
```

#### 4.2 Weryfikacja
```powershell
# Sprawdź czy funkcja działa
curl -i --location --request POST "https://YOUR_PROJECT_ID.supabase.co/functions/v1/create-exam-payment" \
  --header "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "userId": "test-user-id",
    "email": "test@example.com",
    "priceId": "price_xxxxxxxxxxxxx",
    "examData": {
      "examDate": "2025-02-01",
      "warehouseLocation": "Amsterdam",
      "experienceDescription": "Test experience",
      "specializations": ["forklift", "warehouse"]
    }
  }'
```

**Oczekiwany output:**
```json
{
  "sessionId": "cs_test_xxxxxxxxxxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_xxxxxxxxxxxxx",
  "applicationId": "uuid-xxxxxxxxxxxxx"
}
```

---

### **KROK 5: Build & Deploy Frontend**

#### 5.1 Install dependencies (jeśli jeszcze nie)
```powershell
npm install
```

#### 5.2 Build production bundle
```powershell
npm run build
```

**Sprawdź output:**
- ✅ Bundle size powinien być ~500KB (gzipped)
- ✅ Brak błędów kompilacji
- ✅ Wszystkie lazy-loaded chunks utworzone

#### 5.3 Test lokalnie
```powershell
npm run dev
```

**Ścieżki do przetestowania:**
1. `/worker` - Dashboard pracownika
   - Sprawdź 2 sekcje: Premium Subscription + ZZP Exam
2. `/worker/zzp-exam-application` - Formularz zgłoszeniowy
   - Wypełnij formularz, kliknij "Betalen €230"
   - Przekierowanie do Stripe Checkout (Test Mode)
3. `/exam-success?session_id=cs_test_xxx` - Strona potwierdzenia
4. `/admin/zzp-exams` - Panel admina
   - Lista nadchodzących egzaminów
   - Formularz oceny (slider 1-10, Pass/Fail)
   - Przycisk "Wystaw Certyfikat"

#### 5.4 Deploy (Vercel/Netlify/inne)
```powershell
# Przykład: Vercel
vercel --prod

# Przykład: Netlify
netlify deploy --prod
```

---

### **KROK 6: Stripe Webhook Configuration**

#### 6.1 Zaktualizuj webhook endpoint w Stripe Dashboard
```
https://dashboard.stripe.com/test/webhooks
```

**Endpoint URL:**
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/stripe-webhook
```

**Events do nasłuchiwania:**
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

#### 6.2 Skopiuj Webhook Secret
Format: `whsec_xxxxxxxxxxxxx`

#### 6.3 Ustaw jako Supabase Secret
```powershell
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## ✅ TESTING CHECKLIST

### **Test 1: Premium Subscription (€13)**
- [ ] Kliknij "Upgrade naar Premium Abonnement" na `/worker`
- [ ] Przekierowanie do Stripe Checkout (€13/miesiąc, recurring)
- [ ] Użyj test card: `4242 4242 4242 4242`, CVC: `123`, Data: przyszła
- [ ] Płatność potwierdzona → redirect na `/payment-success`
- [ ] Sprawdź w Supabase: `worker_subscriptions.subscription_tier = 'premium'`
- [ ] **WAŻNE:** NIE powinno być certyfikatu! To tylko subscription.

### **Test 2: ZZP Exam Application (€230)**
- [ ] Kliknij "Aanmelden voor ZZP Examen" na `/worker`
- [ ] Wypełnij formularz:
  - Data egzaminu: wybierz przyszłą datę (min jutro)
  - Lokalizacja: Amsterdam
  - Specjalizacje: zaznacz Forklift, Warehouse
  - Doświadczenie: wpisz min 50 znaków
- [ ] Kliknij "Betalen €230"
- [ ] Przekierowanie do Stripe Checkout (€230, one-time payment)
- [ ] Użyj test card: `4242 4242 4242 4242`
- [ ] Płatność potwierdzona → redirect na `/exam-success`
- [ ] Sprawdź w Supabase: `zzp_exam_applications.status = 'paid'`, `payment_amount = 230.00`

### **Test 3: Admin Panel - Exam Evaluation**
- [ ] Zaloguj się jako admin
- [ ] Przejdź do `/admin/zzp-exams`
- [ ] Zobacz listę nadchodzących egzaminów (z Test 2)
- [ ] Kliknij "Oceń egzamin"
- [ ] Ustaw slider na 8/10
- [ ] Wpisz notatki: "Świetne umiejętności z wózkami widłowymi"
- [ ] Kliknij "Zaliczony" (Pass)
- [ ] Zapisz ocenę
- [ ] Sprawdź: status zmieniony na `passed`, `practical_score = 8`
- [ ] Kliknij "Wystaw Certyfikat"
- [ ] Sprawdź: `certificate_number = ZZP-2025-00001`, `status = certified`

### **Test 4: Certificate Badge Display**
- [ ] Przejdź na profil pracownika (jako pracodawca viewing profile)
- [ ] Sprawdź czy badge certyfikatu jest widoczny
- [ ] Wyświetla: ZZP-2025-00001, data wydania, wygaśnięcia (za 1 rok), status "Geldig"
- [ ] Score 8/10 widoczny

### **Test 5: VCA References Cleanup**
- [ ] Przejdź do `/admin/analytics`
- [ ] Sprawdź metrykę: "ZZP Certificates" (NIE "VCA Certificates")
- [ ] Przejdź do `/admin/search`
- [ ] Wyszukaj "zzp certificate" (NIE "vca certificate")
- [ ] Przejdź do `/admin/certificate-approval`
- [ ] Sprawdź mock data: BRAK wzmianek o VCA

---

## 🔧 TROUBLESHOOTING

### Problem 1: "Cannot find module create-exam-payment"
**Rozwiązanie:**
```powershell
npx supabase functions deploy create-exam-payment
```

### Problem 2: Stripe Checkout błąd "Invalid Price ID"
**Rozwiązanie:**
- Sprawdź `.env`: `VITE_STRIPE_PRICE_ZZP_EXAM` powinien mieć `price_xxxxx` (NIE `prod_xxxxx`)
- Upewnij się, że Price ID jest z **Test Mode** (jeśli testujesz)

### Problem 3: Database error "relation zzp_exam_applications does not exist"
**Rozwiązanie:**
- Wykonaj ponownie migrację SQL z **KROKU 1**
- Sprawdź czy tabela istnieje: `SELECT * FROM zzp_exam_applications LIMIT 1;`

### Problem 4: Worker Dashboard pokazuje "Premium Certyfikat"
**Rozwiązanie:**
- Clear cache przeglądarki (Ctrl+Shift+R)
- Sprawdź czy `SubscriptionPanel.tsx` został zaktualizowany
- Rebuild frontend: `npm run build`

### Problem 5: Certificate number generator zwraca duplikaty
**Rozwiązanie:**
```sql
-- Zresetuj sequence (tylko jeśli potrzebne!)
SELECT setval('zzp_exam_applications_id_seq', 1, false);

-- Test
SELECT generate_certificate_number();
```

---

## 📊 POST-DEPLOYMENT MONITORING

### Metryki do sprawdzenia (pierwsze 7 dni):

1. **Stripe Dashboard:**
   - Liczba płatności €13 (Premium Subscription)
   - Liczba płatności €230 (ZZP Exam)
   - Conversion rate: Stripe Checkout → Success

2. **Supabase Dashboard:**
   - Liczba rekordów w `zzp_exam_applications`
   - Statusy: pending_payment, paid, scheduled, certified
   - Error logs w Edge Functions (`create-exam-payment`)

3. **Frontend Analytics:**
   - Pageviews: `/worker/zzp-exam-application`
   - Bounce rate na formularz zgłoszeniowy
   - Time on page (czy użytkownicy czytają instrukcje?)

4. **Admin Usage:**
   - Liczba ocenionych egzaminów (`practical_score` NOT NULL)
   - Liczba wydanych certyfikatów (`certificate_number` NOT NULL)
   - Średni czas od `exam_date` do `certificate_issued_at`

---

## 🚨 ROLLBACK PLAN (jeśli coś pójdzie nie tak)

### Opcja 1: Przywróć stare produkty Stripe
```sql
-- Zmień z powrotem cenę w starym systemie (NIE ZALECANE!)
UPDATE worker_subscriptions 
SET subscription_tier = 'basic' 
WHERE subscription_tier = 'premium';
```

### Opcja 2: Ukryj nową sekcję ZZP Exam
```tsx
// W SubscriptionPanel.tsx zakomentuj sekcję:
{/* ZZP EXAM & CERTIFICATION - SEPARATE SECTION (€230) */}
```

### Opcja 3: Cofnij migrację SQL (DRASTYCZNE!)
```sql
-- Usuń nową tabelę
DROP TABLE zzp_exam_applications;

-- Przywróć stare tabele (jeśli masz backup)
-- UWAGA: To usunie wszystkie dane egzaminacyjne!
```

---

## 📞 SUPPORT & KONTAKT

W razie problemów:
1. Sprawdź Supabase Logs: `https://supabase.com/dashboard/project/YOUR_PROJECT_ID/logs`
2. Sprawdź Stripe Logs: `https://dashboard.stripe.com/test/logs`
3. GitHub Issues: [link do repo]
4. Email: support@zzp-werkplaats.nl

---

## 📝 CHANGELOG

### 2025-01-11 - v2.0.0 (MAJOR CORRECTION)
- ❌ **USUNIĘTO:** Automatyczny certyfikat za €13 subscription
- ✅ **DODANO:** Oddzielny system egzaminów ZZP (€230)
- ✅ **DODANO:** Panel admina do oceny egzaminów
- ✅ **DODANO:** Certificate Badge component
- ✅ **USUNIĘTO:** Wszystkie referencje VCA (nie oferujemy szkoleń VCA!)
- ✅ **NAPRAWIONO:** Stripe payment flow (mock → real API calls)

---

**✅ DEPLOYMENT COMPLETE!** 🎉

System gotowy do użycia. Pracownicy mogą:
1. Wykupić Premium Subscription (€13/miesiąc) dla lepszej widoczności
2. Zgłosić się na egzamin ZZP (€230) i zdobyć oficjalny certyfikat po fizycznym teście

Właściciel kontroluje cały proces certyfikacji: ocena → zatwierdzenie → wydanie certyfikatu.
