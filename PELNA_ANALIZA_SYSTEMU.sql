-- ============================================
-- PEŁNA ANALIZA SYSTEMU ZZP WERKPLAATS
-- Data: 2025-10-31
-- ============================================

-- ===== CZĘŚĆ 1: WSZYSTKIE TABELE =====
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;

-- ===== CZĘŚĆ 2: KOLUMNY DLA TABEL PROJEKTOWYCH =====
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('communication_projects', 'project_tasks', 'project_invites', 'project_members')
ORDER BY table_name, ordinal_position;

-- ===== CZĘŚĆ 3: FOREIGN KEYS =====
SELECT
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- ===== CZĘŚĆ 4: RLS STATUS =====
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ===== CZĘŚĆ 5: RLS POLICIES =====
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

-- ===== CZĘŚĆ 6: UNIQUE CONSTRAINTS =====
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- ===== CZĘŚĆ 7: NOT NULL CONSTRAINTS =====
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND is_nullable = 'NO'
  AND table_name IN ('communication_projects', 'project_tasks', 'project_invites', 'project_members')
ORDER BY table_name, column_name;

-- ===== CZĘŚĆ 8: INDEXES =====
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('communication_projects', 'project_tasks', 'project_invites', 'project_members')
ORDER BY tablename, indexname;

-- ===== CZĘŚĆ 9: TRIGGERS =====
SELECT
    trigger_schema,
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ===== CZĘŚĆ 10: STORAGE BUCKETS (jeśli dostępne) =====
-- Ta część może nie zadziałać przez RLS, ale spróbujemy
SELECT 
    id,
    name,
    public,
    created_at
FROM storage.buckets
ORDER BY name;
