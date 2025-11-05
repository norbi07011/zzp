-- =====================================================
-- CHECK IF USER EXISTS - Debug Script
-- =====================================================
-- Run this in Supabase SQL Editor to check if acalendar14@gmail.com exists

-- 1. Check in auth.users (Supabase Auth table)
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'role' as role
FROM auth.users 
WHERE email = 'acalendar14@gmail.com';

-- 2. Check in profiles table
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles 
WHERE email = 'acalendar14@gmail.com';

-- 3. Check in accountants table
SELECT 
  a.id,
  a.profile_id,
  a.full_name,
  a.email,
  a.is_active,
  a.created_at
FROM accountants a
WHERE a.email = 'acalendar14@gmail.com';

-- 4. Count total users
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM profiles) as profiles_count,
  (SELECT COUNT(*) FROM accountants) as accountants_count;

-- =====================================================
-- TO DELETE USER (if needed):
-- =====================================================
-- Run these commands in order:

-- Step 1: Delete from accountants table
-- DELETE FROM accountants WHERE email = 'acalendar14@gmail.com';

-- Step 2: Delete from profiles table  
-- DELETE FROM profiles WHERE email = 'acalendar14@gmail.com';

-- Step 3: Delete from auth.users (requires service_role or dashboard)
-- This must be done via Supabase Dashboard > Authentication > Users
-- Or use service_role key with auth.admin API
