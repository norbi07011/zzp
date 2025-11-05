-- ==========================================
-- STEP 2: SPRAWDŹ STRUKTURĘ KAŻDEJ TABELI
-- ==========================================

-- Uruchom to DOPIERO jak zobaczysz wynik STEP 1

-- A) Sprawdź kolumny tabeli project_tasks (jeśli istnieje)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'project_tasks'
ORDER BY ordinal_position;

-- B) Sprawdź kolumny tabeli projects (jeśli istnieje)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'projects'
ORDER BY ordinal_position;

-- C) Sprawdź kolumny tabeli project_members (jeśli istnieje)
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'project_members'
ORDER BY ordinal_position;
