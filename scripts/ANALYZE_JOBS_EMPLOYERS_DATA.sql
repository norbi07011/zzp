-- ============================================
-- ANALIZA DANYCH: jobs vs employers
-- ============================================
-- Najpierw sprawdźmy co faktycznie jest w bazie danych

-- 1. Sprawdź strukturę tabeli jobs (czy employer_id jest NOT NULL?)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'jobs'
    AND column_name IN ('id', 'employer_id', 'title', 'status')
ORDER BY ordinal_position;

-- 2. Ile jobs mamy w sumie?
SELECT 
    COUNT(*) as total_jobs,
    COUNT(DISTINCT employer_id) as unique_employers,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_jobs,
    COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_jobs
FROM jobs;

-- 3. Które employer_id w jobs NIE istnieją w employers?
SELECT 
    j.id as job_id,
    j.title,
    j.employer_id,
    j.status,
    j.created_at,
    'MISSING EMPLOYER' as problem
FROM jobs j
WHERE NOT EXISTS (
    SELECT 1 FROM employers e WHERE e.id = j.employer_id
)
LIMIT 20;

-- 4. Sprawdź wszystkie employers i ile mają jobs
SELECT 
    e.id as employer_id,
    e.user_id,
    e.company_name,
    e.created_at,
    COUNT(j.id) as jobs_count
FROM employers e
LEFT JOIN jobs j ON j.employer_id = e.id
GROUP BY e.id, e.user_id, e.company_name, e.created_at
ORDER BY e.created_at DESC
LIMIT 20;

-- 4. Sprawdź wszystkie employers i ile mają jobs
SELECT 
    e.id as employer_id,
    e.user_id,
    e.company_name,
    e.created_at,
    COUNT(j.id) as jobs_count
FROM employers e
LEFT JOIN jobs j ON j.employer_id = e.id
GROUP BY e.id, e.user_id, e.company_name, e.created_at
ORDER BY e.created_at DESC
LIMIT 20;

-- 5. Znajdź "sierocę" jobs (employer_id który nie istnieje) wraz z potencjalnym rozwiązaniem
SELECT 
    j.id as job_id,
    j.title,
    j.employer_id as missing_employer_id,
    j.created_at as job_created,
    'NO EMPLOYER FOUND' as problem,
    'DELETE THIS JOB OR CREATE DUMMY EMPLOYER' as solution
FROM jobs j
WHERE NOT EXISTS (
    SELECT 1 FROM employers e WHERE e.id = j.employer_id
)
ORDER BY j.created_at DESC;
