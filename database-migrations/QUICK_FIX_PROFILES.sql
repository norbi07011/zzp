-- ================================
-- QUICK FIX: Certificates + Profile + Worker
-- ================================

-- 1. UTWÓRZ TABELĘ CERTIFICATES
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_type VARCHAR(50) NOT NULL,
  certificate_number VARCHAR(100) UNIQUE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  pdf_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy
CREATE INDEX IF NOT EXISTS idx_certificates_worker_id ON public.certificates(worker_id);

-- RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
CREATE POLICY "Users can view own certificates"
ON public.certificates FOR SELECT
USING (auth.uid() = worker_id);

GRANT SELECT ON public.certificates TO authenticated;

-- ================================
-- 2. NAPRAW PROFIL
-- ================================

DO $$
DECLARE
  user_id UUID;
  user_email TEXT;
BEGIN
  -- Znajdź ostatnio zalogowanego użytkownika
  SELECT id, email INTO user_id, user_email
  FROM auth.users
  ORDER BY last_sign_in_at DESC NULLS LAST
  LIMIT 1;

  RAISE NOTICE 'Naprawiam profil dla: % (%)', user_email, user_id;

  -- Dodaj profil
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (user_id, user_email, user_email, 'worker')
  ON CONFLICT (id) DO UPDATE SET updated_at = NOW();

  RAISE NOTICE 'Profil utworzony';

  -- Dodaj worker z PREMIUM (payment był successful!)
  INSERT INTO public.workers (profile_id, subscription_tier, subscription_status)
  VALUES (user_id, 'premium', 'active')
  ON CONFLICT (profile_id) DO UPDATE 
  SET 
    subscription_tier = 'premium', 
    subscription_status = 'active',
    updated_at = NOW();

  RAISE NOTICE 'Worker Premium utworzony dla: %', user_email;
END $$;

-- ================================
-- 3. WERYFIKACJA
-- ================================

SELECT 
  u.email,
  p.role,
  w.subscription_tier,
  w.subscription_status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.workers w ON u.id = w.profile_id
ORDER BY u.last_sign_in_at DESC NULLS LAST
LIMIT 3;
