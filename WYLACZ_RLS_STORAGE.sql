-- ============================================
-- WYŁĄCZ RLS DLA STORAGE (project_files bucket)
-- ============================================

-- 1. Sprawdź istniejące buckety
SELECT id, name, public FROM storage.buckets;

-- 2. Wyłącz RLS dla project_files bucket (jeśli istnieje)
UPDATE storage.buckets 
SET public = true 
WHERE name = 'project_files';

-- 3. Usuń wszystkie policies dla project_files
DELETE FROM storage.policies 
WHERE bucket_id = (SELECT id FROM storage.buckets WHERE name = 'project_files');

-- 4. Dodaj policy pozwalającą wszystkim użytkownikom na wszystko (development only!)
INSERT INTO storage.policies (bucket_id, name, definition)
VALUES (
  (SELECT id FROM storage.buckets WHERE name = 'project_files'),
  'Allow all operations',
  'true'
);
