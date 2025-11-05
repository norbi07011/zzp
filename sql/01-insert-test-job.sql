-- ============================================
-- INSERT TEST JOB - Metselaar
-- ============================================
-- Użyj w Supabase Dashboard: SQL Editor → New Query → Wklej i Run
-- Employer ID: 66bb0aef-c74c-4bbc-9705-43d9e4c35042 (Test Bouwbedrijf BV)

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
  'Metselaar gezocht - Amsterdam',
  'Wij zoeken een ervaren metselaar voor diverse bouwprojecten in Amsterdam en omgeving. 

Je werkt zelfstandig en in teamverband aan nieuwbouw- en renovatieprojecten.

Werkzaamheden:
- Metselwerk
- Pleisterwerk  
- Voegwerk
- Lezen van bouwtekeningen
- Kwaliteitscontrole

Wat wij bieden:
- Goed salaris tussen €2500-€3500
- Pensioenregeling
- Vakantiegeld
- Bedrijfskleding
- Doorgroeimogelijkheden',
  'Ervaren metselaar voor projecten in Amsterdam',
  'metselaar',
  'fulltime',
  'onsite',
  'Amsterdam',
  '1012AB',
  'NL',
  2500,
  3500,
  'EUR',
  'month',
  true,
  'medior',
  ARRAY['metselwerk', 'pleisterwerk', 'VCA certificaat'],
  ARRAY['rijbewijs B', 'eigen gereedschap'],
  ARRAY['VCA'],
  ARRAY['pensioenregeling', 'vakantiegeld', 'bedrijfskleding'],
  40,
  '2025-03-01',
  'active',
  NOW(),
  false,
  true,
  0,
  0,
  NOW(),
  NOW()
);

-- Verify insertion
SELECT 
  id,
  title,
  city,
  status,
  employment_type,
  experience_level,
  salary_min,
  salary_max,
  created_at
FROM jobs 
WHERE employer_id = '66bb0aef-c74c-4bbc-9705-43d9e4c35042'
ORDER BY created_at DESC
LIMIT 1;
