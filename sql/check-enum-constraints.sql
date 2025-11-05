-- ============================================
-- CHECK VALID ENUM VALUES
-- ============================================
-- Użyj tego aby sprawdzić jakie wartości są dozwolone w check constraints
-- Wklej w Supabase SQL Editor

-- 1. Check employment_type constraint
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'jobs' 
  AND con.conname LIKE '%employment_type%';

-- 2. Check experience_level constraint
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'jobs' 
  AND con.conname LIKE '%experience_level%';

-- 3. Check location_type constraint
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'jobs' 
  AND con.conname LIKE '%location_type%';

-- 4. Check status constraint
SELECT 
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'jobs' 
  AND con.conname LIKE '%status%';

-- 5. Check ALL constraints on jobs table
SELECT 
  con.conname AS constraint_name,
  con.contype AS constraint_type,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'jobs'
ORDER BY con.contype, con.conname;

-- 6. Show jobs table structure with column types
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'jobs'
  AND table_schema = 'public'
ORDER BY ordinal_position;
