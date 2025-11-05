-- ============================================
-- ANALIZA: Połączenie project_tasks z communication_projects
-- Date: 2025-10-31
-- Problem: Zadania dodają się ale nie pokazują w panelach
-- ============================================

-- STEP 1: Sprawdź czy project_tasks.project_id wskazuje na communication_projects
SELECT 
  pt.id as task_id,
  pt.title as task_title,
  pt.project_id,
  cp.id as comm_project_id,
  cp.name as project_name,
  CASE 
    WHEN cp.id IS NULL THEN '❌ ORPHAN - projekt nie istnieje!'
    ELSE '✅ Connected'
  END as status
FROM project_tasks pt
LEFT JOIN communication_projects cp ON pt.project_id = cp.id
ORDER BY pt.created_at DESC
LIMIT 20;

-- STEP 2: Sprawdź czy są FK constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'project_tasks'
AND tc.constraint_type = 'FOREIGN KEY';

-- STEP 3: Sprawdź wszystkie projekty i ich zadania
SELECT 
  cp.id,
  cp.name,
  cp.created_by,
  COUNT(pt.id) as tasks_count
FROM communication_projects cp
LEFT JOIN project_tasks pt ON cp.id = pt.project_id
GROUP BY cp.id, cp.name, cp.created_by
ORDER BY cp.created_at DESC;

-- STEP 4: Sprawdź czy jest stary system "projects" (bez communication_)
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%project%'
ORDER BY table_name;

-- STEP 5: Jeśli jest tabela "projects", porównaj z communication_projects
-- SELECT 
--   'OLD projects' as source,
--   id,
--   name,
--   created_at
-- FROM projects
-- UNION ALL
-- SELECT 
--   'NEW communication_projects' as source,
--   id,
--   name,
--   created_at
-- FROM communication_projects
-- ORDER BY created_at DESC;
