-- =====================================================
-- Sprawdzenie dostępu admina do tabeli workers
-- =====================================================

-- KROK 1: Sprawdź czy są jakieś dane w tabeli workers
SELECT 
  COUNT(*) as total_workers,
  COUNT(CASE WHEN verified = true THEN 1 END) as verified_workers,
  COUNT(CASE WHEN verified = false THEN 1 END) as unverified_workers
FROM workers;

-- KROK 2: Sprawdź przykładowe dane z JOIN do profiles
SELECT 
  w.id,
  w.specialization,
  w.location_city,
  w.verified,
  w.rating,
  p.full_name,
  p.email,
  p.role
FROM workers w
LEFT JOIN profiles p ON w.profile_id = p.id
LIMIT 5;

-- KROK 3: Sprawdź polityki RLS dla tabeli workers
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'workers';

-- KROK 4: Sprawdź czy RLS jest włączony
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'workers';
