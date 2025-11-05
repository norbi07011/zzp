-- ==========================================
-- SPRAWDŹ STRUKTURĘ TABELI PROJECTS
-- ==========================================

-- 1. Pokaż wszystkie kolumny w tabeli projects
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'projects'
ORDER BY ordinal_position;

-- 2. Pokaż przykładowe dane z projects
SELECT *
FROM projects
LIMIT 5;

-- ==========================================
-- URUCHOM TO NAJPIERW!
-- Wyślij mi wynik - zobaczę jakie kolumny istnieją
-- ==========================================
