-- ============================================
-- FIX: Usuń "sierocę" jobs i dodaj foreign key
-- ============================================
-- Data: 2025-10-28
-- Problem: 3 testowe jobs mają employer_id który nie istnieje w tabeli employers
-- Rozwiązanie: Usuń te testowe jobs, potem dodaj FK constraint

-- ROLLBACK PLAN:
-- Jeśli coś pójdzie nie tak, te jobs można odtworzyć ręcznie
-- (są to testowe dane z 26.10.2025)

-- ============================================
-- KROK 1: Sprawdź które jobs zostaną usunięte
-- ============================================
SELECT 
    id,
    title,
    employer_id,
    status,
    created_at
FROM jobs
WHERE employer_id IN (
    '8a17942f-7209-469a-bafc-1a748d195eef',
    'e15f1bef-4268-49c4-ad4f-788494342b9d'
);

-- Powinno pokazać 3 jobs:
-- 1. "Elektricien - Woningbouw Rotterdam"
-- 2. "Timmerman - Meubelmaker (Hybride)"  
-- 3. "TEST JOB - Metselaar Amsterdam"

-- ============================================
-- KROK 2: Usuń jobs z nieistniejącymi employers
-- ============================================
BEGIN;

-- Usuń jobs gdzie employer nie istnieje
DELETE FROM jobs
WHERE NOT EXISTS (
    SELECT 1 FROM employers e WHERE e.id = jobs.employer_id
);

-- Powinno usunąć 3 rows

COMMIT;

-- ============================================
-- KROK 3: Sprawdź czy usunięcie się powiodło
-- ============================================
SELECT 
    COUNT(*) as remaining_jobs,
    COUNT(DISTINCT employer_id) as unique_employers
FROM jobs;

-- Sprawdź czy są jeszcze "sieroty"
SELECT COUNT(*) as orphaned_jobs
FROM jobs j
WHERE NOT EXISTS (
    SELECT 1 FROM employers e WHERE e.id = j.employer_id
);
-- Powinno być 0

-- ============================================
-- KROK 4: Sprawdź czy FK już istnieje
-- ============================================
SELECT 
    constraint_name,
    table_name
FROM information_schema.table_constraints
WHERE table_name = 'jobs'
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%employer%';

-- ============================================
-- KROK 5: Dodaj foreign key constraint
-- ============================================
DO $$
BEGIN
    -- Usuń stare constraints jeśli istnieją
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'jobs_employer_id_fkey'
    ) THEN
        ALTER TABLE jobs DROP CONSTRAINT jobs_employer_id_fkey;
        RAISE NOTICE '⚠️ Usunięto stary constraint jobs_employer_id_fkey';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_jobs_employer'
    ) THEN
        ALTER TABLE jobs DROP CONSTRAINT fk_jobs_employer;
        RAISE NOTICE '⚠️ Usunięto stary constraint fk_jobs_employer';
    END IF;
END $$;

-- Dodaj nowy FK constraint
ALTER TABLE jobs 
ADD CONSTRAINT fk_jobs_employer 
FOREIGN KEY (employer_id) 
REFERENCES employers(id) 
ON DELETE CASCADE;

-- ============================================
-- KROK 6: Weryfikuj wynik
-- ============================================
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

-- Powinno pokazać:
-- fk_jobs_employer | jobs | employer_id | employers | id | CASCADE

-- ============================================
-- KROK 7: Final check
-- ============================================
SELECT 
    'SUCCESS! ✅' as status,
    COUNT(*) as total_jobs,
    COUNT(DISTINCT employer_id) as unique_employers,
    (SELECT COUNT(*) FROM employers) as total_employers_in_db
FROM jobs;
