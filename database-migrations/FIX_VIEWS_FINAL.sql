-- ============================================================================
-- FIX WIDOKÓW - OSTATECZNA WERSJA (BEZ BŁĘDÓW)
-- ============================================================================

-- USUŃ STARE WIDOKI
DROP VIEW IF EXISTS public.v_profiles CASCADE;
DROP VIEW IF EXISTS public.v_workers CASCADE;
DROP VIEW IF EXISTS public.v_employers CASCADE;
DROP VIEW IF EXISTS public.v_certificates CASCADE;

-- ============================================================================
-- UTWÓRZ NOWE WIDOKI (PROSTE - TYLKO ISTNIEJĄCE KOLUMNY)
-- ============================================================================

-- 1. v_profiles - SELECT * bezpieczne
CREATE OR REPLACE VIEW public.v_profiles AS
SELECT * FROM public.profiles;

GRANT SELECT ON public.v_profiles TO anon, authenticated;

-- 2. v_workers - SELECT * bezpieczne (użyje wszystkich kolumn które są)
CREATE OR REPLACE VIEW public.v_workers AS
SELECT * FROM public.workers;

GRANT SELECT ON public.v_workers TO anon, authenticated;

-- 3. v_employers - SELECT * bezpieczne
CREATE OR REPLACE VIEW public.v_employers AS
SELECT * FROM public.employers;

GRANT SELECT ON public.v_employers TO anon, authenticated;

-- 4. v_certificates - SELECT * bezpieczne
CREATE OR REPLACE VIEW public.v_certificates AS
SELECT * FROM public.certificates;

GRANT SELECT ON public.v_certificates TO anon, authenticated;

-- ============================================================================
-- SPRAWDŹ WYNIK
-- ============================================================================

DO $$
DECLARE
  v_view_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_view_count
  FROM pg_views 
  WHERE schemaname = 'public' 
  AND viewname IN ('v_profiles', 'v_workers', 'v_employers', 'v_certificates');
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ WIDOKI NAPRAWIONE: %/4', v_view_count;
  RAISE NOTICE '========================================';
  
  IF v_view_count = 4 THEN
    RAISE NOTICE '✅ v_profiles - OK';
    RAISE NOTICE '✅ v_workers - OK';
    RAISE NOTICE '✅ v_employers - OK';
    RAISE NOTICE '✅ v_certificates - OK';
    RAISE NOTICE '🎯 GOTOWE! Odśwież przeglądarkę (Ctrl+Shift+R)!';
  ELSE
    RAISE NOTICE '❌ BŁĄD: Sprawdź logi powyżej';
  END IF;
END $$;
