-- ============================================
-- MIGRATION: RLS dla 4 tabel projektowych (POPRAWIONA)
-- Date: 2025-10-31
-- Author: AI Copilot
-- Verified: Column names checked via terminal
-- Note: project_invites i project_chat_messages POMINIĘTE (już mają RLS + policies)
-- ============================================

-- ROLLBACK PLAN:
-- ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_tasks DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_chat_groups DISABLE ROW LEVEL SECURITY;

BEGIN;

-- ============================================
-- 1. PROJECTS - główna tabela projektów
-- Kolumny: id, title, description, owner_id, status, start_date, end_date, 
--          budget_total, budget_used, client_name, project_manager_id, etc (16 total)
-- ============================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Owner może wszystko ze swoim projektem
CREATE POLICY "Project owners can manage their projects"
  ON projects FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Project members mogą widzieć projekty
CREATE POLICY "Project members can view projects"
  ON projects FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
  );

-- Project managers mogą edytować projekty
CREATE POLICY "Project managers can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    project_manager_id = auth.uid()
    OR id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() 
      AND can_manage_project = true
    )
  )
  WITH CHECK (
    project_manager_id = auth.uid()
    OR id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() 
      AND can_manage_project = true
    )
  );

-- Admins mogą wszystko
CREATE POLICY "Admins can manage all projects"
  ON projects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 2. PROJECT_MEMBERS - członkowie projektów
-- Kolumny: id, project_id, user_id, profile_id, role, display_name, 
--          can_invite, can_manage_project, can_view_reports, etc (14 total)
-- ============================================

ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- User może widzieć członków projektów do których należy
CREATE POLICY "Users can view project members"
  ON project_members FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
    OR project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Project owner może dodawać członków
CREATE POLICY "Project owners can add members"
  ON project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- User z uprawnieniem can_invite może dodawać członków
CREATE POLICY "Users with can_invite can add members"
  ON project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() 
      AND can_invite = true
    )
  );

-- Project owner może edytować członków
CREATE POLICY "Project owners can update members"
  ON project_members FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Project owner może usuwać członków
CREATE POLICY "Project owners can remove members"
  ON project_members FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- User może usunąć sam siebie z projektu
CREATE POLICY "Users can leave projects"
  ON project_members FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Admins mogą wszystko
CREATE POLICY "Admins can manage all project members"
  ON project_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 3. PROJECT_TASKS - zadania projektowe
-- Kolumny: id, project_id, title, description, status, priority, 
--          assigned_to, created_by, due_date, progress_percentage, etc (50 total)
-- ============================================

ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Project members mogą widzieć zadania
CREATE POLICY "Project members can view tasks"
  ON project_tasks FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
    OR project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Project members mogą tworzyć zadania
CREATE POLICY "Project members can create tasks"
  ON project_tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
    OR project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Assigned user lub creator może edytować zadanie
CREATE POLICY "Assigned users can update tasks"
  ON project_tasks FOR UPDATE
  TO authenticated
  USING (
    assigned_to = auth.uid() 
    OR created_by = auth.uid()
    OR project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() 
      AND can_manage_project = true
    )
    OR project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  )
  WITH CHECK (
    assigned_to = auth.uid() 
    OR created_by = auth.uid()
    OR project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() 
      AND can_manage_project = true
    )
    OR project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Creator lub project owner może usuwać zadania
CREATE POLICY "Task creators can delete tasks"
  ON project_tasks FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
    OR project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() 
      AND can_manage_project = true
    )
  );

-- Admins mogą wszystko
CREATE POLICY "Admins can manage all tasks"
  ON project_tasks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 4. PROJECT_CHAT_GROUPS - grupy czatowe
-- Kolumny: id, project_id, name, description, icon, color, group_type,
--          members, auto_join_roles, created_by, etc (13 total)
-- ============================================

ALTER TABLE project_chat_groups ENABLE ROW LEVEL SECURITY;

-- Project members mogą widzieć grupy czatowe
CREATE POLICY "Project members can view chat groups"
  ON project_chat_groups FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
    OR project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Project members mogą tworzyć grupy
CREATE POLICY "Project members can create chat groups"
  ON project_chat_groups FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid()
    )
    OR project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Creator lub project owner może edytować grupy
CREATE POLICY "Group creators can update chat groups"
  ON project_chat_groups FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
    OR project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() 
      AND can_manage_project = true
    )
  )
  WITH CHECK (
    created_by = auth.uid()
    OR project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
    OR project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() 
      AND can_manage_project = true
    )
  );

-- Creator lub project owner może usuwać grupy
CREATE POLICY "Group creators can delete chat groups"
  ON project_chat_groups FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
    OR project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
    )
  );

-- Admins mogą wszystko
CREATE POLICY "Admins can manage all chat groups"
  ON project_chat_groups FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- WERYFIKACJA
-- ============================================

-- Sprawdź czy RLS jest włączony dla wszystkich 4 tabel
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'projects', 
    'project_members', 
    'project_tasks', 
    'project_chat_groups'
)
ORDER BY tablename;

-- Sprawdź liczba policies (powinno być 21 nowych)
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN (
    'projects', 
    'project_members', 
    'project_tasks', 
    'project_chat_groups'
)
GROUP BY tablename
ORDER BY tablename;

-- Sprawdź wszystkie 6 tabel projektowych (razem z invites i messages)
SELECT 
    t.tablename,
    CASE WHEN t.rowsecurity THEN '✅' ELSE '❌' END as rls,
    COUNT(p.policyname) as policies
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = 'public'
WHERE t.schemaname = 'public'
AND t.tablename IN (
    'projects', 
    'project_members', 
    'project_tasks', 
    'project_chat_groups',
    'project_invites',
    'project_chat_messages'
)
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

COMMIT;

-- ============================================
-- KONIEC MIGRACJI
-- ============================================
SELECT '✅ MIGRATION COMPLETE: RLS enabled for 4 project tables (+ 2 already secured)' as status;
