-- ============================================
-- MIGRATION: Fix Posts RLS Policies 
-- Date: 2025-10-28
-- Author: AI Copilot
-- ============================================

-- ROLLBACK PLAN:
-- DROP POLICY "Employers can create posts" ON posts;
-- DROP POLICY "Accountants can create posts" ON posts;
-- DROP POLICY "Authors can update their own posts" ON posts;
-- DROP POLICY "Authors can delete their own posts" ON posts;
-- [Restore original policies from CREATE_FEED_SYSTEM.sql]

-- PROBLEM IDENTIFIED:
-- Current policies check author_id against employer.id (wrong)
-- Should check author_id against employer.profile_id (correct)
-- Because posts.author_id = profile_id, not employer.id

-- STEP 1: Remove incorrect policies
DROP POLICY IF EXISTS "Employers can create posts" ON posts;
DROP POLICY IF EXISTS "Accountants can create posts" ON posts;
DROP POLICY IF EXISTS "Authors can update their own posts" ON posts;
DROP POLICY IF EXISTS "Authors can delete their own posts" ON posts;

-- STEP 2: Create corrected policies

-- Employers can create posts (FIXED)
CREATE POLICY "Employers can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    author_type = 'employer' 
    AND author_id = auth.uid()
    AND EXISTS (SELECT 1 FROM employers WHERE profile_id = auth.uid())
  );

-- Accountants can create posts (FIXED)
CREATE POLICY "Accountants can create posts"
  ON posts FOR INSERT
  WITH CHECK (
    author_type = 'accountant' 
    AND author_id = auth.uid()
    AND EXISTS (SELECT 1 FROM accountants WHERE profile_id = auth.uid())
  );

-- Authors can update their own posts (FIXED)
CREATE POLICY "Authors can update their own posts"
  ON posts FOR UPDATE
  USING (
    author_id = auth.uid()
    AND (
      (author_type = 'employer' AND EXISTS (SELECT 1 FROM employers WHERE profile_id = auth.uid()))
      OR
      (author_type = 'accountant' AND EXISTS (SELECT 1 FROM accountants WHERE profile_id = auth.uid()))
    )
  );

-- Authors can delete their own posts (FIXED)
CREATE POLICY "Authors can delete their own posts"
  ON posts FOR DELETE
  USING (
    author_id = auth.uid()
    AND (
      (author_type = 'employer' AND EXISTS (SELECT 1 FROM employers WHERE profile_id = auth.uid()))
      OR
      (author_type = 'accountant' AND EXISTS (SELECT 1 FROM accountants WHERE profile_id = auth.uid()))
    )
  );

-- STEP 3: Verify policies are working
-- Test with a known employer profile_id
SELECT 
  'Policy verification' as test,
  'e15f1bef-4268-49c4-ad4f-788494342b9d' as test_profile_id,
  EXISTS (SELECT 1 FROM employers WHERE profile_id = 'e15f1bef-4268-49c4-ad4f-788494342b9d') as employer_exists;

-- STEP 4: Show corrected policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'posts' 
  AND cmd = 'INSERT'
ORDER BY policyname;