-- ============================================
-- QUICK FIX: Routing Problem - All Users See Worker Dashboard
-- ============================================
-- This script fixes the most common cause of the routing bug:
-- missing or incorrectly configured profiles table and RLS policies
--
-- CZAS WYKONANIA: ~30 sekund
-- BEZPIECZEŃSTWO: Idempotentne (można uruchamiać wielokrotnie)
--
-- INSTRUKCJA:
-- 1. Otwórz Supabase Dashboard → SQL Editor
-- 2. Skopiuj i wklej cały ten skrypt
-- 3. Kliknij "Run"
-- 4. Wyloguj się i zaloguj ponownie w aplikacji
-- ============================================

-- CZĘŚĆ 1: Upewnij się że tabela profiles istnieje
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employer', 'worker')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dodaj indexy (jeśli nie istnieją)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- CZĘŚĆ 2: Włącz RLS i ustaw polityki
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Usuń potencjalnie restrykcyjne polityki
DROP POLICY IF EXISTS "Users can only view own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles are private" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can do everything" ON profiles;

-- KLUCZOWA POLITYKA: Pozwól authenticated użytkownikom czytać wszystkie profile
-- To jest NIEZBĘDNE dla AuthContext.mapSupabaseUserToAppUser()
CREATE POLICY "Profiles are viewable by authenticated users"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Użytkownicy mogą aktualizować swój własny profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Admini mogą wszystko
CREATE POLICY "Admins can do everything"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- CZĘŚĆ 3: Synchronizuj profile z auth.users
-- ============================================

-- Dodaj profile dla użytkowników którzy istnieją w auth.users ale nie mają profilu
INSERT INTO profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'fullName',
    au.raw_user_meta_data->>'full_name',
    SPLIT_PART(au.email, '@', 1)
  ) AS full_name,
  COALESCE(
    au.raw_user_meta_data->>'role',
    'worker'
  ) AS role
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
)
ON CONFLICT (id) DO NOTHING;

-- CZĘŚĆ 4: Napraw role dla kont testowych (jeśli istnieją)
-- ============================================

-- Napraw admin@zzp.nl
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@zzp.nl' AND role != 'admin';

-- Napraw employer@test.nl
UPDATE profiles 
SET role = 'employer' 
WHERE email = 'employer@test.nl' AND role != 'employer';

-- Napraw worker@test.nl (dla pewności)
UPDATE profiles 
SET role = 'worker' 
WHERE email = 'worker@test.nl' AND role != 'worker';

-- CZĘŚĆ 5: Napraw NULL lub nieprawidłowe role
-- ============================================

-- Ustaw domyślną rolę dla NULL
UPDATE profiles 
SET role = 'worker' 
WHERE role IS NULL;

-- Usuń nieprawidłowe role (jeśli jakieś istnieją)
UPDATE profiles 
SET role = 'worker' 
WHERE role NOT IN ('admin', 'employer', 'worker');

-- ============================================
-- WERYFIKACJA WYNIKU
-- ============================================

-- Pokaż wszystkie profile z ich rolami
SELECT 
  email,
  role,
  full_name,
  created_at
FROM profiles
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'employer' THEN 2
    WHEN 'worker' THEN 3
  END,
  email;

-- Pokaż statystyki
SELECT 
  '✅ SUKCES! Tabela profiles skonfigurowana prawidłowo' AS status,
  COUNT(*) AS total_users,
  COUNT(CASE WHEN role = 'admin' THEN 1 END) AS admins,
  COUNT(CASE WHEN role = 'employer' THEN 1 END) AS employers,
  COUNT(CASE WHEN role = 'worker' THEN 1 END) AS workers
FROM profiles;

-- ============================================
-- 🎯 NASTĘPNE KROKI:
-- ============================================
-- 1. Wyloguj się z aplikacji (jeśli jesteś zalogowany)
-- 2. Zaloguj się jako admin@zzp.nl (hasło: test123)
-- 3. Sprawdź czy widzisz panel admina (/admin)
-- 4. Wyloguj i zaloguj jako employer@test.nl (hasło: test123)
-- 5. Sprawdź czy widzisz panel pracodawcy (/employer)
-- 6. Wyloguj i zaloguj jako worker@test.nl (hasło: test123)
-- 7. Sprawdź czy widzisz panel pracownika (/worker)
--
-- Jeśli nadal widzisz problem, sprawdź plik:
-- FIX_ROUTING_PROBLEM.md (szczegółowa diagnoza)
-- ============================================
