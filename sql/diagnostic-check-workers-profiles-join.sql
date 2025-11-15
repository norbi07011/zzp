-- Diagnostic: Check workers and profiles data integrity
-- Run this in Supabase SQL Editor to verify data exists and RLS allows access

-- Step 1: Count total workers
SELECT COUNT(*) as total_workers FROM workers;

-- Step 2: Count workers with profiles
SELECT COUNT(*) as workers_with_profiles 
FROM workers w
WHERE w.profile_id IS NOT NULL;

-- Step 3: Show sample workers with profile data (CRITICAL: checks JOIN)
SELECT 
  w.id as worker_id,
  w.profile_id,
  w.specialization,
  w.verified,
  p.id as profile_id_from_profiles,
  p.full_name,
  p.email,
  p.role
FROM workers w
LEFT JOIN profiles p ON w.profile_id = p.id
LIMIT 5;

-- Step 4: Check if admin user exists and has role='admin'
SELECT id, email, full_name, role 
FROM profiles 
WHERE role = 'admin';

-- Step 5: Check current auth context (run as authenticated user)
SELECT 
  auth.uid() as current_user_id,
  (SELECT role FROM profiles WHERE id = auth.uid()) as current_user_role;

-- Step 6: Test RLS policies for workers table
-- (Run this AFTER confirming you're logged in as admin)
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  qual 
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'workers';
