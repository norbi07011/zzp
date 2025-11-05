-- ============================================
-- CHECK: Które policies już istnieją w bazie
-- ============================================

-- Sprawdź istniejące policies dla tabel projektowych
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN cmd = 'SELECT' THEN 'SELECT'
        WHEN cmd = 'INSERT' THEN 'INSERT'
        WHEN cmd = 'UPDATE' THEN 'UPDATE'
        WHEN cmd = 'DELETE' THEN 'DELETE'
        WHEN cmd = '*' THEN 'ALL'
        ELSE cmd
    END as command,
    roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'projects', 
    'project_members', 
    'project_tasks', 
    'project_chat_groups',
    'project_invites',
    'project_chat_messages'
)
ORDER BY tablename, policyname;
