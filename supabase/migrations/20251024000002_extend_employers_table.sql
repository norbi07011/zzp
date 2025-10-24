-- ===================================================================
-- MIGRATION: Extend EMPLOYERS table with missing columns
-- Priority: P0 - CRITICAL
-- Description: Add all missing columns needed for Employer Dashboard
-- ===================================================================

-- Add company profile information
ALTER TABLE employers ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+'));

-- Add address information
ALTER TABLE employers ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'NL';

-- Add contact information
ALTER TABLE employers ADD COLUMN IF NOT EXISTS contact_person TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS contact_email TEXT;

-- Add verification status
ALTER TABLE employers ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Add performance metrics
ALTER TABLE employers ADD COLUMN IF NOT EXISTS total_jobs_posted INTEGER DEFAULT 0;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS total_hires INTEGER DEFAULT 0;
ALTER TABLE employers ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(3,2) DEFAULT 0 CHECK (avg_rating >= 0 AND avg_rating <= 5);

-- Add timestamps
ALTER TABLE employers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create unique constraint for website (if provided)
CREATE UNIQUE INDEX IF NOT EXISTS employers_website_key ON employers(website) WHERE website IS NOT NULL;

-- Create index for city searches
CREATE INDEX IF NOT EXISTS idx_employers_city ON employers(city);

-- Create index for industry
CREATE INDEX IF NOT EXISTS idx_employers_industry ON employers(industry);

-- Create index for verification status
CREATE INDEX IF NOT EXISTS idx_employers_verified ON employers(verified) WHERE verified = true;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_employers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_employers_timestamp ON employers;
CREATE TRIGGER trigger_update_employers_timestamp
    BEFORE UPDATE ON employers
    FOR EACH ROW
    EXECUTE FUNCTION update_employers_updated_at();

-- Add comments to table
COMMENT ON TABLE employers IS 'Extended employer profiles with complete company information';

COMMENT ON COLUMN employers.company_size IS 'Company size category: 1-10, 11-50, 51-200, 201-500, or 500+';
COMMENT ON COLUMN employers.verified IS 'Whether the company has been verified by platform';
COMMENT ON COLUMN employers.total_jobs_posted IS 'Total number of jobs posted by this employer';
COMMENT ON COLUMN employers.total_hires IS 'Total number of successful hires made';
COMMENT ON COLUMN employers.avg_rating IS 'Average rating from workers (0-5)';
