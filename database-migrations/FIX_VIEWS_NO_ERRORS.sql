-- ============================================================================
-- FIX WIDOKÓW - WERSJA UPROSZCZONA (BEZ BŁĘDÓW SKŁADNI)
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

-- ============================================================================
-- KROK 3: WERYFIKACJA
-- ============================================================================

SELECT 
  'WIDOKI NAPRAWIONE: ' || COUNT(*) || '/4' AS status
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('v_profiles', 'v_workers', 'v_employers', 'v_certificates');

-- Jeśli powyższe zwraca "WIDOKI NAPRAWIONE: 4/4" → SUKCES!
-- Jeśli zwraca mniej niż 4 → sprawdź błędy powyżej

-- ============================================================================
-- INSTRUKCJE:
-- ============================================================================
-- 
-- 1. Skopiuj CAŁY ten plik (od linii 1 do końca)
-- 2. Wklej do Supabase SQL Editor
-- 3. Kliknij RUN (lub Ctrl+Enter)
-- 4. Sprawdź Results:
--    Powinno pokazać: "WIDOKI NAPRAWIONE: 4/4"
-- 5. Odśwież przeglądarkę: Ctrl+Shift+R
-- 6. Zaloguj się jako worker@test.nl (Demo → ZZP'er)
-- 7. POWINNO DZIAŁAĆ - BRAK 400 błędów!
--
-- ============================================================================
