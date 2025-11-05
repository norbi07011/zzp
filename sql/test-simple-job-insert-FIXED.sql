-- 🧪 SIMPLE TEST JOB INSERT - FIXED WITH CORRECT ENUM VALUES
-- Quick test to verify jobs table works

-- Use existing employer: test-employer@example.com
-- employer_id (auth.users): e15f1bef-4268-49c4-ad4f-788494342b9d

-- ✅ CORRECT VALUES (with HYPHENS!):
-- employment_type: 'full-time', 'part-time', 'contract', 'freelance', 'temporary', 'internship'
-- location_type: 'on-site', 'remote', 'hybrid'
-- experience_level: 'entry', 'junior', 'mid', 'senior', 'expert', 'any'

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
  'e15f1bef-4268-49c4-ad4f-788494342b9d',
  'TEST JOB - Metselaar Amsterdam',
  'Test job description',
  'metselaar',
  'full-time',
  'on-site',
  'Amsterdam', 'NL',
  2500, 3500,
  'EUR', 'mid', 'active'
);

-- Verify insertion
SELECT 
  id,
  title,
  employment_type,
  location_type,
  experience_level,
  city,
  salary_min,
  salary_max
FROM jobs
WHERE employer_id = 'e15f1bef-4268-49c4-ad4f-788494342b9d';
