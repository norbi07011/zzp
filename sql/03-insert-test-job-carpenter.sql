-- ============================================
-- INSERT TEST JOB - Timmerman (Remote)
-- ============================================
-- Test job z location_type = 'remote' dla testowania filtrów

INSERT INTO jobs (
  id,
  employer_id,
  title,
  description,
  short_description,
  category,
  employment_type,
  location_type,
  city,
  postal_code,
  country,
  salary_min,
  salary_max,
  salary_currency,
  salary_period,
  salary_visible,
  experience_level,
  required_skills,
  preferred_skills,
  benefits,
  hours_per_week,
  start_date,
  status,
  published_at,
  urgent,
  featured,
  views_count,
  applications_count,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '66bb0aef-c74c-4bbc-9705-43d9e4c35042',
  'Timmerman - Meubelmaker (Hybride)',
  'We zijn op zoek naar een creatieve timmerman voor op maat gemaakte meubels.

Wat je doet:
- Ontwerpen en maken van meubels
- Werken met verschillende houtsoorten
- Afwerking en detaillering
- Overleg met klanten (remote mogelijk)

Werkomgeving:
- 3 dagen werkplaats in Utrecht
- 2 dagen remote (ontwerp, planning)
- Flexibele werktijden

Wij zoeken:
- Ervaring met meubelmakerij
- Oog voor detail
- Zelfstandig kunnen werken

Wij bieden:
- Creatieve vrijheid
- Modern uitgeruste werkplaats
- Hybride werken mogelijk',
  'Meubelmaker met hybride werkmogelijkheid',
  'carpenter',
  'parttime',
  'hybrid',
  'Utrecht',
  '3511AB',
  'NL',
  2200,
  3000,
  'EUR',
  'month',
  true,
  'senior',
  ARRAY['houtbewerking', 'meubelmakerij', 'technisch tekenen'],
  ARRAY['3D ontwerpsoftware', 'CNC machines'],
  ARRAY['flexibele werktijden', 'hybride werken', 'moderne werkplaats'],
  32,
  '2025-04-01',
  'active',
  NOW(),
  false,
  true,
  12,
  2,
  NOW(),
  NOW()
);

-- Verify
SELECT 
  id,
  title,
  location_type,
  employment_type,
  hours_per_week
FROM jobs 
WHERE location_type = 'hybrid'
LIMIT 1;
