-- ============================================================================
-- NAPRAWA INFINITE RECURSION W PROFILES RLS POLICIES
-- ============================================================================
-- Problem: Policy na profiles sprawdza role przez SELECT z profiles
-- Rozwiązanie: Użyj auth.jwt() zamiast SELECT z profiles
-- ============================================================================

-- KROK 1: Usuń problematyczne policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- KROK 2: Dodaj nowe policies BEZ REKURSJI
-- Użyjemy prostego auth.uid() = id zamiast SELECT z profiles

-- Policy 1: Każdy może zobaczyć swój własny profil
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy 2: Każdy może edytować swój własny profil  
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- Policy 3: Admini - używamy claim z JWT zamiast SELECT
-- Gdy user się loguje, Supabase dodaje custom claim 'role' do JWT
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id  -- zawsze może zobaczyć swój profil
  OR
  (auth.jwt() ->> 'role')::text = 'admin'  -- lub jest adminem (z JWT)
);

CREATE POLICY "Admins can manage all profiles"
ON public.profiles FOR ALL
USING (
  (auth.jwt() ->> 'role')::text = 'admin'
);

-- KROK 3: Dodaj funkcję która aktualizuje JWT claims (jeśli nie istnieje)
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  user_role text;
BEGIN
  -- Pobierz rolę użytkownika z tabeli profiles
  SELECT role INTO user_role
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;

  -- Dodaj rolę do claims
  claims := event->'claims';
  
  IF user_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  END IF;

  -- Zwróć event z zaktualizowanymi claims
  event := jsonb_set(event, '{claims}', claims);
  
  RETURN event;
END;
$$;

-- ============================================================================
-- WERYFIKACJA
-- ============================================================================

-- Sprawdź czy policies zostały utworzone
SELECT 
  policyname,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================================================
-- SUKCES!
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🎉 INFINITE RECURSION NAPRAWIONE! 🎉';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Usunięto problematyczne policies';
  RAISE NOTICE '✅ Dodano nowe policies bez rekursji';
  RAISE NOTICE '✅ Dodano funkcję custom_access_token_hook';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 CO DALEJ:';
  RAISE NOTICE '  1. Wyloguj się i zaloguj ponownie (odśwież JWT token)';
  RAISE NOTICE '  2. Spróbuj otworzyć panel employer';
  RAISE NOTICE '  3. Błędy 500 powinny zniknąć!';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
