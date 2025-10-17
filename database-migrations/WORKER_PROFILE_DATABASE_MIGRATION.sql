-- ============================================================================
-- WORKER PROFILE - DATABASE MIGRATION
-- ============================================================================
-- Version: 2.0
-- Date: 2025-01-29
-- Purpose: Create new tables for Portfolio, Applications, Earnings, Reviews
-- ============================================================================

-- ============================================================================
-- TABLE 1: PORTFOLIO PROJECTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  project_url TEXT,
  tags TEXT[],
  start_date DATE NOT NULL,
  end_date DATE,
  client_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign Key
  CONSTRAINT fk_portfolio_worker 
    FOREIGN KEY (worker_id) 
    REFERENCES workers(profile_id) 
    ON DELETE CASCADE,
  
  -- Indexes
  CONSTRAINT portfolio_projects_worker_id_idx 
    UNIQUE (worker_id, id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_portfolio_worker_id ON portfolio_projects(worker_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON portfolio_projects(created_at DESC);

-- Comments
COMMENT ON TABLE portfolio_projects IS 'Worker portfolio projects with images and metadata';
COMMENT ON COLUMN portfolio_projects.worker_id IS 'References workers.profile_id';
COMMENT ON COLUMN portfolio_projects.tags IS 'Array of skill/technology tags';
COMMENT ON COLUMN portfolio_projects.image_url IS 'URL to project image in storage bucket';

-- ============================================================================
-- TABLE 2: JOB APPLICATIONS (if not exists, or ALTER existing)
-- ============================================================================

-- Option A: Create new table
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL,
  job_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT fk_application_worker 
    FOREIGN KEY (worker_id) 
    REFERENCES workers(profile_id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_application_job 
    FOREIGN KEY (job_id) 
    REFERENCES jobs(id) 
    ON DELETE CASCADE,
  
  -- Unique constraint (worker can apply only once per job)
  CONSTRAINT unique_worker_job_application 
    UNIQUE (worker_id, job_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_applications_worker_id ON job_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON job_applications(applied_at DESC);

-- Comments
COMMENT ON TABLE job_applications IS 'Worker job applications with status tracking';
COMMENT ON COLUMN job_applications.status IS 'Application status: pending, accepted, rejected, withdrawn';
COMMENT ON COLUMN job_applications.cover_letter IS 'Optional cover letter text';

-- ============================================================================
-- TABLE 3: EARNINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL,
  job_id UUID,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  hours_worked DECIMAL(5, 2) CHECK (hours_worked >= 0),
  payment_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT fk_earnings_worker 
    FOREIGN KEY (worker_id) 
    REFERENCES workers(profile_id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_earnings_job 
    FOREIGN KEY (job_id) 
    REFERENCES jobs(id) 
    ON DELETE SET NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_earnings_worker_id ON earnings(worker_id);
CREATE INDEX IF NOT EXISTS idx_earnings_payment_date ON earnings(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON earnings(status);
CREATE INDEX IF NOT EXISTS idx_earnings_created_at ON earnings(created_at DESC);

-- Comments
COMMENT ON TABLE earnings IS 'Worker earnings and payment tracking';
COMMENT ON COLUMN earnings.amount IS 'Payment amount in euros';
COMMENT ON COLUMN earnings.hours_worked IS 'Number of hours worked for this payment';
COMMENT ON COLUMN earnings.status IS 'Payment status: pending, paid, cancelled';

-- ============================================================================
-- TABLE 4: REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL,
  employer_id UUID NOT NULL,
  job_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign Keys
  CONSTRAINT fk_review_worker 
    FOREIGN KEY (worker_id) 
    REFERENCES workers(profile_id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_review_employer 
    FOREIGN KEY (employer_id) 
    REFERENCES employers(profile_id) 
    ON DELETE CASCADE,
  
  CONSTRAINT fk_review_job 
    FOREIGN KEY (job_id) 
    REFERENCES jobs(id) 
    ON DELETE SET NULL,
  
  -- Unique constraint (one review per employer per job per worker)
  CONSTRAINT unique_review_per_job 
    UNIQUE (worker_id, employer_id, job_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reviews_worker_id ON reviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_employer_id ON reviews(employer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Comments
COMMENT ON TABLE reviews IS 'Employer reviews for workers';
COMMENT ON COLUMN reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN reviews.comment IS 'Optional review comment';

-- ============================================================================
-- STORAGE BUCKET: PORTFOLIO
-- ============================================================================

-- Note: This must be run in Supabase Dashboard or via Supabase CLI
-- Storage bucket for portfolio images

-- Run in Supabase SQL Editor or Dashboard:
/*
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio', 'portfolio', true)
ON CONFLICT (id) DO NOTHING;
*/

-- Or via Supabase Dashboard:
-- 1. Go to Storage
-- 2. Create New Bucket
-- 3. Name: portfolio
-- 4. Public: Yes

-- ============================================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PORTFOLIO PROJECTS POLICIES
-- ============================================================================

-- Policy: Workers can view their own projects
CREATE POLICY "Workers can view own portfolio"
  ON portfolio_projects
  FOR SELECT
  USING (worker_id = auth.uid());

-- Policy: Workers can insert their own projects
CREATE POLICY "Workers can insert own portfolio"
  ON portfolio_projects
  FOR INSERT
  WITH CHECK (worker_id = auth.uid());

-- Policy: Workers can update their own projects
CREATE POLICY "Workers can update own portfolio"
  ON portfolio_projects
  FOR UPDATE
  USING (worker_id = auth.uid())
  WITH CHECK (worker_id = auth.uid());

-- Policy: Workers can delete their own projects
CREATE POLICY "Workers can delete own portfolio"
  ON portfolio_projects
  FOR DELETE
  USING (worker_id = auth.uid());

-- Policy: Public can view all portfolios (for employer browsing)
CREATE POLICY "Public can view portfolios"
  ON portfolio_projects
  FOR SELECT
  USING (true);

-- ============================================================================
-- JOB APPLICATIONS POLICIES
-- ============================================================================

-- Policy: Workers can view their own applications
CREATE POLICY "Workers can view own applications"
  ON job_applications
  FOR SELECT
  USING (worker_id = auth.uid());

-- Policy: Workers can insert their own applications
CREATE POLICY "Workers can insert own applications"
  ON job_applications
  FOR INSERT
  WITH CHECK (worker_id = auth.uid());

-- Policy: Workers can update their own applications (withdraw)
CREATE POLICY "Workers can update own applications"
  ON job_applications
  FOR UPDATE
  USING (worker_id = auth.uid())
  WITH CHECK (worker_id = auth.uid());

-- Policy: Employers can view applications for their jobs
CREATE POLICY "Employers can view applications for their jobs"
  ON job_applications
  FOR SELECT
  USING (
    job_id IN (
      SELECT id FROM jobs WHERE employer_id = auth.uid()
    )
  );

-- ============================================================================
-- EARNINGS POLICIES
-- ============================================================================

-- Policy: Workers can view their own earnings
CREATE POLICY "Workers can view own earnings"
  ON earnings
  FOR SELECT
  USING (worker_id = auth.uid());

-- Policy: Only admins can insert/update earnings (via admin panel)
CREATE POLICY "Admins can manage earnings"
  ON earnings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- REVIEWS POLICIES
-- ============================================================================

-- Policy: Workers can view their own reviews
CREATE POLICY "Workers can view own reviews"
  ON reviews
  FOR SELECT
  USING (worker_id = auth.uid());

-- Policy: Employers can insert reviews for their workers
CREATE POLICY "Employers can insert reviews"
  ON reviews
  FOR INSERT
  WITH CHECK (employer_id = auth.uid());

-- Policy: Employers can update their own reviews
CREATE POLICY "Employers can update own reviews"
  ON reviews
  FOR UPDATE
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

-- Policy: Public can view all reviews (for transparency)
CREATE POLICY "Public can view reviews"
  ON reviews
  FOR SELECT
  USING (true);

-- ============================================================================
-- STORAGE POLICIES (for portfolio bucket)
-- ============================================================================

-- Policy: Workers can upload to their own folder
CREATE POLICY "Workers can upload portfolio images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Workers can update their own images
CREATE POLICY "Workers can update own portfolio images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Workers can delete their own images
CREATE POLICY "Workers can delete own portfolio images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'portfolio' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Public can view all portfolio images
CREATE POLICY "Public can view portfolio images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'portfolio');

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: portfolio_projects updated_at
CREATE TRIGGER update_portfolio_projects_updated_at
  BEFORE UPDATE ON portfolio_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: job_applications updated_at
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON job_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: earnings updated_at
CREATE TRIGGER update_earnings_updated_at
  BEFORE UPDATE ON earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: reviews updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ANALYTICS VIEW (Helper view for analytics calculations)
-- ============================================================================

CREATE OR REPLACE VIEW worker_analytics_view AS
SELECT 
  w.profile_id as worker_id,
  
  -- Profile views (placeholder - implement tracking separately)
  0 as profile_views,
  
  -- Job views (placeholder - implement tracking separately)
  0 as job_views,
  
  -- Applications
  COUNT(DISTINCT a.id) as applications_sent,
  COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN a.id END) as applications_accepted,
  
  -- Earnings
  COALESCE(SUM(e.amount), 0) as total_earnings,
  
  -- Reviews
  COALESCE(AVG(r.rating), 0) as average_rating,
  
  -- Completed jobs (jobs with earnings marked as paid)
  COUNT(DISTINCT CASE WHEN e.status = 'paid' THEN e.job_id END) as completed_jobs,
  
  -- Response rate (placeholder - needs message tracking)
  0 as response_rate

FROM workers w
LEFT JOIN job_applications a ON w.profile_id = a.worker_id
LEFT JOIN earnings e ON w.profile_id = e.worker_id
LEFT JOIN reviews r ON w.profile_id = r.worker_id

GROUP BY w.profile_id;

-- Comment
COMMENT ON VIEW worker_analytics_view IS 'Aggregated analytics data for workers';

-- ============================================================================
-- SAMPLE DATA (for testing)
-- ============================================================================

-- Insert sample portfolio project
/*
INSERT INTO portfolio_projects (worker_id, title, description, start_date, tags)
VALUES (
  'your-worker-id-here',
  'Sample Electrical Installation',
  'Installed electrical system in 3-story office building',
  '2024-01-15',
  ARRAY['electrical', 'commercial', 'VCA']
);
*/

-- Insert sample application
/*
INSERT INTO job_applications (worker_id, job_id, cover_letter)
VALUES (
  'your-worker-id-here',
  'job-id-here',
  'I am very interested in this position...'
);
*/

-- Insert sample earning
/*
INSERT INTO earnings (worker_id, amount, hours_worked, payment_date, status, description)
VALUES (
  'your-worker-id-here',
  450.00,
  10.0,
  '2025-01-15',
  'paid',
  'Week 1 payment for Job XYZ'
);
*/

-- Insert sample review
/*
INSERT INTO reviews (worker_id, employer_id, rating, comment)
VALUES (
  'your-worker-id-here',
  'employer-id-here',
  5,
  'Excellent work! Very professional and on time.'
);
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('portfolio_projects', 'job_applications', 'earnings', 'reviews');

-- Check policies exist
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('portfolio_projects', 'job_applications', 'earnings', 'reviews');

-- Check indexes exist
SELECT tablename, indexname 
FROM pg_indexes 
WHERE tablename IN ('portfolio_projects', 'job_applications', 'earnings', 'reviews');

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- Uncomment to rollback changes:
/*
DROP VIEW IF EXISTS worker_analytics_view;

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
DROP TRIGGER IF EXISTS update_earnings_updated_at ON earnings;
DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
DROP TRIGGER IF EXISTS update_portfolio_projects_updated_at ON portfolio_projects;

DROP FUNCTION IF EXISTS update_updated_at_column();

DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS earnings CASCADE;
DROP TABLE IF EXISTS job_applications CASCADE;
DROP TABLE IF EXISTS portfolio_projects CASCADE;

DELETE FROM storage.buckets WHERE id = 'portfolio';
*/

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Worker Profile Database Migration Complete!';
  RAISE NOTICE 'Tables created: portfolio_projects, job_applications, earnings, reviews';
  RAISE NOTICE 'Storage bucket: portfolio';
  RAISE NOTICE 'RLS policies: enabled and configured';
  RAISE NOTICE 'Next step: Create storage bucket in Supabase Dashboard';
END $$;
