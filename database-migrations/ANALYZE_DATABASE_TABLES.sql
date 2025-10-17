-- ============================================
-- ANALIZA BAZY DANYCH - Pełna lista tabel
-- ============================================
-- Ten skrypt pokazuje wszystkie tabele i ich strukturę
-- ============================================

-- 1. LISTA WSZYSTKICH TABEL
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN tablename LIKE '%profile%' THEN '👤 Profile'
    WHEN tablename LIKE '%worker%' OR tablename LIKE '%pracown%' THEN '👷 Workers'
    WHEN tablename LIKE '%employer%' OR tablename LIKE '%pracodaw%' THEN '🏢 Employers'
    WHEN tablename LIKE '%certificate%' OR tablename LIKE '%certyfik%' THEN '📜 Certificates'
    WHEN tablename LIKE '%job%' OR tablename LIKE '%application%' THEN '💼 Jobs'
    WHEN tablename LIKE '%message%' OR tablename LIKE '%conversation%' THEN '💬 Messages'
    WHEN tablename LIKE '%payment%' OR tablename LIKE '%subscription%' THEN '💳 Payments'
    WHEN tablename LIKE '%admin%' THEN '⚙️ Admin'
    ELSE '📊 Other'
  END AS category
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY category, tablename;

-- 2. STATYSTYKI - ile rekordów w każdej tabeli
SELECT 
  'profiles' AS table_name,
  COUNT(*) AS row_count
FROM profiles
UNION ALL
SELECT 'workers', COUNT(*) FROM workers
UNION ALL
SELECT 'employers', COUNT(*) FROM employers
UNION ALL
SELECT 'certificates', COUNT(*) FROM certificates
UNION ALL
SELECT 'portfolio_projects', COUNT(*) FROM portfolio_projects
ORDER BY row_count DESC;

-- 3. SPRAWDŹ KTÓRE TABELE MAJĄ DANE
DO $$
DECLARE
  rec RECORD;
  row_count INTEGER;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'TABELE Z DANYMI:';
  RAISE NOTICE '============================================';
  
  FOR rec IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM %I', rec.tablename) INTO row_count;
    
    IF row_count > 0 THEN
      RAISE NOTICE '✅ % - % rekordów', rec.tablename, row_count;
    ELSE
      RAISE NOTICE '⚪ % - PUSTA', rec.tablename;
    END IF;
  END LOOP;
END $$;
