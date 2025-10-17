-- ====================================
-- NAPRAWIONE - WSZYSTKO W JEDNYM
-- ====================================

-- KROK 1: UTWÓRZ BRAKUJĄCE KOLUMNY I TABELE
-- ====================================

-- 1. Dodaj kolumnę file_url do certyfikatów (jeśli nie istnieje)
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

-- 2. Utwórz tabelę portfolio_projects (POPRAWIONA - bez kolumny status)
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  project_date DATE,
  client_name VARCHAR(255),
  location VARCHAR(255),
  images JSONB DEFAULT '[]'::jsonb,
  file_url TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  start_date DATE,
  end_date DATE,
  project_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Włącz RLS dla portfolio_projects
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- 4. Utwórz indeksy
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_worker_id ON public.portfolio_projects(worker_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_dates ON public.portfolio_projects(start_date, end_date);

-- 5. Usuń stare zasady RLS (jeśli istnieją)
DROP POLICY IF EXISTS "Users view own projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Users insert own projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Users update own projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Users delete own projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Public can view active projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Użytkownicy mogą przeglądać własne projekty" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Publiczność może przeglądać aktywne projekty" ON public.portfolio_projects;

-- 6. Utwórz zasady RLS dla portfolio_projects
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

-- 7. Nadaj uprawnienia
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_projects TO authenticated;
GRANT SELECT ON public.portfolio_projects TO anon;

-- 8. Utwórz funkcję update_updated_at (jeśli nie istnieje)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Utwórz wyzwalacz dla portfolio_projects
DROP TRIGGER IF EXISTS update_portfolio_projects_updated_at ON public.portfolio_projects;
CREATE TRIGGER update_portfolio_projects_updated_at
  BEFORE UPDATE ON public.portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- KROK 2: NAPRAW PROFILE I WORKERS
-- ====================================

-- 10. Dodaj profile dla użytkowników bez profili
INSERT INTO public.profiles (id, email, full_name, role, created_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  'worker',
  NOW()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- 11. Dodaj worker records dla profili worker bez worker records
INSERT INTO public.workers (profile_id, subscription_tier, subscription_status, created_at)
SELECT 
  p.id,
  'premium',
  'active',
  NOW()
FROM public.profiles p
WHERE p.role = 'worker'
AND NOT EXISTS (SELECT 1 FROM public.workers w WHERE w.profile_id = p.id);

-- KROK 3: WERYFIKACJA
-- ====================================

-- 12. Sprawdź kolumny w tabeli certificates
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'certificates'
ORDER BY ordinal_position;

-- 13. Sprawdź kolumny w tabeli portfolio_projects
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'portfolio_projects'
ORDER BY ordinal_position;

-- 14. Sprawdź zasady RLS
SELECT schemaname, tablename, policyname, polcmd
FROM pg_policies
WHERE tablename IN ('certificates', 'portfolio_projects')
ORDER BY tablename, policyname;

-- 15. WERYFIKACJA - pokaż użytkowników
SELECT 
  u.email as "Email",
  p.full_name as "Nazwa",
  p.role as "Rola",
  w.subscription_tier as "Plan",
  w.subscription_status as "Status"
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.workers w ON u.id = w.profile_id
ORDER BY u.created_at DESC
LIMIT 10;
