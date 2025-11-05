-- ============================================
-- MIGRATION: Naprawa systemu drużyny
-- Date: 2025-10-31 14:30
-- Author: AI Copilot
-- ============================================

-- ROLLBACK PLAN:
-- 1. DROP TRIGGER validate_project_task_assignment ON project_tasks;
-- 2. Przywróć starą funkcję validate_task_assignment
-- 3. DROP TRIGGER auto_add_project_creator ON communication_projects;
-- 4. DELETE FROM project_members WHERE added_by_system = true;

-- ============================================
-- PART 1: Napraw trigger validate_task_assignment
-- ============================================

-- Usuń stary trigger
DROP TRIGGER IF EXISTS validate_project_task_assignment ON project_tasks;

-- Napraw funkcję - pozwól na NULL i created_by
CREATE OR REPLACE FUNCTION validate_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- ✅ Jeśli assigned_to jest NULL, pozwól (zadanie nieprzypisane)
    IF NEW.assigned_to IS NULL THEN
        RETURN NEW;
    END IF;

    -- ✅ Jeśli assigned_to = created_by (twórca zadania może przypisać sobie)
    IF NEW.assigned_to = NEW.created_by THEN
        RETURN NEW;
    END IF;

    -- ✅ Sprawdź czy user jest właścicielem projektu
    IF EXISTS (
        SELECT 1 FROM communication_projects
        WHERE id = NEW.project_id
        AND created_by = NEW.assigned_to
    ) THEN
        RETURN NEW;
    END IF;

    -- ✅ Sprawdź czy user jest w project_members
    IF NOT EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_id = NEW.project_id 
        AND user_id = NEW.assigned_to
    ) THEN
        RAISE EXCEPTION 'User % is not a member of project %. Add them to the team first.', 
            NEW.assigned_to, NEW.project_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Utwórz trigger ponownie
CREATE TRIGGER validate_project_task_assignment
    BEFORE INSERT OR UPDATE ON project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION validate_task_assignment();

-- ============================================
-- PART 2: Auto-dodaj twórcę projektu do project_members
-- ============================================

-- Funkcja dodająca twórcę projektu do members
CREATE OR REPLACE FUNCTION auto_add_project_creator()
RETURNS TRIGGER AS $$
BEGIN
    -- Dodaj twórcę projektu do project_members jako owner
    INSERT INTO project_members (
        project_id,
        user_id,
        role,
        joined_at,
        can_invite,
        can_manage_project,
        can_view_reports
    )
    VALUES (
        NEW.id,
        NEW.created_by,
        'owner',
        NOW(),
        true,
        true,
        true
    )
    ON CONFLICT (project_id, user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger automatycznie dodający twórcę do members
DROP TRIGGER IF EXISTS auto_add_project_creator ON communication_projects;
CREATE TRIGGER auto_add_project_creator
    AFTER INSERT ON communication_projects
    FOR EACH ROW
    EXECUTE FUNCTION auto_add_project_creator();

-- ============================================
-- PART 3: Dodaj istniejących twórców do project_members
-- ============================================

-- Dodaj wszystkich istniejących twórców projektów do project_members
INSERT INTO project_members (
    project_id,
    user_id,
    role,
    joined_at,
    can_invite,
    can_manage_project,
    can_view_reports
)
SELECT 
    cp.id as project_id,
    cp.created_by as user_id,
    'owner' as role,
    cp.created_at as joined_at,
    true as can_invite,
    true as can_manage_project,
    true as can_view_reports
FROM communication_projects cp
WHERE NOT EXISTS (
    SELECT 1 FROM project_members pm
    WHERE pm.project_id = cp.id
    AND pm.user_id = cp.created_by
)
ON CONFLICT (project_id, user_id) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

-- Sprawdź ile projektów ma teraz members
SELECT 
    cp.id,
    cp.name,
    cp.created_by,
    COUNT(pm.id) as members_count
FROM communication_projects cp
LEFT JOIN project_members pm ON cp.id = pm.project_id
GROUP BY cp.id, cp.name, cp.created_by
ORDER BY cp.created_at DESC;

-- Sprawdź czy trigger działa (powinno być OK)
-- SELECT validate_task_assignment();

-- ============================================
-- EXPECTED RESULTS:
-- ✅ Każdy projekt ma przynajmniej 1 członka (twórca)
-- ✅ UPDATE project_tasks działa z assigned_to = NULL
-- ✅ UPDATE project_tasks działa z assigned_to = created_by
-- ✅ Nowe projekty automatycznie dodają twórcę do members
-- ============================================
