-- Get real employer IDs from employers table
SELECT 
  e.id as employer_id,
  e.company_name,
  p.email,
  p.full_name
FROM employers e
JOIN profiles p ON e.profile_id = p.id
ORDER BY e.created_at;

-- Also check auth.users to see what IDs exist
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE id IN (
  SELECT profile_id FROM employers
)
ORDER BY created_at;
