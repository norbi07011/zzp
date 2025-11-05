-- Sprawdź orphaned data (rekordy bez powiązań)

-- 1. Workers bez profiles
SELECT 'workers without profiles' as issue, COUNT(*) as count
FROM workers w
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = w.profile_id);

-- 2. Employers bez profiles  
SELECT 'employers without profiles' as issue, COUNT(*) as count
FROM employers e
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = e.profile_id);

-- 3. Applications bez workers
SELECT 'applications without workers' as issue, COUNT(*) as count
FROM applications a
WHERE NOT EXISTS (SELECT 1 FROM workers w WHERE w.id = a.worker_id);

-- 4. Applications bez jobs
SELECT 'applications without jobs' as issue, COUNT(*) as count
FROM applications a
WHERE NOT EXISTS (SELECT 1 FROM jobs j WHERE j.id = a.job_id);
