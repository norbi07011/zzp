-- =====================================================
-- DELETE FAILED ACCOUNTANT REGISTRATION USER
-- =====================================================
-- Usuwa usera ksiegowyy-test-2024@gmail.com który nie ma profilu

-- KROK 1: Sprawdź czy user istnieje
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'role' as intended_role
FROM auth.users
WHERE email = 'ksiegowyy-test-2024@gmail.com';

-- KROK 2: Sprawdź czy ma profil
SELECT 
  au.id,
  au.email,
  p.id as profile_id,
  CASE WHEN p.id IS NULL THEN 'NO PROFILE ❌' ELSE 'HAS PROFILE ✅' END as status
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE au.email = 'ksiegowyy-test-2024@gmail.com';

-- KROK 3: USUŃ usera (tylko jeśli nie ma profilu)
DELETE FROM auth.users
WHERE email = 'ksiegowyy-test-2024@gmail.com'
  AND id NOT IN (SELECT id FROM profiles);

-- KROK 4: Weryfikacja - user powinien być usunięty
SELECT 
  COUNT(*) as remaining_users
FROM auth.users
WHERE email = 'ksiegowyy-test-2024@gmail.com';

-- Oczekiwany wynik KROK 4: remaining_users = 0

-- =====================================================
-- OPCJA 2: Usuń WSZYSTKICH userów bez profili
-- =====================================================
/*
DELETE FROM auth.users
WHERE id NOT IN (SELECT id FROM profiles);
*/

-- =====================================================
-- WERYFIKACJA KOŃCOWA
-- =====================================================
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users WHERE id NOT IN (SELECT id FROM profiles)) as orphaned_users;

-- Po usunięciu orphaned_users powinno być 0
