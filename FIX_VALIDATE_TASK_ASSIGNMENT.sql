-- ============================================
-- FIX: Napraw trigger validate_task_assignment
-- Date: 2025-10-31
-- Problem: Trigger blokuje UPDATE gdy assigned_to = NULL
-- ============================================

-- STEP 1: Zobacz jak wygląda obecny trigger function
SELECT 
  proname as function_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc
WHERE proname = 'validate_task_assignment';

-- STEP 2: Usuń stary trigger i funkcję (jeśli trzeba naprawić)
-- DROP TRIGGER IF EXISTS validate_project_task_assignment ON project_tasks;
-- DROP FUNCTION IF EXISTS validate_task_assignment();

-- STEP 3: Utwórz poprawiony trigger function
-- Ten trigger powinien:
-- 1. Pozwalać na assigned_to = NULL (zadanie bez przypisania)
-- 2. Jeśli assigned_to IS NOT NULL, sprawdzić czy user jest w project_members
-- 3. Pozwalać też na assigned_to = created_by (twórca projektu)

/*
CREATE OR REPLACE FUNCTION validate_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- Jeśli assigned_to jest NULL, pozwól (zadanie nieprzypisane)
  IF NEW.assigned_to IS NULL THEN
    RETURN NEW;
  END IF;

  -- Jeśli assigned_to = created_by (twórca zadania może przypisać sobie)
  IF NEW.assigned_to = NEW.created_by THEN
    RETURN NEW;
  END IF;

  -- Sprawdź czy user jest w project_members ALBO jest twórcą projektu
  IF NOT EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = NEW.project_id 
    AND user_id = NEW.assigned_to
  ) AND NOT EXISTS (
    SELECT 1 FROM communication_projects
    WHERE id = NEW.project_id
    AND created_by = NEW.assigned_to
  ) THEN
    RAISE EXCEPTION 'User % is not a member of project %', NEW.assigned_to, NEW.project_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Utwórz trigger ponownie
CREATE TRIGGER validate_project_task_assignment
  BEFORE INSERT OR UPDATE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION validate_task_assignment();
*/

-- STEP 4: Test po naprawie
-- INSERT INTO project_tasks (title, project_id, created_by, assigned_to, status, priority, is_subtask, progress_percentage, is_recurring, requires_photo_proof, risk_level)
-- VALUES ('Test task', 'project_id_here', 'user_id_here', NULL, 'not_started', 'medium', false, 0, false, false, 'low');
