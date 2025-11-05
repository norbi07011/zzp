-- =====================================================
-- FIX PROFILES ROLE CHECK CONSTRAINT - SAFE VERSION
-- =====================================================
-- Naprawia constraint z weryfikacją istniejących danych

-- KROK 1: Sprawdź obecny constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND conname LIKE '%role%';

-- KROK 2: Sprawdź wszystkie istniejące wartości role
SELECT 
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- KROK 3: Pokaż profile z nieprawidłowymi wartościami (jeśli są)
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles
WHERE role NOT IN ('worker', 'employer', 'accountant')
ORDER BY created_at DESC;

-- KROK 4: Usuń stary constraint (bez sprawdzania)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- KROK 5: Dodaj nowy constraint z 'accountant' (BEZ WALIDACJI istniejących danych)
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('worker', 'employer', 'accountant')) NOT VALID;

-- KROK 6: Zwaliduj constraint dla NOWYCH danych (stare dane nie są sprawdzane)
ALTER TABLE profiles VALIDATE CONSTRAINT profiles_role_check;

-- KROK 7: Weryfikacja końcowa
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition,
  convalidated as is_validated
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND conname LIKE '%role%';

-- Oczekiwany wynik:
-- constraint_name: profiles_role_check
-- constraint_definition: CHECK ((role = ANY (ARRAY['worker'::text, 'employer'::text, 'accountant'::text])))
-- is_validated: true
