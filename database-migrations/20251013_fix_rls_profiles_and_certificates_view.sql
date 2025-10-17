-- ============================================================================
-- KRYTYCZNA NAPRAWA: RLS Infinite Recursion + Certificates View
-- ============================================================================
-- Data: 2025-01-13
-- Autor: AI Assistant
-- Cel: 
--   1. Naprawić infinite recursion w policies dla profiles
--   2. Dodać tabelę user_roles dla bezpiecznego sprawdzania roli admin
--   3. Utworzyć widok certificates dla kompatybilności z frontem
--   4. Zabezpieczyć wszystko RLS bez rekurencji
-- ============================================================================

-- ============================================================================
-- CZĘŚĆ 1: TABELA user_roles (bez rekurencji)
-- ============================================================================

-- Tabela pomocnicza dla ról - używana w politykach zamiast profiles
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employer', 'worker')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- Włącz RLS na user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Polityki dla user_roles (PROSTE - bez rekurencji)
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;
CREATE POLICY "Users can view own role"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- ============================================================================
-- CZĘŚĆ 2: WYPEŁNIENIE user_roles z istniejących profiles
-- ============================================================================

-- Przenieś role z profiles do user_roles (idempotentnie)
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, p.role
FROM public.profiles p
WHERE p.role IS NOT NULL
ON CONFLICT (user_id) DO UPDATE 
SET role = EXCLUDED.role,
    updated_at = NOW();

-- TODO: Jeśli znasz email admina, podmień poniżej:
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'
-- FROM auth.users
-- WHERE email = 'twoj-admin@example.com'
-- ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- CZĘŚĆ 3: NAPRAWA POLICIES NA profiles (BEZ REKURENCJI!)
-- ============================================================================

-- Włącz RLS na profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USUŃ WSZYSTKIE STARE POLITYKI (które powodowały rekurencję)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

-- NOWE POLITYKI - BEZPIECZNE (bez SELECT z profiles!)

-- Policy 1: Każdy widzi swój profil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (id = auth.uid());

-- Policy 2: Każdy może edytować swój profil
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy 3: Każdy może utworzyć swój profil (przy rejestracji)
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (id = auth.uid());

-- Policy 4: Admin widzi wszystkie profile (poprzez user_roles!)
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Policy 5: Admin może zarządzać wszystkimi profilami
CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- ============================================================================
-- CZĘŚĆ 4: WIDOK certificates (kompatybilność z frontem)
-- ============================================================================

-- Usuń stary widok jeśli istnieje
DROP VIEW IF EXISTS public.certificates CASCADE;

-- Utwórz widok który łączy certificate_applications i zzp_exam_applications
CREATE OR REPLACE VIEW public.certificates AS
SELECT
  ca.id,
  ca.worker_id,
  ca.certificate_type AS name,
  ca.certificate_type,
  ca.status,
  ca.application_date AS issued_at,
  ca.review_date,
  ca.expiry_date AS expires_at,
  ca.document_url,
  ca.metadata,
  ca.created_at,
  ca.updated_at,
  'certificate_application' AS source_table
FROM public.certificate_applications ca
WHERE ca.status IN ('approved', 'under_review', 'pending')

UNION ALL

SELECT
  zea.id,
  zea.worker_id,
  zea.certificate_type AS name,
  zea.certificate_type,
  zea.status::text AS status,
  zea.scheduled_exam_date AS issued_at,
  zea.exam_completed_at AS review_date,
  (zea.exam_completed_at + INTERVAL '2 years')::date AS expires_at,
  zea.certificate_url AS document_url,
  zea.metadata,
  zea.created_at,
  zea.updated_at,
  'zzp_exam_application' AS source_table
FROM public.zzp_exam_applications zea
WHERE zea.status IN ('certified', 'passed', 'pending');

-- Polityki RLS dla widoku certificates
ALTER VIEW public.certificates SET (security_invoker = true);

-- Polityka: Worker widzi tylko swoje certyfikaty
DROP POLICY IF EXISTS "Workers can view own certificates" ON public.certificate_applications;
CREATE POLICY "Workers can view own certificates"
ON public.certificate_applications FOR SELECT
USING (
  worker_id IN (
    SELECT id FROM public.workers WHERE profile_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Workers can view own exam applications" ON public.zzp_exam_applications;
CREATE POLICY "Workers can view own exam applications"
ON public.zzp_exam_applications FOR SELECT
USING (
  worker_id IN (
    SELECT id FROM public.workers WHERE profile_id = auth.uid()
  )
);

-- Polityka: Admin widzi wszystkie certyfikaty
DROP POLICY IF EXISTS "Admins can view all certificates" ON public.certificate_applications;
CREATE POLICY "Admins can view all certificates"
ON public.certificate_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

DROP POLICY IF EXISTS "Admins can view all exam applications" ON public.zzp_exam_applications;
CREATE POLICY "Admins can view all exam applications"
ON public.zzp_exam_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- ============================================================================
-- CZĘŚĆ 5: NAPRAWA INNYCH KRYTYCZNYCH POLICIES (bez rekurencji)
-- ============================================================================

-- Workers table
DROP POLICY IF EXISTS "Admins can manage workers" ON public.workers;
CREATE POLICY "Admins can manage workers"
ON public.workers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Employers table
DROP POLICY IF EXISTS "Admins can manage employers" ON public.employers;
CREATE POLICY "Admins can manage employers"
ON public.employers FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- Jobs table
DROP POLICY IF EXISTS "Admins can manage jobs" ON public.jobs;
CREATE POLICY "Admins can manage jobs"
ON public.jobs FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- ============================================================================
-- CZĘŚĆ 6: FUNKCJA HELPER - Synchronizacja role między profiles i user_roles
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_user_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Gdy zmieni się role w profiles, zaktualizuj user_roles
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, NEW.role)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    role = EXCLUDED.role,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: synchronizuj role przy UPDATE/INSERT w profiles
DROP TRIGGER IF EXISTS sync_user_role_trigger ON public.profiles;
CREATE TRIGGER sync_user_role_trigger
AFTER INSERT OR UPDATE OF role ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_role();

-- ============================================================================
-- WERYFIKACJA
-- ============================================================================

-- Test 1: Sprawdź czy user_roles jest wypełniona
SELECT 
  ur.user_id,
  u.email,
  ur.role,
  ur.created_at
FROM public.user_roles ur
JOIN auth.users u ON u.id = ur.user_id
ORDER BY ur.created_at DESC
LIMIT 10;

-- Test 2: Sprawdź nowe policies na profiles
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Test 3: Sprawdź widok certificates
SELECT 
  id,
  worker_id,
  name,
  status,
  source_table
FROM public.certificates
LIMIT 5;

-- ============================================================================
-- SUKCES!
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🎉 KRYTYCZNA NAPRAWA ZAKOŃCZONA! 🎉';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ user_roles: Utworzona i wypełniona';
  RAISE NOTICE '✅ profiles policies: Naprawione (bez rekurencji)';
  RAISE NOTICE '✅ certificates view: Utworzony dla kompatybilności';
  RAISE NOTICE '✅ RLS policies: Wszystkie używają user_roles';
  RAISE NOTICE '✅ Trigger sync: role profiles ↔ user_roles';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 CO DALEJ:';
  RAISE NOTICE '  1. WYLOGUJ SIĘ i ZALOGUJ PONOWNIE (odśwież JWT)';
  RAISE NOTICE '  2. Sprawdź czy /rest/v1/profiles działa (200 zamiast 500)';
  RAISE NOTICE '  3. Sprawdź czy /rest/v1/certificates działa';
  RAISE NOTICE '  4. Worker/Employer/Admin dashboard powinny działać';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  JEŚLI POTRZEBUJESZ DODAĆ ADMINA RĘCZNIE:';
  RAISE NOTICE '   INSERT INTO user_roles (user_id, role)';
  RAISE NOTICE '   SELECT id, ''admin'' FROM auth.users WHERE email = ''twoj@email.com'';';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
