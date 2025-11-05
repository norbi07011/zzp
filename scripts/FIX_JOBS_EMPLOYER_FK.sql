-- ============================================
-- FIX JOBS TABLE - Add foreign key to employers
-- ============================================
-- Problem: jobs.employer_id nie ma foreign key do employers.id
-- Rozwiązanie: Dodaj foreign key constraint

-- 1. Sprawdź czy foreign key już istnieje
DO $$
BEGIN
    -- Usuń istniejący constraint jeśli istnieje (z błędną nazwą)
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'jobs_employer_id_fkey'
    ) THEN
        ALTER TABLE jobs DROP CONSTRAINT jobs_employer_id_fkey;
        RAISE NOTICE '⚠️ Usunięto stary constraint jobs_employer_id_fkey';
    END IF;
END $$;

-- 2. Dodaj foreign key constraint
ALTER TABLE jobs 
ADD CONSTRAINT fk_jobs_employer 
FOREIGN KEY (employer_id) 
REFERENCES employers(id) 
ON DELETE CASCADE;

-- 3. Sprawdź wynik
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
