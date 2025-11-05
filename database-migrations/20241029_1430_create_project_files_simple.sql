-- ============================================
-- MIGRATION: Stwórz tabelę project_files bazując na task_attachments
-- Date: 2024-10-29
-- Author: AI Copilot
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE IF EXISTS project_files CASCADE;

-- STEP 1: Sprawdź czy tabela już istnieje
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'project_files' 
  AND table_schema = 'public';

-- STEP 2: Stwórz tabelę project_files wzorowaną na task_attachments
CREATE TABLE IF NOT EXISTS project_files (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name character varying NOT NULL,
    original_name character varying NOT NULL, -- dodatkowa kolumna
    file_size bigint NOT NULL,
    file_type character varying NULL,
    mime_type character varying NULL, -- dodatkowa kolumna
    storage_path text NOT NULL,
    description text NULL,
    is_public boolean DEFAULT false, -- dodatkowa kolumna
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    deleted_at timestamp with time zone NULL
);

-- STEP 3: Dodaj indeksy dla wydajności
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON project_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_files_created_at ON project_files(created_at);
CREATE INDEX IF NOT EXISTS idx_project_files_file_type ON project_files(file_type);

-- STEP 4: Dodaj funkcję update_updated_at_column jeśli nie istnieje
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- STEP 5: Dodaj trigger dla automatycznego update updated_at
DROP TRIGGER IF EXISTS update_project_files_updated_at ON project_files;
CREATE TRIGGER update_project_files_updated_at
    BEFORE UPDATE ON project_files
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- STEP 6: Włącz Row Level Security
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;

-- STEP 7: Dodaj RLS policies
-- Policy: Użytkownicy mogą widzieć pliki projektów do których mają dostęp
DROP POLICY IF EXISTS "project_files_select_policy" ON project_files;
CREATE POLICY "project_files_select_policy" ON project_files
    FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects 
            WHERE owner_id = auth.uid() 
               OR project_manager_id = auth.uid()
        )
    );

-- Policy: Właściciele projektów mogą wstawiać pliki
DROP POLICY IF EXISTS "project_files_insert_policy" ON project_files;
CREATE POLICY "project_files_insert_policy" ON project_files
    FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM projects 
            WHERE owner_id = auth.uid() 
               OR project_manager_id = auth.uid()
        )
    );

-- Policy: Właściciele projektów lub uploaderzy mogą aktualizować pliki
DROP POLICY IF EXISTS "project_files_update_policy" ON project_files;
CREATE POLICY "project_files_update_policy" ON project_files
    FOR UPDATE
    USING (
        uploaded_by = auth.uid() OR
        project_id IN (
            SELECT id FROM projects 
            WHERE owner_id = auth.uid() 
               OR project_manager_id = auth.uid()
        )
    );

-- Policy: Właściciele projektów lub uploaderzy mogą usuwać pliki
DROP POLICY IF EXISTS "project_files_delete_policy" ON project_files;
CREATE POLICY "project_files_delete_policy" ON project_files
    FOR DELETE
    USING (
        uploaded_by = auth.uid() OR
        project_id IN (
            SELECT id FROM projects 
            WHERE owner_id = auth.uid() 
               OR project_manager_id = auth.uid()
        )
    );

-- STEP 8: Sprawdź wynik
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'project_files' 
  AND table_schema = 'public'
ORDER BY ordinal_position;