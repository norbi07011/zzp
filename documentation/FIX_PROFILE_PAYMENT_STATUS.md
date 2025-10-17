# 🔧 NAPRAWA PROFILU I PŁATNOŚCI - STATUS
**Data:** 2025-01-29  
**Problemy zgłoszone:** 
1. ❌ Profil się nie ładuje (cały czas loading)
2. ❌ Płatności nie działają (Invalid API Key)

---

## ✅ NAPRAWY WYKONANE

### 1. **AuthContext.tsx - Fixed `zzp_worker_profiles` → `workers`**
**Problem:** Kod próbował odczytać z nieistniejącej tabeli `zzp_worker_profiles`

**Naprawa:**
- Linia 123: `.from('zzp_worker_profiles')` → `.from('workers')`
- Linia 274: Rejestracja też poprawiona na `workers` table
- Zmieniono pola: `profile_id` zamiast `user_id`

**Pliki zmienione:**
- `contexts/AuthContext.tsx`

---

### 2. **src/services/profile.ts - Fixed views `v_workers` → `workers`**
**Problem:** Kod używał widoków `v_workers` i `v_profiles`, których nie ma w bazie

**Naprawa:**
- `getWorkerProfile()` - teraz czyta z `workers` + `profiles` bezpośrednio
- `updateWorkerProfile()` - aktualizuje `workers` table
- `updateWorkerSkills()` - poprawione na `profile_id` zamiast `user_id`

**Pliki zmienione:**
- `src/services/profile.ts`

---

### 3. **Stripe Secret Key - Zaktualizowany w Supabase**
**Problem:** Edge Functions używały starego/nieprawidłowego klucza Stripe

**Naprawa:**
```powershell
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_51SGfc0Dbg0wPn3ud...
```

**Edge Functions przeładowane (ALL 3):**
✅ `create-checkout-session` - Version 5 DEPLOYED  
✅ `create-exam-payment` - Version 4 DEPLOYED  
✅ `stripe-webhook` - Version 4 DEPLOYED

---

## 📋 CO MUSISZ ZROBIĆ TERAZ

### **KROK 1: Utwórz widoki w Supabase**

**WAŻNE!** Wiele plików (`src/services/workers.ts`, `certificates.ts`, `subscriptions.ts`) nadal używa widoków `v_workers` i `v_profiles`.

**Wklej ten plik SQL w Supabase SQL Editor:**
```
CREATE_VIEWS_WORKERS_PROFILES.sql
```

**Kroki:**
1. Otwórz https://supabase.com/dashboard/project/dtnotuyagygexmkyqtgb/sql/new
2. Wklej zawartość pliku `CREATE_VIEWS_WORKERS_PROFILES.sql`
3. Kliknij **RUN**
4. Sprawdź czy widzisz: `✅ Views created successfully!`

---

### **KROK 2: Zrestartuj serwer deweloperski**

```powershell
# Zatrzymaj aktualny serwer (Ctrl+C w terminalu)
# Potem uruchom:
npm run dev
```

---

### **KROK 3: Testuj aplikację**

1. **Otwórz:** http://localhost:3000/worker
2. **Sprawdź Console (F12):**
   - ❌ Błędy "Error fetching user profile" - **powinny zniknąć**
   - ❌ Błędy "Error fetching worker profile" - **powinny zniknąć**
   - ❌ "Invalid API Key provided" - **powinny zniknąć**

3. **Testuj profil:**
   - Profil powinien się załadować bez "loading" na wieczność
   - Dane użytkownika powinny być widoczne

4. **Testuj płatności:**
   - Kliknij "Upgrade to Premium €13"
   - Powinno otworzyć Stripe Checkout (bez błędów)

---

## 🔍 PLIKI DIAGNOSTYCZNE

Utworzone do weryfikacji:
- `CHECK_WORKERS_TABLE.sql` - sprawdź strukturę tabeli workers
- `CREATE_VIEWS_WORKERS_PROFILES.sql` - **MUSISZ URUCHOMIĆ W SUPABASE!**

---

## ⚠️ ZNANE PROBLEMY DO NAPRAWY

### **POZOSTAŁE PLIKI używają v_workers (nie naprawione jeszcze):**
Jeśli widoki `v_workers` i `v_profiles` nie zostaną utworzone, te pliki będą nadal wyrzucać błędy:

❌ `src/services/workers.ts` (20 użyć v_workers)  
❌ `src/services/subscriptions.ts` (5 użyć v_workers)  
❌ `src/services/certificates.ts` (4 użycia v_workers)

**Rozwiązanie:** Uruchom SQL `CREATE_VIEWS_WORKERS_PROFILES.sql` w Supabase!

---

## 📊 STATUS NAPRAW

| Problem | Status | Naprawa |
|---------|--------|---------|
| Profil nie ładuje się | ✅ FIXED | AuthContext używa `workers` zamiast `zzp_worker_profiles` |
| Invalid API Key | ✅ FIXED | Stripe Secret Key zaktualizowany w Edge Functions |
| Brak widoków v_workers | ⚠️ PENDING | Musisz uruchomić `CREATE_VIEWS_WORKERS_PROFILES.sql` |
| Edge Functions | ✅ DEPLOYED | Wszystkie 3 funkcje przeładowane z nowym kluczem |

---

## 🎯 NASTĘPNE KROKI PO NAPRAWIE

Po uruchomieniu widoków i restarcie serwera:

1. ✅ Profil worker powinien się ładować natychmiast
2. ✅ Płatności Stripe powinny działać (checkout session otwiera się)
3. ✅ Formularz ZZP Exam powinien działać (€230 payment)
4. ⏳ Testuj end-to-end flow: Rejestracja → Login → Upgrade → Payment

---

**Potrzebujesz pomocy?** Napisz jeśli:
- Widoki się nie utworzyły w Supabase
- Nadal są błędy w konsoli
- Płatności nadal nie działają
