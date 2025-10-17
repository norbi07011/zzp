# 🔧 RAPORT NAPRAWY SYSTEMU PŁATNOŚCI - SUBSKRYPCJE

**Data:** 2025-01-11  
**Status:** ✅ NAPRAWIONO  
**Wersja aplikacji:** localhost:5175

---

## 🔴 PROBLEMY ZIDENTYFIKOWANE

### Problem #1: **Błąd 400 - "Failed to create checkout session"**
**Symptom:**
- Kliknięcie "Upgrade naar Premium Abonnement - €13/maand" wywala błąd 400
- Console pokazuje: `Error creating checkout session: Error: Failed to create checkout session`

**Przyczyna:**
- **BRAK Authorization header** w żądaniach do Edge Functions
- Edge Functions wymagają JWT tokenu użytkownika do autoryzacji
- Żądania zawierały tylko `apikey`, ale brakowało `Authorization: Bearer <token>`

**Rozwiązanie:**
```typescript
// PRZED (❌ BŁĘDNE):
const response = await fetch(`${functionsUrl}/create-checkout-session`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  body: JSON.stringify({ priceId, userId, userType: 'worker', email })
});

// PO (✅ POPRAWNE):
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  throw new Error('User not authenticated. Please log in.');
}

const response = await fetch(`${functionsUrl}/create-checkout-session`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session.access_token}`, // ✅ DODANO!
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },
  body: JSON.stringify({ priceId, userId, userType: 'worker', email })
});
```

**Pliki zmienione:**
- ✅ `src/services/stripe.ts` - funkcja `createCheckoutSession()`
- ✅ `src/services/stripe.ts` - funkcja `createEmployerCheckoutSession()`

---

### Problem #2: **Timeout 408 - Wszystkie endpointy Supabase**
**Symptom:**
- Console pokazuje masę błędów 408: 
  - `Error fetching earnings: Object`
  - `Failed to load resource: server responded with status 408`
  - `dtnotuyagygexmkyqtgb.supabase.co/rest/v1/...` zwraca 408 timeout

**Przyczyna:**
- Supabase RLS (Row Level Security) policies mogą blokować zapytania
- Brak poprawnego tokenu autoryzacji w niektórych zapytaniach
- Możliwe przeciążenie połączeń (zbyt wiele zapytań w krótkim czasie)

**Rozwiązanie:**
1. **Authorization header dodany do wszystkich funkcji płatności**
2. **Lepsze logowanie błędów** - teraz widzimy dokładną przyczynę:
```typescript
if (!response.ok) {
  const errorText = await response.text();
  let errorMessage = 'Failed to create checkout session';
  try {
    const errorJson = JSON.parse(errorText);
    errorMessage = errorJson.error || errorMessage;
  } catch {
    errorMessage = errorText || errorMessage;
  }
  throw new Error(errorMessage);
}
```

3. **Weryfikacja sesji** przed wysłaniem żądania:
```typescript
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  throw new Error('User not authenticated. Please log in.');
}
```

---

### Problem #3: **Nieskończone ładowanie - ZZP Exam Application**
**Symptom:**
- Po kliknięciu "Aanmelden voor ZZP Examen" strona się kręci (spinner) i nigdy nie kończy
- URL: `localhost:5174/worker/zzp-exam-application`
- Console: `ładowanie...` bez końca

**Przyczyna:**
- **Brak obsługi błędów w bloku `finally`**
- Gdy wystąpi błąd, `finally { setLoading(false); }` nie jest wykonywany, bo następuje przekierowanie
- Loading state pozostaje `true` na zawsze

**Rozwiązanie:**
```typescript
// PRZED (❌ BŁĘDNE):
try {
  // ... create session
  window.location.href = url; // Przekierowanie
  onSuccess?.();
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false); // ❌ NIE WYKONA SIĘ po przekierowaniu!
}

// PO (✅ POPRAWNE):
try {
  // ... create session
  window.location.href = url; // Przekierowanie
  onSuccess?.();
} catch (err) {
  console.error('❌ Error creating exam payment:', err);
  setError(err.message);
  setLoading(false); // ✅ RESET loading state NA BŁĄD!
}
// Brak finally - loading zostaje true przy sukcesie (przekierowanie),
// ale zostaje false przy błędzie
```

**Dodatkowe ulepszenia:**
- ✅ **Console logging** - dokładne logi każdego kroku procesu
- ✅ **Walidacja URL** - sprawdzenie czy `functionsUrl` i `url` istnieją
- ✅ **Lepsze komunikaty błędów** - parsowanie odpowiedzi błędu z Edge Function

**Pliki zmienione:**
- ✅ `src/components/certificates/ZZPExamApplicationForm.tsx`
  - Dodano `import { supabase } from '../../lib/supabase'`
  - Dodano `auth.getSession()` dla Authorization header
  - Dodano logi console dla debugowania
  - Poprawiono obsługę błędów (setLoading false przy błędzie)

---

## ✅ ZMIANY WPROWADZONE

### 1. **src/services/stripe.ts**
```typescript
// Dodano Authorization header do wszystkich funkcji:
'Authorization': `Bearer ${session.access_token}`,

// Dodano weryfikację sesji:
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  throw new Error('User not authenticated. Please log in.');
}

// Lepsze parsowanie błędów:
const errorText = await response.text();
try {
  const errorJson = JSON.parse(errorText);
  errorMessage = errorJson.error || errorMessage;
} catch {
  errorMessage = errorText || errorMessage;
}
```

**Funkcje zmienione:**
- ✅ `createCheckoutSession()` - Worker Premium €13/miesiąc
- ✅ `createEmployerCheckoutSession()` - Employer Basic/Premium €13/€25

---

### 2. **src/components/certificates/ZZPExamApplicationForm.tsx**
```typescript
// Dodano import supabase
import { supabase } from '../../lib/supabase';

// Dodano weryfikację sesji
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  throw new Error('Nie jesteś zalogowany. Zaloguj się ponownie.');
}

// Dodano Authorization header
'Authorization': `Bearer ${session.access_token}`,

// Dodano logi console
console.log('🔵 Creating exam payment session...', { functionsUrl, examPriceId, userId });
console.log('🔵 Response status:', response.status, response.statusText);
console.log('✅ Payment session created:', responseData);

// Poprawiono obsługę błędów
catch (err) {
  console.error('❌ Error creating exam payment:', err);
  setError(err instanceof Error ? err.message : 'Wystąpił błąd');
  setLoading(false); // ✅ Reset loading state!
}
```

---

## 🧪 JAK TESTOWAĆ

### Test #1: Worker Premium Upgrade (€13/miesiąc)
1. Otwórz: **http://localhost:5175/**
2. Zaloguj się jako Worker
3. Przejdź do: **Dashboard → zakładka "Subskrypcja"**
4. Kliknij: **"Upgrade naar Premium Abonnement - €13/maand"**
5. **OCZEKIWANY WYNIK:**
   - ✅ Przekierowanie do Stripe Checkout
   - ✅ Strona płatności pokazuje €13.00 EUR/month
   - ✅ Brak błędów 400 w console

6. **W CONSOLE POWINIENEŚ ZOBACZYĆ:**
```
🔵 Creating checkout session...
✅ Checkout URL: https://checkout.stripe.com/c/pay/cs_test_...
```

---

### Test #2: ZZP Exam Application (€230 jednorazowo)
1. Zaloguj jako Worker
2. Przejdź do: **Dashboard → "Haal je ZZP Certificaat"**
3. Kliknij: **"Aanmelden voor ZZP Examen"**
4. Wypełnij formularz:
   - Data egzaminu (jutro lub później)
   - Lokalizacja magazynu
   - Opis doświadczenia (min. 50 znaków)
   - Wybierz specjalizacje (min. 1)
   - Telefon kontaktowy (opcjonalne)

5. Kliknij: **"Potwierdź i zapłać €230"**

6. **OCZEKIWANY WYNIK:**
   - ✅ Console log: `🔵 Creating exam payment session...`
   - ✅ Console log: `✅ Payment session created:` + dane sesji
   - ✅ Przekierowanie do Stripe Checkout
   - ✅ Strona płatności pokazuje €230.00 EUR (one-time)
   - ✅ Brak nieskończonego ładowania

7. **W CONSOLE POWINIENEŚ ZOBACZYĆ:**
```
🔵 Creating exam payment session... {functionsUrl: '...', examPriceId: 'price_...', userId: '...'}
🔵 Response status: 200 OK
✅ Payment session created: {sessionId: 'cs_test_...', url: 'https://checkout.stripe.com/...', applicationId: '...'}
🔵 Redirecting to: https://checkout.stripe.com/c/pay/cs_test_...
```

---

### Test #3: Employer Registration (€13 Basic / €25 Premium)
1. Wyloguj się
2. Przejdź do: **http://localhost:5175/register/employer**
3. Wypełnij formularz rejestracji
4. Wybierz plan: **Basic (€13/miesiąc)** lub **Premium (€25/miesiąc)**
5. Kliknij: **"Registreer en betaal"**

6. **OCZEKIWANY WYNIK:**
   - ✅ Przekierowanie do Stripe Checkout
   - ✅ Cena zgodna z wybranym planem
   - ✅ Brak błędów 400

---

## 📊 KONFIGURACJA STRIPE (POTWIERDZONO)

### Produkty w Stripe (Test Mode):
1. **Worker Premium Subscription**
   - Price ID: `price_1SGfnFDbg0wPn3udGPqBRbGc`
   - Kwota: €13.00/month
   - Typ: Recurring subscription
   - ✅ Skonfigurowany w .env

2. **ZZP Exam & Certification**
   - Price ID: `price_1SHC7GDbg0wPn3ud5iIrBfUz`
   - Kwota: €230.00 (€190 + 21% BTW)
   - Typ: One-time payment
   - ✅ Skonfigurowany w .env

3. **Employer Basic Plan**
   - Price ID: `price_1SGfrvDbg0wPn3udVDgMY15p`
   - Kwota: €13.00/month
   - Typ: Recurring subscription
   - ✅ Skonfigurowany w .env

4. **Employer Premium Plan**
   - Price ID: `price_1SGfsXDbg0wPn3ud0wpm2TtH`
   - Kwota: €25.00/month
   - Typ: Recurring subscription
   - ✅ Skonfigurowany w .env

---

## 🔐 EDGE FUNCTIONS (POTWIERDZONO)

### Wdrożone funkcje:
1. **create-checkout-session** ✅
   - Status: Active (Version 2)
   - Obsługuje: Worker Premium, Employer Basic, Employer Premium
   - Endpoint: `https://dtnotuyagygexmkyqtgb.functions.supabase.co/create-checkout-session`

2. **create-exam-payment** ✅
   - Status: Active (wdrożony)
   - Obsługuje: ZZP Exam €230
   - Endpoint: `https://dtnotuyagygexmkyqtgb.functions.supabase.co/create-exam-payment`
   - Tworzy rekord w `zzp_exam_applications` przed płatnością

3. **stripe-webhook** ✅
   - Status: Active (Version 2)
   - Obsługuje: checkout.session.completed, subscription.*, invoice.*
   - Endpoint: `https://dtnotuyagygexmkyqtgb.functions.supabase.co/stripe-webhook`

---

## 🗄️ BAZA DANYCH (POTWIERDZONO)

### Tabele:
1. **workers** - 12 nowych kolumn dla subskrypcji ✅
2. **subscription_payments** - historia płatności ✅
3. **certificate_applications** - stary system (deprecated) ✅
4. **subscription_events** - logi zdarzeń ✅
5. **zzp_exam_applications** - nowy system egzaminów ✅

### RLS Policies (Row Level Security):
- ✅ Workers mogą widzieć własne dane
- ✅ Workers mogą tworzyć aplikacje egzaminacyjne
- ✅ Workers mogą edytować draft applications
- ✅ Admini mają pełny dostęp

---

## 🚀 DEPLOYMENT STATUS

### Frontend:
- ✅ Dev server: **http://localhost:5175/**
- ✅ Vite 6.3.6
- ✅ React + TypeScript
- ✅ TailwindCSS
- ✅ Wszystkie komponenty zaktualizowane

### Backend (Supabase):
- ✅ Project: `dtnotuyagygexmkyqtgb`
- ✅ Database: PostgreSQL z RLS
- ✅ Edge Functions: 3/3 deployed
- ✅ Authentication: JWT tokens

### Stripe:
- ✅ Mode: Test
- ✅ Publishable Key: `pk_test_51SGfc0...`
- ✅ Secret Key: `sk_test_51SGfc0...`
- ✅ Webhook Secret: `whsec_C4H3OTcj...`
- ✅ Products: 4/4 configured

---

## ❗ ZNANE PROBLEMY (DO NAPRAWY)

### 1. Timeout 408 na innych endpointach
**Problem:** 
- `earnings`, `portfolio`, `reviews`, `applications` zwracają 408 timeout
- To są zapytania do Supabase REST API

**Możliwe przyczyny:**
- RLS policies blokują zapytania (brak uprawnień)
- Zbyt wiele zapytań w krótkim czasie
- Nieoptymalne zapytania (join bez indeksów)

**Rekomendacja:**
1. Sprawdź RLS policies dla tabel: `earnings`, `portfolio`, `reviews`, `job_applications`
2. Dodaj indeksy do często używanych kolumn
3. Zoptymalizuj zapytania (ogranicz ilość joinów)
4. Dodaj retry logic z exponential backoff

---

### 2. Brak widoku "Historia płatności"
**Problem:**
- SubscriptionPanel pokazuje mock data (statyczne dane testowe)
- Brak integracji z tabelą `subscription_payments`

**Rozwiązanie (TODO):**
```typescript
// src/components/subscription/SubscriptionPanel.tsx
useEffect(() => {
  const fetchPayments = async () => {
    const { data, error } = await supabase
      .from('subscription_payments')
      .select('*')
      .eq('worker_id', workerId)
      .order('payment_date', { ascending: false })
      .limit(10);

    if (data) setPayments(data);
  };

  fetchPayments();
}, [workerId]);
```

---

## 📝 NASTĘPNE KROKI

### Wysokie priorytety:
1. ✅ **Naprawiono:** Authorization header w Edge Functions
2. ✅ **Naprawiono:** Nieskończone ładowanie ZZP Exam
3. ⏳ **TODO:** Napraw timeout 408 na innych endpointach (earnings, portfolio, etc.)
4. ⏳ **TODO:** Zintegruj prawdziwe dane w SubscriptionPanel (zamiast mock data)
5. ⏳ **TODO:** Dodaj Customer Portal dla zarządzania subskrypcją (Stripe)

### Niskie priorytety:
6. ⏳ **TODO:** Dodaj email notifications (potwierdzenie płatności, przypomnienie o egzaminie)
7. ⏳ **TODO:** Stwórz admin panel dla zarządzania egzaminami
8. ⏳ **TODO:** Dodaj generowanie PDF certyfikatów
9. ⏳ **TODO:** Dodaj testy jednostkowe dla funkcji płatności

---

## 🎯 PODSUMOWANIE

### ✅ CO NAPRAWIONO:
1. **Błąd 400 przy checkout** - dodano Authorization header
2. **Nieskończone ładowanie** - poprawiono obsługę błędów
3. **Brak logowania** - dodano console logs dla debugowania

### 🧪 GOTOWE DO TESTOWANIA:
- Worker Premium upgrade (€13/miesiąc)
- ZZP Exam application (€230 jednorazowo)
- Employer registration (€13/€25 miesiąc)

### 🔗 LINKI TESTOWE:
- App: **http://localhost:5175/**
- Stripe Dashboard: **https://dashboard.stripe.com/test/payments**
- Supabase Dashboard: **https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb**

---

**KONIEC RAPORTU**
