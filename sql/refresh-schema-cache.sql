-- 🔄 REFRESH SUPABASE SCHEMA CACHE
-- This forces Supabase to reload table relationships

-- Method 1: Drop and recreate the foreign key
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_employer_id_fkey;

ALTER TABLE jobs
ADD CONSTRAINT jobs_employer_id_fkey
FOREIGN KEY (employer_id)
REFERENCES employers(id)
ON DELETE CASCADE;

-- Method 2: Verify the constraint exists
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'jobs'
  AND tc.constraint_type = 'FOREIGN KEY';

-- Method 3: Check if employer_id column exists in jobs table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'jobs'
  AND column_name = 'employer_id';

-- Method 4: Test query with explicit join (bypass schema cache)
SELECT 
  j.id,
  j.title,
  j.status,
  e.company_name,
  p.email
FROM jobs j
LEFT JOIN employers e ON j.employer_id = e.id
LEFT JOIN profiles p ON e.profile_id = p.id
LIMIT 5;
