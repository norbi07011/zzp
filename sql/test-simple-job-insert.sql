-- 🧪 SIMPLE TEST JOB INSERT
-- Quick test to verify jobs table works

-- Use existing employer: Test Bouwbedrijf BV
-- employer_id: 66bb0aef-c74c-4bbc-9705-43d9e4c35042

-- IMPORTANT: employment_type values (with underscores!):
-- 'full_time', 'part_time', 'contract', 'temporary'

INSERT INTO jobs (
  employer_id,
  title,
  description,
  category,
  employment_type,
  location_type,
  city,
  country,
  salary_min,
  salary_max,
  salary_currency,
  experience_level,
  status
) VALUES (
  '66bb0aef-c74c-4bbc-9705-43d9e4c35042',
  'TEST JOB - Metselaar Amsterdam',
  'Test job description',
  'metselaar',
  'full_time',  -- ✅ 'full_time' | 'part_time' | 'contract' | 'temporary'
  'onsite',     -- ✅ 'onsite' | 'remote' | 'hybrid'
  'Amsterdam',
  'NL',
  2500,
  3500,
  'EUR',
  'medior',     -- ✅ 'junior' | 'medior' | 'senior' | 'expert'
  'active'      -- ✅ 'active' | 'filled' | 'expired' | 'draft'
);

-- Verify insert
SELECT 
  j.id,
  j.title,
  j.employer_id,
  e.company_name
FROM jobs j
LEFT JOIN employers e ON j.employer_id = e.id
ORDER BY j.created_at DESC
LIMIT 1;
