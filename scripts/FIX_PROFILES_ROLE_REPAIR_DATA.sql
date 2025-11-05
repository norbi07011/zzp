-- =====================================================
-- FIX PROFILES ROLE - REPAIR DATA FIRST
-- =====================================================
-- Najpierw napraw dane, potem dodaj constraint

-- KROK 1: Sprawdź wszystkie istniejące wartości role
SELECT 
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- KROK 2: Pokaż profile z nieprawidłowymi wartościami
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles
WHERE role IS NULL 
   OR role NOT IN ('worker', 'employer', 'accountant')
ORDER BY created_at DESC;

-- KROK 3: NAPRAW nieprawidłowe wartości role
-- Zamień NULL na 'worker' (domyślna wartość)
UPDATE profiles
SET role = 'worker'
WHERE role IS NULL;

-- Zamień inne nieprawidłowe wartości na 'worker'
UPDATE profiles
SET role = 'worker'
WHERE role NOT IN ('worker', 'employer', 'accountant');

-- KROK 4: Weryfikacja - wszystkie role powinny być prawidłowe
SELECT 
  role,
  COUNT(*) as count
FROM profiles
GROUP BY role
ORDER BY count DESC;

-- KROK 5: Usuń stary constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- KROK 6: Dodaj nowy constraint z 'accountant'
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('worker', 'employer', 'accountant'));

-- KROK 7: Weryfikacja końcowa
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'profiles'::regclass
  AND conname LIKE '%role%';

-- Oczekiwany wynik KROK 4:
-- worker   | X
-- employer | Y
-- (tylko te dwie wartości powinny być)

-- Oczekiwany wynik KROK 7:
-- constraint_name: profiles_role_check
-- constraint_definition: CHECK ((role = ANY (ARRAY['worker'::text, 'employer'::text, 'accountant'::text])))
