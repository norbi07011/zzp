-- =====================================================
-- USUWANIE TESTOWYCH KONT I UTWORZENIE NOWEGO ADMINA
-- =====================================================
-- Ten skrypt usuwa stare testowe konta i tworzy nowe konto admina

-- =====================================================
-- KROK 1: USUWANIE TESTOWYCH KONT
-- =====================================================
-- UWAGA: To usunie wszystkie dane związane z tymi kontami!

-- 1. Usuń z tabeli employers (jeśli istnieją)
DELETE FROM employers WHERE profile_id IN (
  SELECT id FROM profiles WHERE email IN (
    'employer@test.nl',
    'admin@zzp.nl',
    'worker@test.nl'
  )
);

-- 2. Usuń z tabeli workers (jeśli istnieją)
DELETE FROM workers WHERE profile_id IN (
  SELECT id FROM profiles WHERE email IN (
    'employer@test.nl',
    'admin@zzp.nl',
    'worker@test.nl'
  )
);

-- 3. Usuń z tabeli profiles
DELETE FROM profiles WHERE email IN (
  'employer@test.nl',
  'admin@zzp.nl',
  'worker@test.nl'
);

-- 4. Usuń z auth.users (Supabase Authentication)
-- UWAGA: To wymaga uprawnień administratora w Supabase
DELETE FROM auth.users WHERE email IN (
  'employer@test.nl',
  'admin@zzp.nl',
  'worker@test.nl'
);

-- =====================================================
-- KROK 2: UTWORZENIE NOWEGO KONTA ADMINA
-- =====================================================
-- Admin nie ma formularza rejestracji ze względów bezpieczeństwa
-- Musi być utworzony ręcznie w bazie

-- OPCJA A: Przez Supabase Dashboard (ZALECANE)
-- 1. Przejdź do: Authentication → Users
-- 2. Kliknij "Add user"
-- 3. Wypełnij:
--    Email: admin@zzpwerkplaats.nl
--    Password: [silne hasło - min 8 znaków]
--    Auto Confirm User: TAK
-- 4. Kliknij "Create user"
-- 5. Skopiuj UUID użytkownika
-- 6. Uruchom poniższe SQL z tym UUID:

/*
-- Zamień 'USER_UUID_TUTAJ' na prawdziwy UUID z kroku 5
INSERT INTO profiles (id, email, full_name, role, created_at)
VALUES (
  'USER_UUID_TUTAJ'::uuid,
  'admin@zzpwerkplaats.nl',
  'Administrator',
  'admin',
  NOW()
);
*/

-- OPCJA B: Przez SQL (jeśli masz dostęp do auth schema)
-- UWAGA: Wymaga funkcji serwerowych i może nie działać w SQL Editor

-- Funkcja pomocnicza do tworzenia konta admina
CREATE OR REPLACE FUNCTION create_admin_account(
  admin_email TEXT,
  admin_password TEXT,
  admin_name TEXT
) RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
  encrypted_password TEXT;
BEGIN
  -- Generuj UUID dla nowego użytkownika
  new_user_id := gen_random_uuid();
  
  -- Hash hasła (Supabase używa bcrypt)
  encrypted_password := crypt(admin_password, gen_salt('bf'));
  
  -- Utwórz użytkownika w auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    role,
    aud
  ) VALUES (
    new_user_id,
    '00000000-0000-0000-0000-000000000000',
    admin_email,
    encrypted_password,
    NOW(),
    NOW(),
    NOW(),
    'authenticated',
    'authenticated'
  );
  
  -- Utwórz profil
  INSERT INTO profiles (id, email, full_name, role, created_at)
  VALUES (new_user_id, admin_email, admin_name, 'admin', NOW());
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Użycie funkcji (odkomentuj i zmień dane):
/*
SELECT create_admin_account(
  'admin@zzpwerkplaats.nl',  -- email
  'Admin2025!SecurePass',     -- hasło (ZMIEŃ!)
  'Administrator Systemu'     -- imię
);
*/

-- =====================================================
-- WERYFIKACJA
-- =====================================================

-- Sprawdź czy stare konta zostały usunięte
SELECT 'Stare konta (powinno być 0):' AS check_type, COUNT(*) as count
FROM profiles 
WHERE email IN ('employer@test.nl', 'admin@zzp.nl', 'worker@test.nl')

UNION ALL

-- Sprawdź czy nowy admin istnieje
SELECT 'Nowy admin (powinno być 1):' AS check_type, COUNT(*) as count
FROM profiles 
WHERE email LIKE '%zzpwerkplaats.nl' AND role = 'admin';

-- Wyświetl wszystkich użytkowników (do weryfikacji)
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- =====================================================
-- NOTATKI
-- =====================================================
-- Po wykonaniu tego skryptu:
-- 1. Stare konta testowe (employer@test.nl, worker@test.nl, admin@zzp.nl) ZNIKNĄ
-- 2. Nowe konto admina będzie utworzone (jeśli użyjesz funkcji lub Supabase Dashboard)
-- 3. Nowe konta pracodawcy i pracownika MUSISZ utworzyć przez formularz rejestracji:
--    - Pracodawca: http://localhost:3003/register/employer
--    - Pracownik: http://localhost:3003/register/worker

-- BEZPIECZEŃSTWO:
-- - Admin powinien mieć SILNE hasło (min 12 znaków, duże/małe litery, cyfry, znaki specjalne)
-- - Email admina powinien być prawdziwy (nie testowy)
-- - Po utworzeniu admina, zmień hasło przez interfejs Supabase

-- =====================================================
-- SUKCES!
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Skrypt wykonany!';
  RAISE NOTICE '📝 Następne kroki:';
  RAISE NOTICE '1. Utwórz konto admina przez Supabase Dashboard (Authentication → Add User)';
  RAISE NOTICE '2. Zarejestruj pracodawcę przez: http://localhost:3003/register/employer';
  RAISE NOTICE '3. Zarejestruj pracownika przez: http://localhost:3003/register/worker';
END $$;
