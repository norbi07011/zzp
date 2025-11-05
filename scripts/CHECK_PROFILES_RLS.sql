-- =====================================================
-- CHECK PROFILES RLS POLICIES
-- =====================================================
-- Sprawdza wszystkie RLS policies dla tabeli profiles

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
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- Sprawdź czy RLS jest włączone
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'profiles';

-- =====================================================
-- MOŻLIWE ROZWIĄZANIE: Dodaj INSERT policy dla profiles
-- =====================================================
-- Jeśli brakuje INSERT policy, wykonaj:

/*
CREATE POLICY "Users can create their own profile during registration"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
*/

-- Alternatywnie, jeśli policy istnieje ale jest źle skonfigurowana:
/*
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
*/
