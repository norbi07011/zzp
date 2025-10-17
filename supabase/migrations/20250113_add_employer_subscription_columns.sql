-- =====================================================
-- ADD SUBSCRIPTION COLUMNS TO EMPLOYERS TABLE
-- =====================================================
-- This fixes the issue where employers can't access dashboard
-- after payment because subscription data isn't stored

-- Add subscription columns to employers table
ALTER TABLE employers 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Add constraint for subscription_tier
ALTER TABLE employers 
DROP CONSTRAINT IF EXISTS employers_subscription_tier_check;

ALTER TABLE employers 
ADD CONSTRAINT employers_subscription_tier_check 
CHECK (subscription_tier IN ('basic', 'premium', 'enterprise'));

-- Add constraint for subscription_status  
ALTER TABLE employers 
DROP CONSTRAINT IF EXISTS employers_subscription_status_check;

ALTER TABLE employers 
ADD CONSTRAINT employers_subscription_status_check 
CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'expired'));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employers_subscription 
ON employers(subscription_status, subscription_expires_at);

-- Comment
COMMENT ON COLUMN employers.subscription_tier IS 'Subscription plan: basic, premium, or enterprise';
COMMENT ON COLUMN employers.subscription_status IS 'Current subscription status: active, inactive, cancelled, or expired';
COMMENT ON COLUMN employers.subscription_started_at IS 'When the current subscription period started';
COMMENT ON COLUMN employers.subscription_expires_at IS 'When the current subscription expires';

-- =====================================================
-- UPDATE EXISTING EMPLOYERS TO HAVE ACTIVE BASIC PLAN
-- =====================================================
-- This allows existing employers to access their dashboard immediately

UPDATE employers 
SET 
  subscription_tier = 'basic',
  subscription_status = 'active',
  subscription_started_at = NOW(),
  subscription_expires_at = NOW() + INTERVAL '30 days'
WHERE subscription_status IS NULL OR subscription_status = 'inactive';

-- =====================================================
-- SYNC WITH EMPLOYER_STATS TABLE
-- =====================================================
-- Update employer_stats to reflect subscription expiry dates

UPDATE employer_stats es
SET 
  subscription_expires_at = e.subscription_expires_at,
  last_updated = NOW()
FROM employers e
WHERE es.employer_id = e.id
AND e.subscription_expires_at IS NOT NULL;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Subscription columns added to employers table';
  RAISE NOTICE '✅ All existing employers now have active basic subscription';
  RAISE NOTICE '✅ Employers can now access their dashboard';
END $$;
