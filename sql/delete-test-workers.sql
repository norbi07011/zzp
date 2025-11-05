-- =============================================
-- DELETE TEST WORKERS - KEEP ONLY ORIGINAL
-- =============================================
-- Keep: lunarosexx4@gmail.com (ZZP WERKPLAATS, construction, €25/h)
-- Delete: test-worker@test.pl (test registration)
-- Delete: test@test.com (alejr wevusnib - test registration)

-- STEP 1: Delete 2 test worker records
DELETE FROM workers 
WHERE id IN (
  'a2857a24-f61d-493d-bd37-1cd2de4fc1a1',  -- test-worker@test.pl
  '4113b09b-85fd-49a9-9868-7c6491eeef89'   -- test@test.com
);

-- STEP 2: Delete orphaned profiles (those without worker records)
DELETE FROM profiles
WHERE role = 'worker'
AND id NOT IN (
  SELECT profile_id FROM workers
);

-- STEP 3: Verify cleanup
SELECT 
  w.id as worker_id,
  p.full_name,
  p.email,
  w.specialization,
  w.hourly_rate
FROM workers w
JOIN profiles p ON w.profile_id = p.id;

-- Should show only 1 worker: lunarosexx4@gmail.com
SELECT COUNT(*) as total_workers FROM workers;
SELECT COUNT(*) as total_worker_profiles FROM profiles WHERE role = 'worker';
