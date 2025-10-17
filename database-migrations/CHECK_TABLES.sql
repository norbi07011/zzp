-- =========================================
-- DIAGNOZA: Sprawdź które tabele istnieją
-- =========================================
-- Uruchom TO NAJPIERW żeby zobaczyć co masz w bazie
-- =========================================

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- To pokaże wszystkie tabele w Twojej bazie.
-- Skopiuj wynik i wyślij mi go, żebym mógł naprawić SQL.
