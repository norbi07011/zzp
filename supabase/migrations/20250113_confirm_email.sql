-- =====================================================
-- POTWIERDZENIE EMAILA RĘCZNIE
-- =====================================================
-- Dla użytkownika: servicenorbs@gmail.com

-- Potwierdź email w auth.users
UPDATE auth.users 
SET 
  email_confirmed_at = NOW(),
  confirmed_at = NOW()
WHERE email = 'servicenorbs@gmail.com';

-- Weryfikacja - powinno być potwierdzony
SELECT 
  email,
  email_confirmed_at,
  confirmed_at,
  created_at
FROM auth.users 
WHERE email = 'servicenorbs@gmail.com';

-- Sprawdź czy profil istnieje
SELECT 
  id,
  email,
  full_name,
  role
FROM profiles 
WHERE email = 'servicenorbs@gmail.com';

-- Sprawdź czy employer istnieje
SELECT 
  e.company_name,
  e.subscription_status,
  e.subscription_expires_at
FROM employers e
JOIN profiles p ON e.profile_id = p.id
WHERE p.email = 'servicenorbs@gmail.com';
