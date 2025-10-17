-- =================================================================
-- MASTER SEED SCRIPT - HOLENDERSKA PLATFORMA ZZP
-- Uruchamia wszystkie seed files w prawidłowej kolejności
-- =================================================================

-- Start transaction
BEGIN;

-- Set session variables for consistent behavior
SET client_encoding = 'UTF8';
SET timezone = 'Europe/Amsterdam';

-- =================================================================
-- INFORMATION HEADER
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'HOLENDERSKA PLATFORMA ZZP - DATABASE SEEDING';
    RAISE NOTICE 'Starting database seeding process...';
    RAISE NOTICE 'Timestamp: %', NOW();
    RAISE NOTICE '========================================';
END $$;

-- =================================================================
-- STEP 1: COMPANIES SEEDING
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 1/4: Seeding Companies (50+ Dutch companies)...';
END $$;

\i 'database/seeds/companies.sql'

DO $$
BEGIN
    RAISE NOTICE 'Companies seeded successfully! Count: %', (SELECT COUNT(*) FROM companies);
END $$;

-- =================================================================
-- STEP 2: WORKERS SEEDING
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 2/4: Seeding Workers (200+ ZZP professionals)...';
END $$;

\i 'database/seeds/workers.sql'

DO $$
BEGIN
    RAISE NOTICE 'Workers seeded successfully! Count: %', (SELECT COUNT(*) FROM workers);
END $$;

-- =================================================================
-- STEP 3: JOBS SEEDING
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 3/4: Seeding Jobs (100+ job opportunities)...';
END $$;

\i 'database/seeds/jobs.sql'

DO $$
BEGIN
    RAISE NOTICE 'Jobs seeded successfully! Count: %', (SELECT COUNT(*) FROM jobs);
END $$;

-- =================================================================
-- STEP 4: CERTIFICATES SEEDING
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 4/5: Seeding Certificates (Professional certifications)...';
END $$;

\i 'database/seeds/certificates.sql'

DO $$
BEGIN
    RAISE NOTICE 'Certificates seeded successfully! Count: %', (SELECT COUNT(*) FROM certificates);
    RAISE NOTICE 'Worker certificates assigned: %', (SELECT COUNT(*) FROM worker_certificates);
END $$;

-- =================================================================
-- STEP 5: REVIEWS SEEDING
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE 'Step 5/5: Seeding Reviews (Reviews and ratings)...';
END $$;

\i 'database/seeds/reviews.sql'

DO $$
BEGIN
    RAISE NOTICE 'Reviews seeded successfully! Count: %', (SELECT COUNT(*) FROM reviews);
END $$;

-- =================================================================
-- DATA VALIDATION AND STATISTICS
-- =================================================================

DO $$
DECLARE
    company_count INTEGER;
    worker_count INTEGER;
    job_count INTEGER;
    certificate_count INTEGER;
    review_count INTEGER;
    avg_company_rating DECIMAL;
    avg_worker_rating DECIMAL;
BEGIN
    -- Get counts
    SELECT COUNT(*) INTO company_count FROM companies WHERE is_active = true;
    SELECT COUNT(*) INTO worker_count FROM workers WHERE profile_status = 'active';
    SELECT COUNT(*) INTO job_count FROM jobs WHERE status = 'active';
    SELECT COUNT(*) INTO certificate_count FROM certificates WHERE is_active = true;
    SELECT COUNT(*) INTO review_count FROM reviews WHERE status = 'published';
    
    -- Get average ratings
    SELECT ROUND(AVG(rating), 2) INTO avg_company_rating FROM companies WHERE reviews_count > 0;
    SELECT ROUND(AVG(average_rating), 2) INTO avg_worker_rating FROM workers WHERE reviews_count > 0;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE SEEDING COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Final Statistics:';
    RAISE NOTICE '- Active Companies: %', company_count;
    RAISE NOTICE '- Active Workers: %', worker_count;
    RAISE NOTICE '- Active Jobs: %', job_count;
    RAISE NOTICE '- Available Certificates: %', certificate_count;
    RAISE NOTICE '- Published Reviews: %', review_count;
    RAISE NOTICE '- Average Company Rating: %', COALESCE(avg_company_rating, 0);
    RAISE NOTICE '- Average Worker Rating: %', COALESCE(avg_worker_rating, 0);
    RAISE NOTICE '========================================';
END $$;

-- =================================================================
-- SAMPLE QUERIES FOR TESTING
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE 'Sample test queries you can run:';
    RAISE NOTICE '1. Find React developers in Amsterdam:';
    RAISE NOTICE '   SELECT * FROM search_workers(''React'', NULL, ''Amsterdam'');';
    RAISE NOTICE '';
    RAISE NOTICE '2. Find construction jobs requiring VCA:';
    RAISE NOTICE '   SELECT * FROM search_jobs(NULL, ARRAY[''VCA''], ''construction'');';
    RAISE NOTICE '';
    RAISE NOTICE '3. Get company statistics by industry:';
    RAISE NOTICE '   SELECT * FROM company_stats ORDER BY total_companies DESC;';
    RAISE NOTICE '';
    RAISE NOTICE '4. Find popular certificates:';
    RAISE NOTICE '   SELECT * FROM certificates WHERE is_popular = true ORDER BY name;';
    RAISE NOTICE '';
    RAISE NOTICE '5. Get reviews for a specific worker:';
    RAISE NOTICE '   SELECT * FROM search_reviews(''worker'', (SELECT id FROM workers LIMIT 1));';
END $$;

-- =================================================================
-- PERFORMANCE ANALYSIS
-- =================================================================

-- Analyze tables for better query performance
ANALYZE companies;
ANALYZE workers;
ANALYZE jobs;
ANALYZE certificates;
ANALYZE reviews;
ANALYZE worker_certificates;
ANALYZE job_certificate_requirements;

-- =================================================================
-- VACUUM FOR CLEANUP
-- =================================================================

VACUUM ANALYZE;

-- =================================================================
-- FINAL SUCCESS MESSAGE
-- =================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SUCCESS! Holenderska platforma ZZP database is ready!';
    RAISE NOTICE 'You can now start using the platform with real Dutch data.';
    RAISE NOTICE 'All tables are populated with realistic information:';
    RAISE NOTICE '- Companies from all major Dutch cities';
    RAISE NOTICE '- Workers with diverse skills and backgrounds';
    RAISE NOTICE '- Jobs across all industries and skill levels';
    RAISE NOTICE '- Professional certificates and qualifications';
    RAISE NOTICE '- Authentic reviews and ratings';
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Implement FAZA 1 KROK 1.2 - Payment System';
    RAISE NOTICE '========================================';
END $$;

-- Commit all changes
COMMIT;