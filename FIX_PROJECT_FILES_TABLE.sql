-- ============================================
-- FIX: Utworzenie tabeli project_files na wzór task_attachments
-- Date: 2025-10-29
-- Author: AI Copilot
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE IF EXISTS project_files;
-- DROP TABLE IF EXISTS event_attachments;

-- STEP 1: Sprawdź istniejące tabele z plikami
SELECT table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('task_attachments', 'project_files', 'event_attachments')
ORDER BY table_name, ordinal_position;

-- STEP 2: Utworzenie tabeli project_files (na wzór task_attachments)
CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name character varying NOT NULL,
  file_size bigint NOT NULL,
  file_type character varying,
  storage_path text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

-- STEP 3: Utworzenie tabeli event_attachments
CREATE TABLE IF NOT EXISTS event_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES project_events(id) ON DELETE CASCADE,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name character varying NOT NULL,
  file_size bigint NOT NULL,
  file_type character varying,
  storage_path text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

-- STEP 4: Dodanie indeksów dla wydajności
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON project_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_files_created_at ON project_files(created_at);

CREATE INDEX IF NOT EXISTS idx_event_attachments_event_id ON event_attachments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attachments_uploaded_by ON event_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_event_attachments_created_at ON event_attachments(created_at);

-- STEP 5: Row Level Security (RLS)
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Użytkownicy mogą widzieć pliki projektów których są członkami
CREATE POLICY "Users can view files of projects they are members of" ON project_files
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Użytkownicy mogą dodawać pliki do projektów których są członkami
CREATE POLICY "Users can upload files to projects they are members of" ON project_files
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );

-- RLS Policy: Użytkownicy mogą usuwać swoje pliki lub pliki w projektach gdzie mają uprawnienia
CREATE POLICY "Users can delete their own files or files in projects they manage" ON project_files
  FOR DELETE USING (
    uploaded_by = auth.uid() OR
    project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND (role = 'admin' OR role = 'manager')
    )
  );

-- RLS Policy dla event_attachments - analogiczne
CREATE POLICY "Users can view event files of projects they are members of" ON event_attachments
  FOR SELECT USING (
    event_id IN (
      SELECT pe.id FROM project_events pe
      JOIN project_members pm ON pe.project_id = pm.project_id
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload event files to projects they are members of" ON event_attachments
  FOR INSERT WITH CHECK (
    event_id IN (
      SELECT pe.id FROM project_events pe
      JOIN project_members pm ON pe.project_id = pm.project_id
      WHERE pm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own event files" ON event_attachments
  FOR DELETE USING (uploaded_by = auth.uid());

-- STEP 6: Sprawdź czy tabele zostały utworzone
SELECT 
  t.table_name,
  COUNT(c.column_name) as column_count,
  string_agg(c.column_name, ', ' ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_name IN ('project_files', 'event_attachments', 'task_attachments')
  AND t.table_schema = 'public'
GROUP BY t.table_name
ORDER BY t.table_name;