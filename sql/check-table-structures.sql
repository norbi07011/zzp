-- =====================================================
-- CHECK DATABASE STRUCTURE - Verify Required Columns
-- =====================================================

-- 1. Check EMPLOYERS table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'employers'
ORDER BY ordinal_position;

-- 2. Check MESSAGES table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'messages'
ORDER BY ordinal_position;

-- 3. Check EMPLOYER_SAVED_WORKERS table columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'employer_saved_workers'
ORDER BY ordinal_position;

-- 4. Check WORKERS table columns (for profile_id)
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'workers'
ORDER BY ordinal_position;
