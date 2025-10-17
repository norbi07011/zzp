-- ============================================
-- SZYBKA WERYFIKACJA: Które tabele istnieją?
-- ============================================
-- Wykonaj to w Supabase SQL Editor aby zobaczyć
-- dokładnie które tabele masz w bazie
-- ============================================

-- 1. LISTA WSZYSTKICH TABEL (tylko public schema)
SELECT 
  tablename AS "Nazwa tabeli",
  CASE 
    WHEN tablename IN ('profiles', 'workers', 'employers') THEN '✅ PODSTAWOWA'
    WHEN tablename IN ('worker_certificates', 'portfolio_projects', 'job_applications', 'earnings', 'worker_skills', 'worker_reviews', 'worker_experiences', 'worker_availability') THEN '🚨 DLA PRACOWNIKA'
    WHEN tablename IN ('employer_searches', 'saved_workers', 'worker_views', 'conversations', 'messages') THEN '🚨 DLA PRACODAWCY'
    WHEN tablename IN ('admin_actions', 'system_metrics', 'feature_flags') THEN '🚨 DLA ADMINA'
    ELSE '📊 INNA'
  END AS "Status"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY 
  CASE 
    WHEN tablename IN ('profiles', 'workers', 'employers') THEN 1
    WHEN tablename IN ('worker_certificates', 'portfolio_projects', 'job_applications', 'earnings', 'worker_skills', 'worker_reviews', 'worker_experiences', 'worker_availability') THEN 2
    WHEN tablename IN ('employer_searches', 'saved_workers', 'worker_views', 'conversations', 'messages') THEN 3
    WHEN tablename IN ('admin_actions', 'system_metrics', 'feature_flags') THEN 4
    ELSE 5
  END,
  tablename;

-- 2. SPRAWDŹ KLUCZOWE TABELE
SELECT 
  'Podstawowe tabele użytkowników' AS kategoria,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles' AND schemaname = 'public') THEN '✅' ELSE '❌' END AS profiles,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'workers' AND schemaname = 'public') THEN '✅' ELSE '❌' END AS workers,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employers' AND schemaname = 'public') THEN '✅' ELSE '❌' END AS employers,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'jobs' AND schemaname = 'public') THEN '✅' ELSE '❌' END AS jobs

UNION ALL

SELECT 
  'Tabele dla panelu pracownika',
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'worker_certificates' AND schemaname = 'public') THEN '✅' ELSE '❌' END,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'portfolio_projects' AND schemaname = 'public') THEN '✅' ELSE '❌' END,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'job_applications' AND schemaname = 'public') THEN '✅' ELSE '❌' END,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'earnings' AND schemaname = 'public') THEN '✅' ELSE '❌' END

UNION ALL

SELECT 
  'Tabele dla panelu pracodawcy',
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employer_searches' AND schemaname = 'public') THEN '✅' ELSE '❌' END,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'saved_workers' AND schemaname = 'public') THEN '✅' ELSE '❌' END,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'conversations' AND schemaname = 'public') THEN '✅' ELSE '❌' END,
  CASE WHEN EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'messages' AND schemaname = 'public') THEN '✅' ELSE '❌' END;

-- 3. ILE REKORDÓW W KLUCZOWYCH TABELACH?
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'STATYSTYKI DANYCH:';
  RAISE NOTICE '============================================';
  
  -- Sprawdź profiles
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles') THEN
    SELECT COUNT(*) INTO table_count FROM profiles;
    RAISE NOTICE '✅ profiles: % rekordów', table_count;
  ELSE
    RAISE NOTICE '❌ profiles: TABELA NIE ISTNIEJE!';
  END IF;
  
  -- Sprawdź workers
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'workers') THEN
    SELECT COUNT(*) INTO table_count FROM workers;
    RAISE NOTICE '✅ workers: % rekordów', table_count;
  ELSE
    RAISE NOTICE '❌ workers: TABELA NIE ISTNIEJE!';
  END IF;
  
  -- Sprawdź employers
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'employers') THEN
    SELECT COUNT(*) INTO table_count FROM employers;
    RAISE NOTICE '✅ employers: % rekordów', table_count;
  ELSE
    RAISE NOTICE '❌ employers: TABELA NIE ISTNIEJE!';
  END IF;
  
  -- Sprawdź certificates (stara tabela seed)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'certificates') THEN
    SELECT COUNT(*) INTO table_count FROM certificates;
    RAISE NOTICE '⚠️  certificates (seed): % rekordów - BEZ FK do workers!', table_count;
  ELSE
    RAISE NOTICE '❌ certificates: tabela nie istnieje';
  END IF;
  
  -- Sprawdź portfolio_projects
  IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'portfolio_projects') THEN
    SELECT COUNT(*) INTO table_count FROM portfolio_projects;
    RAISE NOTICE '✅ portfolio_projects: % rekordów', table_count;
  ELSE
    RAISE NOTICE '❌ portfolio_projects: TABELA NIE ISTNIEJE - POTRZEBNA!';
  END IF;
  
  RAISE NOTICE '============================================';
END $$;

-- 4. POKAŻ TOTAL COUNT
SELECT 
  COUNT(*) AS "Total tabel w public schema"
FROM pg_tables
WHERE schemaname = 'public';
