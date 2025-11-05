-- ============================================
-- SPRAWDŹ PROJEKTY W COMMUNICATION_PROJECTS
-- Uruchom w Supabase SQL Editor
-- ============================================

-- 1. Policz projekty
SELECT COUNT(*) as total_projects
FROM communication_projects;

-- 2. Pokaż wszystkie projekty
SELECT 
    id,
    name,
    description,
    status,
    created_by,
    employer_id,
    employer_name,
    created_at
FROM communication_projects
ORDER BY created_at DESC;

-- 3. Sprawdź czy aktualny użytkownik ma jakieś projekty
-- (zastąp 'TWOJE_USER_ID' prawdziwym ID z auth.users)
SELECT 
    id,
    name,
    status,
    created_at
FROM communication_projects
WHERE created_by = 'TWOJE_USER_ID'
ORDER BY created_at DESC;
