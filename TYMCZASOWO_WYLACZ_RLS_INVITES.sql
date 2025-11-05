-- ============================================
-- SZYBKI FIX: Wyłącz RLS dla project_invites
-- (tymczasowe rozwiązanie na czas developmentu)
-- ============================================

-- Wyłącz RLS dla project_invites
ALTER TABLE project_invites DISABLE ROW LEVEL SECURITY;

-- Sprawdź status
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'project_invites'
    AND schemaname = 'public';
