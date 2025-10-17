-- ============================================
-- CHECK USER ROLES - Diagnostic Query
-- ============================================
-- This query checks if users have correct roles in profiles table
-- Run this in Supabase SQL Editor to diagnose the routing bug

-- 1. Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) AS profiles_table_exists;

-- 2. Count total profiles
SELECT COUNT(*) AS total_profiles FROM profiles;

-- 3. Check role distribution
SELECT 
  role,
  COUNT(*) AS user_count
FROM profiles
GROUP BY role
ORDER BY role;

-- 4. Show all profiles with their roles (limit 20)
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 20;

-- 5. Check if there are users in auth but not in profiles
SELECT 
  COUNT(*) AS auth_users_without_profiles
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.id = au.id
);

-- 6. List specific test accounts
SELECT 
  id,
  email,
  full_name,
  role
FROM profiles
WHERE email IN (
  'admin@zzp.nl',
  'employer@test.nl', 
  'worker@test.nl'
)
ORDER BY email;

-- 7. Check for NULL or invalid roles
SELECT 
  id,
  email,
  role,
  CASE 
    WHEN role IS NULL THEN 'NULL role!'
    WHEN role NOT IN ('admin', 'employer', 'worker') THEN 'Invalid role!'
    ELSE 'OK'
  END AS role_status
FROM profiles
WHERE role IS NULL OR role NOT IN ('admin', 'employer', 'worker');
