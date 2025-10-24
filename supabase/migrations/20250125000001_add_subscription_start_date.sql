-- ===================================================================
-- MIGRATION: Add subscription_start_date to employers and workers
-- Date: 2025-01-25
-- Description: Track when subscription was activated
-- ===================================================================

-- Add subscription_start_date to employers
ALTER TABLE employers 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;

-- Add subscription_start_date to workers
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMPTZ;

-- Add comment
COMMENT ON COLUMN employers.subscription_start_date IS 'When the subscription was activated (after payment)';
COMMENT ON COLUMN workers.subscription_start_date IS 'When the subscription was activated (after payment)';
