-- ===================================================================
-- MIGRATION: Create WORKER_SKILLS table
-- Priority: P0 - CRITICAL
-- Description: Worker skills with proficiency levels
-- ===================================================================

CREATE TABLE IF NOT EXISTS worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  
  -- Skill information
  skill_name TEXT NOT NULL,
  proficiency INTEGER CHECK (proficiency BETWEEN 1 AND 5),
  years_experience INTEGER CHECK (years_experience >= 0),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate skills per worker
  UNIQUE(worker_id, skill_name)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_worker_skills_worker ON worker_skills(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_skills_name ON worker_skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_worker_skills_proficiency ON worker_skills(proficiency DESC);
CREATE INDEX IF NOT EXISTS idx_worker_skills_verified ON worker_skills(verified) WHERE verified = true;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_worker_skills_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_worker_skills_timestamp ON worker_skills;
CREATE TRIGGER trigger_update_worker_skills_timestamp
    BEFORE UPDATE ON worker_skills
    FOR EACH ROW
    EXECUTE FUNCTION update_worker_skills_updated_at();

-- Enable Row Level Security
ALTER TABLE worker_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Everyone can view skills of public workers
CREATE POLICY "Public can view skills of public workers"
    ON worker_skills FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workers
            WHERE workers.id = worker_skills.worker_id
            AND workers.profile_visibility = 'public'
        )
    );

-- Workers can view their own skills
CREATE POLICY "Workers can view own skills"
    ON worker_skills FOR SELECT
    USING (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

-- Workers can create their own skills
CREATE POLICY "Workers can create own skills"
    ON worker_skills FOR INSERT
    WITH CHECK (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

-- Workers can update their own skills
CREATE POLICY "Workers can update own skills"
    ON worker_skills FOR UPDATE
    USING (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

-- Workers can delete their own skills
CREATE POLICY "Workers can delete own skills"
    ON worker_skills FOR DELETE
    USING (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

-- Admins can verify skills
CREATE POLICY "Admins can verify skills"
    ON worker_skills FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Admins can do everything
CREATE POLICY "Admins can do everything with skills"
    ON worker_skills FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Add comments
COMMENT ON TABLE worker_skills IS 'Worker skills with proficiency levels and verification status';
COMMENT ON COLUMN worker_skills.proficiency IS 'Skill proficiency level: 1 (beginner) to 5 (expert)';
COMMENT ON COLUMN worker_skills.verified IS 'Whether this skill has been verified by platform';
COMMENT ON COLUMN worker_skills.years_experience IS 'Years of experience with this specific skill';
