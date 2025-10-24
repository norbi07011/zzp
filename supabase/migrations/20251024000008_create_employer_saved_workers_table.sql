-- ===================================================================
-- MIGRATION: Create EMPLOYER_SAVED_WORKERS table
-- Priority: P1 - HIGH
-- Description: Employers can save/bookmark workers
-- ===================================================================

CREATE TABLE IF NOT EXISTS employer_saved_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  
  -- Organization
  notes TEXT,
  tags TEXT[],
  folder TEXT,
  
  -- Timestamps
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ,
  
  -- Prevent duplicates
  UNIQUE(employer_id, worker_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_employer_saved_workers_employer ON employer_saved_workers(employer_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_employer_saved_workers_worker ON employer_saved_workers(worker_id);
CREATE INDEX IF NOT EXISTS idx_employer_saved_workers_tags ON employer_saved_workers USING GIN(tags);

-- Enable Row Level Security
ALTER TABLE employer_saved_workers ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Employers can view their own saved workers
CREATE POLICY "Employers can view own saved workers"
    ON employer_saved_workers FOR SELECT
    USING (employer_id = (SELECT id FROM employers WHERE profile_id = auth.uid()));

-- Employers can save workers
CREATE POLICY "Employers can save workers"
    ON employer_saved_workers FOR INSERT
    WITH CHECK (employer_id = (SELECT id FROM employers WHERE profile_id = auth.uid()));

-- Employers can update their saved workers
CREATE POLICY "Employers can update saved workers"
    ON employer_saved_workers FOR UPDATE
    USING (employer_id = (SELECT id FROM employers WHERE profile_id = auth.uid()));

-- Employers can delete their saved workers
CREATE POLICY "Employers can delete saved workers"
    ON employer_saved_workers FOR DELETE
    USING (employer_id = (SELECT id FROM employers WHERE profile_id = auth.uid()));

-- Admins can do everything
CREATE POLICY "Admins can do everything with saved workers"
    ON employer_saved_workers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Add comments
COMMENT ON TABLE employer_saved_workers IS 'Employers saved/bookmarked workers';
COMMENT ON COLUMN employer_saved_workers.notes IS 'Private notes about this worker';
COMMENT ON COLUMN employer_saved_workers.tags IS 'Custom tags for organization';
COMMENT ON COLUMN employer_saved_workers.folder IS 'Folder/category for organization';
