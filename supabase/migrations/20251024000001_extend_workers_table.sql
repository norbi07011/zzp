-- ===================================================================
-- MIGRATION: Extend WORKERS table with missing columns
-- Priority: P0 - CRITICAL
-- Description: Add all missing columns needed for Worker Dashboard
-- ===================================================================

-- Add profile and contact information
ALTER TABLE workers ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS location_postal_code TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS location_country TEXT DEFAULT 'NL';

-- Add rate information
ALTER TABLE workers ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10,2) DEFAULT 0;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS hourly_rate_max NUMERIC(10,2);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS radius_km INTEGER DEFAULT 50;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS available_from DATE;

-- Add rating and verification
ALTER TABLE workers ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);
ALTER TABLE workers ADD COLUMN IF NOT EXISTS rating_count INTEGER DEFAULT 0;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT '{nl}';

-- Add business information
ALTER TABLE workers ADD COLUMN IF NOT EXISTS kvk_number TEXT;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS btw_number TEXT;

-- Add privacy and notification settings
ALTER TABLE workers ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'contacts', 'private'));
ALTER TABLE workers ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT false;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT false;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS show_location BOOLEAN DEFAULT true;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT true;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT false;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS push_notifications BOOLEAN DEFAULT true;

-- Add tools and vehicle information
ALTER TABLE workers ADD COLUMN IF NOT EXISTS own_tools TEXT[] DEFAULT '{}';
ALTER TABLE workers ADD COLUMN IF NOT EXISTS own_vehicle BOOLEAN DEFAULT false;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS vehicle_type TEXT;

-- Add performance metrics
ALTER TABLE workers ADD COLUMN IF NOT EXISTS response_time TEXT; -- e.g. "< 2h"
ALTER TABLE workers ADD COLUMN IF NOT EXISTS total_jobs_completed INTEGER DEFAULT 0;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS profile_views INTEGER DEFAULT 0;
ALTER TABLE workers ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT NOW();

-- Add updated_at column if not exists
ALTER TABLE workers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add unique constraint for KVK number (if provided)
CREATE UNIQUE INDEX IF NOT EXISTS workers_kvk_number_key ON workers(kvk_number) WHERE kvk_number IS NOT NULL;

-- Add unique constraint for BTW number (if provided)
CREATE UNIQUE INDEX IF NOT EXISTS workers_btw_number_key ON workers(btw_number) WHERE btw_number IS NOT NULL;

-- Create index for location-based searches
CREATE INDEX IF NOT EXISTS idx_workers_location ON workers(location_city, radius_km);

-- Create index for rate searches
CREATE INDEX IF NOT EXISTS idx_workers_rate ON workers(hourly_rate) WHERE hourly_rate > 0;

-- Create index for availability
CREATE INDEX IF NOT EXISTS idx_workers_availability ON workers(available_from) WHERE available_from IS NOT NULL;

-- Create index for rating
CREATE INDEX IF NOT EXISTS idx_workers_rating ON workers(rating DESC, rating_count DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_workers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_workers_timestamp ON workers;
CREATE TRIGGER trigger_update_workers_timestamp
    BEFORE UPDATE ON workers
    FOR EACH ROW
    EXECUTE FUNCTION update_workers_updated_at();

-- Add comment to table
COMMENT ON TABLE workers IS 'Extended worker profiles with complete information for Worker Dashboard';

COMMENT ON COLUMN workers.profile_visibility IS 'Profile visibility: public, contacts, or private';
COMMENT ON COLUMN workers.hourly_rate IS 'Base hourly rate in EUR';
COMMENT ON COLUMN workers.hourly_rate_max IS 'Maximum hourly rate in EUR (for range display)';
COMMENT ON COLUMN workers.radius_km IS 'Willing to travel distance in kilometers';
COMMENT ON COLUMN workers.rating IS 'Average rating (0-5)';
COMMENT ON COLUMN workers.rating_count IS 'Total number of ratings received';
