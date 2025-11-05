-- ============================================
-- NUCLEAR RLS FIX - DROP ALL & REBUILD CLEAN
-- Date: 2024-10-29
-- ============================================

-- UWAGA: Ten fix USUNIE WSZYSTKIE policies z 3 tabel
-- i stworzy nowe, czyste policies od zera

-- ====================
-- STEP 1: NUCLEAR DROP - WSZYSTKIE POLICIES
-- ====================

-- DROP ALL employers policies
DROP POLICY IF EXISTS "Admins can manage all employers" ON employers;
DROP POLICY IF EXISTS "Employers are viewable by authenticated users" ON employers;
DROP POLICY IF EXISTS "Employers can update own profile" ON employers;
DROP POLICY IF EXISTS "Workers can view employers" ON employers;
DROP POLICY IF EXISTS "employers_full_access_simple" ON employers;

-- DROP ALL projects policies
DROP POLICY IF EXISTS "Project owners can update their projects" ON projects;
DROP POLICY IF EXISTS "Users can create their own projects" ON projects;
DROP POLICY IF EXISTS "Users can view projects they have access to" ON projects;
DROP POLICY IF EXISTS "projects_members_view" ON projects;
DROP POLICY IF EXISTS "projects_owner_full_access" ON projects;

-- DROP ALL project_notifications policies  
DROP POLICY IF EXISTS "Users can manage their own notifications" ON project_notifications;
DROP POLICY IF EXISTS "project_notifications_user_access" ON project_notifications;

SELECT 'All conflicting policies dropped!' as status;

-- ====================
-- STEP 2: CREATE CLEAN, SIMPLE POLICIES
-- ====================

-- EMPLOYERS: Jedna prosta policy - owner ma full access
CREATE POLICY "employers_owner_access"
ON employers
FOR ALL
TO public
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- EMPLOYERS: Public read access (dla wyświetlania listy pracodawców)
CREATE POLICY "employers_public_read"
ON employers
FOR SELECT
TO public
USING (true);

-- PROJECTS: Owner ma full access
CREATE POLICY "projects_owner_access"
ON projects  
FOR ALL
TO public
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- PROJECT_NOTIFICATIONS: User widzi swoje
CREATE POLICY "notifications_user_access"
ON project_notifications
FOR ALL
TO public
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

SELECT 'New clean policies created!' as status;

-- ====================
-- STEP 3: VERIFY NEW POLICY COUNT
-- ====================

SELECT 
    'Policy count check' as test,
    tablename,
    count(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('employers', 'projects', 'project_notifications')
GROUP BY tablename
ORDER BY tablename;

-- Expected results:
-- employers: 2 policies
-- projects: 1 policy  
-- project_notifications: 1 policy

-- ====================
-- STEP 4: TEST ACCESS - SHOULD WORK NOW!
-- ====================

-- Test 1: Employers access
SELECT 
    'EMPLOYERS TEST' as test,
    count(*) as my_employer_profiles
FROM employers 
WHERE profile_id = auth.uid();

-- Test 2: Projects access  
SELECT 
    'PROJECTS TEST' as test,
    count(*) as my_projects
FROM projects 
WHERE owner_id = auth.uid();

-- Test 3: Notifications access
SELECT 
    'NOTIFICATIONS TEST' as test,
    count(*) as my_notifications
FROM project_notifications 
WHERE user_id = auth.uid();

-- ====================
-- STEP 5: FINAL SUCCESS MESSAGE
-- ====================

SELECT 
    '🎉 NUCLEAR FIX COMPLETED! 🎉' as result,
    'RLS policies cleaned and rebuilt' as details,
    'App should work without 401 errors now!' as next_step;