-- ====================================
-- FIX USER ROLES & REMOVE VCA SYSTEM
-- ====================================

-- PROBLEM 1: User roles są źle przypisane
-- employer@test.nl → powinien być 'employer' (nie 'worker')
-- admin@zzp.nl → powinien być 'admin' (nie 'worker')
-- worker@test.nl → powinien pozostać 'worker' ✓

-- PROBLEM 2: VCA system nie jest potrzebny
-- To jest platforma dla ZZP z certyfikatami doświadczenia
-- Nie oferujemy kursów VCA

-- ====================================
-- KROK 0: UTWÓRZ TABELĘ EMPLOYERS (jeśli nie istnieje)
-- ====================================

CREATE TABLE IF NOT EXISTS public.employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255),
  company_kvk VARCHAR(50),
  company_address TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'free',
  subscription_status VARCHAR(20) DEFAULT 'inactive',
  subscription_start_date TIMESTAMPTZ,
  subscription_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Employers view own data" ON public.employers;
CREATE POLICY "Employers view own data" ON public.employers
FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Employers update own data" ON public.employers;
CREATE POLICY "Employers update own data" ON public.employers
FOR UPDATE USING (auth.uid() = profile_id);

-- ====================================
-- KROK 1: FIX USER ROLES
-- ====================================

-- Update employer@test.nl → role 'employer'
UPDATE public.profiles
SET role = 'employer'
WHERE email = 'employer@test.nl';

-- Update admin@zzp.nl → role 'admin'
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@zzp.nl';

-- Usuń worker record dla employer@test.nl (nie powinien być w tabeli workers)
DELETE FROM public.workers
WHERE profile_id IN (
  SELECT id FROM public.profiles WHERE email = 'employer@test.nl'
);

-- Usuń worker record dla admin@zzp.nl (nie powinien być w tabeli workers)
DELETE FROM public.workers
WHERE profile_id IN (
  SELECT id FROM public.profiles WHERE email = 'admin@zzp.nl'
);

-- Dodaj employer record dla employer@test.nl
INSERT INTO public.employers (profile_id, subscription_tier, subscription_status, created_at)
SELECT 
  id,
  'premium',
  'active',
  NOW()
FROM public.profiles
WHERE email = 'employer@test.nl'
AND NOT EXISTS (
  SELECT 1 FROM public.employers WHERE profile_id = public.profiles.id
);

-- ====================================
-- KROK 2: UPDATE AUTH METADATA (WAŻNE!)
-- ====================================

-- Update user_metadata dla employer@test.nl
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"employer"'
)
WHERE email = 'employer@test.nl';

-- Update user_metadata dla admin@zzp.nl
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"admin"'
)
WHERE email = 'admin@zzp.nl';

-- Update user_metadata dla worker@test.nl (upewnij się że ma 'worker')
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{role}',
  '"worker"'
)
WHERE email = 'worker@test.nl';

-- ====================================
-- WERYFIKACJA
-- ====================================

-- Pokaż wszystkich użytkowników z rolami
SELECT 
  u.email as "Email",
  p.role as "Profile Role",
  u.raw_user_meta_data->>'role' as "Auth Metadata Role",
  CASE 
    WHEN w.profile_id IS NOT NULL THEN '✅ Worker'
    WHEN e.profile_id IS NOT NULL THEN '✅ Employer'
    ELSE '❌ Brak'
  END as "Record Type",
  COALESCE(w.subscription_tier, e.subscription_tier, 'brak') as "Subscription"
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.workers w ON p.id = w.profile_id
LEFT JOIN public.employers e ON p.id = e.profile_id
WHERE u.email IN ('worker@test.nl', 'employer@test.nl', 'admin@zzp.nl')
ORDER BY u.email;

-- Sprawdź czy tabela employers istnieje
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'employers'
) as employers_table_exists;

-- ====================================
-- NOTES
-- ====================================

-- Po uruchomieniu tego SQL:
-- 1. ✅ worker@test.nl → role: worker, w tabeli workers
-- 2. ✅ employer@test.nl → role: employer, w tabeli employers
-- 3. ✅ admin@zzp.nl → role: admin, BEZ worker/employer record

-- Frontend automatycznie przekieruje do właściwych dashboardów:
-- - worker@test.nl → /worker (Worker Dashboard)
-- - employer@test.nl → /employer (Employer Dashboard)  
-- - admin@zzp.nl → /admin (Admin Panel)

-- VCA system zostanie usunięty z kodu frontendu w następnym kroku
