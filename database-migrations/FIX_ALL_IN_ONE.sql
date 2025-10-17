-- ====================================
-- WSZYSTKO W JEDNYM - COPY & PASTE
-- ====================================

-- 1. Utwórz tabelę certificates
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

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own certs" ON public.certificates;
CREATE POLICY "Users view own certs" ON public.certificates
FOR SELECT USING (auth.uid() = worker_id);

-- 2. Dodaj profil dla WSZYSTKICH użytkowników bez profili
INSERT INTO public.profiles (id, email, full_name, role, created_at)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.email),
  'worker',
  NOW()
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id);

-- 3. Dodaj worker records (BEZ ON CONFLICT - używamy WHERE NOT EXISTS)
INSERT INTO public.workers (profile_id, subscription_tier, subscription_status, created_at)
SELECT 
  p.id,
  'premium',
  'active',
  NOW()
FROM public.profiles p
WHERE p.role = 'worker'
AND NOT EXISTS (SELECT 1 FROM public.workers w WHERE w.profile_id = p.id);

-- 4. WERYFIKACJA - pokaż co się stało
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
