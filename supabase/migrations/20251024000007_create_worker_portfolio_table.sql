-- ===================================================================
-- MIGRATION: Create WORKER_PORTFOLIO table
-- Priority: P1 - HIGH
-- Description: Worker portfolio/projects showcase
-- ===================================================================

CREATE TABLE IF NOT EXISTS worker_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  
  -- Project information
  title TEXT NOT NULL,
  description TEXT,
  project_url TEXT,
  
  -- Media
  images TEXT[],
  video_url TEXT,
  
  -- Categorization
  tags TEXT[],
  category TEXT,
  
  -- Timeline
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  
  -- Client info (optional)
  client_name TEXT,
  client_company TEXT,
  
  -- Visibility
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_worker ON worker_portfolio(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_featured ON worker_portfolio(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_public ON worker_portfolio(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_tags ON worker_portfolio USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_worker_portfolio_created ON worker_portfolio(created_at DESC);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_worker_portfolio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_worker_portfolio_timestamp ON worker_portfolio;
CREATE TRIGGER trigger_update_worker_portfolio_timestamp
    BEFORE UPDATE ON worker_portfolio
    FOR EACH ROW
    EXECUTE FUNCTION update_worker_portfolio_updated_at();

-- Create trigger to calculate duration
CREATE OR REPLACE FUNCTION calculate_portfolio_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.start_date IS NOT NULL AND NEW.end_date IS NOT NULL THEN
        NEW.duration_days = NEW.end_date - NEW.start_date;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_portfolio_duration ON worker_portfolio;
CREATE TRIGGER trigger_calculate_portfolio_duration
    BEFORE INSERT OR UPDATE ON worker_portfolio
    FOR EACH ROW
    EXECUTE FUNCTION calculate_portfolio_duration();

-- Enable Row Level Security
ALTER TABLE worker_portfolio ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Public can view public portfolio items
CREATE POLICY "Public can view public portfolio"
    ON worker_portfolio FOR SELECT
    USING (is_public = true);

-- Workers can view all their portfolio items
CREATE POLICY "Workers can view own portfolio"
    ON worker_portfolio FOR SELECT
    USING (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

-- Workers can create their own portfolio items
CREATE POLICY "Workers can create own portfolio"
    ON worker_portfolio FOR INSERT
    WITH CHECK (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

-- Workers can update their own portfolio items
CREATE POLICY "Workers can update own portfolio"
    ON worker_portfolio FOR UPDATE
    USING (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

-- Workers can delete their own portfolio items
CREATE POLICY "Workers can delete own portfolio"
    ON worker_portfolio FOR DELETE
    USING (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

-- Admins can do everything
CREATE POLICY "Admins can do everything with portfolio"
    ON worker_portfolio FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Add comments
COMMENT ON TABLE worker_portfolio IS 'Worker portfolio/project showcase';
COMMENT ON COLUMN worker_portfolio.is_featured IS 'Whether this project is featured on worker profile';
COMMENT ON COLUMN worker_portfolio.is_public IS 'Whether this project is visible to public';
COMMENT ON COLUMN worker_portfolio.duration_days IS 'Project duration in days (auto-calculated)';
