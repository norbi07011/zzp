-- ============================================
-- SPRAWDZENIE STRUKTURY BAZY DANYCH
-- ============================================

-- 1. WSZYSTKIE TABELE W SCHEMACIE PUBLIC
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. TABELE ZWIĄZANE Z EMPLOYER
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%employer%';

-- 3. SPRAWDŹ CZY ISTNIEJE USER: lenavalentinaaa@gmail.com
SELECT id, email, role, created_at
FROM auth.users
WHERE email = 'lenavalentinaaa@gmail.com';

-- 4. SPRAWDŹ PROFIL W TABELI PROFILES
SELECT id, email, role, display_name
FROM profiles
WHERE email = 'lenavalentinaaa@gmail.com';
