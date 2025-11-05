-- ============================================
-- FIX JOBS TABLE - Add foreign key to employers (with data cleanup)
-- ============================================
-- Problem: jobs.employer_id ma wartości które nie istnieją w employers.id
-- Rozwiązanie: Najpierw napraw dane, potem dodaj foreign key

-- KROK 1: Sprawdź jakie employer_id w jobs nie mają odpowiednika w employers
SELECT 
    j.employer_id,
    COUNT(*) as jobs_count,
    'MISSING IN EMPLOYERS' as status
FROM jobs j
LEFT JOIN employers e ON j.employer_id = e.id
WHERE e.id IS NULL
    AND j.employer_id IS NOT NULL
GROUP BY j.employer_id;

-- KROK 2: Opcja A - Usuń jobs bez prawidłowego employer_id
-- (odkomentuj jeśli chcesz usunąć "sierocę" jobs)
/*
DELETE FROM jobs
WHERE employer_id NOT IN (SELECT id FROM employers)
    AND employer_id IS NOT NULL;
*/

-- KROK 2: Opcja B - Ustaw employer_id na NULL dla jobs bez prawidłowego employer
-- (bezpieczniejsza opcja - zachowuje jobs ale usuwa nieprawidłowe powiązanie)
UPDATE jobs
SET employer_id = NULL
WHERE employer_id NOT IN (SELECT id FROM employers)
    AND employer_id IS NOT NULL;

-- KROK 3: Usuń stary constraint jeśli istnieje
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'jobs_employer_id_fkey'
    ) THEN
        ALTER TABLE jobs DROP CONSTRAINT jobs_employer_id_fkey;
        RAISE NOTICE '⚠️ Usunięto stary constraint jobs_employer_id_fkey';
    END IF;
    
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'fk_jobs_employer'
    ) THEN
        ALTER TABLE jobs DROP CONSTRAINT fk_jobs_employer;
        RAISE NOTICE '⚠️ Usunięto stary constraint fk_jobs_employer';
    END IF;
END $$;

-- KROK 4: Dodaj foreign key constraint
ALTER TABLE jobs 
ADD CONSTRAINT fk_jobs_employer 
FOREIGN KEY (employer_id) 
REFERENCES employers(id) 
ON DELETE CASCADE;

-- KROK 5: Sprawdź wynik
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'jobs'
    AND kcu.column_name = 'employer_id';

-- KROK 6: Sprawdź czy wszystkie jobs mają prawidłowe employer_id
SELECT 
    COUNT(*) as total_jobs,
    COUNT(employer_id) as jobs_with_employer,
    COUNT(*) - COUNT(employer_id) as jobs_without_employer
FROM jobs;
