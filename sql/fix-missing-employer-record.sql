-- ============================================
-- CREATE MISSING EMPLOYER RECORD
-- ============================================
-- Użyj tego gdy user zarejestrował się ale employer record nie został utworzony

-- 1. Sprawdź profil użytkownika
SELECT id, email, role FROM profiles WHERE email = 'lenavalentinass@gmail.com';

-- 2. Utwórz employer record (zamień profile_id na ID z query powyżej)
-- UWAGA: Wklej ID z pierwszego query jako profile_id poniżej!

INSERT INTO employers (
  profile_id,
  company_name,
  kvk_number,
  industry,
  location_city,
  phone,
  email,
  subscription_tier,
  subscription_status,
  verified
)
VALUES (
  '8a17942f-7209-469a-bafc-1a748d195eef', -- ← Zamień na prawdziwe ID z query #1
  'Test Company',
  '',
  'other',
  '',
  '',
  'lenavalentinass@gmail.com',
  'basic',
  'active',
  false
)
RETURNING *;

-- 3. Sprawdź czy employer_stats został utworzony (powinien być trigger)
SELECT * FROM employer_stats WHERE employer_id IN (
  SELECT id FROM employers WHERE email = 'lenavalentinass@gmail.com'
);

-- 4. Jeśli brak employer_stats, utwórz ręcznie:
INSERT INTO employer_stats (
  employer_id,
  active_jobs,
  filled_jobs,
  total_jobs_posted,
  total_applications_received,
  pending_applications,
  total_saved_workers,
  total_searches,
  searches_this_week,
  searches_this_month,
  last_search_at,
  total_contacts,
  contacts_this_week,
  contacts_this_month,
  last_contact_at
)
SELECT 
  id,
  0,  -- active_jobs
  0,  -- filled_jobs
  0,  -- total_jobs_posted
  0,  -- total_applications_received
  0,  -- pending_applications
  0,  -- total_saved_workers
  0,  -- total_searches
  0,  -- searches_this_week
  0,  -- searches_this_month
  NULL,  -- last_search_at
  0,  -- total_contacts
  0,  -- contacts_this_week
  0,  -- contacts_this_month
  NULL  -- last_contact_at
FROM employers 
WHERE email = 'lenavalentinass@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM employer_stats WHERE employer_id = employers.id
)
RETURNING *;
