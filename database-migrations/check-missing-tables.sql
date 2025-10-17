-- ============================================================================
-- SZYBKIE SPRAWDZENIE BRAKUJĄCYCH TABEL
-- ============================================================================
-- Wykonaj to zapytanie w Supabase SQL Editor
-- Wynik skopiuj i wklej do VS Code
-- ============================================================================

-- Lista wszystkich tabel w bazie danych
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as columns_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Podsumowanie
SELECT 
  COUNT(*) as total_tables,
  'tabele w schemacie public' as description
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
