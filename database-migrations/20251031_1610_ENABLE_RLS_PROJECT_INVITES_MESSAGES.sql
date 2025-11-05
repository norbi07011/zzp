-- ============================================
-- QUICK FIX: Enable RLS dla 2 tabel z policies
-- Date: 2025-10-31
-- ============================================

BEGIN;

-- Te tabele mają już policies, tylko brakuje ENABLE RLS
ALTER TABLE project_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_chat_messages ENABLE ROW LEVEL SECURITY;

-- Weryfikacja
SELECT 
    t.tablename,
    CASE WHEN t.rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status,
    COUNT(p.policyname) as policies
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
AND t.tablename IN ('project_invites', 'project_chat_messages')
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

COMMIT;

SELECT '✅ RLS enabled for project_invites and project_chat_messages' as status;
