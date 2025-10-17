# ✅ NAPRAWIONE - Profile Worker i Employer

## 🔧 CO BYŁO NIE TAK:

### Problem 1: Brak Worker/Employer Profili
❌ Trigger tworzył tylko profil w `profiles`
❌ NIE tworzył wpisu w `workers` ani `employers`
❌ Panele wymagają tych danych → błędy!

### Problem 2: Employer Miał Nieaktywną Subskrypcję
❌ `subscription_status = 'inactive'`
❌ Aplikacja blokowała dostęp do panelu
❌ Przekierowanie do płatności zamiast do panelu

---

## ✅ CO ZOSTAŁO NAPRAWIONE:

### 1. Ulepszony Trigger
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Krok 1: Tworzy profil w 'profiles'
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, NEW.email, ..., ...);

  -- Krok 2: Tworzy wpis w 'workers' LUB 'employers'
  IF role = 'worker' THEN
    INSERT INTO workers (...) VALUES (...);
  ELSIF role = 'employer' THEN
    INSERT INTO employers (...) VALUES (...);
  END IF;
END;
$$;
```

### 2. Naprawiono Istniejących Użytkowników
✅ Dodano brakujący profil employer dla `odzeradomilionera708@gmail.com`
✅ Worker `servicenorbs@gmail.com` już miał profil

### 3. Aktywowano Subskrypcję Employer
✅ `subscription_status = 'active'`
✅ `subscription_tier = 'pro'`
✅ `subscription_expires_at = +30 dni`

---

## 📊 OBECNY STAN BAZY:

### Użytkownicy (2):
1. **servicenorbs@gmail.com** (Worker)
   - ✅ Profil: `profiles`
   - ✅ Worker: `workers`
   - ✅ Subskrypcja: `active` / `basic`
   - ✅ Specjalizacja: Electricien

2. **odzeradomilionera708@gmail.com** (Employer)
   - ✅ Profil: `profiles`
   - ✅ Employer: `employers`
   - ✅ Subskrypcja: `active` / `pro`
   - ✅ Wygasa: 2025-11-16

---

## 🚀 CO TERAZ POWINNO DZIAŁAĆ:

### 1. Panel Worker (/worker)
✅ Powinien się otworzyć
✅ Powinien pokazać profil
✅ Powinien działać routing
✅ Dane powinny się ładować

### 2. Panel Employer (/employer)
✅ Powinien się otworzyć BEZ przekierowania do płatności
✅ Subskrypcja aktywna (pro, 30 dni)
✅ Powinien pokazać dashboard
✅ Routing powinien działać

### 3. Panel Admin (/admin)
⚠️ **NIE MA ADMINA!** Musisz utworzyć konto z role='admin'

---

## 🔍 JAK PRZETESTOWAĆ:

### Test 1: Worker Panel
1. Zaloguj się jako: `servicenorbs@gmail.com`
2. Otwórz: `/worker`
3. Sprawdź czy:
   - ✅ Panel się otwiera
   - ✅ Widać specjalizację: Electricien
   - ✅ Menu działa
   - ✅ Brak błędów w konsoli (F12)

### Test 2: Employer Panel
1. Zaloguj się jako: `odzeradomilionera708@gmail.com`
2. Otwórz: `/employer`
3. Sprawdź czy:
   - ✅ Panel się otwiera (NIE przekierowuje do płatności!)
   - ✅ Widać subskrypcję: Pro (aktywna do 2025-11-16)
   - ✅ Menu działa
   - ✅ Brak błędów w konsoli

### Test 3: Admin Panel
⚠️ **Musisz utworzyć admina:**

**OPCJA A: Przez Supabase Dashboard**
1. Otwórz: https://supabase.com/dashboard/project/fldquchnitwsybkhrnns/auth/users
2. Kliknij "Add user"
3. Email: `admin@zzpwerkplaats.nl`
4. Password: `Admin123!@#`
5. ✅ Zaznacz "Auto Confirm User"
6. W **User Metadata** dodaj:
   ```json
   {
     "role": "admin",
     "full_name": "Admin Test"
   }
   ```
7. Kliknij "Create user"

**OPCJA B: Przez SQL**
```sql
-- 1. Zmień rolę istniejącego użytkownika
UPDATE profiles
SET role = 'admin'
WHERE email = 'servicenorbs@gmail.com';

-- 2. Zaloguj się ponownie
```

---

## ⚠️ JAKIE BŁĘDY MOGĄ SIĘ JESZCZE POJAWIĆ:

### 1. "Cannot read properties of undefined"
**Przyczyna:** Frontend próbuje odczytać dane które nie istnieją

**Sprawdź:**
```sql
-- Czy worker ma wszystkie wymagane pola?
SELECT * FROM workers WHERE profile_id IN (
  SELECT id FROM profiles WHERE email = 'servicenorbs@gmail.com'
);

-- Czy employer ma wszystkie wymagane pola?
SELECT * FROM employers WHERE profile_id IN (
  SELECT id FROM profiles WHERE email = 'odzeradomilionera708@gmail.com'
);
```

### 2. "403 Forbidden" lub "RLS policy violation"
**Przyczyna:** RLS blokuje dostęp

**Sprawdź RLS policies:**
```sql
-- Pokaż wszystkie polityki
SELECT
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. "Redirect loop" (ciągłe przekierowania)
**Przyczyna:** Routing nie może ustalić dokąd przekierować

**Sprawdź AuthContext.tsx:**
- Czy poprawnie sprawdza role?
- Czy prawidłowo przekierowuje?

---

## 📝 SPRAWDŹ W KONSOLI (F12):

### Worker Panel:
```javascript
// Otwórz Console i wklej:
console.log('Profile:', await supabase.from('profiles').select('*').single());
console.log('Worker:', await supabase.from('workers').select('*').single());
```

### Employer Panel:
```javascript
// Otwórz Console i wklej:
console.log('Profile:', await supabase.from('profiles').select('*').single());
console.log('Employer:', await supabase.from('employers').select('*').single());
```

---

## 🎯 NASTĘPNE KROKI:

1. **Wyloguj się i zaloguj ponownie** (wyczyść cache!)
2. **Przetestuj oba panele** (worker i employer)
3. **Sprawdź console (F12)** - zobacz czy są błędy
4. **Powiedz mi co widzisz:**
   - ✅ Panel działa → SUPER!
   - ❌ Błąd → Pokaż mi co w konsoli (F12)

---

## 📄 UTWORZONE PLIKI:

- **`supabase/migrations/20251017_fix_auto_create_worker_employer.sql`** - Naprawa triggera
- **`NAPRAWIONE_PROFILE.md`** - Ten plik (instrukcje)

---

## ✅ PODSUMOWANIE:

**Problem:** Brak profili worker/employer + nieaktywna subskrypcja
**Rozwiązanie:** Naprawiono trigger + aktywowano subskrypcję
**Status:** ✅ NAPRAWIONE!

**Teraz wyloguj się, zaloguj ponownie i sprawdź czy działa!** 🚀

Jeśli nadal są błędy → Pokaż mi console (F12) i naprawimy to natychmiast! 💪
