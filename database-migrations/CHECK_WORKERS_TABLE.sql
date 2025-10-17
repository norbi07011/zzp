-- =========================================
-- CHECK WORKERS TABLE STRUCTURE
-- =========================================
-- Sprawdzam czy workers table ma wszystkie potrzebne kolumny
-- Data: 2025-01-29
-- =========================================

-- Sprawdź strukturę tabeli workers
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'workers'
ORDER BY ordinal_position;

-- Sprawdź czy RLS jest włączony
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'workers';

-- Sprawdź polityki RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'workers';
