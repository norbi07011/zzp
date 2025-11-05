-- =====================================================
-- FIX PROFILES INSERT POLICY
-- =====================================================
-- Dodaje INSERT policy dla tabeli profiles
-- Pozwala użytkownikom tworzyć swój profil podczas rejestracji

-- KROK 1: Usuń starą policy jeśli istnieje
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;

-- KROK 2: Utwórz nową INSERT policy
CREATE POLICY "Users can insert their own profile during registration"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- KROK 3: Sprawdź wszystkie policies dla profiles
SELECT 
  policyname,
  cmd,
  roles,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Oczekiwany wynik: Powinna być policy dla INSERT
-- policyname: "Users can insert their own profile during registration"
-- cmd: INSERT
-- roles: {authenticated}
-- with_check: (id = auth.uid())
