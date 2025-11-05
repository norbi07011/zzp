-- ===== QUERY 1: LISTA TABEL =====
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- ===== QUERY 2: KOLUMNY project_tasks =====
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'project_tasks'
ORDER BY ordinal_position;

-- ===== QUERY 3: KOLUMNY project_members =====
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'project_members'
ORDER BY ordinal_position;

-- ===== QUERY 4: WSZYSTKIE ENUM TYPES =====
SELECT t.typname as enum_name
FROM pg_type t
WHERE t.typtype = 'e'
ORDER BY t.typname;

-- ===== QUERY 5: FOREIGN KEYS project_tasks =====
SELECT
    kcu.column_name,
    ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'project_tasks';
