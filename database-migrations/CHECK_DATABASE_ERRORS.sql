-- ============================================================================
-- SPRAWDZENIE KTÓRE TABELE/KOLUMNY POWODUJĄ BŁĘDY
-- ============================================================================

-- 1. Sprawdź czy istnieją kluczowe tabele dla firm
SELECT 
  'companies' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') 
    THEN '✅ ISTNIEJE' ELSE '❌ BRAK' END as status
UNION ALL
SELECT 'employers', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employers') 
    THEN '✅ ISTNIEJE' ELSE '❌ BRAK' END
UNION ALL
SELECT 'subscription_payments', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscription_payments') 
    THEN '✅ ISTNIEJE' ELSE '❌ BRAK' END
UNION ALL
SELECT 'workers', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workers') 
    THEN '✅ ISTNIEJE' ELSE '❌ BRAK' END;

-- 2. Sprawdź strukturę tabeli employers (czy ma wszystkie potrzebne kolumny)
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'employers'
ORDER BY ordinal_position;

-- 3. Sprawdź strukturę tabeli companies
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'companies'
ORDER BY ordinal_position;

-- 4. Sprawdź czy są jakieś dane w employers
SELECT COUNT(*) as employer_count FROM employers;

-- 5. Sprawdź czy są jakieś dane w companies
SELECT COUNT(*) as companies_count FROM companies;
