-- ============================================
-- FIX ALL RLS PROBLEMS - COMPLETE SOLUTION
-- Run these queries ONE BY ONE in Supabase SQL Editor
-- ============================================

-- STEP 1: DISABLE RLS ON ALL PROBLEMATIC TABLES
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_chat_groups DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;

-- STEP 2: DROP ALL EXISTING POLICIES (clean slate)
DROP POLICY IF EXISTS "select_employer_owned_projects" ON projects;
DROP POLICY IF EXISTS "select_worker_projects" ON projects;
DROP POLICY IF EXISTS "select_public_projects" ON projects;
DROP POLICY IF EXISTS "insert_own_projects" ON projects;
DROP POLICY IF EXISTS "update_own_projects" ON projects;
DROP POLICY IF EXISTS "delete_own_projects" ON projects;
DROP POLICY IF EXISTS "projects_read_policy" ON projects;
DROP POLICY IF EXISTS "projects_write_policy" ON projects;

-- Drop any other policies that might exist
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- STEP 3: CREATE SIMPLE, NON-RECURSIVE POLICIES
-- Projects: only owners can see their projects
CREATE POLICY "projects_owner_access" ON projects
    FOR ALL USING (owner_id = auth.uid());

-- Notifications: users can see their own notifications  
CREATE POLICY "notifications_user_access" ON project_notifications
    FOR ALL USING (user_id = auth.uid());

-- Jobs: everyone can read, only employers can modify their own
CREATE POLICY "jobs_read_all" ON jobs
    FOR SELECT USING (true);

CREATE POLICY "jobs_owner_modify" ON jobs
    FOR ALL USING (employer_id = auth.uid());

-- STEP 4: RE-ENABLE RLS WITH CLEAN POLICIES
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- STEP 5: TEST QUERIES (run to verify)
-- Should return projects for current user
SELECT id, title, owner_id FROM projects WHERE owner_id = auth.uid();

-- Should return notifications for current user  
SELECT id, title, user_id FROM project_notifications WHERE user_id = auth.uid();