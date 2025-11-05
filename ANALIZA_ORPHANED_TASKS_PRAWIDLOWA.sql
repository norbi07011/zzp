-- ============================================
-- ANALIZA ORPHANED TASKS (poprawna wersja)
-- Bazuje na faktycznej strukturze z Supabase
-- ============================================

-- STEP 1: Sprawdź ile jest orphaned tasks
-- (tasks gdzie project_id nie istnieje w communication_projects)
SELECT 
    COUNT(*) as orphaned_count,
    'Tasks bez projektu' as opis
FROM project_tasks pt
WHERE NOT EXISTS (
    SELECT 1 
    FROM communication_projects cp 
    WHERE cp.id = pt.project_id
);

-- STEP 2: Pokaż szczegóły orphaned tasks
SELECT 
    pt.id,
    pt.project_id as nieistniejacy_project_id,
    pt.title,
    pt.status,
    pt.created_by,
    pt.created_at,
    pt.assigned_to
FROM project_tasks pt
WHERE NOT EXISTS (
    SELECT 1 
    FROM communication_projects cp 
    WHERE cp.id = pt.project_id
)
ORDER BY pt.created_at DESC
LIMIT 20;

-- STEP 3: Sprawdź istniejące projekty
SELECT 
    id,
    name as project_name,
    status,
    employer_id,
    created_by,
    created_at
FROM communication_projects
ORDER BY created_at DESC
LIMIT 10;

-- STEP 4: Statystyki tasków per projekt
SELECT 
    cp.name as project_name,
    cp.status as project_status,
    COUNT(pt.id) as tasks_count
FROM communication_projects cp
LEFT JOIN project_tasks pt ON pt.project_id = cp.id
GROUP BY cp.id, cp.name, cp.status
ORDER BY tasks_count DESC;

-- STEP 5: Sprawdź czy są NULL project_id
SELECT 
    COUNT(*) as tasks_with_null_project_id
FROM project_tasks
WHERE project_id IS NULL;
