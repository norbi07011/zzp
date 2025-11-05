-- Check all workers in database
SELECT 
  w.id as worker_id,
  w.profile_id,
  p.full_name,
  p.email,
  w.specialization,
  w.hourly_rate,
  w.years_of_experience,
  w.city,
  w.created_at
FROM workers w
JOIN profiles p ON w.profile_id = p.id
ORDER BY w.created_at DESC;

-- Check profiles with role = worker
SELECT 
  id,
  email,
  full_name,
  role,
  created_at
FROM profiles
WHERE role = 'worker'
ORDER BY created_at DESC;
