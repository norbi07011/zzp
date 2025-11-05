-- ============================================
-- UTWÓRZ BUCKET project_files W SUPABASE STORAGE
-- ============================================

-- 1. Sprawdź istniejące buckety
SELECT id, name, public FROM storage.buckets;

-- 2. Utwórz bucket project_files (jeśli nie istnieje)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project_files', 'project_files', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Sprawdź czy został utworzony
SELECT id, name, public FROM storage.buckets WHERE name = 'project_files';
