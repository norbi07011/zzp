-- ============================================
-- INSERT REMAINING 2 TEST JOBS
-- ============================================
-- Job 1 już istnieje: TEST JOB - Metselaar Amsterdam
-- Ten plik dodaje 2 pozostałe jobs

-- JOB 2: Elektricien - Rotterdam (Urgent)
INSERT INTO jobs (
  id, employer_id, title, description, short_description,
  category, employment_type, location_type, city, postal_code, country,
  salary_min, salary_max, salary_currency, salary_period, salary_visible,
  experience_level, required_skills, preferred_skills, required_certificates,
  benefits, hours_per_week, start_date, status, published_at,
  urgent, featured, views_count, applications_count, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '8a17942f-7209-469a-bafc-1a748d195eef',
  'Elektricien - Woningbouw Rotterdam',
  'Voor woningbouwprojecten in Rotterdam zoeken wij een ervaren elektricien. Installeren van elektrische leidingen, aansluiten groepenkast, werken volgens NEN normen.',
  'Elektricien voor woningbouw in Rotterdam',
  'electrician', 'full-time', 'on-site', 'Rotterdam', '3011AA', 'NL',
  3000, 4000, 'EUR', 'month', true,
  'mid',
  ARRAY['elektricien', 'NEN 1010', 'VOG'],
  ARRAY['rijbewijs B', 'VCA certificaat'],
  ARRAY['VOG'],
  ARRAY['lease auto', 'opleidingen', 'pensioenregeling'],
  40, '2025-02-15', 'active', NOW(),
  true, false, 5, 0, NOW(), NOW()
);

-- JOB 3: Timmerman - Utrecht (Part-time, Hybrid)
INSERT INTO jobs (
  id, employer_id, title, description, short_description,
  category, employment_type, location_type, city, postal_code, country,
  salary_min, salary_max, salary_currency, salary_period, salary_visible,
  experience_level, required_skills, preferred_skills,
  benefits, hours_per_week, start_date, status, published_at,
  urgent, featured, views_count, applications_count, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  'e15f1bef-4268-49c4-ad4f-788494342b9d',
  'Timmerman - Meubelmaker (Hybride)',
  'We zijn op zoek naar een creatieve timmerman voor op maat gemaakte meubels. 3 dagen werkplaats in Utrecht, 2 dagen remote (ontwerp, planning). Flexibele werktijden.',
  'Meubelmaker met hybride werkmogelijkheid',
  'carpenter', 'part-time', 'hybrid', 'Utrecht', '3511AB', 'NL',
  2200, 3000, 'EUR', 'month', true,
  'senior',
  ARRAY['houtbewerking', 'meubelmakerij', 'technisch tekenen'],
  ARRAY['3D ontwerpsoftware', 'CNC machines'],
  ARRAY['flexibele werktijden', 'hybride werken', 'moderne werkplaats'],
  32, '2025-04-01', 'active', NOW(),
  false, true, 12, 2, NOW(), NOW()
);

-- Verify all 3 jobs exist
SELECT 
  id,
  title,
  city,
  employment_type,
  location_type,
  experience_level,
  urgent,
  featured,
  salary_min,
  salary_max,
  created_at
FROM jobs 
WHERE employer_id IN ('e15f1bef-4268-49c4-ad4f-788494342b9d', '8a17942f-7209-469a-bafc-1a748d195eef')
ORDER BY created_at DESC;

-- Check total count
SELECT COUNT(*) as total_jobs FROM jobs;
