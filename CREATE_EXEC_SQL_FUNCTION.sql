-- ============================================
-- CREATE HELPER FUNCTION: exec_sql
-- Umożliwia wykonywanie dynamicznego SQL przez API
-- ============================================

-- KROK 1: Stwórz funkcję exec_sql
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- ⚠️ Działa z prawami właściciela (admin)
AS $$
BEGIN
  EXECUTE query;
END;
$$;

-- KROK 2: Nadaj uprawnienia (tylko dla service_role)
REVOKE ALL ON FUNCTION exec_sql(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;

-- KROK 3: Alternatywna funkcja z returnem (dla SELECT)
CREATE OR REPLACE FUNCTION exec_sql_return(query text)
RETURNS SETOF json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY EXECUTE query;
END;
$$;

GRANT EXECUTE ON FUNCTION exec_sql_return(text) TO service_role;

-- ============================================
-- ✅ GOTOWE! Teraz możesz używać:
-- SELECT exec_sql('ALTER TABLE profiles DISABLE ROW LEVEL SECURITY');
-- ============================================

COMMIT;
