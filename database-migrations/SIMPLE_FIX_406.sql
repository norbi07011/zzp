-- =========================================
-- SUPER SIMPLE FIX: 406 Errors
-- =========================================
-- KROK 1: Uruchom TO aby zobaczyć które tabele masz
-- =========================================

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('workers', 'certificates', 'worker_profiles', 'profiles', 'employers')
ORDER BY table_name;

-- =========================================
-- KROK 2: Fix RLS dla WORKERS table (najważniejsza)
-- =========================================

-- Enable RLS
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "Workers can view own data" ON workers;
DROP POLICY IF EXISTS "Workers can update own data" ON workers;
DROP POLICY IF EXISTS "Public can view workers" ON workers;
DROP POLICY IF EXISTS "Admins can do all on workers" ON workers;

-- Create policies
CREATE POLICY "Workers can view own data"
  ON workers FOR SELECT
  USING (auth.uid() = profile_id);

CREATE POLICY "Workers can update own data"
  ON workers FOR UPDATE
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Public can view workers"
  ON workers FOR SELECT
  USING (true);

CREATE POLICY "Admins can do all on workers"
  ON workers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- VERIFICATION
-- =========================================

SELECT 'SUCCESS! Policies created:' as status;

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE tablename = 'workers'
ORDER BY policyname;
