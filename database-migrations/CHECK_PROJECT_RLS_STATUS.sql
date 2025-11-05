-- ============================================
-- CHECK: RLS status dla tabel projektowych
-- ============================================

SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'projects', 
    'project_members', 
    'project_tasks', 
    'project_chat_groups'
)
ORDER BY tablename;
