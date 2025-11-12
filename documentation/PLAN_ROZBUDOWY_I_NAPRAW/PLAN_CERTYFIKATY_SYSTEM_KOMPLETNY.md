# 📋 PLAN ROZBUDOWY SYSTEMU CERTYFIKATÓW - ZZP WERKPLAATS

**Data utworzenia:** 2025-11-12  
**Status:** 🔴 DO WYKONANIA  
**Priorytet:** ⭐⭐⭐ WYSOKI  
**Czas realizacji:** ~4-6 godzin

---

## 🎯 CEL GŁÓWNY

Rozbudować system certyfikatów Premium ZZP o:

1. ✅ Badge certyfikatu w profilu publicznym pracownika
2. ✅ Filtr "Z/Bez certyfikatu" w wyszukiwarce pracodawcy
3. ✅ Logikę subskrypcji pracodawcy (Basic vs Premium access)
4. ✅ Paywall dla Basic employers z CTA do upgrade

---

## 📊 AKTUALNY STAN SYSTEMU

### ✅ CO JUŻ DZIAŁA:

#### 1. Baza danych

```sql
-- Tabela certificates (GOTOWA)
CREATE TABLE certificates (
  id UUID PRIMARY KEY,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  certificate_number TEXT UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  expiry_date DATE,
  status TEXT CHECK (status IN ('active', 'expired', 'revoked')),
  certificate_type TEXT NOT NULL,
  issued_by TEXT,
  file_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies (GOTOWE)
-- Worker: read own certificates
-- Admin: full access (CRUD)
```

#### 2. Backend (services/certificateService.ts)

- ✅ getAllCertificates() - admin
- ✅ getWorkerCertificates(workerId) - worker
- ✅ createCertificate() - admin
- ✅ revokeCertificate() - admin
- ❌ generateCertificatePDF() - TODO (nie działa)

#### 3. Admin Panel (pages/admin/CertificateManagementPage.tsx)

- ✅ Lista wszystkich certyfikatów
- ✅ Tworzenie nowego certyfikatu
- ✅ Odwoływanie certyfikatu
- ✅ Download PDF (TODO - plik nie generuje się)

#### 4. Worker Dashboard (pages/worker/WorkerDashboard.tsx)

- ✅ Sekcja "Moje Certyfikaty"
- ✅ Wyświetlanie listy certyfikatów
- ✅ CertificateCard component
- ✅ Download PDF button

---

## ❌ CO BRAKUJE (DO ZROBIENIA)

### 1. PROFIL PUBLICZNY PRACOWNIKA - BRAK BADGE ❌

**Lokalizacja:** `src/pages/profile/WorkerProfilePage.tsx`

**Problem:**

- Profil NIE pokazuje czy worker ma certyfikat Premium
- Brak SubscriptionBadge
- Brak numeru certyfikatu ZZP

**Wymagania:**

- Badge "PREMIUM" jeśli worker ma subscription_tier = 'premium'
- Wyświetl numer certyfikatu: "🏆 ZZP-2025-001"
- Zielony border wokół sekcji certyfikatu

---

### 2. FILTR CERTYFIKATÓW W WYSZUKIWARCE ❌

**Lokalizacja:** `pages/employer/WorkerSearch.tsx`

**Problem:**

- Brak możliwości filtrowania "Z certyfikatem" vs "Bez certyfikatu"
- Employer musi przewijać całą listę by znaleźć certified workers

**Wymagania:**

- Dodaj dropdown "Certyfikat Premium ZZP":
  - Wszyscy (default)
  - 🏆 Tylko z certyfikatem
  - Bez certyfikatu
- Filtr działa razem z istniejącymi (lokalizacja, kategoria, języki)

---

### 3. LOGIKA SUBSKRYPCJI PRACODAWCY ❌

**Lokalizacja:** `pages/employer/WorkerSearch.tsx`

**Problem:**

- WorkerSearch pokazuje WSZYSTKICH workers niezależnie od subscription tier pracodawcy
- Basic employer (€13/m) widzi workers z certyfikatami (nie powinien!)
- Premium employer (€25/m) ma dostęp do wszystkich (OK)

**Business Logic:**

| Tier Pracodawcy      | Dostęp do Workers                                 |
| -------------------- | ------------------------------------------------- |
| **Basic (€13/m)**    | TYLKO workers BEZ certyfikatu Premium             |
| **Premium (€25/m)**  | WSZYSCY workers (certified + uncertified)         |
| **Brak subskrypcji** | Brak dostępu (redirect do /employer/subscription) |

**Wymagania:**

- Sprawdź subscription_tier pracodawcy w employers table
- Filtruj results based on tier
- Przechowuj w state: `employerSubscription: "basic" | "premium" | null`

---

### 4. PAYWALL DLA BASIC EMPLOYERS ❌

**Lokalizacja:** `pages/employer/WorkerSearch.tsx`

**Problem:**

- Basic employer nie wie że ma ograniczony dostęp
- Brak informacji o upgrade
- Brak CTA do Premium plan

**Wymagania:**

- Wyświetl banner na górze WorkerSearch dla Basic employers:
  - "🔒 Plan Basic - Ograniczony dostęp"
  - Lista benefitów Premium (certified workers, priority, direct contact)
  - Przycisk "🚀 Upgrade do Premium - €25/miesiąc"
  - Redirect do `/employer/subscription`

---

## 🛠️ PLAN IMPLEMENTACJI

### ETAP 1: PROFIL PUBLICZNY PRACOWNIKA (1h)

#### Plik: `src/pages/profile/WorkerProfilePage.tsx`

**Zmiany:**

1. Import SubscriptionBadge:

```typescript
import { SubscriptionBadge } from "@/src/components/SubscriptionBadge";
```

2. Dodaj badge w sekcji header (po avatar):

```typescript
{
  profile.subscription_tier && (
    <SubscriptionBadge tier={profile.subscription_tier} size="lg" />
  );
}
```

3. Dodaj certyfikat (jeśli istnieje):

```typescript
{
  profile.zzp_certificate_issued && profile.zzp_certificate_number && (
    <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="text-4xl">🏆</div>
        <div>
          <h4 className="font-bold text-yellow-900">Certyfikat Premium ZZP</h4>
          <code className="text-sm font-mono text-yellow-800 bg-yellow-100 px-2 py-1 rounded">
            {profile.zzp_certificate_number}
          </code>
          <p className="text-xs text-yellow-700 mt-1">
            Zweryfikowany profesjonalista ZZP Werkplaats
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Test:**

- Otwórz `/worker/jan-kowalski`
- Sprawdź czy badge "PREMIUM" widoczny
- Sprawdź czy certyfikat "🏆 ZZP-2025-001" wyświetla się

---

### ETAP 2: FILTR CERTYFIKATÓW W WORKERSEARCH (1.5h)

#### Plik: `pages/employer/WorkerSearch.tsx`

**Zmiany:**

1. Dodaj state (linia ~220):

```typescript
const [filterCertified, setFilterCertified] = useState<
  "all" | "certified" | "uncertified"
>("all");
```

2. Dodaj dropdown w sekcji filtrów (linia ~500):

```typescript
{
  /* Filtr Certyfikat */
}
<div className="mb-6">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    🏆 Certyfikat Premium ZZP
  </label>
  <select
    value={filterCertified}
    onChange={(e) => setFilterCertified(e.target.value as any)}
    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
  >
    <option value="all">Wszyscy pracownicy</option>
    <option value="certified">🏆 Tylko z certyfikatem Premium</option>
    <option value="uncertified">Bez certyfikatu</option>
  </select>
</div>;
```

3. Dodaj logikę filtrowania w `filteredWorkers` (linia ~400):

```typescript
const matchesCertified =
  filterCertified === "all" ||
  (filterCertified === "certified" && worker.zzp_certificate_issued) ||
  (filterCertified === "uncertified" && !worker.zzp_certificate_issued);

return (
  matchesSearch &&
  matchesCategory &&
  matchesCity &&
  matchesLanguages &&
  matchesRate &&
  matchesTier &&
  matchesCertified // ← NOWE
);
```

4. Dodaj do useMemo dependencies:

```typescript
}, [
  searchQuery,
  filterCategory,
  filterCity,
  filterLanguages,
  filterMinRate,
  filterMaxRate,
  filterSubscriptionTier,
  filterCertified, // ← NOWE
]);
```

**Test:**

- Zaloguj jako employer
- Wybierz "Tylko z certyfikatem Premium"
- Sprawdź czy lista zawiera tylko workers z `zzp_certificate_issued: true`

---

### ETAP 3: LOGIKA SUBSKRYPCJI PRACODAWCY (2h)

#### Plik: `pages/employer/WorkerSearch.tsx`

**Zmiany:**

1. Dodaj state dla employer subscription (linia ~230):

```typescript
const [employerSubscription, setEmployerSubscription] = useState<
  "basic" | "premium" | null
>(null);
const [employerLoading, setEmployerLoading] = useState(true);
```

2. Dodaj useEffect do load employer data (linia ~240):

```typescript
useEffect(() => {
  async function loadEmployerSubscription() {
    if (!user || user.role !== "employer") {
      setEmployerLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("employers")
        .select("subscription_tier, subscription_status")
        .eq("profile_id", user.id)
        .single();

      if (error) {
        console.error("❌ Error loading employer subscription:", error);
        setEmployerLoading(false);
        return;
      }

      if (data && data.subscription_status === "active") {
        setEmployerSubscription(data.subscription_tier as "basic" | "premium");
      } else {
        setEmployerSubscription(null);
      }
    } catch (err) {
      console.error("❌ Exception loading employer:", err);
    } finally {
      setEmployerLoading(false);
    }
  }

  loadEmployerSubscription();
}, [user]);
```

3. Modyfikuj `filteredWorkers` useMemo (linia ~400):

```typescript
const filteredWorkers = useMemo(() => {
  let workers = MOCK_WORKERS; // lub real data from Supabase

  // 🔐 EMPLOYER SUBSCRIPTION LOGIC
  if (employerSubscription === "basic") {
    // Basic employer = TYLKO workers BEZ certyfikatu
    workers = workers.filter(w => !w.zzp_certificate_issued);
  }
  // Premium employer = dostęp do WSZYSTKICH (no filter needed)

  // Reszta filtrów...
  return workers.filter(worker => {
    const matchesCertified = /* ... */;
    const matchesSearch = /* ... */;
    // ...

    return matchesSearch && /* ... */ && matchesCertified;
  });
}, [employerSubscription, filterCertified, /* ...other deps */]);
```

4. Dodaj redirect dla brak subskrypcji:

```typescript
if (!employerLoading && employerSubscription === null) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Brak aktywnej subskrypcji
        </h2>
        <p className="text-gray-600 mb-6">
          Aby przeglądać pracowników, wybierz plan subskrypcji.
        </p>
        <Link to="/employer/subscription" className="btn-primary">
          Wybierz plan
        </Link>
      </div>
    </div>
  );
}
```

**Test:**

- Zaloguj jako employer z Basic plan
- Sprawdź czy widzisz TYLKO workers bez certyfikatu
- Zmień subscription_tier na 'premium' w bazie
- Sprawdź czy teraz widzisz WSZYSTKICH

---

### ETAP 4: PAYWALL DLA BASIC EMPLOYERS (1.5h)

#### Plik: `pages/employer/WorkerSearch.tsx`

**Zmiany:**

1. Dodaj banner przed listą workers (linia ~650):

```typescript
{
  /* Paywall Banner - Basic Employers */
}
{
  employerSubscription === "basic" && (
    <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 border-2 border-orange-400 rounded-2xl p-8 mb-8 shadow-2xl">
      <div className="flex items-start gap-6">
        <div className="text-7xl">🔒</div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-orange-900 mb-3">
            Plan Basic - Ograniczony dostęp do pracowników
          </h3>
          <p className="text-orange-800 mb-5 text-lg">
            Z planem Basic (€13/miesiąc) masz dostęp TYLKO do pracowników bez
            certyfikatu Premium ZZP.
            <br />
            <strong>Upgrade do planu Premium (€25/miesiąc)</strong> odblokowuje:
          </p>

          <ul className="space-y-3 text-orange-800 mb-6">
            <li className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <strong>Dostęp do zweryfikowanych specjalistów</strong>
                <p className="text-sm text-orange-700">
                  Pracownicy z certyfikatem Premium ZZP - potwierdzone
                  umiejętności
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <strong>Wyższy priorytet w wynikach wyszukiwania</strong>
                <p className="text-sm text-orange-700">
                  Twoje oferty pracy wyświetlają się na górze listy
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <strong>Bezpośredni kontakt</strong>
                <p className="text-sm text-orange-700">
                  Wiadomości prywatne i natychmiastowy dostęp do portfolio
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <strong>Pełne profile i statystyki</strong>
                <p className="text-sm text-orange-700">
                  Historia projektów, opinie klientów, certyfikaty
                </p>
              </div>
            </li>
          </ul>

          <div className="flex gap-4">
            <Link
              to="/employer/subscription"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all"
            >
              <span>🚀</span>
              <span>Upgrade do Premium - €25/miesiąc</span>
            </Link>

            <Link
              to="/employer/subscription"
              className="inline-flex items-center gap-2 border-2 border-orange-500 text-orange-700 px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-50 transition-all"
            >
              <span>💳</span>
              <span>Porównaj plany</span>
            </Link>
          </div>

          <p className="text-sm text-orange-600 mt-4">
            💡 <strong>Wskazówka:</strong> Pracownicy z certyfikatem Premium
            mają średnio 40% wyższy rating i szybciej realizują projekty.
          </p>
        </div>
      </div>
    </div>
  );
}
```

2. Dodaj licznik niedostępnych workers:

```typescript
{
  employerSubscription === "basic" && (
    <div className="mb-6 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
      <p className="text-yellow-800">
        <strong>
          📊 Ukryto{" "}
          {MOCK_WORKERS.filter((w) => w.zzp_certificate_issued).length}{" "}
          certyfikowanych pracowników
        </strong>
        <br />
        <span className="text-sm">
          Upgrade do Premium aby zobaczyć wszystkich {MOCK_WORKERS.length}{" "}
          pracowników
        </span>
      </p>
    </div>
  );
}
```

**Test:**

- Zaloguj jako employer z Basic plan
- Sprawdź czy banner jest widoczny
- Kliknij "Upgrade do Premium"
- Sprawdź czy redirect do `/employer/subscription`

---

## 📊 TESTY AKCEPTACYJNE

### Test Case 1: Worker Profile - Badge Certyfikatu

```
1. Otwórz profil publiczny workera z certyfikatem: /worker/jan-kowalski
2. ✅ Badge "PREMIUM" widoczny
3. ✅ Numer certyfikatu "🏆 ZZP-2025-001" widoczny
4. ✅ Zielony border wokół sekcji certyfikatu
5. Otwórz profil workera BEZ certyfikatu
6. ✅ Brak badge Premium
7. ✅ Brak sekcji certyfikatu
```

### Test Case 2: Filtr Certyfikatów

```
1. Zaloguj jako employer (dowolny tier)
2. Idź do /employer/search
3. Wybierz filtr "Tylko z certyfikatem Premium"
4. ✅ Lista pokazuje TYLKO workers z zzp_certificate_issued: true
5. Wybierz filtr "Bez certyfikatu"
6. ✅ Lista pokazuje TYLKO workers z zzp_certificate_issued: false
7. Wybierz "Wszyscy pracownicy"
8. ✅ Lista pokazuje WSZYSTKICH workers
```

### Test Case 3: Basic Employer - Ograniczony Dostęp

```
1. Zaloguj jako employer z Basic plan (subscription_tier: 'basic')
2. Idź do /employer/search
3. ✅ Widzisz TYLKO workers BEZ certyfikatu
4. ✅ Paywall banner widoczny na górze
5. ✅ Licznik "Ukryto X certyfikowanych pracowników" widoczny
6. Kliknij "Upgrade do Premium"
7. ✅ Redirect do /employer/subscription
```

### Test Case 4: Premium Employer - Pełny Dostęp

```
1. Zaloguj jako employer z Premium plan (subscription_tier: 'premium')
2. Idź do /employer/search
3. ✅ Widzisz WSZYSTKICH workers (certified + uncertified)
4. ✅ BRAK paywall banner
5. ✅ Filtr "Certyfikat" działa normalnie
6. ✅ Możesz kontaktować się z certified workers
```

### Test Case 5: Brak Subskrypcji

```
1. Zaloguj jako employer BEZ subskrypcji (subscription_status: 'inactive')
2. Idź do /employer/search
3. ✅ Redirect do /employer/subscription
4. ✅ Komunikat "Brak aktywnej subskrypcji"
```

---

## 🔧 WYMAGANE ZMIANY W BAZIE DANYCH

### ❌ BRAK - Wszystkie tabele już istnieją!

Sprawdź czy `workers` table ma kolumny:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'workers'
  AND column_name IN ('zzp_certificate_issued', 'zzp_certificate_number', 'subscription_tier');
```

Sprawdź czy `employers` table ma kolumny:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'employers'
  AND column_name IN ('subscription_tier', 'subscription_status');
```

**Jeśli brakuje - dodaj migrację!**

---

## 📝 CHECKLIST WYKONANIA

### ETAP 1: Profil Publiczny (1h)

- [ ] Import SubscriptionBadge
- [ ] Dodaj badge w header
- [ ] Dodaj sekcję certyfikatu
- [ ] Test w przeglądarce

### ETAP 2: Filtr Certyfikatów (1.5h)

- [ ] Dodaj state `filterCertified`
- [ ] Dodaj dropdown w UI
- [ ] Dodaj logikę filtrowania
- [ ] Dodaj do dependencies
- [ ] Test filtrowania

### ETAP 3: Logika Subskrypcji (2h)

- [ ] Dodaj state `employerSubscription`
- [ ] Dodaj useEffect load data
- [ ] Modyfikuj filteredWorkers
- [ ] Dodaj redirect dla brak sub
- [ ] Test Basic vs Premium

### ETAP 4: Paywall (1.5h)

- [ ] Dodaj banner UI
- [ ] Dodaj licznik ukrytych workers
- [ ] Dodaj CTA buttons
- [ ] Test w przeglądarce

### FINALNE TESTY

- [ ] Test Case 1: Worker Profile
- [ ] Test Case 2: Filtr Certyfikatów
- [ ] Test Case 3: Basic Employer
- [ ] Test Case 4: Premium Employer
- [ ] Test Case 5: Brak Subskrypcji

---

## 🚀 DEPLOYMENT

Po zakończeniu implementacji:

1. **Code Review** - sprawdź wszystkie zmiany
2. **Test na localhost** - wszystkie test cases
3. **Commit do Git** - z opisowym message
4. **Deploy do Vercel/Netlify** - staging environment
5. **Final Test** - na staging
6. **Deploy do produkcji** - jeśli wszystko OK

---

## 📚 DODATKOWE NOTATKI

### Business Logic - Subscription Tiers

```
BASIC EMPLOYER (€13/miesiąc):
- Dostęp do uncertified workers
- Podstawowe wyszukiwanie
- Limit 10 kontaktów/miesiąc
- Brak priorytetowego wyświetlania ofert

PREMIUM EMPLOYER (€25/miesiąc):
- Dostęp do WSZYSTKICH workers (certified + uncertified)
- Zaawansowane filtry (certyfikat, rating, doświadczenie)
- Nieograniczone kontakty
- Priorytet w wynikach wyszukiwania
- Bezpośrednie wiadomości do certified workers
- Pełne profile + portfolio
```

### Edge Cases

1. **Worker ma certyfikat expired:**

   - `zzp_certificate_issued: true` ale status w `certificates` table = 'expired'
   - Powinien być traktowany jako uncertified dla employer filtering
   - TODO: Dodaj sprawdzenie `certificates.status = 'active'`

2. **Employer zmienia tier podczas sesji:**

   - Potrzebny refresh lub real-time subscription status
   - TODO: Dodaj Supabase Realtime listener na `employers` table

3. **Worker otrzymuje certyfikat podczas gdy employer przegląda:**
   - Lista powinna się automatycznie update
   - TODO: Dodaj Supabase Realtime listener na `workers` table

---

**Status:** 🔴 DO WYKONANIA  
**Ostatnia aktualizacja:** 2025-11-12  
**Autor:** GitHub Copilot
