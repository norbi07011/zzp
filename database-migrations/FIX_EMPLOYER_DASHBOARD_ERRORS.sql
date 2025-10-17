-- ============================================================================
-- DOGŁĘBNA ANALIZA I NAPRAWA PANELU EMPLOYER
-- ============================================================================

-- KROK 1: Sprawdź czy employer ma profil po płatności
SELECT 
  u.id as user_id,
  u.email,
  p.role,
  e.id as employer_id,
  e.company_name,
  e.subscription_tier,
  e.subscription_status
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
LEFT JOIN employers e ON e.profile_id = u.id
WHERE u.email LIKE '%employer%' OR u.email LIKE '%test%'
ORDER BY u.created_at DESC;

-- KROK 2: Sprawdź RLS policies na tabeli profiles (czy nie ma rekursji)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- KROK 3: Sprawdź RLS policies na tabeli employers
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'employers'
ORDER BY policyname;

-- KROK 4: Sprawdź czy tabela companies ma odpowiednie powiązania
SELECT 
  e.id as employer_id,
  e.company_name,
  c.id as company_id,
  c.name as company_table_name,
  c.verified
FROM employers e
LEFT JOIN companies c ON c.employer_id = e.id
LIMIT 5;

-- KROK 5: Znajdź problematyczne RLS policies (rekurencyjne zapytania)
-- Policies które odwołują się do tej samej tabeli którą zabezpieczają
SELECT 
  tablename,
  policyname,
  qual
FROM pg_policies
WHERE qual LIKE '%FROM ' || tablename || '%'
   OR qual LIKE '%FROM public.' || tablename || '%';

-- KROK 6: Sprawdź czy subscription_payments ma dane po płatności testowej
SELECT 
  sp.id,
  sp.employer_id,
  sp.amount,
  sp.status,
  sp.subscription_type,
  sp.created_at,
  e.company_name
FROM subscription_payments sp
LEFT JOIN employers e ON e.id = sp.employer_id
ORDER BY sp.created_at DESC
LIMIT 5;
