-- =====================================================
-- SUPABASE SEED DATA - ZZP Werkplaats
-- Migracja z MOCK_DATA (constants.ts)
-- Generated: 2025-10-07
-- =====================================================

-- =====================================================
-- STEP 1: CREATE TEST USERS IN AUTH (Manual step)
-- =====================================================
-- IMPORTANT: Te użytkownicy muszą być utworzeni przez Supabase Auth API
-- lub przez Dashboard → Authentication → Users → Add user
-- 
-- User 1: jan.kowalski@test.com / password: testpass123 / metadata: {role: 'worker'}
-- User 2: piotr.nowak@test.com / password: testpass123 / metadata: {role: 'worker'}
-- User 3: anna.zielinska@test.com / password: testpass123 / metadata: {role: 'worker'}
-- User 4: bouwbedrijf@test.com / password: testpass123 / metadata: {role: 'employer'}
-- User 5: designhuis@test.com / password: testpass123 / metadata: {role: 'employer'}
-- User 6: admin@test.com / password: testpass123 / metadata: {role: 'admin'}

-- Po utworzeniu użytkowników, skopiuj ich UUID z Dashboard → Authentication → Users
-- i zamień poniższe UUIDs na rzeczywiste:

-- =====================================================
-- STEP 2: INSERT PROFILES
-- =====================================================
-- UWAGA: Zastąp UUIDs rzeczywistymi wartościami z auth.users!

INSERT INTO public.profiles (id, email, full_name, avatar_url, phone, language, role, is_premium, created_at, updated_at) VALUES
-- Worker 1: Jan Kowalski
('00000000-0000-0000-0000-000000000001', 'jan.kowalski@test.com', 'Jan Kowalski', 'https://picsum.photos/seed/jan_kowalski/200', '+31 6 12345678', 'pl', 'worker', false, NOW(), NOW()),

-- Worker 2: Piotr Nowak
('00000000-0000-0000-0000-000000000002', 'piotr.nowak@test.com', 'Piotr Nowak', 'https://picsum.photos/seed/piotr_nowak/200', '+31 6 23456789', 'pl', 'worker', true, NOW(), NOW()),

-- Worker 3: Anna Zielińska
('00000000-0000-0000-0000-000000000003', 'anna.zielinska@test.com', 'Anna Zielińska', 'https://picsum.photos/seed/anna_z/200', '+31 6 34567890', 'pl', 'worker', false, NOW(), NOW()),

-- Employer 1: Bouwbedrijf Jansen
('00000000-0000-0000-0000-000000000004', 'bouwbedrijf@test.com', 'Bouwbedrijf Jansen', 'https://picsum.photos/seed/bouw_totaal/100', '+31 10 1234567', 'nl', 'employer', true, NOW(), NOW()),

-- Employer 2: Design Huis
('00000000-0000-0000-0000-000000000005', 'designhuis@test.com', 'Design Huis', 'https://picsum.photos/seed/electro_world/100', '+31 10 2345678', 'nl', 'employer', false, NOW(), NOW()),

-- Admin
('00000000-0000-0000-0000-000000000006', 'admin@test.com', 'Admin User', NULL, '+31 20 9876543', 'en', 'admin', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 3: INSERT WORKERS
-- =====================================================

INSERT INTO public.workers (
  id, profile_id, kvk_number, btw_number, specialization, hourly_rate, years_experience,
  location_city, location_coords, radius_km, available_from, rating, rating_count,
  verified, verification_documents, bio, skills, certifications, created_at, updated_at
) VALUES
-- Jan Kowalski - Senior Carpenter
(
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '12345678',
  'NL123456789B01',
  'Stolarka',
  45.00,
  15,
  'Westland',
  ST_SetSRID(ST_MakePoint(4.0, 52.0), 4326)::geography, -- Westland coordinates (approximate)
  50,
  NULL,
  4.8,
  12,
  true,
  '{"vca_verified": true, "kvk_verified": true, "btw_verified": true, "verified_until": "2025-06-15"}'::jsonb,
  'Doświadczony stolarz z ponad 15-letnim stażem w branży budowlanej. Specjalizuję się w meblach na wymiar oraz skomplikowanych konstrukcjach drewnianych. Precyzja i dbałość o detale to moje priorytety.',
  ARRAY['Montaż mebli', 'Obróbka drewna', 'Czytanie rysunku technicznego', 'Lakierowanie'],
  ARRAY['VCA VOL', 'Certyfikat czeladniczy'],
  NOW(),
  NOW()
),

-- Piotr Nowak - Regular Electrician
(
  '10000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  '23456789',
  'NL234567890B01',
  'Elektryka',
  40.00,
  5,
  'Haga',
  ST_SetSRID(ST_MakePoint(4.3, 52.1), 4326)::geography, -- The Hague coordinates (approximate)
  75,
  '2024-08-01',
  4.9,
  8,
  true,
  '{"vca_verified": true, "sep_e1_verified": true, "verified_until": "2024-12-31"}'::jsonb,
  'Elektryk z uprawnieniami SEP do 1kV. Zajmuję się instalacjami w nowych budynkach oraz modernizacją istniejących. Znam holenderskie normy i standardy.',
  ARRAY['Instalacje elektryczne', 'Pomiary elektryczne', 'Automatyka budynkowa', 'Montaż oświetlenia'],
  ARRAY['VCA Basis', 'SEP E1 do 1kV'],
  NOW(),
  NOW()
),

-- Anna Zielińska - Junior General Construction
(
  '10000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  '34567890',
  NULL,
  'Ogólnobudowlane',
  32.00,
  2,
  'Rotterdam',
  ST_SetSRID(ST_MakePoint(4.5, 51.9), 4326)::geography, -- Rotterdam coordinates (approximate)
  30,
  NULL,
  4.5,
  3,
  false,
  '{"vca_verified": false, "kvk_verified": true}'::jsonb,
  'Zmotywowana i pracowita osoba na początku swojej drogi w branży budowlanej. Szybko się uczę i chętnie podejmuję nowe wyzwania. Specjalizuję się w pracach wykończeniowych.',
  ARRAY['Malowanie', 'Szpachlowanie', 'Układanie paneli'],
  ARRAY[]::text[],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 4: INSERT EMPLOYERS
-- =====================================================

INSERT INTO public.employers (
  id, profile_id, company_name, kvk_number, industry, location_city, location_coords,
  company_size, verified, rating, rating_count, description, website, created_at, updated_at
) VALUES
-- Bouwbedrijf Jansen
(
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000004',
  'Bouwbedrijf Jansen',
  '87654321',
  'Construction',
  'Haga',
  ST_SetSRID(ST_MakePoint(4.3, 52.1), 4326)::geography,
  '51-200',
  true,
  4.7,
  24,
  'Renomowana firma budowlana z 30-letnim doświadczeniem w realizacji projektów komercyjnych i mieszkaniowych w całej Holandii.',
  'https://bouwbedrijfjansen.nl',
  NOW(),
  NOW()
),

-- Design Huis
(
  '20000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000005',
  'Design Huis',
  '98765432',
  'Interior Design',
  'Amsterdam',
  ST_SetSRID(ST_MakePoint(4.9, 52.4), 4326)::geography,
  '11-50',
  true,
  4.9,
  18,
  'Boutique studio projektowe specjalizujące się w nowoczesnym designie wnętrz i meblach na wymiar.',
  'https://designhuis.nl',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 5: INSERT CERTIFICATES
-- =====================================================

INSERT INTO public.certificates (
  id, worker_id, certificate_type, certificate_number, issuer, issue_date, expiry_date,
  file_url, verified, ocr_data, created_at, updated_at
) VALUES
-- Jan Kowalski - VCA VOL
(
  '30000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'VCA VOL',
  'VCA-VOL-123456',
  'SSVV',
  '2023-12-10',
  '2025-12-10',
  'https://example.com/certificates/jan-vca-vol.pdf',
  true,
  '{"certificate_type": "VCA VOL", "holder_name": "Jan Kowalski", "expiry_date": "2025-12-10"}'::jsonb,
  NOW(),
  NOW()
),

-- Jan Kowalski - Certyfikat Czeladniczy
(
  '30000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  'Certyfikat Czeladniczy',
  'CZ-PL-789012',
  'Izba Rzemieślnicza',
  '2010-06-15',
  NULL,
  'https://example.com/certificates/jan-czeladnik.pdf',
  true,
  '{"certificate_type": "Journeyman Certificate", "holder_name": "Jan Kowalski"}'::jsonb,
  NOW(),
  NOW()
),

-- Piotr Nowak - VCA Basis
(
  '30000000-0000-0000-0000-000000000003',
  '10000000-0000-0000-0000-000000000002',
  'VCA Basis',
  'VCA-BAS-234567',
  'SSVV',
  '2022-11-20',
  '2024-11-20',
  'https://example.com/certificates/piotr-vca-basis.pdf',
  true,
  '{"certificate_type": "VCA Basis", "holder_name": "Piotr Nowak", "expiry_date": "2024-11-20"}'::jsonb,
  NOW(),
  NOW()
),

-- Piotr Nowak - SEP E1
(
  '30000000-0000-0000-0000-000000000004',
  '10000000-0000-0000-0000-000000000002',
  'SEP E1',
  'SEP-E1-345678',
  'EXIN',
  '2023-05-15',
  '2028-05-15',
  'https://example.com/certificates/piotr-sep-e1.pdf',
  true,
  '{"certificate_type": "SEP E1 do 1kV", "holder_name": "Piotr Nowak", "expiry_date": "2028-05-15"}'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 6: INSERT JOBS
-- =====================================================

INSERT INTO public.jobs (
  id, employer_id, title, description, specialization, location_city, location_coords,
  hourly_rate_min, hourly_rate_max, start_date, end_date, required_skills, required_certifications,
  status, application_count, created_at, updated_at
) VALUES
-- Job 1: Kitchen Installation
(
  '40000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'Montaż kuchni i mebli - projekt w Hadze',
  'Poszukujemy dwóch doświadczonych stolarzy do montażu kuchni oraz mebli w nowo budowanym apartamentowcu. Wymagane doświadczenie w pracy z rysunkiem technicznym i własne podstawowe narzędzia.',
  'Stolarka',
  'Haga',
  ST_SetSRID(ST_MakePoint(4.3, 52.1), 4326)::geography,
  40.00,
  45.00,
  '2024-08-12',
  '2024-08-23',
  ARRAY['Montaż mebli', 'Obróbka drewna', 'Czytanie rysunku technicznego'],
  ARRAY['VCA'],
  'open',
  2,
  NOW(),
  NOW()
),

-- Job 2: Electrical Installation
(
  '40000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000001',
  'Instalacje elektryczne w biurowcu',
  'Duży projekt - wykonanie pełnej instalacji elektrycznej w nowym biurowcu w centrum Rotterdamu. Praca w zespole, wymagane uprawnienia i doświadczenie w obiektach komercyjnych.',
  'Elektryka',
  'Rotterdam',
  ST_SetSRID(ST_MakePoint(4.5, 51.9), 4326)::geography,
  42.00,
  48.00,
  '2024-09-02',
  '2024-11-29',
  ARRAY['Instalacje elektryczne', 'Pomiary elektryczne', 'NEN 3140'],
  ARRAY['VCA', 'NEN 3140'],
  'open',
  2,
  NOW(),
  NOW()
),

-- Job 3: Painting & Finishing
(
  '40000000-0000-0000-0000-000000000003',
  '20000000-0000-0000-0000-000000000002',
  'Prace wykończeniowe - malowanie i szpachlowanie',
  'Zlecenie na wyszpachlowanie i pomalowanie ścian i sufitów w domu jednorodzinnym (ok. 150m2 powierzchni). Materiały po stronie zleceniodawcy. Poszukujemy osoby dokładnej i terminowej.',
  'Ogólnobudowlane',
  'Westland',
  ST_SetSRID(ST_MakePoint(4.0, 52.0), 4326)::geography,
  30.00,
  35.00,
  '2024-07-29',
  '2024-08-09',
  ARRAY['Malowanie', 'Szpachlowanie'],
  ARRAY[]::text[],
  'open',
  0,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 7: INSERT JOB APPLICATIONS
-- =====================================================

INSERT INTO public.job_applications (
  id, job_id, worker_id, status, cover_letter, proposed_rate, created_at, updated_at
) VALUES
-- Jan Kowalski applied to Job 2 (Electrical Installation)
(
  '50000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000001',
  'pending',
  'Jestem zainteresowany tym projektem. Mam doświadczenie w pracy przy dużych obiektach komercyjnych.',
  43.00,
  '2024-07-10 10:30:00',
  '2024-07-10 10:30:00'
),

-- Piotr Nowak applied to Job 2 (Electrical Installation)
(
  '50000000-0000-0000-0000-000000000002',
  '40000000-0000-0000-0000-000000000002',
  '10000000-0000-0000-0000-000000000002',
  'accepted',
  'Mam uprawnienia SEP i doświadczenie w instalacjach elektrycznych w biurowcach. Chętnie dołączę do zespołu.',
  44.00,
  '2024-07-11 14:15:00',
  '2024-07-15 09:00:00'
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 8: INSERT REVIEWS
-- =====================================================

INSERT INTO public.reviews (
  id, reviewer_id, reviewee_id, job_id, rating, comment, created_at, updated_at
) VALUES
-- Review 1: Bouwbedrijf Jansen → Jan Kowalski
(
  '60000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000001',
  NULL,
  5,
  'Jan to prawdziwy profesjonalista. Praca wykonana perfekcyjnie i na czas. Polecam!',
  '2023-09-15 16:30:00',
  '2023-09-15 16:30:00'
),

-- Review 2: Design Huis → Jan Kowalski
(
  '60000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000001',
  NULL,
  4,
  'Dobra współpraca, drobne opóźnienie, ale jakość bez zarzutu.',
  '2023-06-02 11:45:00',
  '2023-06-02 11:45:00'
),

-- Review 3: Bouwbedrijf Jansen → Piotr Nowak
(
  '60000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000002',
  NULL,
  5,
  'Piotr jest rzetelnym i kompetentnym fachowcem. Wszystko działa idealnie.',
  '2023-10-20 14:20:00',
  '2023-10-20 14:20:00'
),

-- Review 4: Design Huis → Anna Zielińska
(
  '60000000-0000-0000-0000-000000000004',
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000003',
  NULL,
  5,
  'Anna jest bardzo zaangażowana. Polecam do prostszych prac.',
  '2023-09-01 10:00:00',
  '2023-09-01 10:00:00'
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 9: INSERT NOTIFICATIONS
-- =====================================================

INSERT INTO public.notifications (
  id, user_id, type, title, message, read, action_url, created_at
) VALUES
(
  '70000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000004',
  'NEW_APPLICATION',
  'New Application',
  'Jan Kowalski zaaplikował na Twoją ofertę "Instalacje elektryczne w biurowcu"',
  false,
  '/employer/applications',
  NOW()
),
(
  '70000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  'APPLICATION_ACCEPTED',
  'Application Accepted',
  'Twoja aplikacja na "Instalacje elektryczne w biurowcu" została zaakceptowana!',
  false,
  '/worker/jobs',
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check inserted data
SELECT 'Profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'Workers', COUNT(*) FROM public.workers
UNION ALL
SELECT 'Employers', COUNT(*) FROM public.employers
UNION ALL
SELECT 'Certificates', COUNT(*) FROM public.certificates
UNION ALL
SELECT 'Jobs', COUNT(*) FROM public.jobs
UNION ALL
SELECT 'Job Applications', COUNT(*) FROM public.job_applications
UNION ALL
SELECT 'Reviews', COUNT(*) FROM public.reviews
UNION ALL
SELECT 'Notifications', COUNT(*) FROM public.notifications;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. PRZED uruchomieniem tego SQL:
--    - Utwórz 6 użytkowników w Supabase Auth (Dashboard → Authentication → Users)
--    - Skopiuj ich UUIDs
--    - Zamień wszystkie '00000000-0000-0000-0000-00000000000X' na rzeczywiste UUIDs
--
-- 2. File URLs w certificates są przykładowe
--    - W produkcji zamień na rzeczywiste URLs z Supabase Storage
--
-- 3. PostGIS coordinates są przybliżone
--    - Możesz zaktualizować na dokładniejsze współrzędne
--
-- 4. ON CONFLICT (id) DO NOTHING
--    - Pozwala bezpiecznie uruchomić SQL wielokrotnie
--
-- 5. Po uruchomieniu sprawdź:
--    - Table Editor → każda tabela powinna mieć dane
--    - Workers rating powinien być automatycznie zaktualizowany przez trigger
--    - Jobs application_count powinien być 2 dla Job 2
-- =====================================================
