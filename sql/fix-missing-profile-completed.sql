-- =====================================================
-- ADD MISSING COLUMN: profile_completed to employers
-- =====================================================

ALTER TABLE employers 
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Verify it was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'employers' AND column_name = 'profile_completed';
