-- ================================
-- KROK 2: Znajdź swojego użytkownika
-- ================================
-- Skopiuj i uruchom TO, żeby zobaczyć swoje dane:

SELECT 
  id as user_id,
  email,
  last_sign_in_at,
  created_at
FROM auth.users
ORDER BY last_sign_in_at DESC NULLS LAST
LIMIT 5;

-- Zapisz sobie email z pierwszego wiersza!
-- Użyjesz go w następnym kroku
