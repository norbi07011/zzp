-- =====================================================
-- MIGRATION: Admin Files Storage System
-- Date: 2025-11-13
-- Purpose: Prywatne pliki admina (dokumenty, szablony, backupy, zdjęcia)
-- =====================================================

-- Drop existing table if exists (cleanup)
DROP TABLE IF EXISTS admin_files CASCADE;

-- Create main table for admin files
CREATE TABLE admin_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'pdf', 'docx', 'txt', 'image', 'sql', 'csv', 'json', 'zip', 'other'
  folder TEXT NOT NULL, -- 'dokumenty', 'szablony', 'backupy', 'zdjecia', 'inne'
  url TEXT NOT NULL, -- Supabase Storage URL (bucket: admin-files)
  size INTEGER, -- bytes
  mime_type TEXT, -- 'application/pdf', 'image/png', etc.
  tags TEXT[], -- ['ważne', 'draft', 'archiwum', 'szablon', 'backup']
  description TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_admin_files_folder ON admin_files(folder);
CREATE INDEX idx_admin_files_type ON admin_files(file_type);
CREATE INDEX idx_admin_files_created ON admin_files(created_at DESC);
CREATE INDEX idx_admin_files_uploaded_by ON admin_files(uploaded_by);
CREATE INDEX idx_admin_files_tags ON admin_files USING GIN(tags);

-- Enable RLS
ALTER TABLE admin_files ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can access
CREATE POLICY "Admins full access to admin files" ON admin_files
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_admin_files_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
CREATE TRIGGER admin_files_updated_at
  BEFORE UPDATE ON admin_files
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_files_updated_at();

-- =====================================================
-- SUPABASE STORAGE BUCKET SETUP
-- =====================================================
-- Run this in Supabase Dashboard → Storage:
-- 
-- 1. Create bucket: "admin-files"
-- 2. Settings:
--    - Public: false (tylko admini mają dostęp)
--    - File size limit: 52428800 (50MB)
--    - Allowed MIME types: 
--      application/pdf, 
--      application/msword, 
--      application/vnd.openxmlformats-officedocument.wordprocessingml.document,
--      text/plain, 
--      text/csv,
--      application/json,
--      application/sql,
--      application/zip,
--      image/png, 
--      image/jpeg, 
--      image/jpg,
--      image/gif,
--      image/webp
--
-- 3. Policies (in Storage → Policies):
--    INSERT: (auth.role() = 'authenticated' AND is_admin())
--    SELECT: (auth.role() = 'authenticated' AND is_admin())
--    UPDATE: (auth.role() = 'authenticated' AND is_admin())
--    DELETE: (auth.role() = 'authenticated' AND is_admin())
-- =====================================================

-- Test data (opcjonalne - 3 przykładowe pliki)
INSERT INTO admin_files (name, original_filename, file_type, folder, url, size, mime_type, tags, description) VALUES
  ('Regulamin Platformy 2025', 'regulamin_2025.pdf', 'pdf', 'dokumenty', 'https://placeholder.com/regulamin.pdf', 245000, 'application/pdf', ARRAY['ważne', 'regulamin'], 'Aktualny regulamin platformy ZZP Werkplaats'),
  ('Szablon VCA Certyfikat', 'vca_template.docx', 'docx', 'szablony', 'https://placeholder.com/vca_template.docx', 128000, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ARRAY['szablon', 'vca'], 'Szablon do generowania certyfikatów VCA'),
  ('Logo Firmy PNG', 'logo_zzp.png', 'image', 'zdjecia', 'https://placeholder.com/logo.png', 89000, 'image/png', ARRAY['logo', 'branding'], 'Oficjalne logo ZZP Werkplaats');

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Admin Files table created successfully!';
  RAISE NOTICE '📊 Indexes: 5 created (folder, type, created_at, uploaded_by, tags)';
  RAISE NOTICE '🔒 RLS enabled: Only admins can access';
  RAISE NOTICE '📁 Ready for Supabase Storage bucket: admin-files';
END $$;
