-- ============================================
-- WYŁĄCZ RLS DLA communication_projects
-- (tymczasowo na czas developmentu)
-- ============================================

-- Wyłącz RLS dla communication_projects
ALTER TABLE communication_projects DISABLE ROW LEVEL SECURITY;

-- Sprawdź status
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'communication_projects'
    AND schemaname = 'public';
