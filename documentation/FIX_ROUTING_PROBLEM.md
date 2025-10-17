# 🔧 FIX: Wszyscy użytkownicy widzą panel pracownika

## 📋 PROBLEM
**Objawy:** Niezależnie od roli użytkownika (admin/employer/worker), po zalogowaniu wszyscy widzą panel pracownika.

**Przyczyna:** Funkcja `mapSupabaseUserToAppUser` w `AuthContext.tsx` nie może pobrać profilu z bazy danych i domyślnie ustawia rolę na `'worker'`.

---

## 🔍 KROK 1: DIAGNOZA

### A. Uruchom zapytanie diagnostyczne

1. **Otwórz Supabase Dashboard** → SQL Editor
2. **Wklej i wykonaj** zawartość pliku `CHECK_USER_ROLES.sql`
3. **Przeanalizuj wyniki**:

#### ✅ **Prawidłowy wynik** (wszystko działa):
```
profiles_table_exists: true
total_profiles: 3+
role distribution:
  - admin: 1
  - employer: 1
  - worker: 1+
```

#### ❌ **Problematyczny wynik #1** (tabela nie istnieje):
```
profiles_table_exists: false
```
**➡️ Przejdź do KROK 2A**

#### ❌ **Problematyczny wynik #2** (brak profili):
```
profiles_table_exists: true
total_profiles: 0
```
**➡️ Przejdź do KROK 2B**

#### ❌ **Problematyczny wynik #3** (złe role):
```
profiles_table_exists: true
total_profiles: 3
role distribution:
  - NULL: 2
  - worker: 1
```
**➡️ Przejdź do KROK 2C**

#### ❌ **Problematyczny wynik #4** (RLS blokuje odczyt):
```
Error: permission denied for table profiles
```
**➡️ Przejdź do KROK 2D**

---

## 🛠️ KROK 2: NAPRAWY

### 2A: Tabela profiles nie istnieje

**Wykonaj podstawową migrację:**

```sql
-- Utwórz tabelę profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employer', 'worker')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dodaj index
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Włącz RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Polityki RLS: Każdy może czytać wszystkie profile (potrzebne dla AuthContext)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Użytkownicy mogą aktualizować swój własny profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Tylko admin może wszystko
CREATE POLICY "Admins can do everything"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

**Następnie przejdź do KROK 2B aby dodać użytkowników testowych.**

---

### 2B: Brak profili w tabeli

**Utwórz profile testowe dla istniejących użytkowników:**

```sql
-- Dodaj profile dla użytkowników którzy istnieją w auth.users ale nie mają profilu
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'fullName', 'User'),
  COALESCE(au.raw_user_meta_data->>'role', 'worker')
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- Jeśli nie masz żadnych użytkowników, utwórz konta testowe:
-- UWAGA: Te zapytania zadziałają tylko jeśli konta zostały utworzone przez rejestrację
-- Musisz ręcznie ustawić role dla istniejących kont:

-- Ustaw admin@zzp.nl jako admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@zzp.nl';

-- Ustaw employer@test.nl jako employer
UPDATE profiles 
SET role = 'employer' 
WHERE email = 'employer@test.nl';

-- Ustaw worker@test.nl jako worker
UPDATE profiles 
SET role = 'worker' 
WHERE email = 'worker@test.nl';

-- Sprawdź wynik
SELECT id, email, full_name, role FROM profiles;
```

---

### 2C: Profile mają NULL lub złe role

**Napraw role:**

```sql
-- Ustaw domyślną rolę dla NULL
UPDATE profiles 
SET role = 'worker' 
WHERE role IS NULL;

-- Napraw konkretne konta testowe
UPDATE profiles SET role = 'admin' WHERE email = 'admin@zzp.nl';
UPDATE profiles SET role = 'employer' WHERE email = 'employer@test.nl';
UPDATE profiles SET role = 'worker' WHERE email = 'worker@test.nl';

-- Usuń nieprawidłowe role (jeśli istnieją)
UPDATE profiles 
SET role = 'worker' 
WHERE role NOT IN ('admin', 'employer', 'worker');

-- Sprawdź wynik
SELECT email, role FROM profiles ORDER BY role;
```

---

### 2D: RLS blokuje dostęp

**Problem:** Polityki Row Level Security (RLS) blokują odczyt tabeli profiles przez AuthContext.

**Rozwiązanie:** Dodaj politykę pozwalającą authenticated użytkownikom czytać profile:

```sql
-- Usuń istniejące restrykcyjne polityki
DROP POLICY IF EXISTS "Users can only view own profile" ON profiles;

-- Dodaj bardziej liberalną politykę
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Sprawdź czy polityki są aktywne
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles';
```

**Wyjaśnienie:** AuthContext musi móc czytać profile wszystkich użytkowników, aby poprawnie ustalić rolę. To jest bezpieczne, ponieważ:
- Tylko zalogowani użytkownicy (`authenticated`) mają dostęp
- Profile zawierają tylko publiczne dane (email, imię, rola)
- Wrażliwe dane (hasła) są w `auth.users` który jest niedostępny

---

## ✅ KROK 3: WERYFIKACJA

### A. Sprawdź w Supabase

```sql
-- Powinno pokazać 3 różne role
SELECT 
  email,
  role,
  full_name
FROM profiles
WHERE email IN ('admin@zzp.nl', 'employer@test.nl', 'worker@test.nl')
ORDER BY role;
```

**Oczekiwany wynik:**
```
admin@zzp.nl     | admin    | Admin User
employer@test.nl | employer | Employer User
worker@test.nl   | worker   | Worker User
```

### B. Test w aplikacji

1. **Wyloguj się** (jeśli jesteś zalogowany)
2. **Zaloguj jako admin:**
   - Email: `admin@zzp.nl`
   - Password: `test123`
   - **Oczekiwany URL:** `http://localhost:3003/admin`
   - **Oczekiwany panel:** Admin Dashboard z sekcją "Zarządzanie"

3. **Wyloguj i zaloguj jako employer:**
   - Email: `employer@test.nl`
   - Password: `test123`
   - **Oczekiwany URL:** `http://localhost:3003/employer`
   - **Oczekiwany panel:** Employer Dashboard z "Szukaj Pracowników"

4. **Wyloguj i zaloguj jako worker:**
   - Email: `worker@test.nl`
   - Password: `test123`
   - **Oczekiwany URL:** `http://localhost:3003/worker`
   - **Oczekiwany panel:** Worker Dashboard z "Portfolio"

### C. Debug w konsoli przeglądarki

Otwórz DevTools (F12) → Console i sprawdź:

```javascript
// Powinno pokazać obiekt z poprawną rolą
console.log('User:', user);
// Sprawdź: user.role === 'admin' | 'employer' | 'worker'
```

Jeśli widzisz błędy typu:
```
Error fetching user profile: {...}
```
To znaczy że `mapSupabaseUserToAppUser` nie może pobrać profilu - wróć do KROK 1.

---

## 🚨 KROK 4: JEŚLI NADAL NIE DZIAŁA

### Debug krok po kroku:

1. **Otwórz Network tab** w DevTools (F12)
2. **Odśwież stronę** po zalogowaniu
3. **Znajdź request do Supabase** (filtruj: `supabase`)
4. **Sprawdź response:**

#### Jeśli widzisz `200 OK` ale `data: []`:
```json
{
  "data": [],
  "error": null
}
```
**Problem:** RLS blokuje odczyt → Wróć do KROK 2D

#### Jeśli widzisz `401 Unauthorized`:
```json
{
  "error": "JWT expired"
}
```
**Problem:** Token wygasł → Wyloguj się i zaloguj ponownie

#### Jeśli widzisz `500 Internal Server Error`:
**Problem:** Błąd po stronie bazy danych → Sprawdź logi Supabase

### Logi w Supabase:
1. Przejdź do **Supabase Dashboard** → **Logs** → **Postgres Logs**
2. Szukaj błędów związanych z tabelą `profiles`
3. Typowe błędy:
   - `relation "profiles" does not exist` → KROK 2A
   - `permission denied` → KROK 2D
   - `null value in column "role"` → KROK 2C

---

## 📊 KROK 5: DŁUGOTERMINOWE ROZWIĄZANIE

Po naprawie bieżącego problemu, wykonaj pełną migrację:

1. **Wykonaj `FIX_BEZPIECZNY.sql`** - naprawi istniejące tabele
2. **Wykonaj `COMPLETE_MIGRATION_ALL_TABLES.sql`** - utworzy 16 brakujących tabel
3. **Wykonaj `RLS_POLICIES_ALL_TABLES.sql`** - ustawi właściwe zabezpieczenia

Szczegóły w pliku `INSTRUKCJA_WDROZENIA.md`.

---

## 🎯 PODSUMOWANIE

**Główna przyczyna:** AuthContext nie może odczytać roli z tabeli `profiles` i domyślnie ustawia wszystkich jako `worker`.

**Najczęstsze rozwiązania:**
1. ✅ Tabela nie istnieje → Utwórz ją (KROK 2A)
2. ✅ Profile nie mają ról → Ustaw je (KROK 2C)
3. ✅ RLS blokuje odczyt → Dodaj politykę SELECT (KROK 2D)

**Po naprawie:**
- Admin widzi `/admin` panel
- Employer widzi `/employer` panel  
- Worker widzi `/worker` panel

---

## 📞 DALSZE KROKI

Po naprawieniu routingu:
1. ✅ Przetestuj wszystkie 3 panele
2. ⏳ Wykonaj pełną migrację bazy danych (16 tabel)
3. ⏳ Przetestuj wszystkie funkcjonalności paneli

**Powodzenia!** 🚀
