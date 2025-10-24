-- ===================================================================
-- MIGRATION: Create APPLICATIONS table
-- Priority: P0 - CRITICAL
-- Description: Job applications from workers to employers
-- ===================================================================

CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES employers(id),
  
  -- Application details
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  proposed_rate NUMERIC(10,2),
  available_from DATE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  
  -- Prevent duplicate applications
  UNIQUE(job_id, worker_id)
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_worker ON applications(worker_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_employer ON applications(employer_id, status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_applications_timestamp ON applications;
CREATE TRIGGER trigger_update_applications_timestamp
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_applications_updated_at();

-- Create trigger to update jobs.applications_count
CREATE OR REPLACE FUNCTION update_job_applications_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE jobs
        SET applications_count = applications_count + 1
        WHERE id = NEW.job_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE jobs
        SET applications_count = applications_count - 1
        WHERE id = OLD.job_id AND applications_count > 0;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_job_applications_count ON applications;
CREATE TRIGGER trigger_update_job_applications_count
    AFTER INSERT OR DELETE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_job_applications_count();

-- Enable Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Workers can view their own applications
CREATE POLICY "Workers can view own applications"
    ON applications FOR SELECT
    USING (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

-- Workers can create applications
CREATE POLICY "Workers can create applications"
    ON applications FOR INSERT
    WITH CHECK (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

-- Workers can update their own pending applications
CREATE POLICY "Workers can update own pending applications"
    ON applications FOR UPDATE
    USING (
        worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid())
        AND status = 'pending'
    );

-- Workers can delete their own pending applications
CREATE POLICY "Workers can delete own pending applications"
    ON applications FOR DELETE
    USING (
        worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid())
        AND status = 'pending'
    );

-- Employers can view applications to their jobs
CREATE POLICY "Employers can view applications to their jobs"
    ON applications FOR SELECT
    USING (employer_id = (SELECT id FROM employers WHERE profile_id = auth.uid()));

-- Employers can update applications to their jobs
CREATE POLICY "Employers can update applications to their jobs"
    ON applications FOR UPDATE
    USING (employer_id = (SELECT id FROM employers WHERE profile_id = auth.uid()));

-- Admins can do everything
CREATE POLICY "Admins can do everything with applications"
    ON applications FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Add comments
COMMENT ON TABLE applications IS 'Job applications from workers to employers';
COMMENT ON COLUMN applications.status IS 'Application status: pending, shortlisted, accepted, rejected, or withdrawn';
COMMENT ON COLUMN applications.proposed_rate IS 'Worker proposed hourly rate for this job';
COMMENT ON COLUMN applications.available_from IS 'When the worker can start working';
