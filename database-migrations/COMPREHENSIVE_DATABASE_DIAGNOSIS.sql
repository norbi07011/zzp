-- ============================================
-- COMPREHENSIVE DATABASE DIAGNOSIS
-- Date: 2025-10-31
-- Purpose: Identify all database integrity issues
-- ============================================

-- ==================================================
-- SECTION 1: TABLES WITHOUT RLS POLICIES
-- ==================================================
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false
ORDER BY tablename;

-- ==================================================
-- SECTION 2: FOREIGN KEY ANALYSIS
-- ==================================================

-- List all foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ==================================================
-- SECTION 3: MISSING FOREIGN KEYS (Expected but not present)
-- ==================================================

-- Check profiles table
SELECT 'profiles: missing FK to auth.users' as issue, COUNT(*) as records
FROM profiles
WHERE id NOT IN (SELECT id FROM auth.users);

-- Check workers table
SELECT 'workers: profile_id not in profiles' as issue, COUNT(*) as records
FROM workers
WHERE profile_id NOT IN (SELECT id FROM profiles);

-- Check employers table
SELECT 'employers: profile_id not in profiles' as issue, COUNT(*) as records
FROM employers
WHERE profile_id NOT IN (SELECT id FROM profiles);

-- Check jobs table
SELECT 'jobs: employer_id not in employers' as issue, COUNT(*) as records
FROM jobs
WHERE employer_id IS NOT NULL
AND employer_id NOT IN (SELECT id FROM employers);

-- Check job_applications table
SELECT 'job_applications: worker_id not in workers' as issue, COUNT(*) as records
FROM job_applications
WHERE worker_id NOT IN (SELECT id FROM workers);

SELECT 'job_applications: job_id not in jobs' as issue, COUNT(*) as records
FROM job_applications
WHERE job_id NOT IN (SELECT id FROM jobs);

-- Check messages table (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages') THEN
        RAISE NOTICE 'Checking messages table...';
        -- Check sender/receiver references
    END IF;
END $$;

-- ==================================================
-- SECTION 4: NOT NULL CONSTRAINTS ANALYSIS
-- ==================================================

SELECT 
    table_name,
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND is_nullable = 'YES'
AND column_name IN ('created_at', 'updated_at', 'id')
ORDER BY table_name, column_name;

-- ==================================================
-- SECTION 5: UNIQUE CONSTRAINTS ANALYSIS
-- ==================================================

SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ==================================================
-- SECTION 6: INDEXES ANALYSIS
-- ==================================================

SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ==================================================
-- SECTION 7: ORPHANED DATA CHECK
-- ==================================================

-- Workers without profiles
SELECT 'Workers without profiles' as issue, COUNT(*) as count
FROM workers w
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = w.profile_id);

-- Employers without profiles
SELECT 'Employers without profiles' as issue, COUNT(*) as count
FROM employers e
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = e.profile_id);

-- Jobs without employers
SELECT 'Jobs without employers' as issue, COUNT(*) as count
FROM jobs j
WHERE employer_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM employers e WHERE e.id = j.employer_id);

-- Job applications without workers
SELECT 'Job applications without workers' as issue, COUNT(*) as count
FROM job_applications ja
WHERE NOT EXISTS (SELECT 1 FROM workers w WHERE w.id = ja.worker_id);

-- Job applications without jobs
SELECT 'Job applications without jobs' as issue, COUNT(*) as count
FROM job_applications ja
WHERE NOT EXISTS (SELECT 1 FROM jobs j WHERE j.id = ja.job_id);

-- ==================================================
-- SECTION 8: PROJECT TABLES INTEGRITY
-- ==================================================

-- Project members without projects
SELECT 'Project members without projects' as issue, COUNT(*) as count
FROM project_members pm
WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = pm.project_id);

-- Project members without profiles
SELECT 'Project members without profiles' as issue, COUNT(*) as count
FROM project_members pm
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = pm.profile_id);

-- Project invites without projects
SELECT 'Project invites without projects' as issue, COUNT(*) as count
FROM project_invites pi
WHERE NOT EXISTS (SELECT 1 FROM projects p WHERE p.id = pi.project_id);

-- Project invites with invalid inviter
SELECT 'Project invites with invalid inviter' as issue, COUNT(*) as count
FROM project_invites pi
WHERE inviter_profile_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = pi.inviter_profile_id);

-- Project invites with invalid invitee
SELECT 'Project invites with invalid invitee' as issue, COUNT(*) as count
FROM project_invites pi
WHERE invitee_profile_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = pi.invitee_profile_id);

-- ==================================================
-- SECTION 9: TRIGGER ANALYSIS
-- ==================================================

SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ==================================================
-- SECTION 10: POLICIES COUNT PER TABLE
-- ==================================================

SELECT 
    schemaname,
    tablename,
    COUNT(policyname) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY policy_count DESC, tablename;

-- ==================================================
-- SECTION 11: EXISTING POLICIES DETAILS
-- ==================================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ==================================================
-- END OF DIAGNOSIS
-- ==================================================
