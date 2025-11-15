-- CRITICAL FIX: Admin RLS bypass policies for workers table JOIN with profiles
-- Issue: Admin panel shows "Unknown User" because profile data not returned in JOIN
-- Root cause: RLS policies may be blocking the nested select on profiles table

-- ============================================================================
-- STEP 1: Check existing RLS policies on workers table
-- ============================================================================
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
WHERE schemaname = 'public' 
  AND tablename IN ('workers', 'profiles')
ORDER BY tablename, policyname;

-- ============================================================================
-- STEP 2: Enable RLS (if not already enabled)
-- ============================================================================
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Create admin bypass policy for workers table (if not exists)
-- ============================================================================
DO $$
BEGIN
  -- Drop existing admin policy if it exists
  DROP POLICY IF EXISTS "admin_full_access_workers" ON workers;
  
  -- Create new admin bypass policy
  CREATE POLICY "admin_full_access_workers" ON workers
    FOR ALL 
    TO authenticated
    USING (
      (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
    )
    WITH CHECK (
      (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
    );
    
  RAISE NOTICE 'Admin policy created for workers table';
END $$;

-- ============================================================================
-- STEP 4: Create admin bypass policy for profiles table (CRITICAL FOR JOIN)
-- ============================================================================
DO $$
BEGIN
  -- Drop existing admin policy if it exists
  DROP POLICY IF EXISTS "admin_full_access_profiles" ON profiles;
  
  -- Create new admin bypass policy
  CREATE POLICY "admin_full_access_profiles" ON profiles
    FOR ALL 
    TO authenticated
    USING (
      (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
    )
    WITH CHECK (
      (SELECT role FROM profiles WHERE id = (select auth.uid())) = 'admin'
    );
    
  RAISE NOTICE 'Admin policy created for profiles table';
END $$;

-- ============================================================================
-- STEP 5: Verify admin user exists and has correct role
-- ============================================================================
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE role = 'admin';

-- ============================================================================
-- STEP 6: Test query that admin panel uses
-- ============================================================================
-- This query should return workers with profile data when run as admin user
SELECT 
  w.id as worker_id,
  w.profile_id,
  w.specialization,
  w.verified,
  p.id as profile_id_check,
  p.full_name,
  p.email,
  p.role
FROM workers w
LEFT JOIN profiles p ON w.profile_id = p.id
LIMIT 5;

-- ============================================================================
-- STEP 7: Test Supabase query syntax (exact syntax from workers.ts)
-- ============================================================================
-- NOTE: This is SQL representation of what Supabase client does
SELECT 
  w.*,
  jsonb_build_object(
    'id', p.id,
    'full_name', p.full_name,
    'email', p.email,
    'avatar_url', p.avatar_url,
    'role', p.role
  ) as profile
FROM workers w
LEFT JOIN profiles p ON w.profile_id = p.id
ORDER BY w.created_at DESC
LIMIT 5;
