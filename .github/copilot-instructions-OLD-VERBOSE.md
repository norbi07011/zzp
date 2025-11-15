# ZZP Werkplaats - AI Coding Agent Instructions

## ⚠️ ABSOLUTNIE OBOWIĄZKOWE - PRZED JAKĄKOLWIEK ZMIANĄ

### WORKFLOW PRZED TWORZENIEM/MODYFIKACJĄ PLIKÓW:

**NIGDY nie generuj SQL/kodu bez tego workflow!**

#### � ETAP 0: ANALIZA CHIRURGICZNA ISTNIEJĄCEGO KODU (NAJPIERW!)

**ZASADA:** Zanim dotkniesz bazy danych, ZROZUM co już istnieje w kodzie!

```typescript
// User: "Napraw moduł Płatności"

// ❌ ZŁE: Od razu MCP → zmiana interface → crash
// ✅ DOBRE: NAJPIERW przeanalizuj CAŁY podsystem płatności

// KROK 0.1: Znajdź WSZYSTKIE pliki związane z modułem
grep_search("payment", isRegexp: false) // Szukaj "payment" w nazwach plików
grep_search("Payment", includePattern: "**/*.tsx") // Komponenty UI
grep_search("transaction", isRegexp: false) // Powiązane pliki

// Output przykład:
// - services/payment.ts (service layer)
// - pages/admin/PaymentManagementPage.tsx (UI)
// - types.ts (może mieć interface Transaction?)

// KROK 0.2: Przeczytaj CAŁY service file (payment.ts)
read_file("services/payment.ts", startLine: 1, endLine: 500)

// ZAPISZ MENTALNIE:
// ✅ Jakie funkcje istnieją? (getTransactions, getSubscriptions, updateStatus)
// ✅ Jakie interfejsy są? (Transaction, Subscription, PaymentFilters)
// ✅ Czy są duplicate funkcje? (UWAGA: może być stara + nowa wersja!)
// ✅ Z jakiej tabeli czytają? (.from('transactions') vs .from('invoice_invoices'))
// ✅ Czy mają console.log debug? (jeśli nie → dodasz później)

// KROK 0.3: Przeczytaj UI file (PaymentManagementPage.tsx)
read_file("pages/admin/PaymentManagementPage.tsx", startLine: 1, endLine: 300)

// ZAPISZ MENTALNIE:
// ✅ Jakie funkcje importuje? (import { getTransactions } from 'payment')
// ✅ Jak używa interface? (transaction.job?.title vs transaction.invoice_number)
// ✅ Jakie są dependencies? (formatAmount, updateTransactionStatus)
// ✅ Czy są hardcoded dane? (const [data] = useState([{...}]))

// KROK 0.4: Grep użyć interface
grep_search("Transaction", includePattern: "**/*.ts")
grep_search("transaction.", isRegexp: false)

// ZAPISZ:
// ✅ Które pliki używają interface Transaction?
// ✅ Jak go używają? (transaction.job? transaction.invoice_number?)
// ✅ Czy są konflikty? (UI używa job, ale interface ma invoice_number?)

// KROK 0.5: Zrób RAPORT CHIRURGICZNY
console.log('📋 ANALIZA MODUŁU PŁATNOŚCI:');
console.log('Files found:', ['payment.ts', 'PaymentManagementPage.tsx']);
console.log('Functions in payment.ts:', ['getTransactions()', 'getSubscriptions()', 'updateStatus()']);
console.log('Interfaces:', ['Transaction', 'Subscription']);
console.log('UI używa:', ['transaction.job?.title', 'transaction.company?.name']);
console.log('Interface ma:', ['invoice_number', 'client_name']);
console.log('❌ KONFLIKT: UI używa job/company, interface ma invoice_number/client_name!');

// DOPIERO TERAZ przejdź do KROK 1: MCP SUPABASE
```

**CHECKLIST - ANALIZA KODU:**

```
☐ grep_search plików modułu (payment, transaction)
☐ read_file service layer (payment.ts) - cały plik 1-500 linii
☐ read_file UI layer (PaymentManagementPage.tsx) - cały plik 1-300 linii
☐ grep_search użyć interface ("Transaction", "transaction.")
☐ Zapisz funkcje, interfejsy, dependencies
☐ Sprawdź czy są duplicates (stara + nowa wersja funkcji)
☐ Sprawdź konflikty (UI vs interface schema)
☐ Zrób RAPORT co znalazłeś
☐ DOPIERO TERAZ → KROK 1: MCP SUPABASE
```

**DLACZEGO TO KRYTYCZNE:**

- ✅ Znajdziesz duplicate funkcje (getSubscriptions x2 = void error)
- ✅ Zobaczysz konflikty (UI używa job, interface ma invoice_number)
- ✅ Zrozumiesz dependencies (PaymentManagementPage → payment.ts → invoice_invoices)
- ✅ Unikniesz blind changes (zmiana interface bez sprawdzenia UI)

---

#### �🔍 KROK 1: ANALIZA BAZY PRZEZ MCP SUPABASE

```typescript
// 1. Lista tabel
use_mcp_tool("supabase", "list_tables");

// 2. Struktura KAŻDEJ tabeli którą użyjesz
use_mcp_tool("supabase", "get_table_structure", {
  table_name: "nazwa_tabeli",
});
// ZAPISZ DOKŁADNE nazwy kolumn - NIE ZGADUJ!

// 3. Foreign Keys (dla JOIN/RLS)
use_mcp_tool("supabase", "get_foreign_keys", {
  table_name: "nazwa_tabeli",
});

// 4. RLS Policies (jeśli dotykasz bezpieczeństwa)
use_mcp_tool("supabase", "get_table_policies", {
  table_name: "nazwa_tabeli",
});
// ZAPISZ policies - sprawdź czy admin ma dostęp!
// ⚠️ KRYTYCZNE: Jeśli policy ma auth.uid() = user_id, admin może być zablokowany!

// 5. Przykładowe dane (weryfikacja)
use_mcp_tool("supabase", "execute_query", {
  query: "SELECT * FROM nazwa_tabeli LIMIT 5",
});
// ⚠️ Jeśli zwraca [] mimo że dane istnieją → SPRAWDŹ RLS POLICIES!
```

#### ⛔ ZAKAZANE BEZ MCP:

- ❌ Założenie że kolumna nazywa się X (SPRAWDŹ MCP!)
- ❌ Kopiowanie RLS policy z innej tabeli
- ❌ ALTER TABLE bez `get_table_structure`
- ❌ Generowanie SQL bez weryfikacji nazw kolumn
- ❌ Zmiana TypeScript interface bez `grep_search` użyć (znajdź WSZYSTKIE pliki które go używają!)
- ❌ Refactor service bez console.log + test w przeglądarce
- ❌ Założenie że "TypeScript errors = 0" znaczy "kod działa" (może być RLS block!)

#### 🎯 WORKFLOW CHIRURGICZNY:

```
0. ANALIZA KODU (grep + read całych plików związanych z modułem)
   ↓ (Zapisz: funkcje, interfejsy, użycia, konflikty, duplicates)
1. User prosi o zmianę
   ↓
2. STOP! Użyj MCP - lista tabel
   ↓
3. MCP - struktura KAŻDEJ tabeli
   ↓
4. Zapisz FAKTYCZNE nazwy kolumn
   ↓
5. Sprawdź FK/RLS jeśli potrzebne
   ↓ (⚠️ CHECKPOINT: Jeśli RLS używa auth.uid() = user_id, sprawdź czy admin ma dostęp!)
6. TEST query: SELECT * FROM tabela LIMIT 1
   ↓ (⚠️ Jeśli [] → FIX RLS TERAZ, nie czekaj na user feedback!)
7. PORÓWNAJ: Kod używa X, baza ma Y → GDZIE zmienić? (UI najpierw!)
   ↓ (grep_search gdzie interface używany → zmień NAJPIERW UI, POTEM interface!)
8. DOPIERO TERAZ generuj kod (z console.log debug!)
   ↓
9. TEST w przeglądarce - sprawdź DevTools Console
   ↓ (⚠️ Jeśli dane się nie ładują → wróć do kroku 6 - problem RLS!)
10. Pokaż użytkownikowi PRZED wykonaniem migracji SQL
```

**Jeśli dostaniesz błąd "kolumna X nie istnieje":**

- To znaczy NIE WYKONAŁEŚ MCP!
- STOP - wróć do MCP
- Sprawdź faktyczną strukturę
- Popraw kod

---

## Architecture Overview

**Multi-Role Platform:** React + TypeScript + Vite frontend, Supabase (PostgreSQL 15) backend with real-time subscriptions.

**5 User Roles** with separate dashboards and data models:

- `worker` → `workers` table (avatar_url)
- `employer` → `employers` table (logo_url)
- `accountant` → `accountants` table (avatar_url)
- `cleaning_company` → `cleaning_companies` table (logo_url)
- `admin` → admin panel

**Critical Pattern - Avatar Resolution:**

```typescript
// profiles table has NO avatar_url!
// Must fetch from role-specific table:
profiles!messages_sender_id_fkey(id, full_name, role) // Get role first
// Then:
if (role === 'worker') → workers.avatar_url
if (role === 'employer') → employers.logo_url
if (role === 'accountant') → accountants.avatar_url
if (role === 'cleaning_company') → cleaning_companies.logo_url
```

**See:** `services/employerService.ts` lines 451-527, `services/cleaningCompanyService.ts` lines 747-870

## Database Workflow (MANDATORY)

**ZAWSZE 3-STEP PROCESS przed SQL:**

### KROK 1: MCP Supabase Analysis (NAJPIERW!)

```bash
# Sprawdź czy MCP tools są dostępne
use_mcp_tool("supabase", "list_tables")
use_mcp_tool("supabase", "get_table_structure", {table_name: "..."})
```

### KROK 2: information_schema Verification

```sql
-- Weryfikacja po MCP
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'your_table'
ORDER BY ordinal_position;
```

### KROK 3: Create Migration

- Każda zmiana struktury = nowy plik w `database-migrations/`
- Format nazwy: `YYYYMMDD_HHMM_description.sql`
- Dodaj komentarze + ROLLBACK PLAN

**Typowe pułapki (SPRAWDŹ MCP PRZED!):**

- ❌ `user_id` → ✅ Może być `profile_id`, `author_id`, `created_by`
- ❌ `email` → ✅ Może być `contact_email` (employers)
- ❌ `avatar_url` → ✅ Może być `logo_url` (employers, cleaning_companies)
- ❌ Kopiowanie nazw z innych tabel → ✅ Każda tabela ma INNE nazwy!

**ID Conflicts - KRYTYCZNE:**

```typescript
// Problem: accountant_services.accountant_id → accountants.id
// ALE auth.uid() → accountants.profile_id
// accountants.id ≠ accountants.profile_id ← RÓŻNE UUID!

// RLS policy MUSI używać:
accountant_id IN (
  SELECT id FROM accountants WHERE profile_id = auth.uid()
)
```

**Foreign Key Constraint Names Matter:**

```typescript
// WRONG:
.select('sender_profile:profiles!sender_id(full_name)')

// CORRECT (use FK constraint name):
.select('sender_profile:profiles!messages_sender_id_fkey(full_name)')
```

## Critical Files & Patterns

**Routing:** `App.tsx` - Lazy-loaded routes with role-based guards (`<ProtectedRoute requiredRole="employer">`)

**Dashboard Pattern:** All dashboards follow same structure:

- State management with `useState` + `useEffect`
- Service layer calls (e.g., `employerService.getMessages()`)
- Avatar resolution via Promise.all
- Console.log debugging: `console.log('📬 MESSAGES DEBUG:', data)`

**Message System:** Cross-role messaging via `messages` table:

- `sender_id` → profiles.id (use auth.uid())
- Always validate sender role before INSERT
- Load avatars asynchronously after fetching messages

**Example:** `pages/employer/EmployerDashboard.tsx` lines 103-120

## 🔍 CHECKPOINTY - WERYFIKUJ PO KAŻDYM KROKU

**ZASADA:** Nie przechodź do następnego zadania dopóki obecne NIE DZIAŁA.

### ✅ CHECKPOINT 1: Po analizie MCP (RLS CRITICAL!)

```typescript
// 1. Tabele istnieją?
use_mcp_tool("supabase", "list_tables") → invoice_invoices ✓

// 2. Struktura OK?
use_mcp_tool("supabase", "get_table_structure", {table_name: "invoice_invoices"})
→ invoice_number, total_gross, status ✓

// 3. RLS policies - czy admin ma dostęp?
use_mcp_tool("supabase", "get_table_policies", {table_name: "invoice_invoices"})
→ SELECT policy: USING (user_id = auth.uid()) ← ⚠️ PROBLEM! Admin będzie zablokowany!

// 4. TEST query ZARAZ (nie czekaj na user feedback!)
use_mcp_tool("supabase", "execute_sql", {
  query: "SELECT * FROM invoice_invoices LIMIT 1"
})
→ Jeśli [] mimo że dane istnieją = RLS BLOKUJE! Napraw TERAZ:
  CREATE POLICY admin_access USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR user_id = auth.uid()
  )
```

**RED FLAGS:**

- 🔴 Policy ma `user_id = auth.uid()` bez admin exception → Admin zablokowany
- 🔴 Query zwraca [] mimo że `COUNT(*)` pokazuje dane → RLS problem
- 🔴 Policy używa `accountant_id = auth.uid()` ale `accountant_id` to `accountants.id` nie `profile_id` → ID mismatch

### ✅ CHECKPOINT 2: Przed zmianą TypeScript interface

```typescript
// PROBLEM: Chcesz zmienić interface Transaction
export interface Transaction {
  job_id: string; // OLD ← usunąć
  invoice_number: string; // NEW ← dodać
}

// ⚠️ STOP! Najpierw znajdź gdzie używany:
grep_search("transaction.job_id", isRegexp: false)
grep_search("transaction.job?.title", isRegexp: false)
grep_search("Transaction", includePattern: "**/*.tsx")

// Output: PaymentManagementPage.tsx line 179: transaction.job?.title
//         PaymentManagementPage.tsx line 186: transaction.company?.name

// WORKFLOW:
// 1. Zmień NAJPIERW PaymentManagementPage.tsx (UI):
//    transaction.job?.title → transaction.invoice_number
//    transaction.company?.name → transaction.client_name
// 2. POTEM zmień interface w payment.ts
// 3. Verify TypeScript errors = 0
```

**ZASADA:** Interface change = breaking change. UI NAJPIERW, potem interface!

### ✅ CHECKPOINT 3: Po refactorze service (console.log!)

```typescript
// payment.ts - getTransactions() refactored
export async function getTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('invoice_invoices')
    .select('*');

  if (error) {
    console.error('❌ Error loading transactions:', error);
    throw error;
  }

  // ⚠️ DODAJ DEBUG LOG (usuń po weryfikacji):
  console.log('💸 TRANSACTIONS DEBUG:', {
    count: data?.length,
    totalAmount: data.reduce((sum, t) => sum + parseFloat(t.total_gross), 0).toFixed(2),
    sample: data[0]
  });

  return data.map(invoice => ({...}));
}

// SPRAWDŹ:
// 1. Otwórz stronę w przeglądarce
// 2. DevTools Console (F12)
// 3. Widzisz "💸 TRANSACTIONS DEBUG: {count: 4, totalAmount: 1398.99}"?
//    ✅ TAK → OK, dane się ładują
//    ❌ NIE lub count: 0 → WRÓĆ do CHECKPOINT 1 (RLS problem!)
```

### ✅ CHECKPOINT 4: Po zmianie UI (verify data displays)

```typescript
// PaymentManagementPage.tsx
const [transactions, setTransactions] = useState<Transaction[]>([]);

useEffect(() => {
  loadData();
}, []);

const loadData = async () => {
  setLoading(true);
  const data = await getTransactions();

  // ⚠️ DODAJ DEBUG (usuń po weryfikacji):
  console.log("📊 UI LOADED:", {
    transactionsCount: data.length,
    firstInvoice: data[0]?.invoice_number,
  });

  setTransactions(data);
  setLoading(false);
};

// SPRAWDŹ w przeglądarce:
// 1. Console pokazuje "📊 UI LOADED: {transactionsCount: 4, firstInvoice: 'FV-2025-10-001'}"? ✅
// 2. Tabela wyświetla 4 wiersze? ✅
// 3. Jeśli NIE → wróć do CHECKPOINT 3 (problem w service)
```

**DEBUGGING WORKFLOW:**

```
Console pusty? → Problem w useEffect (nie wywołał się)
Console pokazuje count: 0? → Problem RLS (CHECKPOINT 1)
Console pokazuje error? → Problem SQL/permissions
UI pusta mimo count > 0? → Problem w .map() rendering
```

## 🔴 NAPRAWA BŁĘDÓW TYPESCRIPT

### ⚠️ OBOWIĄZKOWE PO KAŻDEJ ZMIANIE KODU

**ZASADA:** Naprawiaj PRZYCZYNĘ błędu, nie objawy.

---

### 🎯 WORKFLOW

#### KROK 1: Sprawdź błędy

```bash
npm run build
# LUB: VS Code Problems panel (Ctrl+Shift+M)
```

#### KROK 2: Znajdź ROOT CAUSE

```typescript
// ❌ ZŁE: "Property 'job' does not exist" → Dodam job: any
// ✅ DOBRE: Sprawdź GDZIE interface używany, ZMIEŃ UI na faktyczne nazwy kolumn

// WORKFLOW:
// 1. Znajdź interface: grep_search("export interface Transaction")
// 2. Sprawdź użycia: grep_search("transaction.job", isRegexp: false)
// 3. Sprawdź bazę: MCP get_table_structure("invoice_invoices")
// 4. Zmień UI na faktyczne kolumny: job?.title → invoice_number
```

#### KROK 3: Kategoryzuj i napraw

**Typ A: Property does not exist**

```typescript
// Błąd: Property 'job' does not exist on type 'Transaction'

// FIX:
// 1. grep_search("transaction.job") → znajdź użycia
// 2. MCP: get_table_structure → sprawdź faktyczne kolumny
// 3. Zmień UI: transaction.job?.title → transaction.invoice_number
```

**Typ B: Cannot find module/name**

```typescript
// Błąd: Cannot find name 'TestSlotsManager'

// FIX:
// 1. grep_search("TestSlotsManager")
// 2. Usuń WSZYSTKIE użycia OR przywróć plik
// 3. Sprawdź App.tsx routes
```

**Typ C: Type 'void' cannot be tested**

```typescript
// Błąd: Expression of type 'void' cannot be tested for truthiness

// FIX:
// 1. Znajdź funkcję: grep_search("export async function")
// 2. Sprawdź czy ma return statement
// 3. Usuń duplicate funkcje (stara wersja bez return)
```

**Typ D: Type mismatch (enum/union)**

```typescript
// Błąd: Types '"paid"' and '"pending"' have no overlap

// FIX:
// 1. MCP: execute_sql - sprawdź faktyczne wartości enum
// 2. Zmień UI: status === 'pending' → status === 'unpaid'
// 3. Update getStatusColor() na faktyczne statusy
```

---

### 🚫 ZAKAZANE

```typescript
// ❌ Type assertion łatki:
const data = response as any; // NIGDY!

// ❌ Optional chaining everywhere:
transaction.job?.title?.toString()?.substring(0, 10); // NIGDY!

// ❌ Komentowanie błędów:
// {transaction.job?.title} // TODO: fix later // NIGDY!

// ✅ ZAWSZE:
// 1. MCP - sprawdź faktyczne kolumny
// 2. Zmień interface zgodnie z bazą
// 3. Zmień UI zgodnie z interface
```

---

### ✅ BEST PRACTICES

**1. Grep przed zmianą interface**

```bash
grep_search("Transaction", includePattern: "**/*.tsx")
grep_search("transaction.", isRegexp: false)
# Zmień UI NAJPIERW, potem interface
```

**2. Naprawiaj po kolei (1 błąd na raz)**

```
17 błędów?
→ Napraw PIERWSZY
→ npm run build
→ Jeśli liczba spadła → kontynuuj
→ Jeśli nie → cofnij, znajdź inną przyczynę
```

**3. Test po każdym fixie**

```
✅ TypeScript errors = 0?
✅ npm run build successful?
✅ Strona w przeglądarce działa?
✅ DevTools Console bez errors?
→ DOPIERO WTEDY mark as fixed
```

---

### 📊 CHECKLIST

```
Po zmianie interface:
☐ grep_search użyć interface
☐ Zmień UI NAJPIERW
☐ Zmień interface POTEM
☐ npm run build → 0 errors
☐ Test w przeglądarce

Po błędzie "Property X does not exist":
☐ MCP: get_table_structure
☐ grep_search "X"
☐ Zmień na FAKTYCZNĄ nazwę kolumny
☐ Verify w przeglądarce

Po błędzie "Cannot find module":
☐ grep_search nazwy modułu
☐ Usuń użycia OR przywróć plik
☐ Sprawdź App.tsx routing

Po błędzie type mismatch:
☐ MCP: execute_sql - sprawdź faktyczne wartości
☐ Zmień UI logic
☐ Update type definitions
```

**PAMIĘTAJ:** TypeScript errors = 0 ≠ "Kod działa". Testuj w przeglądarce!

## 🚨 DIAGNOSTYKA - GDY PROBLEM NIEJASNY

### User mówi: "Moduł X nie działa" ale NIE WIESZ co dokładnie

**WORKFLOW DIAGNOSTYCZNY:**

#### KROK 1: DevTools Console (NAJPIERW!)

```typescript
// 1. Otwórz stronę w przeglądarce
// URL: localhost:3005/admin/payments (lub inna ścieżka)

// 2. Naciśnij F12 → zakładka Console

// 3. Szukaj:
// 🔴 Czerwone errors → SKOPIUJ DOKŁADNY MESSAGE
// 🟡 Żółte warnings → Zapisz
// 🔵 Network tab → 401/403/404 errors? (RLS/permissions)

// 4. Sprawdź czy są console.log z modułu:
// "💸 TRANSACTIONS DEBUG: {count: 0, totalAmount: '0.0'}"
// ↑ Jeśli count: 0 → problem z ładowaniem danych (idź do KROK 2)
```

#### KROK 2: MCP - Sprawdź czy dane FAKTYCZNIE istnieją

```typescript
// Problem: UI pokazuje pustą listę

// ❌ ZŁA DIAGNOZA: "RLS blokuje!"
// ✅ DOBRA DIAGNOZA: Sprawdź NAJPIERW czy dane są

// KROK 2.1: COUNT - ile rekordów?
use_mcp_tool("supabase", "execute_sql", {
  query: "SELECT COUNT(*) FROM invoice_invoices",
});
// → Jeśli 0 = BRAK DANYCH (nie RLS!)
// → Jeśli > 0 = dane istnieją, idź do KROK 2.2

// KROK 2.2: SELECT - czy widzisz dane?
use_mcp_tool("supabase", "execute_sql", {
  query: "SELECT * FROM invoice_invoices LIMIT 5",
});
// → Jeśli [] mimo COUNT > 0 = RLS BLOKUJE! (idź do RLS DEBUGGING)
// → Jeśli zwraca dane = RLS OK, problem gdzie indziej
```

#### KROK 3: Grep console.log - czy są debug logs?

```bash
grep_search("console.log", includePattern: "services/payment.ts")

# Jeśli NIE MA → DODAJ:
console.log('💸 TRANSACTIONS DEBUG:', { count: data?.length, error });
```

#### KROK 4: Zapytaj USER o szczegóły

```
"Otwórz stronę localhost:3005/admin/payments
Naciśnij F12 → zakładka Console
Skopiuj WSZYSTKIE czerwone errors które widzisz"

→ User: "Error: invoice_invoices_select policy violated"
→ Teraz wiesz: To RLS problem! (idź do RLS DEBUGGING)
```

---

## 🔒 RLS POLICY DEBUGGING - KROK PO KROKU

### Problem: Query zwraca [] ale dane istnieją

**6-STEP DIAGNOSTIC:**

#### STEP 1: Potwierdź że dane istnieją

```sql
-- MCP execute_sql:
SELECT COUNT(*) FROM invoice_invoices;
-- → 4 (dane są!)

SELECT * FROM invoice_invoices LIMIT 1;
-- → [] (puste mimo COUNT = 4 → RLS BLOKUJE!)
```

#### STEP 2: Sprawdź policy USING clause

```typescript
use_mcp_tool("supabase", "get_table_policies", {
  table_name: "invoice_invoices",
});

// Output:
// {
//   policyname: "invoice_invoices_select",
//   cmd: "SELECT",
//   qual: "(user_id = auth.uid())"
// }

// ZAPISZ: Policy wymaga user_id = auth.uid()
```

#### STEP 3: Sprawdź KTO jest zalogowany

```sql
-- MCP execute_sql:
SELECT auth.uid() AS current_user,
       (SELECT role FROM profiles WHERE id = auth.uid()) AS current_role;

-- → current_user: 47f06296-a087-4d63-b052-1004e063c467
-- → current_role: 'admin'
```

#### STEP 4: Sprawdź user_id właścicieli danych

```sql
-- MCP execute_sql:
SELECT DISTINCT user_id FROM invoice_invoices;

-- → user_id: 12345678-... (RÓŻNE od auth.uid()!)
```

#### STEP 5: DIAGNOZA

```
Policy: user_id = auth.uid()
Auth.uid(): 47f06296... (admin)
Dane user_id: 12345678... (różne UUID)

PROBLEM: Policy blokuje bo current_user ≠ owner_user_id
Admin nie ma exception w policy!
```

#### STEP 6: FIX - Dodaj admin access

```sql
-- Migration: 20251112_HHMM_add_admin_access_invoice_invoices.sql

CREATE POLICY "invoice_invoices_admin_select"
ON invoice_invoices
FOR SELECT
TO authenticated
USING (
  -- Admin ma dostęp do wszystkich
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR
  -- Regular users tylko swoje
  user_id = auth.uid()
);

-- Drop old policy
DROP POLICY IF EXISTS "invoice_invoices_select" ON invoice_invoices;

-- Rename
ALTER POLICY "invoice_invoices_admin_select"
ON invoice_invoices
RENAME TO "invoice_invoices_select";
```

**VERIFY:**

```sql
SELECT * FROM invoice_invoices LIMIT 1;
-- → Teraz zwraca dane! ✅
```

---

## ⏪ MIGRATION ROLLBACK - EMERGENCY PROCEDURE

### Sytuacja: Migration wykonana → app crashnęło

**EMERGENCY CHECKLIST:**

#### 1. STOP - Nie rób nic więcej!

```
❌ NIE próbuj naprawiać "na żywo"
❌ NIE wykonuj kolejnych migrations
✅ Przeczytaj migration file - znajdź ROLLBACK PLAN
```

#### 2. Sprawdź czy migration ma ROLLBACK PLAN

```sql
-- W pliku: database-migrations/20251112_2200_add_admin_access.sql

-- ROLLBACK PLAN:
-- DROP POLICY IF EXISTS "invoice_invoices_admin_select" ON invoice_invoices;
-- CREATE POLICY "invoice_invoices_select" ON invoice_invoices
-- FOR SELECT USING (user_id = auth.uid());
```

#### 3. Wykonaj ROLLBACK przez MCP

```typescript
// Wykonaj DOKŁADNIE w odwrotnej kolejności niż migration

use_mcp_tool("supabase", "execute_sql", {
  query: "DROP POLICY IF EXISTS 'invoice_invoices_select' ON invoice_invoices",
});

use_mcp_tool("supabase", "execute_sql", {
  query:
    "CREATE POLICY 'invoice_invoices_select' ON invoice_invoices FOR SELECT USING (user_id = auth.uid())",
});
```

#### 4. VERIFY - Sprawdź czy app działa

```bash
# Test query:
SELECT * FROM invoice_invoices LIMIT 1;

# Otwórz app w przeglądarce:
localhost:3005/admin/payments
# Sprawdź DevTools Console - czy errors zniknęły?
```

#### 5. DIAGNOZA - Co poszło nie tak?

```typescript
// Przeczytaj migration ponownie:
read_file("database-migrations/20251112_2200_add_admin_access.sql", 1, 100);

// Szukaj:
// ❌ Błędy składniowe SQL?
// ❌ Niepoprawne nazwy tabel/kolumn?
// ❌ Policy USING clause ma błąd?
// ❌ Zapomniany DROP przed CREATE?
```

#### 6. POPRAW i wykonaj ponownie

```sql
-- Poprawiona wersja migration:
-- (np. dodano brakujący DROP POLICY przed CREATE)

CREATE POLICY ... -- poprawione
```

**ZASADY ROLLBACK:**

```
✅ ZAWSZE dodawaj ROLLBACK PLAN w migration file
✅ Testuj migration na DEV przed PROD
✅ Rollback = odwrotna kolejność operacji
✅ Po rollback → VERIFY czy app działa
```

## Common Pitfalls

1. **Column names:** NEVER assume - ZAWSZE MCP `get_table_structure`

   - ❌ `email` → ✅ `contact_email` (employers)
   - ❌ `avatar_url` → ✅ `logo_url` (employers, cleaning_companies)
   - ❌ `user_id` → ✅ `profile_id` (większość tabel)

2. **RLS Policies:** Must use FK constraint names + sprawdź ID conflicts:

   ```sql
   -- ❌ BŁĘDNE (jeśli accountant_id to accountants.id, nie profile_id):
   USING (accountant_id = auth.uid())

   -- ✅ POPRAWNE:
   USING (accountant_id IN (
     SELECT id FROM accountants WHERE profile_id = auth.uid()
   ))

   -- Sprawdź constraint name:
   SELECT constraint_name FROM information_schema.table_constraints
   WHERE table_name = 'messages';
   ```

3. **Role Validation:** Zawsze sprawdzaj `user.role` przed akcjami:

   ```typescript
   if (!user || user.role !== "employer") {
     alert("Tylko pracodawcy mogą...");
     return;
   }
   ```

4. **NIE TWÓRZ plików/kolumn bez MCP:**
   - ❌ Zakładasz strukturę → ✅ Sprawdzasz MCP
   - ❌ Kopiujesz z innej tabeli → ✅ Weryfikujesz FK/RLS
   - ❌ Generujesz SQL "na ślepo" → ✅ SELECT analiza NAJPIERW

## Build & Deploy

```bash
npm run dev           # Vite dev server (port 3000)
npm run build         # Production build
npm run db:schema     # Export DB schema to .tmp/schema.json
npm run db:migrate    # Run pending migrations
```

## Project-Specific Conventions

- **Polish UI text** in components, English in code/comments
- **Service layer pattern:** `services/[role]Service.ts` for all backend calls
- **Type safety:** Import from `types.ts` or `src/lib/database.types.ts` (Supabase-generated)
- **Error handling:** Console.error + user-facing alerts, never silent failures
- **Debugging:** Use emoji prefixes: 📬 (messages), ✅ (success), ❌ (error), 🔍 (query)

## Key Directories

```
pages/                    # Role-specific dashboards (employer/, worker/, accountant/, cleaning/)
services/                 # Backend integration layer (employerService.ts, cleaningCompanyService.ts)
components/               # Reusable UI (ProtectedRoute.tsx, Modal.tsx, PageContainer.tsx)
database-migrations/      # SQL migrations (versioned by date)
src/lib/database.types.ts # Supabase-generated types (DO NOT EDIT manually)
types.ts                  # Custom TypeScript interfaces (CleaningCompany, etc.)
```

## Before Making Changes

1. **ZAWSZE MCP NAJPIERW!** Read `.copilot-instructions.md` (634 lines) for detailed MCP Supabase workflows
2. Use MCP tools: `list_tables` → `get_table_structure` → `get_foreign_keys` → `get_table_policies`
3. Check `database-migrations/README.md` for migration best practices
4. Verify role-specific requirements in `components/ProtectedRoute.tsx`
5. Test avatar resolution in console before committing changes

### 📝 PRZYKŁAD POPRAWNEGO WORKFLOW:

```
User: "Napraw foreign key między jobs a employers"

❌ ZŁE (bez MCP):
ALTER TABLE jobs ADD CONSTRAINT fk_jobs_employer
FOREIGN KEY (employer_id) REFERENCES employers(id);

✅ DOBRE (z MCP):

1. use_mcp_tool("supabase", "list_tables") // sprawdź czy jobs i employers istnieją
2. use_mcp_tool("supabase", "get_table_structure", {table_name: "jobs"})
3. use_mcp_tool("supabase", "get_foreign_keys", {table_name: "jobs"})
4. SELECT employer_id FROM jobs WHERE employer_id NOT IN (SELECT id FROM employers);
5. Raport: "5 jobs z nieistniejącymi employer_id - cleanup needed"
6. Migracja: cleanup + FK constraint + rollback plan
7. User approval → Execute → Verify
```

### ⚠️ JEŚLI ZOBACZYSZ BŁĄD "kolumna X nie istnieje":

```
TO ZNACZY ŻE NIE WYKONAŁEŚ MCP!

STOP wszystko → Wróć do MCP → Sprawdź faktyczną strukturę → Popraw kod
```

---

**Last Updated:** 2025-11-12 (Added ETAP 0: Analiza chirurgiczna kodu, CHECKPOINTY workflow, TypeScript error surgery, 🚨 DIAGNOSTYKA (problem niejasny), 🔒 RLS DEBUGGING (6-step), ⏪ MIGRATION ROLLBACK (emergency))
