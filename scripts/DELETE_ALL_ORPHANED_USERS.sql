-- =====================================================
-- DELETE ALL ORPHANED USERS
-- =====================================================
-- Usuwa WSZYSTKICH userów którzy nie mają profilu

-- KROK 1: Pokaż wszystkich orphaned users
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'role' as intended_role,
  'WILL BE DELETED ❌' as action
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM profiles)
ORDER BY au.created_at DESC;

-- KROK 2: USUŃ wszystkich orphaned users
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);

-- KROK 3: Weryfikacja końcowa
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users WHERE id NOT IN (SELECT id FROM profiles)) as orphaned_users;

-- Oczekiwany wynik KROK 3:
-- total_auth_users: 4
-- total_profiles: 4
-- orphaned_users: 0 ✅
