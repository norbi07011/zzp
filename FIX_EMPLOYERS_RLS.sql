-- =====================================================
-- FIX RLS ON EMPLOYERS TABLE
-- =====================================================

-- 1. Sprawdź obecne polityki na employers
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'employers';

-- 2. Disable RLS (tymczasowo)
ALTER TABLE employers DISABLE ROW LEVEL SECURITY;

-- 3. Drop wszystkie polityki
DROP POLICY IF EXISTS "Employers can view own profile" ON employers;
DROP POLICY IF EXISTS "Employers can update own profile" ON employers;
DROP POLICY IF EXISTS "Users can view employer profiles" ON employers;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON employers;

-- 4. Enable RLS z prostymi politykami
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;

-- Employer może zobaczyć swój profil (przez user_id LUB profile_id)
CREATE POLICY "employers_select_own" ON employers
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id 
    OR auth.uid() = profile_id
  );

-- Employer może edytować swój profil
CREATE POLICY "employers_update_own" ON employers
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id 
    OR auth.uid() = profile_id
  );

-- Wszyscy mogą widzieć podstawowe info o pracodawcach (dla wyszukiwania)
CREATE POLICY "employers_select_all" ON employers
  FOR SELECT TO authenticated
  USING (true);

-- =====================================================
-- ✅ READY!
-- =====================================================
