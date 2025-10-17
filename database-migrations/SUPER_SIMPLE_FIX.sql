-- ================================
-- NAJPROSTSZY FIX - BEZ BŁĘDÓW
-- ================================

-- 1. UTWÓRZ TABELĘ CERTIFICATES (jeśli nie istnieje)
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

-- RLS dla certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
CREATE POLICY "Users can view own certificates"
ON public.certificates FOR SELECT
USING (auth.uid() = worker_id);

GRANT SELECT ON public.certificates TO authenticated;

-- ================================
-- 2. NAPRAW PROFIL I WORKER
-- ================================

DO $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  -- Znajdź ostatnio zalogowanego użytkownika
  SELECT id, email INTO v_user_id, v_user_email
  FROM auth.users
  ORDER BY last_sign_in_at DESC NULLS LAST
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Nie znaleziono żadnego użytkownika';
  END IF;

  RAISE NOTICE 'Naprawiam użytkownika: % (ID: %)', v_user_email, v_user_id;

  -- Sprawdź czy profil istnieje
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    -- Utwórz nowy profil
    INSERT INTO public.profiles (id, email, full_name, role, created_at)
    VALUES (v_user_id, v_user_email, v_user_email, 'worker', NOW());
    RAISE NOTICE 'Utworzono nowy profil';
  ELSE
    RAISE NOTICE 'Profil już istnieje';
  END IF;

  -- Sprawdź czy worker istnieje
  IF NOT EXISTS (SELECT 1 FROM public.workers WHERE profile_id = v_user_id) THEN
    -- Utwórz nowy worker z PREMIUM
    INSERT INTO public.workers (
      profile_id, 
      subscription_tier, 
      subscription_status,
      created_at
    )
    VALUES (
      v_user_id, 
      'premium', 
      'active',
      NOW()
    );
    RAISE NOTICE 'Utworzono worker z Premium subscription';
  ELSE
    -- Zaktualizuj istniejący worker na PREMIUM
    UPDATE public.workers
    SET 
      subscription_tier = 'premium',
      subscription_status = 'active'
    WHERE profile_id = v_user_id;
    RAISE NOTICE 'Zaktualizowano worker na Premium';
  END IF;

  RAISE NOTICE '=== GOTOWE! ===';
END $$;

-- ================================
-- 3. WERYFIKACJA
-- ================================

SELECT 
  u.email as "Email użytkownika",
  p.role as "Rola",
  w.subscription_tier as "Plan subskrypcji",
  w.subscription_status as "Status subskrypcji"
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.workers w ON u.id = w.profile_id
ORDER BY u.last_sign_in_at DESC NULLS LAST
LIMIT 5;
