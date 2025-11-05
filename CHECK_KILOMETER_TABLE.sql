\ =====================================================
-- SPRAWDZENIE TABELI invoice_kilometer_entries
-- =====================================================
-- Weryfikacja czy tabela kilometrów istnieje i ma poprawną strukturę
-- =====================================================

-- 1. CZY TABELA ISTNIEJE?
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'invoice_kilometer_entries'
) as "tabela_istnieje";

-- 2. JAKIE KOLUMNY MA TABELA?
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'invoice_kilometer_entries'
ORDER BY ordinal_position;

-- 3. JAKIE SĄ KLUCZE OBCE?
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'invoice_kilometer_entries'
  AND tc.constraint_type = 'FOREIGN KEY';

-- 4. JAKIE SĄ CONSTRAINTS?
SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'invoice_kilometer_entries';

-- 5. CZY JEST RLS WŁĄCZONY?
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'invoice_kilometer_entries';

-- 6. JAKIE SĄ RLS POLICIES?
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'invoice_kilometer_entries';

-- 7. ILE JEST WPISÓW W TABELI?
SELECT COUNT(*) as total_entries FROM invoice_kilometer_entries;

-- 8. PRZYKŁADOWY WPIS (jeśli istnieje)
SELECT * FROM invoice_kilometer_entries LIMIT 1;
