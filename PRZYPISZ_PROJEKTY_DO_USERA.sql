-- ============================================
-- PRZYPISZ PROJEKTY DEMO DO ZALOGOWANEGO UŻYTKOWNIKA
-- ============================================

-- 1. Sprawdź aktualnego zalogowanego użytkownika (z konsoli)
-- User ID: 8a179427-7289-469a-bafc-1a74d6155eef

-- 2. Sprawdź istniejące projekty
SELECT 
    id,
    name,
    created_by,
    status
FROM communication_projects;

-- 3. Przypisz projekty do zalogowanego użytkownika
UPDATE communication_projects
SET created_by = '8a179427-7289-469a-bafc-1a74d6155eef'
WHERE name IN ('Budowa Domu Jednorodzinnego', 'Remont Biurowca');

-- 4. Sprawdź wynik
SELECT 
    id,
    name,
    created_by,
    status,
    (SELECT email FROM auth.users WHERE id = created_by) as creator_email
FROM communication_projects;
