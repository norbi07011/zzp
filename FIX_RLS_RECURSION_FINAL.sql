-- ============================================
-- FIX: Infinite Recursion in RLS Policies
-- Data: 2025-11-05
-- Problem: profiles <-> employer_profiles circular dependency
-- ============================================

-- KROK 1: WYŁĄCZ RLS TYMCZASOWO
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles DISABLE ROW LEVEL SECURITY;

-- KROK 2: USUŃ WSZYSTKIE STARE POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

DROP POLICY IF EXISTS "Employers can view own profile" ON employer_profiles;
DROP POLICY IF EXISTS "Employers can update own profile" ON employer_profiles;
DROP POLICY IF EXISTS "Employers can insert own profile" ON employer_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON employer_profiles;

-- KROK 3: WŁĄCZ RLS Z NOWYMI PROSTYMI POLICIES (BEZ RECURSION)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_profiles ENABLE ROW LEVEL SECURITY;

-- PROFILES: Proste policies bez sprawdzania innych tabel
CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT
TO authenticated
USING (true);  -- Wszyscy authenticated mogą czytać wszystkie profile

CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- EMPLOYER_PROFILES: Proste policies bez sprawdzania profiles
CREATE POLICY "employer_profiles_select_own"
ON employer_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);  -- Tylko bezpośrednie sprawdzenie user_id

CREATE POLICY "employer_profiles_update_own"
ON employer_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "employer_profiles_insert_own"
ON employer_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- KROK 4: REFRESH SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

-- COMMIT
COMMIT;

-- ============================================
-- ✅ GOTOWE! Odśwież przeglądarkę i spróbuj się zalogować
-- ============================================
