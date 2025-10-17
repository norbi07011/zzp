-- ================================
-- CHECK AND FIX USER PROFILES
-- ================================

-- 1. CHECK: List all users from auth.users
SELECT 
  id as user_id,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;

-- 2. CHECK: Which users have profiles?
SELECT 
  u.id as user_id,
  u.email,
  p.id as profile_id,
  p.full_name,
  p.role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC
LIMIT 10;

-- 3. CHECK: Which users have worker records?
SELECT 
  u.id as user_id,
  u.email,
  p.full_name,
  w.id as worker_id,
  w.subscription_tier,
  w.subscription_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.workers w ON u.id = w.profile_id
WHERE p.role = 'worker' OR w.id IS NOT NULL
ORDER BY u.created_at DESC;

-- 4. FIX: Create missing profiles for users without them
-- (Run this after checking which users need profiles)
-- REPLACE 'USER_EMAIL_HERE' with actual email from step 1

-- Example:
-- INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
-- SELECT 
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'full_name', email),
--   'worker', -- or 'employer' or 'admin'
--   NOW(),
--   NOW()
-- FROM auth.users
-- WHERE email = 'USER_EMAIL_HERE'
-- ON CONFLICT (id) DO NOTHING;

-- 5. FIX: Create missing worker records for profiles
-- (Run this after creating profiles)

-- Example:
-- INSERT INTO public.workers (profile_id, subscription_tier, subscription_status, created_at, updated_at)
-- SELECT 
--   id,
--   'premium', -- or 'basic'
--   'active',
--   NOW(),
--   NOW()
-- FROM public.profiles
-- WHERE role = 'worker'
-- AND id NOT IN (SELECT profile_id FROM public.workers)
-- ON CONFLICT (profile_id) DO NOTHING;

-- ================================
-- QUICK FIX FOR LAST LOGGED IN USER
-- ================================

-- This will create profile + worker for the most recent user
DO $$
DECLARE
  last_user_id UUID;
  last_user_email TEXT;
BEGIN
  -- Get last logged in user
  SELECT id, email INTO last_user_id, last_user_email
  FROM auth.users
  ORDER BY last_sign_in_at DESC NULLS LAST
  LIMIT 1;

  RAISE NOTICE 'Last user: % (%)', last_user_email, last_user_id;

  -- Create profile if missing
  INSERT INTO public.profiles (id, email, full_name, role, created_at, updated_at)
  VALUES (
    last_user_id,
    last_user_email,
    COALESCE(last_user_email, 'User'),
    'worker',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET updated_at = NOW();

  RAISE NOTICE 'Profile created/updated for %', last_user_email;

  -- Create worker record if missing
  INSERT INTO public.workers (profile_id, subscription_tier, subscription_status, created_at, updated_at)
  VALUES (
    last_user_id,
    'premium', -- Set to premium since payment was successful
    'active',
    NOW(),
    NOW()
  )
  ON CONFLICT (profile_id) DO UPDATE
  SET 
    subscription_tier = 'premium',
    subscription_status = 'active',
    updated_at = NOW();

  RAISE NOTICE 'Worker record created/updated for %', last_user_email;
END $$;

-- 6. VERIFY: Check if it worked
SELECT 
  u.email,
  p.full_name,
  p.role,
  w.subscription_tier,
  w.subscription_status,
  w.created_at as worker_created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.workers w ON u.id = w.profile_id
ORDER BY u.last_sign_in_at DESC NULLS LAST
LIMIT 5;
