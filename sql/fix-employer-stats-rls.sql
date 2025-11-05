-- ============================================
-- FIX EMPLOYER REGISTRATION - RLS Policy
-- ============================================
-- Wklej w Supabase SQL Editor

-- 1. Check current policies on employer_stats
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'employer_stats';

-- 2. Enable RLS on employer_stats (if not already enabled)
ALTER TABLE employer_stats ENABLE ROW LEVEL SECURITY;

-- 3. Add INSERT policy - Allow authenticated users to create their own stats
CREATE POLICY "Users can insert their own employer stats"
ON employer_stats
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT profile_id FROM employers WHERE id = employer_id
  )
);

-- 4. Add SELECT policy - Users can view their own stats
CREATE POLICY "Users can view their own employer stats"
ON employer_stats
FOR SELECT
USING (
  auth.uid() IN (
    SELECT profile_id FROM employers WHERE id = employer_id
  )
);

-- 5. Add UPDATE policy - Users can update their own stats
CREATE POLICY "Users can update their own employer stats"
ON employer_stats
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT profile_id FROM employers WHERE id = employer_id
  )
);

-- Verify policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'employer_stats';
