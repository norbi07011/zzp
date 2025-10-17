-- ============================================================================
-- FIX WIDOKÓW - USUŃ ZŁE, STWÓRZ POPRAWNE
-- ============================================================================
-- PROBLEM: Widoki mają złe joiny i za dużo kolumn
-- ROZWIĄZANIE: Proste widoki 1:1 z tabelami (bez joinów)
-- ============================================================================

-- KROK 1: USUŃ STARE WIDOKI
DROP VIEW IF EXISTS public.v_profiles CASCADE;
DROP VIEW IF EXISTS public.v_workers CASCADE;
DROP VIEW IF EXISTS public.v_employers CASCADE;
DROP VIEW IF EXISTS public.v_certificates CASCADE;

-- ============================================================================
-- KROK 2: UTWÓRZ NOWE WIDOKI (PROSTE - BEZ JOINÓW)
-- ============================================================================

-- 1. v_profiles - DOKŁADNIE jak tabela profiles
CREATE OR REPLACE VIEW public.v_profiles AS
SELECT * FROM public.profiles;

GRANT SELECT ON public.v_profiles TO anon, authenticated;
COMMENT ON VIEW public.v_profiles IS 'Widok profili - 1:1 z tabelą profiles';

-- ============================================================================

-- 2. v_workers - TYLKO kolumny z tabeli workers
CREATE OR REPLACE VIEW public.v_workers AS
SELECT 
  id,
  profile_id,
  specialization,
  skills,
  experience_years,
  hourly_rate,
  availability,
  verified,
  rating,
  rating_count,
  total_jobs,
  completed_jobs,
  bio,
  portfolio_url,
  linkedin_url,
  github_url,
  languages,
  certifications,
  education,
  work_history,
  created_at,
  updated_at
FROM public.workers;

GRANT SELECT ON public.v_workers TO anon, authenticated;
COMMENT ON VIEW public.v_workers IS 'Widok pracowników - bez joinów, Supabase robi to automatycznie';

-- ============================================================================

-- 3. v_employers - TYLKO kolumny z tabeli employers
CREATE OR REPLACE VIEW public.v_employers AS
SELECT 
  id,
  profile_id,
  company_name,
  company_size,
  industry,
  description,
  website,
  verified,
  rating,
  rating_count,
  total_jobs_posted,
  active_jobs,
  created_at,
  updated_at
FROM public.employers;

GRANT SELECT ON public.v_employers TO anon, authenticated;
COMMENT ON VIEW public.v_employers IS 'Widok pracodawców - bez joinów';

-- ============================================================================

-- 4. v_certificates - TYLKO kolumny z tabeli certificates
CREATE OR REPLACE VIEW public.v_certificates AS
SELECT 
  id,
  worker_id,
  name,
  issuer,
  issue_date,
  expiry_date,
  file_url,
  verified,
  verification_date,
  ocr_data,
  created_at,
  updated_at
FROM public.certificates;

GRANT SELECT ON public.v_certificates TO anon, authenticated;
COMMENT ON VIEW public.v_certificates IS 'Widok certyfikatów - bez joinów';

-- ============================================================================
-- KROK 3: WERYFIKACJA
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
    RAISE NOTICE '✅ v_profiles - OK (SELECT *)';
    RAISE NOTICE '✅ v_workers - OK (bez joinów)';
    RAISE NOTICE '✅ v_employers - OK (bez joinów)';
    RAISE NOTICE '✅ v_certificates - OK (bez joinów)';
    RAISE NOTICE '';
    RAISE NOTICE '🎯 DLACZEGO BEZ JOINÓW?';
    RAISE NOTICE 'Supabase automatycznie robi joiny przez:';
    RAISE NOTICE '.select("*, profile:profiles(*)")';
    RAISE NOTICE 'Więc widok musi być PROSTY!';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 GOTOWE! Odśwież przeglądarkę!';
  ELSE
    RAISE NOTICE '❌ BŁĄD: Sprawdź logi powyżej';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- INSTRUKCJE:
-- ============================================================================
-- 
-- 1. Skopiuj CAŁY ten plik
-- 2. Wklej do Supabase SQL Editor
-- 3. Kliknij RUN
-- 4. Sprawdź output: "✅ WIDOKI NAPRAWIONE: 4/4"
-- 5. Odśwież przeglądarkę: Ctrl+Shift+R
-- 6. Zaloguj się jako worker@test.nl (lub kliknij Demo → ZZP'er)
-- 7. POWINNO DZIAŁAĆ - BRAK 400!
--
-- OCZEKIWANY OUTPUT:
-- ========================================
-- ✅ WIDOKI NAPRAWIONE: 4/4
-- ========================================
-- ✅ v_profiles - OK (SELECT *)
-- ✅ v_workers - OK (bez joinów)
-- ✅ v_employers - OK (bez joinów)
-- ✅ v_certificates - OK (bez joinów)
--
-- 🎯 DLACZEGO BEZ JOINÓW?
-- Supabase automatycznie robi joiny przez:
-- .select("*, profile:profiles(*)")
-- Więc widok musi być PROSTY!
--
-- ========================================
-- 🎉 GOTOWE! Odśwież przeglądarkę!
-- ========================================
--
-- ============================================================================
