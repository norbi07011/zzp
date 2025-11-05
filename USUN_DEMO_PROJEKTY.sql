-- ============================================
-- USUŃ STARE DEMO PROJEKTY
-- ============================================

-- 1. Sprawdź co będzie usunięte
SELECT id, name, created_by, status 
FROM communication_projects
WHERE name = 'Demo Building Project - Amsterdam';

-- 2. Usuń demo projekty
DELETE FROM communication_projects
WHERE name = 'Demo Building Project - Amsterdam';

-- 3. Sprawdź czy zostały usunięte
SELECT COUNT(*) as remaining_projects FROM communication_projects;
