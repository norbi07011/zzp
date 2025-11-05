-- ============================================
-- ADD FOREIGN KEY RELATIONSHIP
-- ============================================
-- Dodaj foreign key constraint jobs.employer_id → employers.id
-- (jeśli nie istnieje)

-- 1. Check if foreign key already exists
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'jobs'
  AND kcu.column_name = 'employer_id';

-- 2. Add foreign key if it doesn't exist
-- (Uncomment if needed)
/*
ALTER TABLE jobs
ADD CONSTRAINT jobs_employer_id_fkey
FOREIGN KEY (employer_id)
REFERENCES employers(id)
ON DELETE CASCADE;
*/

-- 3. Verify the constraint
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'jobs'
  AND con.contype = 'f'; -- 'f' = foreign key
