-- =====================================================
-- ADD profile_completed COLUMN TO employers TABLE
-- =====================================================
-- This tracks if employer has completed their profile setup

ALTER TABLE employers
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT FALSE;

-- Update existing employers to FALSE (they need to complete profile)
UPDATE employers
SET profile_completed = FALSE
WHERE profile_completed IS NULL;

-- Check result
SELECT 
  id,
  company_name,
  profile_completed,
  logo_url IS NOT NULL AS has_logo,
  website IS NOT NULL AS has_website
FROM employers;
