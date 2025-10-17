-- ============================================
-- TEST: Szybka diagnoza problemu routingu
-- ============================================
-- Wykonaj ten skrypt w Supabase SQL Editor aby
-- zidentyfikować przyczynę problemu z routingiem
-- 
-- CZAS: ~10 sekund
-- ============================================

-- TEST 1: Czy tabela profiles istnieje?
-- ============================================
DO $$ 
DECLARE
    table_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ TEST 1 PASSED: Tabela profiles istnieje';
    ELSE
        RAISE NOTICE '❌ TEST 1 FAILED: Tabela profiles NIE ISTNIEJE!';
        RAISE NOTICE '   → Rozwiązanie: Wykonaj QUICK_FIX_ROUTING.sql';
    END IF;
END $$;

-- TEST 2: Czy są jakieś profile?
-- ============================================
DO $$ 
DECLARE
    profile_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM profiles;
    
    IF profile_count > 0 THEN
        RAISE NOTICE '✅ TEST 2 PASSED: Znaleziono % profili', profile_count;
    ELSE
        RAISE NOTICE '❌ TEST 2 FAILED: Brak profili w tabeli!';
        RAISE NOTICE '   → Rozwiązanie: Wykonaj QUICK_FIX_ROUTING.sql';
    END IF;
END $$;

-- TEST 3: Czy konta testowe mają poprawne role?
-- ============================================
DO $$ 
DECLARE
    admin_role TEXT;
    employer_role TEXT;
    worker_role TEXT;
    all_correct BOOLEAN := true;
BEGIN
    -- Sprawdź admin
    SELECT role INTO admin_role FROM profiles WHERE email = 'admin@zzp.nl';
    IF admin_role = 'admin' THEN
        RAISE NOTICE '✅ admin@zzp.nl ma rolę "admin"';
    ELSIF admin_role IS NULL THEN
        RAISE NOTICE '⚠️  admin@zzp.nl nie istnieje w profiles';
        all_correct := false;
    ELSE
        RAISE NOTICE '❌ admin@zzp.nl ma złą rolę: %', admin_role;
        all_correct := false;
    END IF;
    
    -- Sprawdź employer
    SELECT role INTO employer_role FROM profiles WHERE email = 'employer@test.nl';
    IF employer_role = 'employer' THEN
        RAISE NOTICE '✅ employer@test.nl ma rolę "employer"';
    ELSIF employer_role IS NULL THEN
        RAISE NOTICE '⚠️  employer@test.nl nie istnieje w profiles';
        all_correct := false;
    ELSE
        RAISE NOTICE '❌ employer@test.nl ma złą rolę: %', employer_role;
        all_correct := false;
    END IF;
    
    -- Sprawdź worker
    SELECT role INTO worker_role FROM profiles WHERE email = 'worker@test.nl';
    IF worker_role = 'worker' THEN
        RAISE NOTICE '✅ worker@test.nl ma rolę "worker"';
    ELSIF worker_role IS NULL THEN
        RAISE NOTICE '⚠️  worker@test.nl nie istnieje w profiles';
        all_correct := false;
    ELSE
        RAISE NOTICE '❌ worker@test.nl ma złą rolę: %', worker_role;
        all_correct := false;
    END IF;
    
    IF all_correct THEN
        RAISE NOTICE '✅ TEST 3 PASSED: Wszystkie konta testowe mają poprawne role';
    ELSE
        RAISE NOTICE '❌ TEST 3 FAILED: Niektóre konta mają złe lub brakujące role';
        RAISE NOTICE '   → Rozwiązanie: Wykonaj QUICK_FIX_ROUTING.sql';
    END IF;
END $$;

-- TEST 4: Czy są polityki RLS dla SELECT?
-- ============================================
DO $$ 
DECLARE
    select_policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO select_policy_count
    FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND cmd = 'SELECT';
    
    IF select_policy_count > 0 THEN
        RAISE NOTICE '✅ TEST 4 PASSED: Znaleziono % polityk SELECT dla profiles', select_policy_count;
    ELSE
        RAISE NOTICE '❌ TEST 4 FAILED: Brak polityk SELECT! RLS może blokować odczyt';
        RAISE NOTICE '   → Rozwiązanie: Wykonaj QUICK_FIX_ROUTING.sql';
    END IF;
END $$;

-- TEST 5: Czy są NULL role?
-- ============================================
DO $$ 
DECLARE
    null_role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_role_count
    FROM profiles 
    WHERE role IS NULL;
    
    IF null_role_count = 0 THEN
        RAISE NOTICE '✅ TEST 5 PASSED: Brak profili z NULL role';
    ELSE
        RAISE NOTICE '❌ TEST 5 FAILED: % profili ma NULL role!', null_role_count;
        RAISE NOTICE '   → Rozwiązanie: Wykonaj QUICK_FIX_ROUTING.sql';
    END IF;
END $$;

-- TEST 6: Czy są nieprawidłowe role?
-- ============================================
DO $$ 
DECLARE
    invalid_role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO invalid_role_count
    FROM profiles 
    WHERE role NOT IN ('admin', 'employer', 'worker');
    
    IF invalid_role_count = 0 THEN
        RAISE NOTICE '✅ TEST 6 PASSED: Wszystkie role są prawidłowe';
    ELSE
        RAISE NOTICE '❌ TEST 6 FAILED: % profili ma nieprawidłową rolę!', invalid_role_count;
        RAISE NOTICE '   → Rozwiązanie: Wykonaj QUICK_FIX_ROUTING.sql';
    END IF;
END $$;

-- TEST 7: Czy użytkownicy z auth.users mają profile?
-- ============================================
DO $$ 
DECLARE
    orphaned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO orphaned_count
    FROM auth.users au
    WHERE NOT EXISTS (
        SELECT 1 FROM profiles p WHERE p.id = au.id
    );
    
    IF orphaned_count = 0 THEN
        RAISE NOTICE '✅ TEST 7 PASSED: Wszyscy użytkownicy mają profile';
    ELSE
        RAISE NOTICE '❌ TEST 7 FAILED: % użytkowników nie ma profili!', orphaned_count;
        RAISE NOTICE '   → Rozwiązanie: Wykonaj QUICK_FIX_ROUTING.sql';
    END IF;
END $$;

-- ============================================
-- PODSUMOWANIE TESTÓW
-- ============================================

\echo ''
\echo '============================================'
\echo 'PODSUMOWANIE DIAGNOSTYKI'
\echo '============================================'

-- Pokaż wszystkie profile
SELECT 
    'PROFILE OVERVIEW' AS info,
    COUNT(*) AS total,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) AS admins,
    COUNT(CASE WHEN role = 'employer' THEN 1 END) AS employers,
    COUNT(CASE WHEN role = 'worker' THEN 1 END) AS workers,
    COUNT(CASE WHEN role IS NULL THEN 1 END) AS null_roles,
    COUNT(CASE WHEN role NOT IN ('admin', 'employer', 'worker') THEN 1 END) AS invalid_roles
FROM profiles;

-- Pokaż konkretne konta testowe
SELECT 
    'TEST ACCOUNTS' AS info,
    email,
    role,
    full_name,
    created_at
FROM profiles
WHERE email IN ('admin@zzp.nl', 'employer@test.nl', 'worker@test.nl')
ORDER BY 
    CASE role
        WHEN 'admin' THEN 1
        WHEN 'employer' THEN 2
        WHEN 'worker' THEN 3
    END;

-- Pokaż polityki RLS
SELECT 
    'RLS POLICIES' AS info,
    policyname,
    cmd,
    CASE 
        WHEN qual = 'true' THEN 'Allows all'
        ELSE 'Restricted'
    END AS access_level
FROM pg_policies
WHERE tablename = 'profiles';

\echo ''
\echo '============================================'
\echo 'NASTĘPNE KROKI:'
\echo '============================================'
\echo 'Jeśli którykolwiek test FAILED:'
\echo '  1. Wykonaj: QUICK_FIX_ROUTING.sql'
\echo '  2. Wyloguj się z aplikacji'
\echo '  3. Zaloguj ponownie'
\echo ''
\echo 'Jeśli wszystkie testy PASSED ale routing nie działa:'
\echo '  1. Wyczyść cache przeglądarki (Ctrl+Shift+Del)'
\echo '  2. Wyczyść localStorage (F12 → Console → localStorage.clear())'
\echo '  3. Przeładuj stronę (Ctrl+Shift+R)'
\echo '  4. Zaloguj ponownie'
\echo '============================================'
