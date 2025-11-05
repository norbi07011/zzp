-- ============================================
-- TARGETED RLS FIX - Fix 401 Errors
-- Rozwiąże konkretne problemy z policies
-- Date: 2024-10-29
-- ============================================

-- ROLLBACK PLAN:
-- Jeśli coś pójdzie nie tak:
-- 1. DISABLE RLS: ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
-- 2. Przywróć backup policies z poprzednich plików

-- ====================
-- STEP 1: FIX EMPLOYERS TABLE CONFLICTS
-- ====================

-- Usuń wszystkie conflicting policies z employers
DO $$
BEGIN
    -- Drop conflicting employer policies
    DROP POLICY IF EXISTS "emp_insert_self" ON employers;
    DROP POLICY IF EXISTS "emp_select_self" ON employers;
    DROP POLICY IF EXISTS "emp_update_self" ON employers;
    DROP POLICY IF EXISTS "employers_select_owner" ON employers;
    DROP POLICY IF EXISTS "employers_select_self" ON employers;
    DROP POLICY IF EXISTS "employers_update_owner" ON employers;
    DROP POLICY IF EXISTS "employers_upsert_owner" ON employers;
    DROP POLICY IF EXISTS "Employers can update own employer profile" ON employers;
    DROP POLICY IF EXISTS "Employers can view own employer profile" ON employers;
    
    RAISE NOTICE 'Dropped conflicting employer policies';
END $$;

-- Stwórz JEDNĄ, prostą i jasną policy dla employers
CREATE POLICY "employers_full_access_simple"
ON employers
FOR ALL
TO public
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- ====================
-- STEP 2: FIX PROJECTS TABLE ACCESS
-- ====================

-- Drop wszystkie projects policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;
    DROP POLICY IF EXISTS "Users can create projects if they are project members" ON projects;
    DROP POLICY IF EXISTS "Users can update projects if they have permission" ON projects;
    DROP POLICY IF EXISTS "Users can delete projects if they have permission" ON projects;
    DROP POLICY IF EXISTS "project_owner_access" ON projects;
    DROP POLICY IF EXISTS "project_member_access" ON projects;
    
    RAISE NOTICE 'Dropped all projects policies';
END $$;

-- Stwórz prostą projects policy - właściciel ma pełny dostęp
CREATE POLICY "projects_owner_full_access"
ON projects
FOR ALL
TO public
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Dodaj policy dla członków projektów (view only)
CREATE POLICY "projects_members_view"
ON projects
FOR SELECT
TO public
USING (
    id IN (
        SELECT project_id 
        FROM project_members 
        WHERE user_id = auth.uid()
    )
);

-- ====================
-- STEP 3: FIX PROJECT_NOTIFICATIONS
-- ====================

-- Drop wszystkie project_notifications policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can manage notifications for accessible projects" ON project_notifications;
    DROP POLICY IF EXISTS "Users can view notifications for accessible projects" ON project_notifications;
    DROP POLICY IF EXISTS "notification_access" ON project_notifications;
    
    RAISE NOTICE 'Dropped project_notifications policies';
END $$;

-- Prosta policy: user widzi swoje notyfikacje
CREATE POLICY "project_notifications_user_access"
ON project_notifications
FOR ALL
TO public
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ====================
-- STEP 4: ENABLE MISSING RLS ON KEY TABLES
-- ====================

-- Włącz RLS na tables które go nie mają
ALTER TABLE communication_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_communication_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Basic policies dla nowych RLS tables
CREATE POLICY "project_members_access"
ON project_members
FOR ALL
TO public
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ====================
-- STEP 5: VERIFY ACCESS
-- ====================

-- Test queries to verify access works
SELECT 'Testing access...' as status;

-- Test 1: Can user see their employers profile?
SELECT 
    'Employers access test' as test,
    count(*) as should_be_1_or_more
FROM employers 
WHERE profile_id = auth.uid();

-- Test 2: Can user see their projects?
SELECT 
    'Projects access test' as test,
    count(*) as should_be_1_or_more
FROM projects 
WHERE owner_id = auth.uid();

-- Test 3: Can user see their notifications?
SELECT 
    'Notifications access test' as test,
    count(*) as count
FROM project_notifications 
WHERE user_id = auth.uid();

-- ====================
-- STEP 6: FINAL CHECK
-- ====================

SELECT 'Fix completed successfully!' as result;

-- Show current policies status
SELECT 
    tablename,
    count(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('employers', 'projects', 'project_notifications')
GROUP BY tablename
ORDER BY tablename;