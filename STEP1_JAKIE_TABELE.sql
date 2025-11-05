-- ==========================================
-- STEP 1: SPRAWDŹ JAKIE TABELE ISTNIEJĄ
-- ==========================================
SELECT 
    tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
