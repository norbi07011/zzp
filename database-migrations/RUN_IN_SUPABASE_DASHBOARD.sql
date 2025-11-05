-- ============================================
-- QUICK DATABASE DIAGNOSIS
-- Uruchom w Supabase SQL Editor
-- ============================================

-- 1. TABELE BEZ RLS
SELECT 
    tablename as "Table Name",
    CASE 
        WHEN rowsecurity THEN '✅ Enabled'
        ELSE '❌ DISABLED'
    END as "RLS Status"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY rowsecurity, tablename;

-- 2. LICZBA POLICIES PER TABLE
SELECT 
    t.tablename as "Table Name",
    COALESCE(COUNT(p.policyname), 0) as "Policy Count",
    t.rowsecurity as "RLS Enabled"
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
WHERE t.schemaname = 'public'
GROUP BY t.tablename, t.rowsecurity
ORDER BY "Policy Count" DESC, t.tablename;

-- 3. FOREIGN KEYS (ISTNIEJĄCE)
SELECT
    tc.table_name as "From Table", 
    kcu.column_name as "From Column", 
    ccu.table_name as "To Table",
    ccu.column_name as "To Column"
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 4. TABELE BEZ PRIMARY KEY (jeśli są)
SELECT 
    t.table_name as "Table Without PK"
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc 
    ON t.table_name = tc.table_name 
    AND tc.constraint_type = 'PRIMARY KEY'
    AND tc.table_schema = 'public'
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
AND tc.constraint_name IS NULL;

-- 5. ORPHANED DATA CHECK (przykłady)

-- Workers bez profiles
SELECT 'workers without profiles' as issue, COUNT(*) as count
FROM workers w
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = w.profile_id);

-- Employers bez profiles
SELECT 'employers without profiles' as issue, COUNT(*) as count
FROM employers e
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = e.profile_id);

-- Job applications bez workers
SELECT 'job_applications without workers' as issue, COUNT(*) as count
FROM applications ja
WHERE NOT EXISTS (SELECT 1 FROM workers w WHERE w.id = ja.worker_id);

-- Job applications bez jobs
SELECT 'job_applications without jobs' as issue, COUNT(*) as count
FROM applications ja
WHERE NOT EXISTS (SELECT 1 FROM jobs j WHERE j.id = ja.job_id);

-- 6. KOLUMNY BEZ NOT NULL (wybrane istotne)
SELECT 
    table_name as "Table",
    column_name as "Column",
    data_type as "Type"
FROM information_schema.columns
WHERE table_schema = 'public'
AND is_nullable = 'YES'
AND column_name IN ('id', 'created_at', 'profile_id', 'user_id', 'owner_id')
ORDER BY table_name, column_name;

-- KONIEC DIAGNOSTYKI
SELECT '✅ Diagnosis complete - review results above' as status;
