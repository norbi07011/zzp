-- 🔧 DATABASE REPAIR SCRIPT
-- Fixes issues found in database audit

-- ============================================================================
-- 1. DELETE ORPHANED WORKER RECORDS (6 duplicates linked to admin profile)
-- ============================================================================

-- These are bad worker records created during testing
-- All 6 records have profile_id = admin profile (should be worker profiles only)

DELETE FROM workers
WHERE profile_id = 'b96b2fc4-5318-407d-8c2b-9367c0a37c35' -- admin profile
AND id IN (
  '09277109-bec9-4c09-a349-eeb9a919b0e5',
  'e09e8cf6-1432-4cab-aca3-05c6a8e44f7b',
  '2b067ed2-ed3f-4f6c-896d-e5546bd0d284',
  'e49fbdaa-076b-4f84-b3f8-06ffc9a2a5c6',
  '516127fd-f4b4-48b6-b7ac-86817fad5a71',
  '6fa7ea73-5ea7-45c6-90d5-4efc5eab126b'
);

-- Verify: Should have 3 workers left (lunarosexx4, test@test.com, test-worker@test.pl)
SELECT COUNT(*) as worker_count FROM workers; -- Expected: 3

-- ============================================================================
-- 2. FIX EMPLOYER_STATS TABLE - Add missing total_hires column
-- ============================================================================

-- Add total_hires column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'employer_stats' 
    AND column_name = 'total_hires'
  ) THEN
    ALTER TABLE employer_stats 
    ADD COLUMN total_hires INTEGER DEFAULT 0 NOT NULL;
    
    RAISE NOTICE 'Added total_hires column to employer_stats';
  ELSE
    RAISE NOTICE 'total_hires column already exists';
  END IF;
END $$;

-- ============================================================================
-- 3. FIX JOBS TABLE - Add foreign key to employers
-- ============================================================================

-- Check if foreign key exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'jobs_employer_id_fkey'
    AND table_name = 'jobs'
  ) THEN
    -- Add foreign key constraint
    ALTER TABLE jobs
    ADD CONSTRAINT jobs_employer_id_fkey
    FOREIGN KEY (employer_id)
    REFERENCES employers(id)
    ON DELETE CASCADE;
    
    RAISE NOTICE 'Added foreign key constraint jobs_employer_id_fkey';
  ELSE
    RAISE NOTICE 'Foreign key already exists';
  END IF;
END $$;

-- ============================================================================
-- 4. VERIFY FIXES
-- ============================================================================

-- Check workers (should be 3)
SELECT 
  w.id,
  p.email,
  p.role,
  w.specialization,
  w.hourly_rate
FROM workers w
JOIN profiles p ON w.profile_id = p.id
ORDER BY p.email;

-- Check employer_stats columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'employer_stats'
ORDER BY ordinal_position;

-- Check jobs foreign key
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

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 
  'REPAIR COMPLETE' as status,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM workers) as total_workers,
  (SELECT COUNT(*) FROM employers) as total_employers,
  (SELECT COUNT(*) FROM jobs) as total_jobs;
