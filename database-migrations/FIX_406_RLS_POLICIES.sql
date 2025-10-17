-- =========================================
-- QUICK FIX: 406 Not Acceptable Errors
-- =========================================
-- Data: 2025-01-29
-- Naprawia: RLS policies dla certificates i worker_profiles
-- FIXED: Sprawdza czy tabele istnieją PRZED utworzeniem policies
-- =========================================

-- =========================================
-- FIX 1: CERTIFICATES TABLE RLS (tylko jeśli tabela istnieje)
-- =========================================

DO $$ 
BEGIN
  -- Sprawdź czy tabela certificates istnieje
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'certificates'
  ) THEN
    
    -- Enable RLS
    ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
    
    -- Drop old policies (clean slate)
    DROP POLICY IF EXISTS "Workers can view own certificates" ON certificates;
    DROP POLICY IF EXISTS "Workers can insert own certificates" ON certificates;
    DROP POLICY IF EXISTS "Workers can update own certificates" ON certificates;
    DROP POLICY IF EXISTS "Workers can delete own certificates" ON certificates;
    DROP POLICY IF EXISTS "Admins can do all on certificates" ON certificates;
    DROP POLICY IF EXISTS "Public can view certificates" ON certificates;
    
    -- Create NEW policies:
    
    -- 1. Workers can view their own certificates
    CREATE POLICY "Workers can view own certificates"
      ON certificates
      FOR SELECT
      USING (auth.uid() = worker_id);
    
    -- 2. Workers can insert their own certificates
    CREATE POLICY "Workers can insert own certificates"
      ON certificates
      FOR INSERT
      WITH CHECK (auth.uid() = worker_id);
    
    -- 3. Workers can update their own certificates
    CREATE POLICY "Workers can update own certificates"
      ON certificates
      FOR UPDATE
      USING (auth.uid() = worker_id)
      WITH CHECK (auth.uid() = worker_id);
    
    -- 4. Workers can delete their own certificates
    CREATE POLICY "Workers can delete own certificates"
      ON certificates
      FOR DELETE
      USING (auth.uid() = worker_id);
    
    -- 5. Admins can do everything
    CREATE POLICY "Admins can do all on certificates"
      ON certificates
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    
    RAISE NOTICE '✅ CERTIFICATES: RLS policies created successfully';
    
  ELSE
    RAISE NOTICE '⚠️  SKIPPED: Table "certificates" does not exist';
  END IF;
END $$;

-- =========================================
-- FIX 2: WORKER_PROFILES TABLE RLS (jeśli istnieje)
-- =========================================

DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'worker_profiles'
  ) THEN
    
    -- Enable RLS
    ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
    
    -- Drop old policies
    DROP POLICY IF EXISTS "Workers can view own profile" ON worker_profiles;
    DROP POLICY IF EXISTS "Workers can update own profile" ON worker_profiles;
    DROP POLICY IF EXISTS "Admins can view all profiles" ON worker_profiles;
    DROP POLICY IF EXISTS "Admins can do all on profiles" ON worker_profiles;
    
    -- Create NEW policies
    CREATE POLICY "Workers can view own profile"
      ON worker_profiles
      FOR SELECT
      USING (auth.uid() = user_id);
    
    CREATE POLICY "Workers can update own profile"
      ON worker_profiles
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Admins can do all on profiles"
      ON worker_profiles
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    
    RAISE NOTICE '✅ WORKER_PROFILES: RLS policies created successfully';
      
  ELSE
    RAISE NOTICE '⚠️  SKIPPED: Table "worker_profiles" does not exist';
  END IF;
END $$;

-- =========================================
-- FIX 3: WORKERS TABLE RLS (główna tabela)
-- =========================================

DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'workers'
  ) THEN
    
    -- Enable RLS
    ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
    
    -- Drop old policies
    DROP POLICY IF EXISTS "Workers can view own data" ON workers;
    DROP POLICY IF EXISTS "Workers can update own data" ON workers;
    DROP POLICY IF EXISTS "Public can view workers" ON workers;
    DROP POLICY IF EXISTS "Admins can do all on workers" ON workers;
    
    -- Create NEW policies
    
    -- Workers can view their own row
    CREATE POLICY "Workers can view own data"
      ON workers
      FOR SELECT
      USING (auth.uid() = profile_id);
    
    -- Workers can update their own row
    CREATE POLICY "Workers can update own data"
      ON workers
      FOR UPDATE
      USING (auth.uid() = profile_id)
      WITH CHECK (auth.uid() = profile_id);
    
    -- Public can view all workers (for employer browsing)
    CREATE POLICY "Public can view workers"
      ON workers
      FOR SELECT
      USING (true);
    
    -- Admins can do everything
    CREATE POLICY "Admins can do all on workers"
      ON workers
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE id = auth.uid() AND role = 'admin'
        )
      );
    
    RAISE NOTICE '✅ WORKERS: RLS policies created successfully';
      
  ELSE
    RAISE NOTICE '⚠️  SKIPPED: Table "workers" does not exist';
  END IF;
END $$;

-- =========================================
-- VERIFICATION: Check if policies are active
-- =========================================

SELECT 
  '✅ Active RLS Policies:' as status;

SELECT 
  tablename, 
  policyname, 
  permissive, 
  cmd
FROM pg_policies
WHERE tablename IN ('certificates', 'worker_profiles', 'workers')
ORDER BY tablename, policyname;

-- =========================================
-- SHOW WHICH TABLES HAVE RLS ENABLED
-- =========================================

SELECT 
  '✅ Tables with RLS enabled:' as status;

SELECT 
  tablename,
  CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('certificates', 'worker_profiles', 'workers', 'profiles', 'employers')
ORDER BY tablename;

-- =========================================
-- MIGRATION COMPLETE ✅
-- =========================================

SELECT '✅ Migration completed! Check results above.' as final_status;
