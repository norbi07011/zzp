-- 🔍 CHECK CONSTRAINTS ON JOBS TABLE
-- Find out what values are allowed

-- Method 1: Check constraint definition
SELECT
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE rel.relname = 'jobs'
  AND con.contype = 'c'; -- 'c' = check constraint

-- Method 2: Check if there's an enum type
SELECT 
  t.typname,
  e.enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE '%employment%'
ORDER BY t.typname, e.enumsortorder;

-- Method 3: Check column data type
SELECT 
  column_name,
  data_type,
  udt_name,
  character_maximum_length
FROM information_schema.columns
WHERE table_name = 'jobs'
  AND column_name IN ('employment_type', 'experience_level', 'location_type', 'status')
ORDER BY ordinal_position;
