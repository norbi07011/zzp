-- NAPRAWA: Infinite recursion w RLS policies
-- Data: 2025-11-05
-- Problem: Policy profiles ↔ employer_profiles recursive dependency

-- KROK 1: Wyłącz problematyczne policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;

-- KROK 2: Stwórz PROSTĄ policy (bez recursion)
CREATE POLICY "Users can view own profile - SIMPLE"
ON profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- KROK 3: Pozwól czytać wszystkim authenticated (bez sprawdzania employer_profiles)
CREATE POLICY "Authenticated users can view all profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- KROK 4: Napraw employer_profiles policies
DROP POLICY IF EXISTS "Employers can view own profile" ON employer_profiles;

CREATE POLICY "Employers can view own profile - NO RECURSION"
ON employer_profiles
FOR SELECT
TO authenticated
USING (
  -- Sprawdź BEZPOŚREDNIO auth.uid(), nie przez profiles
  auth.uid() = user_id
);

-- KROK 5: Refresh schema cache
NOTIFY pgrst, 'reload schema';

-- COMMIT
COMMIT;
