-- =====================================================
-- DELETE ORPHANED USERS (NO PROFILES)
-- =====================================================
-- Usuwa 7 userów z auth.users którzy nie mają profilu
-- UWAGA: Ten skrypt używa auth.uid() i DELETE - wymaga odpowiednich uprawnień

-- KROK 1: Pokaż userów do usunięcia (weryfikacja)
SELECT 
  au.id,
  au.email,
  au.created_at,
  'WILL BE DELETED ❌' as status
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- KROK 2: USUŃ userów bez profilu
-- Metoda 1: Bezpośrednie usunięcie (wymaga RLS bypass lub service_role)
DELETE FROM auth.users
WHERE id IN (
  SELECT au.id
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  WHERE p.id IS NULL
);

-- KROK 3: Weryfikacja po usunięciu
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users_remaining,
  (SELECT COUNT(*) FROM profiles) as profiles_remaining,
  (SELECT COUNT(*) FROM accountants) as accountants_remaining,
  (SELECT COUNT(*) 
   FROM auth.users au 
   LEFT JOIN profiles p ON p.id = au.id 
   WHERE p.id IS NULL) as orphaned_users_remaining;

-- Oczekiwany wynik po usunięciu:
-- auth_users_remaining: 4
-- profiles_remaining: 4
-- accountants_remaining: 0
-- orphaned_users_remaining: 0

-- =====================================================
-- ALTERNATYWNA METODA: Usuń po emailu (bardziej bezpieczna)
-- =====================================================
/*
DELETE FROM auth.users
WHERE email IN (
  'acalendar145@gmail.com',
  'test-worker@test.pl',
  'test@test.com',
  'karpiukarpinski882@gmail.com',
  'test-worker-1761349771540@test.com',
  'simple-test-1761349686910@test.com',
  'simple-test-1761348637503@test.com'
);
*/

-- =====================================================
-- ROLLBACK (gdyby coś poszło nie tak)
-- =====================================================
-- UWAGA: auth.users nie ma łatwego rollback - upewnij się przed wykonaniem!
-- Możesz najpierw wykonać backup:
/*
CREATE TABLE auth_users_backup AS
SELECT * FROM auth.users
WHERE id IN (
  SELECT au.id
  FROM auth.users au
  LEFT JOIN profiles p ON p.id = au.id
  WHERE p.id IS NULL
);
*/
