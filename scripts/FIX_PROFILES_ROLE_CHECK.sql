-- =====================================================
-- FIX PROFILES ROLE CHECK CONSTRAINT
-- =====================================================
-- Dodaje 'accountant' do dozwolonych wartości role w tabeli profiles

-- KROK 1: Sprawdź obecny constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND conname LIKE '%role%';

-- KROK 2: Usuń stary constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- KROK 3: Dodaj nowy constraint z 'accountant'
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('worker', 'employer', 'accountant'));

-- KROK 4: Weryfikacja - sprawdź nowy constraint
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND conname LIKE '%role%';

-- Oczekiwany wynik:
-- constraint_name: profiles_role_check
-- constraint_definition: CHECK ((role = ANY (ARRAY['worker'::text, 'employer'::text, 'accountant'::text])))
