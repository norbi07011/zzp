-- =============================================
-- CLEANUP WORKERS - DELETE FAILED REGISTRATIONS
-- =============================================

-- STEP 1: Show all current workers
SELECT 
  w.id as worker_id,
  w.profile_id,
  p.full_name,
  p.email,
  w.specialization,
  w.hourly_rate,
  w.years_experience,
  w.created_at
FROM workers w
JOIN profiles p ON w.profile_id = p.id
ORDER BY w.created_at DESC;

-- =============================================
-- STEP 2: DELETE WORKERS (uncomment to execute)
-- =============================================
-- Based on screenshot, keep only "ZZP WERKPLAATS" (Amsterdam, construction)
-- Delete all other workers (failed registration attempts)

-- ⚠️  IMPORTANT: First run STEP 1 to see all workers
-- ⚠️  Then identify which worker to KEEP (ZZP WERKPLAATS)
-- ⚠️  Then uncomment and modify the DELETE statement below

-- DELETE FROM workers 
-- WHERE profile_id IN (
--   SELECT profile_id FROM workers
--   WHERE id NOT IN (
--     'WORKER_ID_TO_KEEP'  -- Replace with actual worker ID to keep
--   )
-- );

-- =============================================
-- STEP 3: DELETE ORPHANED PROFILES
-- =============================================
-- Delete profiles that no longer have worker records

-- DELETE FROM profiles
-- WHERE role = 'worker'
-- AND id NOT IN (
--   SELECT profile_id FROM workers
-- );

-- =============================================
-- STEP 4: VERIFY CLEANUP
-- =============================================
-- SELECT COUNT(*) as remaining_workers FROM workers;
-- SELECT COUNT(*) as remaining_worker_profiles FROM profiles WHERE role = 'worker';
