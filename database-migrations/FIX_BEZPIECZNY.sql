-- ====================================
-- NAPRAWIONE v2 - BEZPIECZNA MIGRACJA
-- ====================================

-- KROK 1: SPRAWDŹ I NAPRAW TABELĘ PORTFOLIO_PROJECTS
-- ====================================

-- 1. Najpierw sprawdź, czy tabela portfolio_projects istnieje
DO $$
BEGIN
  -- Jeśli tabela nie istnieje, utwórz ją
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_projects'
  ) THEN
    CREATE TABLE public.portfolio_projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url TEXT,
      project_url TEXT,
      tags TEXT[],
      start_date DATE NOT NULL,
      end_date DATE,
      client_name TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- 2. Dodaj brakujące kolumny do portfolio_projects (jeśli nie istnieją)
DO $$
BEGIN
  -- Dodaj project_date jeśli nie istnieje
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_projects' 
    AND column_name = 'project_date'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN project_date DATE;
  END IF;

  -- Dodaj location jeśli nie istnieje
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_projects' 
    AND column_name = 'location'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN location VARCHAR(255);
  END IF;

  -- Dodaj images jeśli nie istnieje
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_projects' 
    AND column_name = 'images'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
  END IF;

  -- Dodaj file_url jeśli nie istnieje
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_projects' 
    AND column_name = 'file_url'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN file_url TEXT;
  END IF;
END $$;

-- KROK 2: NAPRAW TABELĘ CERTIFICATES
-- ====================================

-- 3. Utwórz tabelę certificates jeśli nie istnieje
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_type VARCHAR(50) NOT NULL,
  certificate_number VARCHAR(100),
  issue_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Dodaj kolumnę file_url do certificates (jeśli nie istnieje)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'certificates' 
    AND column_name = 'file_url'
  ) THEN
    ALTER TABLE public.certificates ADD COLUMN file_url TEXT;
  END IF;
END $$;

-- KROK 3: RLS I UPRAWNIENIA
-- ====================================

-- 5. Włącz RLS
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 6. Usuń stare zasady RLS dla portfolio_projects
DROP POLICY IF EXISTS "Users view own projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Users insert own projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Users update own projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Users delete own projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Public can view all projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Public can view active projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Użytkownicy mogą przeglądać własne projekty" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Publiczność może przeglądać aktywne projekty" ON public.portfolio_projects;

-- 7. Utwórz zasady RLS dla portfolio_projects
CREATE POLICY "Users view own projects"
ON public.portfolio_projects
FOR SELECT
USING (auth.uid() = worker_id);

CREATE POLICY "Public can view all projects"
ON public.portfolio_projects
FOR SELECT
USING (true);

CREATE POLICY "Users insert own projects"
ON public.portfolio_projects
FOR INSERT
WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Users update own projects"
ON public.portfolio_projects
FOR UPDATE
USING (auth.uid() = worker_id);

CREATE POLICY "Users delete own projects"
ON public.portfolio_projects
FOR DELETE
USING (auth.uid() = worker_id);

-- 8. Usuń stare zasady RLS dla certificates
DROP POLICY IF EXISTS "Users view own certs" ON public.certificates;
DROP POLICY IF EXISTS "Users insert own certs" ON public.certificates;
DROP POLICY IF EXISTS "Users update own certs" ON public.certificates;
DROP POLICY IF EXISTS "Users delete own certs" ON public.certificates;

-- 9. Utwórz zasady RLS dla certificates
CREATE POLICY "Users view own certs" 
ON public.certificates
FOR SELECT 
USING (auth.uid() = worker_id);

CREATE POLICY "Users insert own certs"
ON public.certificates
FOR INSERT
WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Users update own certs"
ON public.certificates
FOR UPDATE
USING (auth.uid() = worker_id);

CREATE POLICY "Users delete own certs"
ON public.certificates
FOR DELETE
USING (auth.uid() = worker_id);

-- 10. Nadaj uprawnienia
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_projects TO authenticated;
GRANT SELECT ON public.portfolio_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;

-- KROK 4: INDEKSY I FUNKCJE
-- ====================================

-- 11. Utwórz indeksy
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_worker_id ON public.portfolio_projects(worker_id);
CREATE INDEX IF NOT EXISTS idx_certificates_worker_id ON public.certificates(worker_id);

-- 12. Utwórz funkcję update_updated_at (jeśli nie istnieje)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 13. Utwórz wyzwalacz dla portfolio_projects
DROP TRIGGER IF EXISTS update_portfolio_projects_updated_at ON public.portfolio_projects;
CREATE TRIGGER update_portfolio_projects_updated_at
  BEFORE UPDATE ON public.portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- KROK 5: NAPRAW PROFILES I WORKERS
-- ====================================

-- 14. Dodaj profile dla użytkowników bez profili
INSERT INTO public.profiles (id, email, full_name, role, created_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  'worker',
  NOW()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- 15. Dodaj worker records dla profili worker bez worker records
INSERT INTO public.workers (profile_id, subscription_tier, subscription_status, created_at)
SELECT 
  p.id,
  'premium',
  'active',
  NOW()
FROM public.profiles p
WHERE p.role = 'worker'
AND NOT EXISTS (SELECT 1 FROM public.workers w WHERE w.profile_id = p.id);

-- KROK 6: WERYFIKACJA
-- ====================================

-- 16. Sprawdź kolumny w tabeli portfolio_projects
SELECT 
  'portfolio_projects' as tabela,
  column_name as kolumna,
  data_type as typ,
  is_nullable as nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'portfolio_projects'
ORDER BY ordinal_position;

-- 17. Sprawdź kolumny w tabeli certificates
SELECT 
  'certificates' as tabela,
  column_name as kolumna,
  data_type as typ,
  is_nullable as nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'certificates'
ORDER BY ordinal_position;

-- 18. Sprawdź zasady RLS
SELECT 
  tablename as tabela,
  policyname as polityka,
  cmd as operacja
FROM pg_policies
WHERE tablename IN ('certificates', 'portfolio_projects')
ORDER BY tablename, policyname;

-- 19. WERYFIKACJA KOŃCOWA - pokaż użytkowników
SELECT 
  u.email as "Email",
  p.full_name as "Nazwa",
  p.role as "Rola",
  w.subscription_tier as "Plan",
  w.subscription_status as "Status",
  COUNT(DISTINCT pp.id) as "Liczba projektów",
  COUNT(DISTINCT c.id) as "Liczba certyfikatów",
  MAX(u.created_at) as "Data rejestracji"
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.workers w ON u.id = w.profile_id
LEFT JOIN public.portfolio_projects pp ON u.id = pp.worker_id
LEFT JOIN public.certificates c ON u.id = c.worker_id
GROUP BY u.email, p.full_name, p.role, w.subscription_tier, w.subscription_status
ORDER BY MAX(u.created_at) DESC
LIMIT 10;

-- GOTOWE! ✅
