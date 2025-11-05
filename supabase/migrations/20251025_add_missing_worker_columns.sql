-- ===================================================================
-- FIX: Add missing 'skills' column to workers table
-- ===================================================================

-- Add skills column if it doesn't exist
ALTER TABLE workers ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';

-- Add phone column if it doesn't exist (może też brakować)
ALTER TABLE workers ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add languages column if it doesn't exist
ALTER TABLE workers ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{nl}';

-- Create index for skills searches
CREATE INDEX IF NOT EXISTS idx_workers_skills ON workers USING GIN (skills);

COMMENT ON COLUMN workers.skills IS 'Array of worker skills/competencies';
COMMENT ON COLUMN workers.phone IS 'Worker phone number';
COMMENT ON COLUMN workers.languages IS 'Languages spoken by worker';
