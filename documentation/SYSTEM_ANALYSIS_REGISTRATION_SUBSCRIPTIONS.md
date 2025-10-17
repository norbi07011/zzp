# 🔍 ANALIZA SYSTEMU REJESTRACJI I SUBSKRYPCJI

## 📊 OBECNY STAN SYSTEMU (Stan faktyczny po analizie kodu)

### ✅ **CO JUŻ DZIAŁA:**

#### 1. **Rejestracja Pracodawców (Employers)**
- ✅ **Plik:** `pages/public/RegisterEmployerPage.tsx` (609 linii)
- ✅ **Route:** `/register-employer` (public, dostępny dla wszystkich)
- ✅ **Funkcjonalność:**
  - 3-stopniowy wizard rejestracji
  - Walidacja Zod (bezpieczna)
  - Pola: nazwa firmy, NIP, email, telefon, osoba kontaktowa, hasło
  - Po rejestracji → przekierowanie do `/employer/subscription`

#### 2. **Wybór Subskrypcji Pracodawcy**
- ✅ **Plik:** `pages/employer/SubscriptionManager.tsx` (427 linii)
- ✅ **Route:** `/employer/subscription`
- ✅ **Funkcjonalność:**
  - Wybór planu: Basic (€13/miesiąc) lub Premium (€25/miesiąc)
  - Przycisk "EmployerCheckoutButton" → płatność Stripe
  - Wyświetla historię faktur, metodę płatności

#### 3. **Protected Routes (Autoryzacja)**
- ✅ **Plik:** `components/ProtectedRoute.tsx`
- ✅ **Funkcjonalność:**
  - Sprawdza czy user jest zalogowany
  - Sprawdza czy user ma odpowiednią rolę (admin/employer/worker)
  - **WAŻNE:** NIE sprawdza czy subskrypcja jest aktywna!

#### 4. **Dashboard Pracodawcy**
- ✅ **Route:** `/employer` (ProtectedRoute: employer)
- ✅ Działa po zalogowaniu (niezależnie od subskrypcji)

#### 5. **Dashboard Pracownika**
- ✅ **Route:** `/worker` (ProtectedRoute: worker)
- ✅ Działa po zalogowaniu (niezależnie od subskrypcji)

---

### ❌ **CO NIE DZIAŁA / CZEGO BRAKUJE:**

#### 1. **Rejestracja Pracowników (Workers) - BRAK!**
- ❌ **Brak pliku:** `pages/public/RegisterWorkerPage.tsx`
- ❌ **Brak route:** `/register-worker` (tylko linki, ale strona nie istnieje!)
- ❌ W `App.tsx` NIE MA:
  ```tsx
  <Route path="/register-worker" element={<RegisterWorkerPage />} />
  ```

#### 2. **Blokada Dostępu Bez Aktywnej Subskrypcji - BRAK!**
- ❌ `ProtectedRoute.tsx` NIE sprawdza statusu subskrypcji
- ❌ Pracodawca może:
  - Zarejestrować się
  - Nie płacić
  - Wejść na `/employer` i korzystać z systemu **ZA DARMO!**
- ❌ Pracownik może:
  - Zarejestrować się (jeśli strona istniałaby)
  - Nie płacić
  - Wejść na `/worker` i korzystać z systemu **ZA DARMO!**

#### 3. **Widoczność Zawartości Oparta na Subskrypcji - BRAK!**
- ❌ Brak sprawdzenia `subscription_status = 'active'` w queries
- ❌ Pracodawca widzi wszystkich pracowników (niezależnie od tego czy płaci)
- ❌ Pracownik widzi wszystkich pracodawców (niezależnie od tego czy płaci)

---

## 🎯 TWÓJ ZAPROPONOWANY MODEL BIZNESOWY

### **Jak POWINNO działać (według Twojego opisu):**

#### **PRACODAWCA (Employer):**
1. Rejestracja → `/register-employer` (JEST ✅)
2. Wybór planu Basic (€13) lub Premium (€25) (JEST ✅)
3. **Płatność OBOWIĄZKOWA** → Stripe Checkout (JEST ✅)
4. **Aktywacja konta** → `subscription_status = 'active'` (BRAK ❌)
5. Dostęp do `/employer` dashboard **TYLKO jeśli subskrypcja aktywna** (BRAK ❌)
6. **Brak płatności = brak dostępu:**
   - Nie widzi listy pracowników
   - Nie może kontaktować się
   - Nie może wyszukiwać
7. **Subskrypcja wygasła** → blokada dashboardu, wyświetlenie strony "Odnów subskrypcję"

#### **PRACOWNIK (Worker):**
1. Rejestracja → `/register-worker` (**BRAK STRONY!** ❌)
2. Wybór planu:
   - **Basic (€0)** - darmowy, ograniczona widoczność
   - **Premium (€13/miesiąc)** - wyższa widoczność, więcej kontaktów
3. **Płatność OPCJONALNA dla Premium** → Stripe Checkout (BRAK ❌)
4. Aktywacja konta → `subscription_status = 'active'` (BRAK ❌)
5. Dostęp do `/worker` dashboard:
   - **Basic:** Może korzystać, ale ma ograniczenia
   - **Premium:** Pełen dostęp, wyższa widoczność w wyszukiwarkach
6. **Brak płatności Premium:**
   - Widzi pracodawców, ale ma niższą pozycję w wynikach
   - Mniej kontaktów od pracodawców

---

## ⚠️ PROBLEMY W OBECNYM SYSTEMIE

### **Problem 1: Darmowy Dostęp dla Wszystkich**
**Aktualnie:**
```typescript
// ProtectedRoute.tsx - sprawdza TYLKO rolę, NIE subskrypcję!
if (user.role === 'employer') {
  return <Navigate to="/employer" replace />; // ✅ Wchodzi bez płatności!
}
```

**Powinno być:**
```typescript
// Sprawdź subskrypcję
if (user.role === 'employer' && !hasActiveSubscription) {
  return <Navigate to="/employer/subscription" replace />; // ❌ Blokada!
}
```

### **Problem 2: Brak RegisterWorkerPage**
**Aktualnie:**
- Homepage ma linki `<Link to="/register-worker">` (20+ miejsc w kodzie)
- Route `/register-worker` **NIE ISTNIEJE** w `App.tsx`
- User klika → błąd 404 lub redirect do `/`

### **Problem 3: Brak Walidacji Subskrypcji w Queries**
**Aktualnie:**
```sql
-- Employer widzi WSZYSTKICH workers (nawet jeśli nie płaci!)
SELECT * FROM workers WHERE verified = true;
```

**Powinno być:**
```sql
-- Tylko employer z aktywną subskrypcją widzi workers
SELECT w.* FROM workers w
WHERE w.verified = true
AND EXISTS (
  SELECT 1 FROM employer_subscriptions es
  WHERE es.employer_id = $employer_id
  AND es.subscription_status = 'active'
  AND es.subscription_end_date > NOW()
);
```

---

## 🛠️ CO TRZEBA NAPRAWIĆ (Lista zadań)

### **ZADANIE 1: Utworzyć RegisterWorkerPage** ⚠️ KRYTYCZNE
**Plik:** `pages/public/RegisterWorkerPage.tsx`
**Route:** `/register-worker`
**Funkcjonalność:**
- 3-stopniowy wizard (jak employer)
- Pola: imię, nazwisko, email, telefon, hasło, zgoda na regulamin
- Po rejestracji → przekierowanie do `/worker/subscription-selection`
- **NIE wymaga płatności od razu** (może wybrać Basic = darmowy)

---

### **ZADANIE 2: Dodać Subscription Check do ProtectedRoute** ⚠️ KRYTYCZNE
**Plik:** `components/ProtectedRoute.tsx`
**Zmiany:**
```typescript
// Pobierz subskrypcję z Supabase
const { subscription } = useSubscription(user.id, user.role);

// Employer MUSI mieć aktywną subskrypcję
if (user.role === 'employer' && !subscription?.isActive) {
  return <Navigate to="/employer/subscription" replace />;
}

// Worker może wejść, ale dashboard pokaże ograniczenia
if (user.role === 'worker' && !subscription?.isActive) {
  // Dozwolone, ale wyświetl baner "Upgrade to Premium"
}
```

---

### **ZADANIE 3: Utworzyć Worker Subscription Selection Page**
**Plik:** `pages/worker/SubscriptionSelectionPage.tsx`
**Route:** `/worker/subscription-selection`
**Funkcjonalność:**
- Wybór planu:
  - **Basic (€0)** - darmowy, kontynuuj bez płatności
  - **Premium (€13/miesiąc)** - przycisk Stripe Checkout
- Po wyborze Basic → przekierowanie do `/worker`
- Po wyborze Premium → Stripe → po płatności → `/worker`

---

### **ZADANIE 4: Dodać Subscription Checks w Queries**
**Pliki:**
- `pages/employer/WorkerSearch.tsx` - tylko employer z aktywną subskrypcją
- `pages/worker/WorkerDashboard.tsx` - tylko jeśli employer ma aktywną subskrypcję
- `supabase/functions/*` - sprawdzaj subscription_status przed zwróceniem danych

---

### **ZADANIE 5: Paywall dla Employers**
**Plik:** `components/EmployerPaywall.tsx`
**Wyświetl jeśli:** `subscription_status !== 'active'`
**Funkcjonalność:**
- Wyświetl komunikat: "Twoja subskrypcja wygasła. Odnów dostęp."
- Przycisk: "Wybierz Plan" → `/employer/subscription`
- Blokuj dostęp do: wyszukiwania, listy workers, kontaktów

---

### **ZADANIE 6: Upgrade Prompts dla Workers**
**Plik:** `components/WorkerUpgradeBanner.tsx`
**Wyświetl jeśli:** `subscription_tier = 'basic'`
**Funkcjonalność:**
- Baner na `/worker`: "Upgrade do Premium - więcej widoczności!"
- NIE blokuj dostępu (Basic jest darmowy)
- Wyświetl ograniczenia: "Masz 5/5 kontaktów w tym miesiącu"

---

## 📋 REKOMENDOWANA KOLEJNOŚĆ IMPLEMENTACJI

### **PRIORYTET 1 (KRYTYCZNY):**
1. ✅ Utworzyć `RegisterWorkerPage.tsx`
2. ✅ Dodać route `/register-worker` w `App.tsx`
3. ✅ Utworzyć `WorkerSubscriptionSelectionPage.tsx`
4. ✅ Dodać route `/worker/subscription-selection`

### **PRIORYTET 2 (WYSOKI):**
5. ✅ Dodać subscription check w `ProtectedRoute.tsx` (dla employers)
6. ✅ Utworzyć `EmployerPaywall.tsx` (blokada bez subskrypcji)
7. ✅ Dodać subscription validation w WorkerSearch queries

### **PRIORYTET 3 (ŚREDNI):**
8. ✅ Utworzyć `WorkerUpgradeBanner.tsx` (zachęta do Premium)
9. ✅ Dodać RLS policies w Supabase (sprawdzaj subscription_status)
10. ✅ Dodać webhook handling dla Stripe (anulowanie subskrypcji)

---

## 🎬 PRZEPŁYW UŻYTKOWNIKA (Docelowy)

### **PRACODAWCA:**
```
1. Wchodzi na stronę → /
2. Klik "Registreren als bedrijf" → /register-employer
3. Wypełnia formularz → Submit
4. Przekierowanie → /employer/subscription
5. Wybiera plan (€13 lub €25) → Stripe Checkout
6. Płaci → Stripe redirect → /payment-success
7. Webhook Stripe → subscription_status = 'active'
8. Przekierowanie → /employer (DOSTĘP ODBLOKOWANY ✅)
9. Widzi listę workers, może wyszukiwać, kontaktować
10. Subskrypcja wygasa → /employer pokazuje paywall ❌
11. Odnawia → Stripe → ponownie dostęp ✅
```

### **PRACOWNIK:**
```
1. Wchodzi na stronę → /
2. Klik "Word nu zzp'er" → /register-worker ❌ (BRAK STRONY!)
3. Wypełnia formularz → Submit
4. Przekierowanie → /worker/subscription-selection
5a. Wybiera Basic (€0) → /worker (DOSTĘP ✅, ale ograniczenia)
5b. Wybiera Premium (€13) → Stripe Checkout → /payment-success → /worker (PEŁEN DOSTĘP ✅)
6. Widzi oferty pracy, może aplikować
7. Baner "Upgrade to Premium" jeśli Basic
8. Subskrypcja Premium wygasa → powrót do Basic (nie blokada!)
```

---

## 💡 ODPOWIEDŹ NA TWOJE PYTANIA

### **"czy tak wyglada nasza struktura projektu?"**
❌ **NIE!** Obecny system ma 2 duże problemy:
1. **Brak strony rejestracji dla pracowników** (`/register-worker` nie istnieje)
2. **Brak enforc'owania subskrypcji** (każdy może korzystać za darmo po rejestracji)

### **"pracodawcy nie wyswietlaja sie pracownicy nmie ma nic dostempnego"**
✅ **TAK, ale TYLKO jeśli zaimplementujemy subscription checks!**
Obecnie każdy widzi wszystko nawet bez płatności.

### **"u pracownika tez nie bedzie sie wystwetlał pracodawca"**
🤔 **To zależy od modelu:**
- **Opcja A:** Worker Basic (€0) widzi pracodawców, ale ma niższy ranking
- **Opcja B:** Worker Basic NIE widzi pracodawców (musi płacić €13)

**Która opcja chcesz?** Zwykle:
- Pracodawca = musi płacić (dostęp do bazy pracowników jest premium)
- Pracownik = może być darmowy Basic (dostęp do ofert), Premium daje więcej widoczności

---

## 🚀 NASTĘPNE KROKI

**Powiedz mi:**
1. Czy tworzymy teraz `RegisterWorkerPage.tsx`?
2. Czy Worker Basic powinien być darmowy czy płatny (€13)?
3. Czy wdrażamy paywall dla Employers bez subskrypcji?
4. Czy chcesz pełną implementację PRIORYTETU 1 (4 pliki)?

**Mogę teraz:**
- ✅ Utworzyć RegisterWorkerPage (3-step wizard jak employer)
- ✅ Dodać WorkerSubscriptionSelectionPage (wybór Basic vs Premium)
- ✅ Dodać subscription check w ProtectedRoute
- ✅ Utworzyć EmployerPaywall component
