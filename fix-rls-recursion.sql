-- ============================================
-- QUICK FIX: Disable problematic RLS policy
-- Date: 2025-10-29
-- Reason: Infinite recursion in projects RLS
-- ============================================

-- STEP 1: Disable RLS on projects table (temporary fix)
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- STEP 2: Check other RLS policies that might cause issues
SELECT schemaname, tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('projects', 'project_permissions', 'project_notifications')
ORDER BY tablename, policyname;