-- ============================================================================
-- SEED TEST DATA - Worker Profile Features
-- ============================================================================
-- Wklej do Supabase SQL Editor TYLKO JEŚLI chcesz dane testowe
-- Użytkownik: worker@test.nl (potrzebujemy jego worker_id)
-- ============================================================================

-- 1. ZNAJDŹ WORKER_ID (skopiuj wynik!)
DO $$
DECLARE
  v_worker_id UUID;
BEGIN
  -- Znajdź worker_id dla worker@test.nl
  SELECT w.id INTO v_worker_id
  FROM workers w
  JOIN profiles p ON w.profile_id = p.id
  WHERE p.email = 'worker@test.nl'
  LIMIT 1;
  
  IF v_worker_id IS NULL THEN
    RAISE NOTICE '❌ BŁĄD: Nie znaleziono workera dla worker@test.nl';
    RAISE NOTICE 'Sprawdź czy worker@test.nl istnieje w tabeli profiles i workers';
  ELSE
    RAISE NOTICE '✅ Worker ID: %', v_worker_id;
    RAISE NOTICE 'Skopiuj powyższe UUID i wklej w miejscu YOUR_WORKER_ID_HERE poniżej';
  END IF;
END $$;

-- ============================================================================
-- 2. WKLEJ WORKER_ID PONIŻEJ (zastąp YOUR_WORKER_ID_HERE)
-- ============================================================================

-- 2A. PORTFOLIO PROJECTS (3 przykładowe projekty)
INSERT INTO portfolio_projects (worker_id, title, description, image_url, project_url, tags, start_date, end_date, client_name)
VALUES
  -- Projekt 1: Website redesign
  (
    'YOUR_WORKER_ID_HERE'::UUID, -- 🔴 ZMIEŃ NA SWOJE!
    'Website Redesign - TechCorp',
    'Complete redesign of corporate website using modern UI/UX principles. Improved conversion rate by 35%.',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800', -- Przykładowy obrazek
    'https://techcorp-example.com',
    ARRAY['Web Design', 'UI/UX', 'React', 'TypeScript'],
    '2024-01-15',
    '2024-03-30',
    'TechCorp B.V.'
  ),
  
  -- Projekt 2: Mobile app
  (
    'YOUR_WORKER_ID_HERE'::UUID, -- 🔴 ZMIEŃ NA SWOJE!
    'Mobile Fitness App',
    'Native mobile app for fitness tracking. Features: workout plans, nutrition tracking, progress charts.',
    'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800',
    'https://github.com/example/fitness-app',
    ARRAY['Mobile', 'React Native', 'Firebase', 'Health'],
    '2023-09-01',
    '2023-12-20',
    'FitLife Amsterdam'
  ),
  
  -- Projekt 3: E-commerce platform
  (
    'YOUR_WORKER_ID_HERE'::UUID, -- 🔴 ZMIEŃ NA SWOJE!
    'E-commerce Platform',
    'Full-stack e-commerce solution with payment integration, admin panel, and inventory management.',
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800',
    NULL, -- Projekt NDA - brak publicznego URL
    ARRAY['E-commerce', 'Next.js', 'PostgreSQL', 'Stripe'],
    '2024-04-10',
    NULL, -- Ongoing project
    'ShopNL Online'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2B. JOB APPLICATIONS (2 przykładowe aplikacje)
-- ============================================================================
-- UWAGA: Potrzebujemy job_id z tabeli jobs. Jeśli jobs nie istnieją, pomiń tę sekcję.

-- Sprawdź czy są joby:
DO $$
DECLARE
  v_job_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_job_count FROM jobs LIMIT 1;
  
  IF v_job_count = 0 THEN
    RAISE NOTICE '⚠️ Brak jobów w bazie - pomijam job_applications seed';
  ELSE
    RAISE NOTICE '✅ Znaleziono joby - możesz dodać aplikacje';
  END IF;
END $$;

-- Jeśli masz joby, wklej ich ID tutaj:
INSERT INTO job_applications (worker_id, job_id, status, cover_letter, applied_at)
SELECT 
  'YOUR_WORKER_ID_HERE'::UUID, -- 🔴 ZMIEŃ NA SWOJE!
  j.id,
  'pending',
  'I am very interested in this position. With my 5 years of experience in web development...',
  NOW() - INTERVAL '3 days'
FROM jobs j
LIMIT 1 -- Weź pierwszy dostępny job
ON CONFLICT DO NOTHING;

INSERT INTO job_applications (worker_id, job_id, status, cover_letter, applied_at)
SELECT 
  'YOUR_WORKER_ID_HERE'::UUID, -- 🔴 ZMIEŃ NA SWOJE!
  j.id,
  'accepted',
  'Looking forward to contributing to your team. My skills in React and TypeScript align perfectly...',
  NOW() - INTERVAL '10 days'
FROM jobs j
OFFSET 1 LIMIT 1 -- Weź drugi job
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2C. EARNINGS (4 przykładowe wpłaty)
-- ============================================================================

INSERT INTO earnings (worker_id, job_id, amount, hours_worked, payment_date, status, description)
VALUES
  -- Zarobek 1: Completed project
  (
    'YOUR_WORKER_ID_HERE'::UUID, -- 🔴 ZMIEŃ NA SWOJE!
    NULL, -- Bez powiązania z konkretnym jobem
    1250.00,
    40,
    '2024-11-15',
    'paid',
    'Website redesign project - TechCorp'
  ),
  
  -- Zarobek 2: Monthly retainer
  (
    'YOUR_WORKER_ID_HERE'::UUID, -- 🔴 ZMIEŃ NA SWOJE!
    NULL,
    850.50,
    25,
    '2024-12-01',
    'paid',
    'Monthly maintenance - December 2024'
  ),
  
  -- Zarobek 3: Pending payment
  (
    'YOUR_WORKER_ID_HERE'::UUID, -- 🔴 ZMIEŃ NA SWOJE!
    NULL,
    2100.00,
    60,
    '2025-01-05',
    'pending',
    'Mobile app development - Phase 1'
  ),
  
  -- Zarobek 4: Disputed
  (
    'YOUR_WORKER_ID_HERE'::UUID, -- 🔴 ZMIEŃ NA SWOJE!
    NULL,
    450.00,
    12,
    '2024-10-20',
    'disputed',
    'Logo design - client requested revision'
  )
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 2D. REVIEWS (2 przykładowe recenzje)
-- ============================================================================
-- UWAGA: Potrzebujemy employer_id. Jeśli nie masz, pomiń.

-- Znajdź pierwszego employera:
DO $$
DECLARE
  v_employer_id UUID;
  v_worker_id UUID := 'YOUR_WORKER_ID_HERE'::UUID; -- 🔴 ZMIEŃ NA SWOJE!
BEGIN
  -- Znajdź employera (employer@test.nl jeśli istnieje)
  SELECT e.id INTO v_employer_id
  FROM employers e
  JOIN profiles p ON e.profile_id = p.id
  WHERE p.email = 'employer@test.nl'
  LIMIT 1;
  
  IF v_employer_id IS NULL THEN
    RAISE NOTICE '⚠️ Brak employera - pomijam reviews seed';
  ELSE
    -- Dodaj 2 recenzje
    INSERT INTO reviews (worker_id, employer_id, job_id, rating, comment, created_at)
    VALUES
      -- Recenzja 1: 5 stars
      (
        v_worker_id,
        v_employer_id,
        NULL,
        5,
        'Excellent work! Very professional and delivered on time. Highly recommended!',
        NOW() - INTERVAL '15 days'
      ),
      
      -- Recenzja 2: 4 stars
      (
        v_worker_id,
        v_employer_id,
        NULL,
        4,
        'Great quality work. Good communication throughout the project.',
        NOW() - INTERVAL '30 days'
      )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE '✅ Added 2 reviews';
  END IF;
END $$;

-- ============================================================================
-- 3. WERYFIKACJA DANYCH
-- ============================================================================

-- Sprawdź ile rekordów dodano:
DO $$
DECLARE
  v_worker_id UUID := 'YOUR_WORKER_ID_HERE'::UUID; -- 🔴 ZMIEŃ NA SWOJE!
  v_portfolio_count INTEGER;
  v_applications_count INTEGER;
  v_earnings_count INTEGER;
  v_reviews_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_portfolio_count FROM portfolio_projects WHERE worker_id = v_worker_id;
  SELECT COUNT(*) INTO v_applications_count FROM job_applications WHERE worker_id = v_worker_id;
  SELECT COUNT(*) INTO v_earnings_count FROM earnings WHERE worker_id = v_worker_id;
  SELECT COUNT(*) INTO v_reviews_count FROM reviews WHERE worker_id = v_worker_id;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ SEED DATA SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Portfolio projects: %', v_portfolio_count;
  RAISE NOTICE 'Job applications: %', v_applications_count;
  RAISE NOTICE 'Earnings: %', v_earnings_count;
  RAISE NOTICE 'Reviews: %', v_reviews_count;
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Total earnings: €%', (SELECT COALESCE(SUM(amount), 0) FROM earnings WHERE worker_id = v_worker_id);
  RAISE NOTICE 'Average rating: %', (SELECT COALESCE(ROUND(AVG(rating), 2), 0) FROM reviews WHERE worker_id = v_worker_id);
  RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- INSTRUKCJE UŻYCIA:
-- ============================================================================
-- 
-- 1. Uruchom sekcję 1 (DO $$ ... ZNAJDŹ WORKER_ID)
-- 2. Skopiuj wyświetlone UUID worker_id
-- 3. Zamień WSZYSTKIE "YOUR_WORKER_ID_HERE" na skopiowane UUID
-- 4. Uruchom CAŁĄ resztę skryptu (sekcje 2A-2D + 3)
-- 5. Sprawdź wynik w sekcji WERYFIKACJA DANYCH
-- 
-- OCZEKIWANY OUTPUT:
-- ✅ Portfolio projects: 3
-- ✅ Job applications: 2
-- ✅ Earnings: 4
-- ✅ Reviews: 2
-- ✅ Total earnings: €4650.50
-- ✅ Average rating: 4.50
--
-- ============================================================================
