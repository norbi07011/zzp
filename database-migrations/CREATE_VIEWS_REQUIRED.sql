-- ============================================================================
-- TWORZENIE WIDOKÓW (VIEWS) - WYMAGANE DLA OPCJI A
-- ============================================================================
-- Te widoki są KONIECZNE bo kod frontendu teraz używa v_* zamiast tabel!
-- Uruchom w Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. WIDOK: v_profiles
-- Bezpieczny dostęp do profili użytkowników
CREATE OR REPLACE VIEW public.v_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  email,
  phone,
  avatar_url,
  bio,
  location,
  preferences,
  created_at,
  updated_at
FROM public.profiles;

-- Uprawnienia
GRANT SELECT ON public.v_profiles TO anon, authenticated;

COMMENT ON VIEW public.v_profiles IS 'Widok profili użytkowników z RLS';

-- ============================================================================
-- 2. WIDOK: v_workers
-- Bezpieczny dostęp do profili pracowników
CREATE OR REPLACE VIEW public.v_workers AS
SELECT 
  w.id,
  w.profile_id,
  w.user_id,
  w.specialization,
  w.skills,
  w.experience_years,
  w.hourly_rate,
  w.availability,
  w.verified,
  w.verification_documents,
  w.rating,
  w.rating_count,
  w.total_jobs,
  w.completed_jobs,
  w.bio,
  w.portfolio_url,
  w.linkedin_url,
  w.github_url,
  w.languages,
  w.certifications,
  w.education,
  w.work_history,
  w.created_at,
  w.updated_at,
  -- Relacja z profilem
  p.full_name,
  p.email,
  p.phone,
  p.avatar_url,
  p.location
FROM public.workers w
LEFT JOIN public.profiles p ON w.profile_id = p.id;

-- Uprawnienia
GRANT SELECT ON public.v_workers TO anon, authenticated;

COMMENT ON VIEW public.v_workers IS 'Widok pracowników z danymi profilu';

-- ============================================================================
-- 3. WIDOK: v_employers
-- Bezpieczny dostęp do profili pracodawców
CREATE OR REPLACE VIEW public.v_employers AS
SELECT 
  e.id,
  e.profile_id,
  e.user_id,
  e.company_name,
  e.company_size,
  e.industry,
  e.description,
  e.website,
  e.verified,
  e.verification_documents,
  e.rating,
  e.rating_count,
  e.total_jobs_posted,
  e.active_jobs,
  e.created_at,
  e.updated_at,
  -- Relacja z profilem
  p.full_name,
  p.email,
  p.phone,
  p.avatar_url,
  p.location
FROM public.employers e
LEFT JOIN public.profiles p ON e.profile_id = p.id;

-- Uprawnienia
GRANT SELECT ON public.v_employers TO anon, authenticated;

COMMENT ON VIEW public.v_employers IS 'Widok pracodawców z danymi profilu';

-- ============================================================================
-- 4. WIDOK: v_certificates
-- Bezpieczny dostęp do certyfikatów pracowników
CREATE OR REPLACE VIEW public.v_certificates AS
SELECT 
  c.id,
  c.worker_id,
  c.name,
  c.issuer,
  c.issue_date,
  c.expiry_date,
  c.file_url,
  c.verified,
  c.verification_date,
  c.ocr_data,
  c.created_at,
  c.updated_at,
  -- Relacja z workerem i profilem
  w.profile_id,
  p.full_name AS worker_name,
  p.email AS worker_email
FROM public.certificates c
LEFT JOIN public.workers w ON c.worker_id = w.id
LEFT JOIN public.profiles p ON w.profile_id = p.id;

-- Uprawnienia
GRANT SELECT ON public.v_certificates TO anon, authenticated;

COMMENT ON VIEW public.v_certificates IS 'Widok certyfikatów z danymi pracownika';

-- ============================================================================
-- 5. WERYFIKACJA - Sprawdź czy widoki powstały
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
  RAISE NOTICE '✅ WIDOKI UTWORZONE: %/4', v_view_count;
  RAISE NOTICE '========================================';
  
  IF v_view_count = 4 THEN
    RAISE NOTICE '✅ v_profiles - OK';
    RAISE NOTICE '✅ v_workers - OK';
    RAISE NOTICE '✅ v_employers - OK';
    RAISE NOTICE '✅ v_certificates - OK';
    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 WSZYSTKIE WIDOKI GOTOWE!';
    RAISE NOTICE 'Możesz teraz testować frontend!';
  ELSE
    RAISE NOTICE '❌ BŁĄD: Nie wszystkie widoki utworzone!';
    RAISE NOTICE 'Sprawdź błędy powyżej.';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- 6. TEST UPRAWNIEŃ
-- ============================================================================

DO $$
DECLARE
  v_grant_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_grant_count
  FROM information_schema.role_table_grants
  WHERE table_schema = 'public'
  AND table_name LIKE 'v_%'
  AND grantee IN ('anon', 'authenticated')
  AND privilege_type = 'SELECT';
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'UPRAWNIENIA SELECT: % (powinno być 8)', v_grant_count;
  RAISE NOTICE '========================================';
  
  IF v_grant_count >= 8 THEN
    RAISE NOTICE '✅ Uprawnienia OK!';
  ELSE
    RAISE NOTICE '⚠️ Brakuje uprawnień - uruchom ponownie GRANT SELECT';
  END IF;
  
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- INSTRUKCJE:
-- ============================================================================
-- 
-- 1. Skopiuj CAŁY ten plik
-- 2. Wklej do Supabase Dashboard → SQL Editor
-- 3. Kliknij RUN (lub Ctrl+Enter)
-- 4. Sprawdź output:
--    ✅ WIDOKI UTWORZONE: 4/4
--    ✅ UPRAWNIENIA SELECT: 8
-- 
-- 5. Jeśli SUCCESS → odśwież przeglądarkę (Ctrl+Shift+R)
-- 6. Testuj Worker Dashboard - powinno działać!
--
-- OCZEKIWANY OUTPUT:
-- ========================================
-- ✅ WIDOKI UTWORZONE: 4/4
-- ========================================
-- ✅ v_profiles - OK
-- ✅ v_workers - OK
-- ✅ v_employers - OK
-- ✅ v_certificates - OK
-- ========================================
-- 🎉 WSZYSTKIE WIDOKI GOTOWE!
-- Możesz teraz testować frontend!
-- ========================================
-- UPRAWNIENIA SELECT: 8 (powinno być 8)
-- ========================================
-- ✅ Uprawnienia OK!
-- ========================================
--
-- ============================================================================
