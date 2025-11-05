-- =====================================================
-- FIX: Cleanup incomplete accountant registration
-- =====================================================
-- This fixes the case where auth user exists but accountant profile is missing

-- Step 1: Find users with role='accountant' but no accountant profile
SELECT 
  p.id as profile_id,
  p.email,
  p.full_name,
  p.role,
  a.id as accountant_id,
  CASE 
    WHEN a.id IS NULL THEN 'MISSING ACCOUNTANT PROFILE ❌'
    ELSE 'OK ✅'
  END as status
FROM profiles p
LEFT JOIN accountants a ON a.profile_id = p.id
WHERE p.role = 'accountant';

-- Step 2: DELETE incomplete registrations (if any found above)
-- UNCOMMENT and run if you see MISSING ACCOUNTANT PROFILE:

-- First get the auth user ID
-- SELECT id FROM auth.users WHERE email = 'acalendar14@gmail.com';

-- Then delete in this order:
-- DELETE FROM profiles WHERE email = 'acalendar14@gmail.com';
-- DELETE FROM auth.users WHERE email = 'acalendar14@gmail.com'; -- Requires service_role or Dashboard

-- OR easier: Go to Supabase Dashboard > Authentication > Users > Delete user
-- This will CASCADE delete profile automatically
