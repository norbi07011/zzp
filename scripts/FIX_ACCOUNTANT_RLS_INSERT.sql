-- =====================================================
-- FIX: Add INSERT policy for accountants table
-- =====================================================
-- Problem: Users cannot register as accountant because there's no INSERT policy
-- Solution: Add policy allowing authenticated users to create their own accountant profile

-- Add INSERT policy for accountants
CREATE POLICY "Authenticated users can create own accountant profile"
  ON accountants FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Verify policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'accountants'
ORDER BY cmd, policyname;
