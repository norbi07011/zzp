-- ============================================
-- MIGRATION: System plików i załączników  
-- Date: 2025-10-29
-- Author: AI Copilot  
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE project_files CASCADE;
-- DROP TABLE task_attachments CASCADE;
-- DROP TABLE event_attachments CASCADE;
-- DROP TYPE file_type CASCADE;
-- DROP TYPE file_status CASCADE;

-- ===========================================
-- CZĘŚĆ 1: TYPY ENUM
-- ===========================================

-- Typ pliku
DO $$ BEGIN
  CREATE TYPE file_type AS ENUM (
    'image',           -- zdjęcia (jpg, png, gif, webp)
    'document',        -- dokumenty (pdf, doc, docx)
    'spreadsheet',     -- arkusze (xls, xlsx, csv)
    'presentation',    -- prezentacje (ppt, pptx)
    'archive',         -- archiwa (zip, rar, 7z)
    'video',           -- filmy (mp4, avi, mov)
    'audio',           -- audio (mp3, wav, ogg)
    'cad',             -- pliki CAD (dwg, dxf)
    'blueprint',       -- rysunki techniczne
    'other'            -- inne pliki
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type file_type already exists, skipping...';
END $$;

-- Status pliku
DO $$ BEGIN
  CREATE TYPE file_status AS ENUM (
    'uploading',       -- w trakcie uploadu
    'active',          -- aktywny
    'processing',      -- w trakcie przetwarzania
    'archived',        -- zarchiwizowany
    'deleted'          -- usunięty (soft delete)
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type file_status already exists, skipping...';
END $$;

-- ===========================================
-- CZĘŚĆ 2: GŁÓWNA TABELA PLIKÓW
-- ===========================================

-- Główna tabela plików projektów
CREATE TABLE IF NOT EXISTS project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Podstawowe relacje
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Informacje o pliku
  original_filename VARCHAR(255) NOT NULL,
  storage_path TEXT NOT NULL, -- ścieżka w Supabase Storage
  file_size BIGINT NOT NULL, -- rozmiar w bajtach
  mime_type VARCHAR(100) NOT NULL,
  file_type file_type NOT NULL,
  
  -- Metadata
  file_hash VARCHAR(64), -- SHA-256 hash dla deduplikacji
  thumbnail_path TEXT, -- ścieżka do miniaturki (dla obrazów)
  description TEXT,
  tags TEXT[], -- tagi do wyszukiwania
  
  -- Status i uprawnienia
  status file_status NOT NULL DEFAULT 'active',
  is_public BOOLEAN NOT NULL DEFAULT false,
  download_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP, -- soft delete
  
  -- Constraints
  CONSTRAINT valid_file_size CHECK (file_size > 0 AND file_size <= 104857600), -- max 100MB
  CONSTRAINT valid_storage_path CHECK (storage_path ~ '^[a-zA-Z0-9/_.-]+$')
);

-- Indeksy dla project_files
CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON project_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_files_type ON project_files(file_type);
CREATE INDEX IF NOT EXISTS idx_project_files_status ON project_files(status);
CREATE INDEX IF NOT EXISTS idx_project_files_created ON project_files(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_files_hash ON project_files(file_hash);
CREATE INDEX IF NOT EXISTS idx_project_files_active ON project_files(project_id, status) WHERE status = 'active';

-- ===========================================
-- CZĘŚĆ 3: TABELE ZAŁĄCZNIKÓW
-- ===========================================

-- Załączniki do zadań
CREATE TABLE IF NOT EXISTS task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacje
  task_id UUID NOT NULL, -- projekt_tasks.id (będzie dodane później)
  file_id UUID NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
  attached_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Metadata
  attachment_type VARCHAR(50) DEFAULT 'general', -- 'evidence', 'blueprint', 'invoice', etc.
  description TEXT,
  is_required BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_task_file UNIQUE (task_id, file_id)
);

-- Załączniki do wydarzeń
CREATE TABLE IF NOT EXISTS event_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacje
  event_id UUID NOT NULL, -- project_events.id (już istnieje)
  file_id UUID NOT NULL REFERENCES project_files(id) ON DELETE CASCADE,
  attached_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Metadata
  attachment_type VARCHAR(50) DEFAULT 'general', -- 'agenda', 'presentation', 'notes', etc.
  description TEXT,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_event_file UNIQUE (event_id, file_id)
);

-- Indeksy dla załączników
CREATE INDEX IF NOT EXISTS idx_task_attachments_task ON task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_file ON task_attachments(file_id);
CREATE INDEX IF NOT EXISTS idx_event_attachments_event ON event_attachments(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attachments_file ON event_attachments(file_id);

-- ===========================================
-- CZĘŚĆ 4: TRIGGERY I FUNKCJE
-- ===========================================

-- Trigger dla auto-update updated_at
DROP TRIGGER IF EXISTS trigger_project_files_updated_at ON project_files;
CREATE TRIGGER trigger_project_files_updated_at
  BEFORE UPDATE ON project_files
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Funkcja do automatycznego określania typu pliku na podstawie MIME
CREATE OR REPLACE FUNCTION determine_file_type(mime_type TEXT) RETURNS file_type AS $$
BEGIN
  CASE 
    WHEN mime_type ILIKE 'image/%' THEN RETURN 'image';
    WHEN mime_type ILIKE 'application/pdf' OR mime_type ILIKE 'application/msword%' OR mime_type ILIKE 'application/vnd.openxmlformats-officedocument.wordprocessingml%' THEN RETURN 'document';
    WHEN mime_type ILIKE 'application/vnd.ms-excel%' OR mime_type ILIKE 'application/vnd.openxmlformats-officedocument.spreadsheetml%' OR mime_type ILIKE 'text/csv' THEN RETURN 'spreadsheet';
    WHEN mime_type ILIKE 'application/vnd.ms-powerpoint%' OR mime_type ILIKE 'application/vnd.openxmlformats-officedocument.presentationml%' THEN RETURN 'presentation';
    WHEN mime_type ILIKE 'application/zip%' OR mime_type ILIKE 'application/x-rar%' OR mime_type ILIKE 'application/x-7z%' THEN RETURN 'archive';
    WHEN mime_type ILIKE 'video/%' THEN RETURN 'video';
    WHEN mime_type ILIKE 'audio/%' THEN RETURN 'audio';
    WHEN mime_type ILIKE 'application/dwg' OR mime_type ILIKE 'application/dxf' THEN RETURN 'cad';
    ELSE RETURN 'other';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Trigger do automatycznego ustawiania file_type
CREATE OR REPLACE FUNCTION set_file_type_trigger() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.file_type IS NULL THEN
    NEW.file_type := determine_file_type(NEW.mime_type);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_file_type ON project_files;
CREATE TRIGGER trigger_set_file_type
  BEFORE INSERT ON project_files
  FOR EACH ROW
  EXECUTE FUNCTION set_file_type_trigger();

-- Funkcja do logowania aktywności plików
CREATE OR REPLACE FUNCTION log_file_activity() RETURNS TRIGGER AS $$
DECLARE
  activity_desc TEXT;
  activity_details JSONB;
BEGIN
  IF TG_OP = 'INSERT' THEN
    activity_desc := 'Przesłano plik: ' || NEW.original_filename;
    activity_details := jsonb_build_object(
      'file_id', NEW.id,
      'filename', NEW.original_filename,
      'file_size', NEW.file_size,
      'file_type', NEW.file_type,
      'mime_type', NEW.mime_type
    );
    
    -- Log aktywności
    PERFORM log_project_activity(
      NEW.project_id,
      NEW.uploaded_by,
      'file_uploaded',
      activity_desc,
      activity_details
    );
    
  ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'deleted' THEN
    activity_desc := 'Usunięto plik: ' || NEW.original_filename;
    activity_details := jsonb_build_object(
      'file_id', NEW.id,
      'filename', NEW.original_filename
    );
    
    -- Log aktywności
    PERFORM log_project_activity(
      NEW.project_id,
      NEW.uploaded_by, -- lub auth.uid() jeśli mamy dostęp
      'file_removed',
      activity_desc,
      activity_details
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_log_file_activity ON project_files;
CREATE TRIGGER trigger_log_file_activity
  AFTER INSERT OR UPDATE ON project_files
  FOR EACH ROW
  EXECUTE FUNCTION log_file_activity();

-- ===========================================
-- CZĘŚĆ 5: RLS POLICIES
-- ===========================================

-- Włącz RLS
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attachments ENABLE ROW LEVEL SECURITY;

-- Polityki dla project_files
DROP POLICY IF EXISTS "Users can view files in their projects" ON project_files;
CREATE POLICY "Users can view files in their projects" ON project_files
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_permissions 
      WHERE user_id = auth.uid() AND is_active = true
    )
    OR is_public = true
  );

DROP POLICY IF EXISTS "Users can upload files to their projects" ON project_files;
CREATE POLICY "Users can upload files to their projects" ON project_files
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_permissions 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND ('project_settings' = ANY(permissions) OR 'full_admin' = ANY(permissions))
    )
    AND uploaded_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can update their own files" ON project_files;
CREATE POLICY "Users can update their own files" ON project_files
  FOR UPDATE USING (
    uploaded_by = auth.uid()
    OR project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_permissions 
      WHERE user_id = auth.uid() 
      AND is_active = true 
      AND ('project_settings' = ANY(permissions) OR 'full_admin' = ANY(permissions))
    )
  );

-- Polityki dla task_attachments
DROP POLICY IF EXISTS "Users can manage task attachments" ON task_attachments;
CREATE POLICY "Users can manage task attachments" ON task_attachments
  FOR ALL USING (
    file_id IN (
      SELECT id FROM project_files 
      WHERE project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM project_permissions 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- Polityki dla event_attachments
DROP POLICY IF EXISTS "Users can manage event attachments" ON event_attachments;
CREATE POLICY "Users can manage event attachments" ON event_attachments
  FOR ALL USING (
    file_id IN (
      SELECT id FROM project_files 
      WHERE project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
        UNION
        SELECT project_id FROM project_permissions 
        WHERE user_id = auth.uid() AND is_active = true
      )
    )
  );

-- ===========================================
-- CZĘŚĆ 6: SUPABASE STORAGE BUCKET
-- ===========================================

-- Utwórz bucket dla plików projektów (wykonaj to w Supabase Dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);

-- Polityki Storage (wykonaj w Supabase Dashboard)
-- CREATE POLICY "Authenticated users can upload files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'project-files');
-- CREATE POLICY "Users can view files in their projects" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'project-files');
-- CREATE POLICY "Users can update their own files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "Users can delete their own files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'project-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ===========================================
-- CZĘŚĆ 7: DANE TESTOWE
-- ===========================================

DO $$
DECLARE
  test_project_id UUID;
  test_user_id UUID;
  test_file_id UUID;
BEGIN
  -- Znajdź istniejący projekt testowy
  SELECT id INTO test_project_id 
  FROM projects 
  WHERE title = 'Demo Building Project - Amsterdam'
  LIMIT 1;
  
  -- Znajdź użytkownika testowego
  SELECT owner_id INTO test_user_id 
  FROM projects 
  WHERE id = test_project_id;
  
  IF test_project_id IS NOT NULL AND test_user_id IS NOT NULL THEN
    RAISE NOTICE 'Dodawanie przykładowych plików...';
    
    -- 1. Przykładowe pliki
    INSERT INTO project_files (
      project_id, uploaded_by, original_filename, storage_path, 
      file_size, mime_type, file_type, description, tags
    ) VALUES 
    (test_project_id, test_user_id, 'building_plans.pdf', 
     test_user_id::text || '/building_plans.pdf', 2048576, 
     'application/pdf', 'document', 'Główne plany budowy domu', 
     ARRAY['plans', 'architecture', 'main']),
     
    (test_project_id, test_user_id, 'foundation_blueprint.dwg',
     test_user_id::text || '/foundation_blueprint.dwg', 5242880,
     'application/dwg', 'cad', 'Rysunek techniczny fundamentów',
     ARRAY['blueprint', 'foundation', 'technical']),
     
    (test_project_id, test_user_id, 'site_photo_before.jpg',
     test_user_id::text || '/site_photo_before.jpg', 1048576,
     'image/jpeg', 'image', 'Zdjęcie działki przed rozpoczęciem prac',
     ARRAY['photo', 'before', 'documentation']),
     
    (test_project_id, test_user_id, 'budget_calculation.xlsx',
     test_user_id::text || '/budget_calculation.xlsx', 524288,
     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'spreadsheet',
     'Kalkulacja kosztów projektu', ARRAY['budget', 'costs', 'calculation']),
     
    (test_project_id, test_user_id, 'permit_documents.zip',
     test_user_id::text || '/permit_documents.zip', 3145728,
     'application/zip', 'archive', 'Dokumenty zezwoleń budowlanych',
     ARRAY['permits', 'legal', 'documentation']);
    
    RAISE NOTICE 'Dodano 5 przykładowych plików';
    
  ELSE
    RAISE NOTICE 'Brak projektu testowego - pomijam tworzenie plików testowych';
  END IF;
END $$;

-- ===========================================
-- CZĘŚĆ 8: VERIFICATION
-- ===========================================

-- Sprawdź utworzone tabele
SELECT 
  'project_files' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_files') 
    THEN '✅ CREATED' ELSE '❌ FAILED' END as status
UNION ALL
SELECT 'task_attachments', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'task_attachments') 
    THEN '✅ CREATED' ELSE '❌ FAILED' END
UNION ALL
SELECT 'event_attachments', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'event_attachments') 
    THEN '✅ CREATED' ELSE '❌ FAILED' END;

-- Sprawdź ENUM types
SELECT 
  t.typname as enum_type,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as possible_values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname IN ('file_type', 'file_status')
GROUP BY t.typname
ORDER BY t.typname;

-- Podsumowanie plików
SELECT 
  'Project Files' as data_type,
  count(*) as count
FROM project_files
UNION ALL
SELECT 'Task Attachments', count(*) 
FROM task_attachments
UNION ALL
SELECT 'Event Attachments', count(*) 
FROM event_attachments;