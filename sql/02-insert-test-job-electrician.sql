-- ============================================
-- INSERT TEST JOB - Elektricien
-- ============================================
-- Drugi test job dla różnorodności

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
  required_certificates,
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
  'Elektricien - Woningbouw Rotterdam',
  'Voor woningbouwprojecten in Rotterdam zoeken wij een ervaren elektricien.

Wat ga je doen?
- Installeren van elektrische leidingen en componenten
- Aansluiten van groepenkast
- Montage van stopcontacten en schakelaars
- Testen van installaties
- Werken volgens NEN normen

Wat verwachten wij?
- Minimaal 3 jaar ervaring
- VOG verklaring
- Kennis van NEN 1010
- Rijbewijs B

Wat bieden wij?
- Aantrekkelijk salaris €3000-€4000
- Lease auto mogelijk
- Opleidingsmogelijkheden
- Prettige werkomgeving',
  'Elektricien voor woningbouw in Rotterdam',
  'electrician',
  'fulltime',
  'onsite',
  'Rotterdam',
  '3011AA',
  'NL',
  3000,
  4000,
  'EUR',
  'month',
  true,
  'medior',
  ARRAY['elektricien', 'NEN 1010', 'VOG'],
  ARRAY['rijbewijs B', 'VCA certificaat'],
  ARRAY['VOG'],
  ARRAY['lease auto', 'opleidingen', 'pensioenregeling'],
  40,
  '2025-02-15',
  'active',
  NOW(),
  true,
  false,
  5,
  0,
  NOW(),
  NOW()
);

-- Verify
SELECT 
  id,
  title,
  city,
  urgent,
  salary_min,
  salary_max
FROM jobs 
WHERE title LIKE '%Elektricien%'
LIMIT 1;
