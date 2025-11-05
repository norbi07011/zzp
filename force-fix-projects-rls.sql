-- ==========================================
-- FORCE DISABLE RLS ON PROJECTS TABLE
-- ==========================================

-- 1. Drop all policies on projects table first
DROP POLICY IF EXISTS "select_employer_owned_projects" ON projects;
DROP POLICY IF EXISTS "select_worker_projects" ON projects; 
DROP POLICY IF EXISTS "select_public_projects" ON projects;
DROP POLICY IF EXISTS "insert_own_projects" ON projects;
DROP POLICY IF EXISTS "update_own_projects" ON projects;
DROP POLICY IF EXISTS "delete_own_projects" ON projects;

-- 2. Drop any policies that might reference project_permissions
DROP POLICY IF EXISTS "projects_read_policy" ON projects;
DROP POLICY IF EXISTS "projects_write_policy" ON projects;

-- 3. Disable RLS completely
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- 4. Check if there are any remaining policies
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'projects';

-- 5. Test query
SELECT id, title, owner_id FROM projects LIMIT 3;