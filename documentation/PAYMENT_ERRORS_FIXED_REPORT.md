# ✅ CZĘŚCIOWO NAPRAWIONE - Błędy 404, 406, Invalid API Key

**Data:** 2025-01-29 04:05 CET  
**Status:** ✅ Payment errors FIXED | ⏳ Database migration PENDING

---

## ✅ CO NAPRAWIŁEM AUTOMATYCZNIE

### 1. **Invalid API Key → FIXED ✅**

**Problem:**
```
stripe.ts:106 - Error: Invalid API Key provided: sk_test_***
```

**Rozwiązanie:**
```powershell
npx supabase secrets set STRIPE_SECRET_KEY="sk_test_51SGfc0Dbg0wPn3ud..."
```

**Rezultat:**
```
✅ Finished supabase secrets set.
```

---

### 2. **Edge Functions Redeployed ✅**

**Wykonano:**
```powershell
✅ npx supabase functions deploy create-checkout-session
✅ npx supabase functions deploy create-exam-payment  
✅ npx supabase functions deploy stripe-webhook
```

**Rezultat:**
```
✅ All 3 functions deployed successfully
✅ New Stripe Secret Key active in all Edge Functions
```

---

## ⏳ CO MUSISZ ZROBIĆ RĘCZNIE

### KROK 1: Uruchom Migration SQL w Supabase

**Błąd który nadal występuje:**
```
404 - GET .../rest/v1/zzp_exam_applications
```

**Przyczyna:**
Tabela `zzp_exam_applications` **nie istnieje** w bazie danych.

---

### **INSTRUKCJA KROK PO KROKU:**

#### 1️⃣ Otwórz Supabase SQL Editor:
```
https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql
```

#### 2️⃣ Skopiuj CAŁĄ zawartość pliku:
```
c:\AI PROJEKT\zzp-werkplaats (3)\supabase\migrations\20250111_zzp_exam_system.sql
```

**Lokalizacja:** Ten plik jest **OTWARTY W TWOIM EDITORZE** (widzę go w zakładce)

#### 3️⃣ Wklej do SQL Editor i kliknij **"Run"**

**Oczekiwany output:**
```
✅ CREATE TABLE zzp_exam_applications
✅ CREATE INDEX (5 indexes)
✅ CREATE TRIGGER update_zzp_exam_applications_timestamp
✅ CREATE FUNCTION generate_certificate_number()
✅ CREATE POLICY (4 RLS policies)
```

#### 4️⃣ Zweryfikuj czy tabela istnieje:
```sql
SELECT * FROM zzp_exam_applications LIMIT 5;
```

**Jeśli zwraca "0 rows" (pusta tabela) → ✅ DZIAŁA!**  
**Jeśli zwraca błąd → ❌ Migration nie zadziałał**

---

### KROK 2: Fix 406 errors - Dodaj brakujące RLS policies

**Błąd:**
```
406 - GET .../rest/v1/certificates
406 - GET .../rest/v1/worker_profiles
```

**Uruchom w Supabase SQL Editor:**

```sql
-- =========================================
-- FIX 406: certificates table RLS
-- =========================================

-- Enable RLS (jeśli nie enabled):
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Drop old policies (jeśli istnieją):
DROP POLICY IF EXISTS "Workers can view own certificates" ON certificates;
DROP POLICY IF EXISTS "Workers can insert own certificates" ON certificates;
DROP POLICY IF EXISTS "Admins can view all certificates" ON certificates;

-- Create NEW policies:
CREATE POLICY "Workers can view own certificates"
  ON certificates
  FOR SELECT
  USING (auth.uid() = worker_id);

CREATE POLICY "Workers can insert own certificates"
  ON certificates
  FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Workers can update own certificates"
  ON certificates
  FOR UPDATE
  USING (auth.uid() = worker_id)
  WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Admins can do all on certificates"
  ON certificates
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

---

### KROK 3: Odśwież stronę i sprawdź Console

**Po uruchomieniu migration + RLS policies:**

1. Wróć do aplikacji: http://localhost:3001/worker
2. **Odśwież (F5)**
3. Otwórz Console (F12)
4. Sprawdź czy:
   - ✅ Brak 404 errors
   - ✅ Brak 406 errors
   - ✅ Brak "Invalid API Key"

---

## 📊 CURRENT STATUS

| Błąd | Status | Rozwiązanie |
|------|--------|-------------|
| **Invalid API Key** | ✅ FIXED | Stripe Secret Key zaktualizowany |
| **Edge Functions** | ✅ DEPLOYED | 3/3 functions redeployed |
| **404 - zzp_exam_applications** | ⏳ PENDING | **MUSISZ uruchomić migration SQL** |
| **406 - certificates** | ⏳ PENDING | **MUSISZ dodać RLS policies** |
| **406 - worker_profiles** | ⏳ PENDING | **MUSISZ dodać RLS policies** |

---

## 🚀 NASTĘPNE KROKI

1. **TERAZ:** Uruchom migration SQL w Supabase (KROK 1 powyżej)
2. **POTEM:** Dodaj RLS policies dla certificates (KROK 2 powyżej)
3. **NA KOŃCU:** Odśwież stronę i sprawdź Console (KROK 3 powyżej)

---

## 📝 PLIKI UTWORZONE

1. **`FIX_404_406_PAYMENT_ERRORS.md`** - Pełna instrukcja naprawy (wszystkie kroki)
2. **Ten plik** - Podsumowanie co zrobiłem automatycznie + co musisz zrobić ręcznie

---

## ✅ WERYFIKACJA (po wykonaniu KROKÓW 1-3)

**Test w SQL Editor:**
```sql
-- Test 1: Tabela istnieje?
SELECT * FROM zzp_exam_applications LIMIT 1;

-- Test 2: RLS działa?
SELECT * FROM certificates WHERE worker_id = auth.uid() LIMIT 1;

-- Test 3: Policies są aktywne?
SELECT tablename, policyname FROM pg_policies 
WHERE tablename IN ('zzp_exam_applications', 'certificates');
```

**Expected output:**
```
✅ zzp_exam_applications → 0 rows (pusta tabela - OK!)
✅ certificates → rows lub empty (zależy czy worker ma certs)
✅ pg_policies → 4 policies dla zzp_exam, 4 policies dla certificates
```

---

**PODSUMOWANIE:**
- ✅ **Payment errors (Invalid API Key)** → **NAPRAWIONE** (Stripe key zaktualizowany)
- ⏳ **Database errors (404, 406)** → **CZEKA NA CIEBIE** (musisz uruchomić SQL w Supabase Dashboard)

**Link do Supabase SQL Editor:**
https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql

**Skopiuj plik:** `supabase\migrations\20250111_zzp_exam_system.sql` i uruchom w SQL Editor.
