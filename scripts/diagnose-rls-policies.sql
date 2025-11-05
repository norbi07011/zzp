-- ============================================
-- DIAGNOSIS: Posts RLS Policy Problem
-- Date: 2025-10-28
-- Author: AI Copilot
-- ============================================

-- STEP 1: Check if RLS is enabled on posts table
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  relowner
FROM pg_tables pt
JOIN pg_class pc ON pc.relname = pt.tablename
WHERE tablename = 'posts';

-- STEP 2: Show ALL policies for posts table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as policy_command,
  qual as using_expression,
  with_check as with_check_expression
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY cmd, policyname;

-- STEP 3: Check what auth.uid() returns (should be null for anon)
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role;

-- STEP 4: Check what our test user looks like
SELECT 
  id,
  email,
  role,
  created_at
FROM profiles 
WHERE id = 'e15f1bef-4268-49c4-ad4f-788494342b9d';

-- STEP 5: Check employer record for our test user
SELECT 
  id,
  profile_id,
  company_name,
  created_at
FROM employers 
WHERE profile_id = 'e15f1bef-4268-49c4-ad4f-788494342b9d';

-- STEP 6: Test the RLS policy logic manually
-- This simulates what the INSERT policy should check
SELECT 
  'Auth UID check' as test,
  auth.uid() as auth_uid,
  CASE 
    WHEN auth.uid() IS NULL THEN 'FAIL: No authenticated user'
    WHEN auth.uid() = 'e15f1bef-4268-49c4-ad4f-788494342b9d' THEN 'PASS: Auth UID matches'
    ELSE 'FAIL: Auth UID does not match'
  END as result;

SELECT 
  'Employer existence check' as test,
  EXISTS(
    SELECT 1 FROM employers 
    WHERE profile_id = 'e15f1bef-4268-49c4-ad4f-788494342b9d'
  ) as employer_exists;

-- STEP 7: Check if there are any RLS policies that might be blocking
-- Look for policies that check auth.uid() = author_id
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'posts' 
  AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%');

-- STEP 8: Try to understand the exact policy that's failing
-- Show the policy expressions in readable format
SELECT 
  policyname || ' (' || cmd || ')' as policy_info,
  COALESCE(qual, 'No USING clause') as using_clause,
  COALESCE(with_check, 'No WITH CHECK clause') as with_check_clause
FROM pg_policies 
WHERE tablename = 'posts'
ORDER BY cmd;