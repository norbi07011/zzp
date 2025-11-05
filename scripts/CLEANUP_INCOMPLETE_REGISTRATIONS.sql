-- =====================================================
-- CLEANUP INCOMPLETE REGISTRATIONS
-- =====================================================
-- Usuwa userów z auth.users którzy NIE mają profilu w profiles table
-- (nieudane próby rejestracji)

-- KROK 1: Sprawdź ile userów będzie usuniętych
SELECT 
  au.id,
  au.email,
  au.created_at,
  au.raw_user_meta_data->>'role' as intended_role,
  'NO PROFILE ❌' as status
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;

-- KROK 2: USUŃ userów bez profilu
-- UWAGA: To musi być wykonane przez ADMIN lub via Dashboard!
-- Skopiuj listę email z KROK 1 i usuń ręcznie przez:
-- Supabase Dashboard → Authentication → Users → Delete

-- Jeśli masz service_role key, możesz użyć:
-- WYMAGA: auth.admin permissions (service_role key)
/*
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT au.id, au.email
    FROM auth.users au
    LEFT JOIN profiles p ON p.id = au.id
    WHERE p.id IS NULL
  LOOP
    -- Delete user from auth.users (requires service_role)
    DELETE FROM auth.users WHERE id = user_record.id;
    RAISE NOTICE 'Deleted user: % (ID: %)', user_record.email, user_record.id;
  END LOOP;
END $$;
*/

-- KROK 3: Sprawdź ile userów pozostało
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM auth.users au LEFT JOIN profiles p ON p.id = au.id WHERE p.id IS NULL) as users_without_profile
;

-- =====================================================
-- ALTERNATYWNE ROZWIĄZANIE: Lista emaili do ręcznego usunięcia
-- =====================================================
SELECT 
  au.email,
  au.created_at,
  'DELETE THIS USER VIA DASHBOARD' as action
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ORDER BY au.created_at DESC;
