# 🏆 PLAN ADMIN PANEL - CERTYFIKATY WORKFLOW

**Data utworzenia:** 2025-11-12  
**Status:** 🔴 DO WYKONANIA  
**Priorytet:** ⭐⭐⭐⭐ KRYTYCZNY  
**Czas realizacji:** ~6-8 godzin

---

## 🎯 CEL GŁÓWNY

Naprawić workflow certyfikatów aby:

1. ✅ TYLKO Admin mógł zatwierdzić certyfikat (zabezpieczenie przed oszustwami)
2. ✅ Worker pojawiał się w filtrach "Certyfikowani" DOPIERO po zatwierdzeniu przez admina
3. ✅ Employer Basic miał dostęp TYLKO do uncertified workers
4. ✅ Employer Premium miał dostęp do WSZYSTKICH workers (certified + uncertified)
5. ✅ Kategorie w filtrach = TYLKO zatwierdzone przez admina podczas testu

---

## 📊 AKTUALNY STAN - CO JUŻ DZIAŁA

### ✅ WORKER SIDE (Już istnieje!)

#### 1. Worker Subscription Page (`/worker/subscription`)

```typescript
// Sekcja: "Haal je ZZP Certificaat!" 👑
✅ Opis workflow (4 kroki)
✅ Cena: €230 (€190 + 21% BTW)
✅ Button: "Aanmelden voor ZZP Examen →"
✅ Redirect do formularza aplikacji
```

#### 2. Certificate Application Form

```typescript
// Formularz aplikacji o certyfikat
✅ Preferowana data testu (date picker)
✅ Lokalizacja magazynu (dropdown):
   - Amsterdam (Centrum magazynowe)
   - Rotterdam (Havengebied)
   - Utrecht (Centrum logistyczne)
   - Eindhoven (Park przemysłowy)

✅ Specjalizacje (checkboxes):
   - 🚜 Wózki widłowe
   - 📦 Prace magazynowe
   - 🚚 Logistyka
   - 🏗️ Ciężki sprzęt
   - 📊 Zarządzanie zapasami
   - ✅ Kontrola jakości

✅ Opis doświadczenia (textarea, min 50 znaków)
✅ Numer telefonu (opcjonalnie)
✅ Płatność Stripe: €230
✅ Po płatności: INSERT do `zzp_exam_applications` table
```

### ✅ ADMIN SIDE (Już istnieje!)

#### 3. Admin Panel - Certificate Approval Page (`/admin/certificate-approval`)

```typescript
// Plik: pages/admin/CertificateApprovalPage.tsx

✅ 4 Zakładki:
   1. Pending - Oczekujące płatności
   2. Testing - Zaplanowane testy
   3. Approved - Zatwierdzone certyfikaty
   4. Rejected - Odrzucone aplikacje

✅ Lista aplikacji z szczegółami:
   - Worker name + email + phone
   - Preferred date
   - Warehouse location
   - Specializations (badges)
   - Motivation letter
   - Payment status

✅ Modal "Schedule Meeting":
   - Date picker (wybór daty testu)
   - Time picker (godzina testu)
   - Location dropdown (który magazyn)
   - Instructions textarea (co zabrać)
   - Button: "Schedule Test" → status: TESTING

✅ Modal "Evaluate Application":
   - Score slider (1-10)
   - Notes textarea (uwagi z testu)
   - Radio buttons: Approve / Reject
   - Button: "Submit Evaluation"

✅ Funkcje już zaimplementowane:
   - handleScheduleMeeting() - planowanie testu
   - handleEvaluate() - wprowadzenie wyniku
   - handleApprove() - zatwierdzenie certyfikatu
   - handleReject() - odrzucenie aplikacji
```

---

## ❌ CO NIE DZIAŁA - PROBLEM

### 🔴 PROBLEM 1: `handleApprove()` NIE USTAWIA CERTYFIKATU

**Aktualny kod (linia ~450 w CertificateApprovalPage.tsx):**

```typescript
const handleApprove = async (applicationId: string) => {
  // PROBLEM: Tylko zmienia status aplikacji!
  const { error } = await supabase
    .from("zzp_exam_applications")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  // ❌ BRAKUJE:
  // - Generowanie certificate_number
  // - UPDATE workers.zzp_certificate_issued = TRUE
  // - UPDATE workers.approved_categories
  // - Generowanie PDF
  // - Email do workera
};
```

### 🔴 PROBLEM 2: BRAK KOLUMN W `workers` TABLE

**Sprawdzenie przez MCP:**

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'workers'
  AND column_name IN (
    'zzp_certificate_issued',
    'zzp_certificate_number',
    'approved_categories',
    'certificate_status',
    'certificate_issued_at',
    'certificate_expires_at'
  );
```

**Wymagane kolumny:**

- `zzp_certificate_issued` BOOLEAN DEFAULT false
- `zzp_certificate_number` TEXT UNIQUE
- `approved_categories` TEXT[] (array specjalizacji zatwierdzonych podczas testu)
- `certificate_status` TEXT CHECK (status IN ('active', 'expired', 'revoked'))
- `certificate_issued_at` TIMESTAMPTZ
- `certificate_expires_at` DATE (issue_date + 7 lat)

### 🔴 PROBLEM 3: BRAK RLS POLICY - Worker może oszukać!

**Aktualnie:**

```sql
-- Worker może SAM sobie ustawić certyfikat! ❌
UPDATE workers
SET zzp_certificate_issued = true,
    zzp_certificate_number = 'ZZP-2025-FAKE'
WHERE profile_id = auth.uid();
-- To zadziała bo NIE MA policy zabezpieczenia!
```

**Wymagane:**

```sql
-- TYLKO Admin może ustawić certyfikat ✅
CREATE POLICY "Only admin can set certificate"
  ON public.workers FOR UPDATE
  WITH CHECK (
    -- Worker NIE MOŻE zmienić tych kolumn
    (zzp_certificate_issued IS NOT DISTINCT FROM OLD.zzp_certificate_issued) AND
    (zzp_certificate_number IS NOT DISTINCT FROM OLD.zzp_certificate_number) AND
    (approved_categories IS NOT DISTINCT FROM OLD.approved_categories)
  );
```

### 🔴 PROBLEM 4: Employer Filters - NIE SPRAWDZAJĄ `approved_categories`

**Aktualny kod (pages/employer/WorkerSearch.tsx):**

```typescript
// Linia ~400
const filteredWorkers = workers.filter((w) => {
  // PROBLEM: Filtr kategorii używa w.categories (self-declared!)
  if (filterCategory !== "all") {
    return w.categories?.includes(filterCategory); // ❌ ZŁE!
  }

  // POWINNO BYĆ:
  // return w.approved_categories?.includes(filterCategory); // ✅ DOBRE!
});
```

### 🔴 PROBLEM 5: Basic Employer widzi certified workers

**Aktualny kod:**

```typescript
// Brak sprawdzenia subscription tier pracodawcy!
const filteredWorkers = workers; // ❌ Wszyscy workers widoczni!

// POWINNO BYĆ:
if (employerSubscription === "basic") {
  workers = workers.filter((w) => !w.zzp_certificate_issued); // ✅
}
```

---

## 🛠️ ROZWIĄZANIE - PLAN NAPRAWY

### FAZA 1: BAZA DANYCH - DODAJ KOLUMNY I POLICIES (2-3h)

#### KROK 1.1: MCP Supabase - Sprawdź strukturę `workers`

```typescript
// Użyj MCP tools
use_mcp_tool("supabase", "get_table_structure", {
  table_name: "workers",
});

// Sprawdź które kolumny już istnieją
// Sprawdź które trzeba dodać
```

#### KROK 1.2: Migracja SQL - Dodaj brakujące kolumny

```sql
-- Plik: database-migrations/20251112_1400_add_certificate_columns_to_workers.sql

-- ============================================
-- MIGRATION: Dodaj kolumny certyfikatów do workers
-- Date: 2025-11-12
-- Author: GitHub Copilot
-- ============================================

-- ROLLBACK PLAN:
-- ALTER TABLE workers DROP COLUMN zzp_certificate_issued;
-- ALTER TABLE workers DROP COLUMN zzp_certificate_number;
-- ALTER TABLE workers DROP COLUMN approved_categories;
-- ALTER TABLE workers DROP COLUMN certificate_status;
-- ALTER TABLE workers DROP COLUMN certificate_issued_at;
-- ALTER TABLE workers DROP COLUMN certificate_expires_at;

-- STEP 1: Analyze current state
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'workers'
  AND column_name LIKE '%certificate%';

-- STEP 2: Add columns (IF NOT EXISTS)
DO $$
BEGIN
  -- zzp_certificate_issued
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workers' AND column_name = 'zzp_certificate_issued'
  ) THEN
    ALTER TABLE workers ADD COLUMN zzp_certificate_issued BOOLEAN DEFAULT false;
  END IF;

  -- zzp_certificate_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workers' AND column_name = 'zzp_certificate_number'
  ) THEN
    ALTER TABLE workers ADD COLUMN zzp_certificate_number TEXT UNIQUE;
  END IF;

  -- approved_categories (array specjalizacji zatwierdzonych przez admina)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workers' AND column_name = 'approved_categories'
  ) THEN
    ALTER TABLE workers ADD COLUMN approved_categories TEXT[];
  END IF;

  -- certificate_status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workers' AND column_name = 'certificate_status'
  ) THEN
    ALTER TABLE workers ADD COLUMN certificate_status TEXT
      CHECK (certificate_status IN ('active', 'expired', 'revoked'))
      DEFAULT 'active';
  END IF;

  -- certificate_issued_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workers' AND column_name = 'certificate_issued_at'
  ) THEN
    ALTER TABLE workers ADD COLUMN certificate_issued_at TIMESTAMPTZ;
  END IF;

  -- certificate_expires_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'workers' AND column_name = 'certificate_expires_at'
  ) THEN
    ALTER TABLE workers ADD COLUMN certificate_expires_at DATE;
  END IF;
END $$;

-- STEP 3: Create index for performance
CREATE INDEX IF NOT EXISTS idx_workers_certificate_issued
  ON workers(zzp_certificate_issued)
  WHERE zzp_certificate_issued = true;

CREATE INDEX IF NOT EXISTS idx_workers_certificate_status
  ON workers(certificate_status)
  WHERE certificate_status = 'active';

-- STEP 4: Verify results
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'workers'
  AND column_name LIKE '%certificate%'
ORDER BY ordinal_position;
```

#### KROK 1.3: RLS Policy - TYLKO Admin może ustawić certyfikat

```sql
-- Plik: database-migrations/20251112_1430_add_certificate_rls_policy.sql

-- ============================================
-- MIGRATION: RLS Policy - TYLKO Admin może wydać certyfikat
-- Date: 2025-11-12
-- Author: GitHub Copilot
-- ============================================

-- ROLLBACK PLAN:
-- DROP POLICY IF EXISTS "admin_only_certificate_update" ON workers;

-- STEP 1: Sprawdź istniejące policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'workers';

-- STEP 2: Create policy - TYLKO Admin może zmienić certyfikat
CREATE POLICY "admin_only_certificate_update"
  ON public.workers
  FOR UPDATE
  USING (
    -- Admin może wszystko
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
    OR
    -- Worker może edytować TYLKO dozwolone kolumny
    -- NIE MOŻE zmienić: zzp_certificate_issued, zzp_certificate_number, approved_categories
    (
      profile_id = auth.uid() AND
      zzp_certificate_issued IS NOT DISTINCT FROM OLD.zzp_certificate_issued AND
      zzp_certificate_number IS NOT DISTINCT FROM OLD.zzp_certificate_number AND
      approved_categories IS NOT DISTINCT FROM OLD.approved_categories AND
      certificate_status IS NOT DISTINCT FROM OLD.certificate_status
    )
  );

-- STEP 3: Verify policy
SELECT * FROM pg_policies WHERE policyname = 'admin_only_certificate_update';

-- STEP 4: Test (run in separate session as worker)
-- SELECT current_user, auth.uid(); -- Pokaże worker ID
-- UPDATE workers
-- SET zzp_certificate_issued = true
-- WHERE profile_id = auth.uid();
-- Expected: ERROR - policy violation
```

---

### FAZA 2: ADMIN PANEL - NAPRAW `handleApprove()` (2h)

#### KROK 2.1: Dodaj logikę wydawania certyfikatu

```typescript
// Plik: pages/admin/CertificateApprovalPage.tsx
// Linia ~450 (w funkcji handleApprove)

const handleApprove = async (applicationId: string) => {
  try {
    setLoading(true);

    // 1. Pobierz szczegóły aplikacji
    const { data: application, error: fetchError } = await supabase
      .from("zzp_exam_applications")
      .select("*, worker:workers(profile_id, full_name, email)")
      .eq("id", applicationId)
      .single();

    if (fetchError || !application) {
      toast.error("Nie znaleziono aplikacji");
      return;
    }

    // 2. Generuj unikalny numer certyfikatu
    const year = new Date().getFullYear();
    const uniqueId = Date.now().toString().slice(-5);
    const certificateNumber = `ZZP-${year}-${uniqueId}`;

    // 3. UPDATE workers table - TYLKO ADMIN MOŻE!
    const { error: workerError } = await supabase
      .from("workers")
      .update({
        zzp_certificate_issued: true,
        zzp_certificate_number: certificateNumber,
        approved_categories: application.specializations, // Array z formularza!
        certificate_status: "active",
        certificate_issued_at: new Date().toISOString(),
        certificate_expires_at: new Date(
          Date.now() + 7 * 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // +7 lat
      })
      .eq("profile_id", application.worker_id);

    if (workerError) {
      console.error("❌ Error updating worker:", workerError);
      toast.error("Błąd aktualizacji workera");
      return;
    }

    // 4. UPDATE application status
    const { error: appError } = await supabase
      .from("zzp_exam_applications")
      .update({
        status: "approved",
        certificate_number: certificateNumber,
        approved_at: new Date().toISOString(),
        approved_by: user?.id, // ID admina
      })
      .eq("id", applicationId);

    if (appError) {
      console.error("❌ Error updating application:", appError);
      toast.error("Błąd aktualizacji aplikacji");
      return;
    }

    // 5. Generuj PDF certyfikatu (TODO - implement later)
    // const pdfUrl = await generateCertificatePDF({
    //   certificateNumber,
    //   workerName: application.worker.full_name,
    //   categories: application.specializations,
    //   issueDate: new Date(),
    //   expiryDate: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000)
    // });

    // 6. Wyślij email do workera (TODO - implement later)
    // await sendEmail({
    //   to: application.worker.email,
    //   subject: '🎉 Gratulacje! Otrzymałeś Certyfikat Premium ZZP',
    //   template: 'certificate-approved',
    //   data: {
    //     workerName: application.worker.full_name,
    //     certificateNumber,
    //     categories: application.specializations,
    //     pdfUrl
    //   }
    // });

    // 7. Success!
    toast.success(`✅ Certyfikat ${certificateNumber} wydany!`);

    // 8. Refresh list
    await loadApplications();
  } catch (err) {
    console.error("❌ Exception in handleApprove:", err);
    toast.error("Wystąpił błąd podczas zatwierdzania certyfikatu");
  } finally {
    setLoading(false);
  }
};
```

#### KROK 2.2: Dodaj kolumny do `zzp_exam_applications` table

```sql
-- Plik: database-migrations/20251112_1500_add_columns_to_exam_applications.sql

ALTER TABLE zzp_exam_applications
  ADD COLUMN IF NOT EXISTS certificate_number TEXT,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS test_score INTEGER CHECK (test_score BETWEEN 0 AND 10);

-- Verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'zzp_exam_applications'
  AND column_name IN ('certificate_number', 'approved_by', 'test_score');
```

---

### FAZA 3: EMPLOYER FILTERS - UŻYJ `approved_categories` (2h)

#### KROK 3.1: Napraw filtr kategorii

```typescript
// Plik: pages/employer/WorkerSearch.tsx
// Linia ~400 (w useMemo filteredWorkers)

const filteredWorkers = useMemo(() => {
  let workers = MOCK_WORKERS; // TODO: Replace with real Supabase query

  return workers.filter((worker) => {
    // 1. Search query
    const matchesSearch =
      searchQuery === "" ||
      worker.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.categories?.some((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // 2. Filtr kategorii - TYLKO approved_categories (zatwierdzone przez admina!)
    const matchesCategory =
      filterCategory === "all" ||
      worker.approved_categories?.includes(filterCategory); // ✅ POPRAWIONE!

    // 3. Filtr lokalizacji
    const matchesCity = filterCity === "all" || worker.city === filterCity;

    // 4. Filtr języków
    const matchesLanguages =
      filterLanguages.length === 0 ||
      filterLanguages.every((lang) => worker.languages?.includes(lang));

    // 5. Filtr stawki
    const matchesRate =
      (!filterMinRate || worker.hourly_rate >= filterMinRate) &&
      (!filterMaxRate || worker.hourly_rate <= filterMaxRate);

    // 6. Filtr subscription tier
    const matchesTier =
      filterSubscriptionTier === "all" ||
      worker.subscription_tier === filterSubscriptionTier;

    // 7. Filtr certyfikat - SPRAWDŹ STATUS I DATĘ WYGAŚNIĘCIA!
    const matchesCertified =
      filterCertified === "all" ||
      (filterCertified === "certified" &&
        worker.zzp_certificate_issued &&
        worker.certificate_status === "active" &&
        new Date(worker.certificate_expires_at) > new Date()) ||
      (filterCertified === "uncertified" && !worker.zzp_certificate_issued);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesCity &&
      matchesLanguages &&
      matchesRate &&
      matchesTier &&
      matchesCertified
    );
  });
}, [
  searchQuery,
  filterCategory,
  filterCity,
  filterLanguages,
  filterMinRate,
  filterMaxRate,
  filterSubscriptionTier,
  filterCertified,
]);
```

#### KROK 3.2: Dodaj logikę subscription tier pracodawcy

```typescript
// Plik: pages/employer/WorkerSearch.tsx
// Linia ~230 (dodaj state)

const [employerSubscription, setEmployerSubscription] = useState<
  "basic" | "premium" | null
>(null);
const [employerLoading, setEmployerLoading] = useState(true);

// Linia ~240 (dodaj useEffect)
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

// Linia ~400 (modyfikuj filteredWorkers - PRZED innymi filtrami!)
const filteredWorkers = useMemo(() => {
  let workers = MOCK_WORKERS;

  // 🔐 EMPLOYER SUBSCRIPTION LOGIC - NAJPIERW!
  if (employerSubscription === "basic") {
    // Basic employer (€13/m) = TYLKO workers BEZ certyfikatu
    workers = workers.filter((w) => !w.zzp_certificate_issued);
  }
  // Premium employer (€25/m) = dostęp do WSZYSTKICH (no filter)

  // Reszta filtrów...
  return workers.filter((worker) => {
    // ... matchesCategory, matchesCity, etc.
  });
}, [employerSubscription, searchQuery, filterCategory /* ...other deps */]);
```

#### KROK 3.3: Dodaj paywall banner dla Basic employers

```typescript
// Plik: pages/employer/WorkerSearch.tsx
// Linia ~650 (przed listą workers)

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
                  umiejętności na egzaminie fizycznym
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">⭐</span>
              <div>
                <strong>Filtrowanie po zatwierdzoych kategoriach</strong>
                <p className="text-sm text-orange-700">
                  Znajdź pracowników certyfikowanych w konkretnych
                  specjalizacjach (wózki widłowe, logistyka, etc.)
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">💬</span>
              <div>
                <strong>Bezpośredni kontakt</strong>
                <p className="text-sm text-orange-700">
                  Wiadomości prywatne i natychmiastowy dostęp do portfolio
                  certified workers
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <strong>Pełne profile i certyfikaty</strong>
                <p className="text-sm text-orange-700">
                  Szczegóły certyfikatów, zatwierdzone kategorie, data ważności
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
            💡 <strong>Wskazówka:</strong>{" "}
            {MOCK_WORKERS.filter((w) => w.zzp_certificate_issued).length}{" "}
            certyfikowanych pracowników jest ukrytych w Twoim planie Basic.
          </p>
        </div>
      </div>
    </div>
  );
}
```

---

### FAZA 4: WORKER PROFILE - BADGE CERTYFIKATU (1h)

#### KROK 4.1: Dodaj badge w profilu publicznym

```typescript
// Plik: src/pages/profile/WorkerProfilePage.tsx
// Linia ~50 (po avatar i nazwie workera)

{
  /* Certyfikat Badge */
}
{
  profile.zzp_certificate_issued &&
    profile.certificate_status === "active" &&
    new Date(profile.certificate_expires_at) > new Date() && (
      <div className="mt-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🏆</div>
          <div>
            <h4 className="font-bold text-yellow-900 text-lg">
              Certyfikat Premium ZZP
            </h4>
            <code className="text-sm font-mono text-yellow-800 bg-yellow-100 px-2 py-1 rounded">
              {profile.zzp_certificate_number}
            </code>
            <p className="text-xs text-yellow-700 mt-1">
              ✅ Zweryfikowany na egzaminie fizycznym | Ważny do:{" "}
              {new Date(profile.certificate_expires_at).toLocaleDateString(
                "pl-PL"
              )}
            </p>

            {/* Zatwierdzone kategorie */}
            {profile.approved_categories &&
              profile.approved_categories.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {profile.approved_categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-yellow-200 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold"
                    >
                      ✓ {cat}
                    </span>
                  ))}
                </div>
              )}
          </div>
        </div>
      </div>
    );
}

{
  /* Wygasły certyfikat */
}
{
  profile.zzp_certificate_issued &&
    (profile.certificate_status !== "active" ||
      new Date(profile.certificate_expires_at) <= new Date()) && (
      <div className="mt-4 bg-gray-100 border-2 border-gray-300 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">⚠️</div>
          <div>
            <h4 className="font-bold text-gray-700">
              Certyfikat Premium ZZP -{" "}
              {profile.certificate_status === "revoked" ? "Odwołany" : "Wygasł"}
            </h4>
            <p className="text-sm text-gray-600">
              {profile.certificate_status === "revoked"
                ? "Certyfikat został odwołany przez administratora."
                : `Certyfikat wygasł: ${new Date(
                    profile.certificate_expires_at
                  ).toLocaleDateString("pl-PL")}`}
            </p>
          </div>
        </div>
      </div>
    );
}
```

---

## 📊 TESTY AKCEPTACYJNE

### Test Case 1: Worker aplikuje o certyfikat

```
1. Worker loguje się: /worker/subscription
2. Kliknięcie "Aanmelden voor ZZP Examen"
3. Wypełnia formularz:
   - Preferowana data: 2025-01-20
   - Lokalizacja: Amsterdam
   - Specjalizacje: ✅ Wózki widłowe, ✅ Logistyka
   - Opis: "10 lat doświadczenia..."
4. Płaci €230 przez Stripe
5. ✅ Verify: INSERT do zzp_exam_applications (status: pending)
6. ✅ Verify: Worker dostaje email potwierdzający płatność
```

### Test Case 2: Admin planuje test

```
1. Admin: /admin/certificate-approval
2. Zakładka "Pending" - widzi Jana Kowalskiego
3. Kliknięcie "Schedule Test"
4. Modal:
   - Date: 2025-01-25
   - Time: 10:00
   - Location: Amsterdam Magazyn
   - Instructions: "Przynieś dowód osobisty"
5. Kliknięcie "Schedule Test"
6. ✅ Verify: status zmienia się na 'testing'
7. ✅ Verify: Worker dostaje email z terminem testu
```

### Test Case 3: Admin zatwierdza certyfikat

```
1. Admin: /admin/certificate-approval
2. Zakładka "Testing" - widzi Jana (po dacie testu)
3. Kliknięcie "Evaluate"
4. Modal:
   - Score: 8/10
   - Notes: "Świetne umiejętności"
   - Radio: ✅ APPROVE
5. Kliknięcie "Submit Evaluation"
6. ✅ Verify: workers.zzp_certificate_issued = TRUE
7. ✅ Verify: workers.zzp_certificate_number = "ZZP-2025-XXXXX"
8. ✅ Verify: workers.approved_categories = ["Wózki widłowe", "Logistyka"]
9. ✅ Verify: certificate_status = 'active'
10. ✅ Verify: certificate_expires_at = NOW() + 7 years
11. ✅ Verify: Worker dostaje email: "🎉 Gratulacje! Certyfikat w załączniku"
```

### Test Case 4: Worker widzi certyfikat

```
1. Worker loguje się: /worker/subscription
2. ✅ Verify: Badge "🏆 Certyfikat Premium ZZP" widoczny
3. ✅ Verify: Numer certyfikatu widoczny: ZZP-2025-XXXXX
4. ✅ Verify: Kategorie: Wózki widłowe ✓, Logistyka ✓
```

### Test Case 5: Employer Premium widzi certified worker

```
1. Employer (Premium plan): /employer/search
2. Filtr kategorii: "Wózki widłowe"
3. ✅ Verify: Jan Kowalski pojawia się w wynikach
4. ✅ Verify: Badge 🏆 widoczny
5. Kliknięcie profilu → ✅ Verify: Certyfikat widoczny
```

### Test Case 6: Employer Basic NIE widzi certified worker

```
1. Employer (Basic plan €13/m): /employer/search
2. ✅ Verify: Paywall banner widoczny
3. ✅ Verify: Jan Kowalski (certified) NIEWIDOCZNY w wynikach
4. ✅ Verify: Lista zawiera TYLKO uncertified workers
5. Kliknięcie "Upgrade do Premium"
6. ✅ Verify: Redirect do /employer/subscription
```

### Test Case 7: Worker NIE MOŻE sam sobie nadać certyfikatu

```
1. Worker loguje się
2. Otwórz Console → Network tab
3. Spróbuj UPDATE workers:
   supabase.from('workers')
     .update({ zzp_certificate_issued: true })
     .eq('profile_id', myId)
4. ✅ Verify: ERROR - RLS policy violation
5. ✅ Verify: zzp_certificate_issued nadal = false
```

---

## 📝 CHECKLIST WYKONANIA

### FAZA 1: Baza danych (2-3h)

- [ ] MCP Supabase - sprawdź strukturę workers table
- [ ] Migracja SQL - dodaj kolumny certyfikatów
- [ ] Migracja SQL - dodaj RLS policy (admin only)
- [ ] Migracja SQL - dodaj kolumny do zzp_exam_applications
- [ ] Test: Worker NIE MOŻE zmienić zzp_certificate_issued

### FAZA 2: Admin Panel (2h)

- [ ] Napraw handleApprove() - generuj certificate_number
- [ ] Napraw handleApprove() - UPDATE workers table
- [ ] Napraw handleApprove() - UPDATE application status
- [ ] Test: Admin zatwierdza certyfikat → worker.zzp_certificate_issued = true

### FAZA 3: Employer Filters (2h)

- [ ] Napraw filtr kategorii - użyj approved_categories
- [ ] Dodaj state employerSubscription
- [ ] Dodaj useEffect load employer subscription tier
- [ ] Dodaj logikę Basic vs Premium filtering
- [ ] Dodaj paywall banner dla Basic employers
- [ ] Test: Basic employer NIE widzi certified workers

### FAZA 4: Worker Profile Badge (1h)

- [ ] Dodaj badge certyfikatu w profilu publicznym
- [ ] Dodaj numer certyfikatu + data ważności
- [ ] Dodaj listę zatwierdzonych kategorii
- [ ] Dodaj komunikat dla wygasłych/odwołanych certyfikatów
- [ ] Test: Profil certified workera pokazuje badge

### FINALNE TESTY

- [ ] Test Case 1: Worker aplikuje
- [ ] Test Case 2: Admin planuje test
- [ ] Test Case 3: Admin zatwierdza certyfikat
- [ ] Test Case 4: Worker widzi certyfikat
- [ ] Test Case 5: Employer Premium widzi certified
- [ ] Test Case 6: Employer Basic NIE widzi certified
- [ ] Test Case 7: Worker NIE MOŻE oszukać

---

## 🚀 DEPLOYMENT

Po zakończeniu implementacji:

1. **Database Migrations** - uruchom wszystkie migracje SQL
2. **Code Review** - sprawdź wszystkie zmiany w AdminPanel i Filters
3. **Test na localhost** - wszystkie 7 test cases
4. **Commit do Git** - opisowy message: "feat: Admin-controlled certificate workflow"
5. **Deploy do Vercel/Netlify** - staging environment
6. **Final Test** - na staging ze wszystkimi rolami (worker, employer basic, employer premium, admin)
7. **Deploy do produkcji** - jeśli wszystko OK

---

## 📚 DODATKOWE NOTATKI

### Business Logic - Subscription Tiers dla Employers

```
BASIC EMPLOYER (€13/miesiąc):
✅ Dostęp do uncertified workers
✅ Podstawowe wyszukiwanie
❌ BRAK dostępu do certified workers
❌ BRAK filtrowania po approved_categories

PREMIUM EMPLOYER (€25/miesiąc):
✅ Dostęp do WSZYSTKICH workers (certified + uncertified)
✅ Filtrowanie po approved_categories (wózki widłowe, logistyka, etc.)
✅ Badge 🏆 w wynikach wyszukiwania
✅ Pełne profile z certyfikatami
✅ Nieograniczone kontakty
```

### Workflow Certyfikatu - Timeline

```
DAY 0: Worker aplikuje + płaci €230
  ↓ status: pending

DAY 1: Admin planuje test (25.01.2025 10:00, Amsterdam)
  ↓ status: testing
  ↓ Email: "Test zaplanowany..."

DAY 10: Test fizyczny na magazynie (2h)

DAY 10: Admin wprowadza wynik (8/10, APPROVED)
  ↓ workers.zzp_certificate_issued = TRUE
  ↓ workers.approved_categories = ["Wózki widłowe", "Logistyka"]
  ↓ certificate_number = ZZP-2025-00123
  ↓ status: approved
  ↓ Email: "🎉 Gratulacje! Certyfikat w załączniku"

DAY 11: Worker widoczny w filtrach Premium Employers
  ↓ Badge 🏆 w profilu
  ↓ Employer (Premium) widzi w kategorii "Wózki widłowe"
  ↓ Employer (Basic) NIE WIDZI (paywall)
```

### Edge Cases

1. **Certyfikat wygasł (po 7 latach):**

   - certificate_expires_at < NOW()
   - Worker NIE pojawia się w filtrze "Certyfikowani"
   - Badge w profilu: "⚠️ Certyfikat wygasł"
   - Worker może aplikować ponownie

2. **Admin odwołuje certyfikat:**

   - certificate_status = 'revoked'
   - Worker ZNIKA z filtru "Certyfikowani"
   - Badge w profilu: "⚠️ Certyfikat odwołany"

3. **Worker ma certyfikat ale Basic Employer go szuka:**
   - MIMO że worker ma certyfikat, Basic Employer go NIE WIDZI
   - Paywall: "Upgrade do Premium aby zobaczyć {X} certyfikowanych"

---

**Status:** 🔴 DO WYKONANIA  
**Ostatnia aktualizacja:** 2025-11-12  
**Autor:** GitHub Copilot  
**Priorytet:** ⭐⭐⭐⭐ KRYTYCZNY
