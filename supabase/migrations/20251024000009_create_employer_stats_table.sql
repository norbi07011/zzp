-- ===================================================================
-- MIGRATION: Create EMPLOYER_STATS table
-- Priority: P1 - HIGH
-- Description: Employer dashboard statistics
-- ===================================================================

CREATE TABLE IF NOT EXISTS employer_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL UNIQUE REFERENCES employers(id) ON DELETE CASCADE,
  
  -- Search statistics
  total_searches INTEGER DEFAULT 0,
  searches_this_month INTEGER DEFAULT 0,
  searches_this_week INTEGER DEFAULT 0,
  last_search_at TIMESTAMPTZ,
  
  -- Saved workers
  total_saved_workers INTEGER DEFAULT 0,
  
  -- Contact statistics
  total_contacts INTEGER DEFAULT 0,
  contacts_this_month INTEGER DEFAULT 0,
  contacts_this_week INTEGER DEFAULT 0,
  last_contact_at TIMESTAMPTZ,
  
  -- Job statistics  
  total_jobs_posted INTEGER DEFAULT 0,
  active_jobs INTEGER DEFAULT 0,
  filled_jobs INTEGER DEFAULT 0,
  
  -- Application statistics
  total_applications_received INTEGER DEFAULT 0,
  pending_applications INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_employer_stats_employer ON employer_stats(employer_id);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_employer_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_employer_stats_timestamp ON employer_stats;
CREATE TRIGGER trigger_update_employer_stats_timestamp
    BEFORE UPDATE ON employer_stats
    FOR EACH ROW
    EXECUTE FUNCTION update_employer_stats_updated_at();

-- Create function to initialize stats for new employers
CREATE OR REPLACE FUNCTION initialize_employer_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO employer_stats (employer_id)
    VALUES (NEW.id)
    ON CONFLICT (employer_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_initialize_employer_stats ON employers;
CREATE TRIGGER trigger_initialize_employer_stats
    AFTER INSERT ON employers
    FOR EACH ROW
    EXECUTE FUNCTION initialize_employer_stats();

-- Initialize stats for existing employers
INSERT INTO employer_stats (employer_id)
SELECT id FROM employers
ON CONFLICT (employer_id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE employer_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Employers can view their own stats
CREATE POLICY "Employers can view own stats"
    ON employer_stats FOR SELECT
    USING (employer_id = (SELECT id FROM employers WHERE profile_id = auth.uid()));

-- Employers can update their own stats
CREATE POLICY "Employers can update own stats"
    ON employer_stats FOR UPDATE
    USING (employer_id = (SELECT id FROM employers WHERE profile_id = auth.uid()));

-- Admins can do everything
CREATE POLICY "Admins can do everything with employer stats"
    ON employer_stats FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Add comments
COMMENT ON TABLE employer_stats IS 'Statistics and metrics for employer dashboard';
COMMENT ON COLUMN employer_stats.searches_this_month IS 'Number of worker searches this month';
COMMENT ON COLUMN employer_stats.contacts_this_month IS 'Number of workers contacted this month';
