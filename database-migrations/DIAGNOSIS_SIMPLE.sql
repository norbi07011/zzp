-- ============================================
-- SIMPLE DATABASE DIAGNOSIS - ONE QUERY
-- Uruchom w Supabase SQL Editor
-- ============================================

-- Wszystkie tabele z ich statusem RLS i liczba policies
SELECT 
    t.tablename as "Table",
    CASE WHEN t.rowsecurity THEN '✅' ELSE '❌' END as "RLS",
    COALESCE(COUNT(p.policyname), 0) as "Policies"
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.rowsecurity DESC, "Policies" DESC, t.tablename;
