-- ================================
-- KROK 3: Dodaj profil i worker
-- ================================
-- ZAMIEŃ 'TWOJ_EMAIL@EXAMPLE.COM' na email z poprzedniego kroku!

DO $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'TWOJ_EMAIL@EXAMPLE.COM'; -- <--- ZMIEŃ TO!
BEGIN
  -- Znajdź ID użytkownika po emailu
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Nie znaleziono użytkownika o emailu: %', v_email;
  END IF;

  RAISE NOTICE 'Znaleziono użytkownika: % (ID: %)', v_email, v_user_id;

  -- Dodaj profil (jeśli nie istnieje)
  INSERT INTO public.profiles (id, email, full_name, role, created_at)
  VALUES (v_user_id, v_email, v_email, 'worker', NOW())
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Profil OK';

  -- Dodaj worker z PREMIUM (jeśli nie istnieje)
  INSERT INTO public.workers (profile_id, subscription_tier, subscription_status, created_at)
  VALUES (v_user_id, 'premium', 'active', NOW())
  ON CONFLICT (profile_id) 
  DO UPDATE SET 
    subscription_tier = 'premium',
    subscription_status = 'active';

  RAISE NOTICE 'Worker Premium OK!';
  RAISE NOTICE '=== GOTOWE! Odśwież stronę ===';
END $$;
