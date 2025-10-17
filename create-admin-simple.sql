-- ==========================================================
-- INSTRUKCJA: Tworzenie Konta Admina
-- ==========================================================
--
-- KROK 1: Utwórz użytkownika w Supabase Dashboard
-- ================================================
-- 1. Otwórz: https://supabase.com/dashboard/project/fldquchnitwsybkhrnns/auth/users
-- 2. Kliknij "Add User"
-- 3. Email: admin@zzpwerkplaats.nl
-- 4. Password: Admin123!@#
-- 5. ✅ Zaznacz "Auto Confirm User"
-- 6. Kliknij "Create user"
-- 7. SKOPIUJ User ID (UUID z kolumny UID)
--
-- KROK 2: Wykonaj poniższe SQL
-- ================================
-- Zamień 'WKLEJ_USER_ID_TUTAJ' na skopiowane UUID
--
-- ==========================================================

-- Utwórz profil admina
INSERT INTO profiles (id, email, full_name, role)
VALUES (
  'WKLEJ_USER_ID_TUTAJ'::uuid,  -- ⬅️ ZAMIEŃ TO NA PRAWDZIWE UUID
  'admin@zzpwerkplaats.nl',
  'Admin Test',
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin', full_name = 'Admin Test';

-- Sprawdź czy profil został utworzony
SELECT
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE email = 'admin@zzpwerkplaats.nl';

-- ==========================================================
-- GOTOWE! Możesz się teraz zalogować:
-- Email: admin@zzpwerkplaats.nl
-- Hasło: Admin123!@#
-- ==========================================================
