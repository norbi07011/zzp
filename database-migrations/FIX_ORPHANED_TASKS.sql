-- ============================================
-- MIGRATION: Fix Orphaned Tasks
-- Date: 2025-10-30
-- Author: AI Assistant
-- Purpose: Update project_tasks with invalid project_id to point to existing project
-- ============================================

-- PROBLEM:
-- All tasks point to project_id = '64f10ee1-dbc4-42ec-aa50-d4428adf3dab'
-- This project does NOT exist in 'projects' table
-- Real projects: 'cce21528-6d03-4f49-bd50-bbdd385e3765', '8e26765d-3fca-45c5-b51f-79df1411c19f'

-- STEP 1: Verify orphaned tasks
SELECT 
  pt.id,
  pt.title,
  pt.project_id as invalid_project_id,
  p.id as valid_project_id,
  p.title as project_title
FROM project_tasks pt
LEFT JOIN projects p ON pt.project_id = p.id
WHERE p.id IS NULL;

-- Expected: 5 rows (all with project_id = '64f10ee1-dbc4-42ec-aa50-d4428adf3dab')

-- STEP 2: Update orphaned tasks to point to first available project
BEGIN;

UPDATE project_tasks
SET project_id = (
  SELECT id 
  FROM projects 
  ORDER BY created_at ASC 
  LIMIT 1
)
WHERE project_id NOT IN (SELECT id FROM projects);

-- Verify update
SELECT 
  pt.id,
  pt.title,
  p.title as project_title,
  p.id as project_id
FROM project_tasks pt
JOIN projects p ON pt.project_id = p.id
ORDER BY pt.created_at DESC;

COMMIT;

-- ROLLBACK PLAN:
-- If something goes wrong:
-- UPDATE project_tasks 
-- SET project_id = '64f10ee1-dbc4-42ec-aa50-d4428adf3dab'
-- WHERE id IN (SELECT id FROM project_tasks LIMIT 5);

-- STEP 3: Verify NO orphaned tasks remain
SELECT COUNT(*) as orphaned_count
FROM project_tasks pt
LEFT JOIN projects p ON pt.project_id = p.id
WHERE p.id IS NULL;

-- Expected: 0
