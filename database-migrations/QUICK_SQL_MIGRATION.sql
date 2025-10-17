-- ============================================================================
-- QUICK WORKER PROFILE TABLES - PASTE INTO SUPABASE SQL EDITOR
-- ============================================================================
-- Copy this ENTIRE file and run in Supabase Dashboard → SQL Editor
-- ============================================================================

-- 1. PORTFOLIO PROJECTS
CREATE TABLE IF NOT EXISTS portfolio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(profile_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  project_url TEXT,
  tags TEXT[],
  start_date DATE NOT NULL,
  end_date DATE,
  client_name TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portfolio_worker ON portfolio_projects(worker_id);

-- 2. JOB APPLICATIONS
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(profile_id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  applied_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (worker_id, job_id)
);

CREATE INDEX idx_applications_worker ON job_applications(worker_id);

-- 3. EARNINGS
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(profile_id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  hours_worked DECIMAL(5, 2) CHECK (hours_worked >= 0),
  payment_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'disputed')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_earnings_worker ON earnings(worker_id);

-- 4. REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID NOT NULL REFERENCES workers(profile_id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES employers(profile_id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (worker_id, employer_id, job_id)
);

CREATE INDEX idx_reviews_worker ON reviews(worker_id);

-- 5. ENABLE RLS (Row Level Security)
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES
-- Portfolio: Workers can manage their own, public can view
CREATE POLICY "Workers manage own portfolio" ON portfolio_projects FOR ALL USING (worker_id = auth.uid());
CREATE POLICY "Public view portfolios" ON portfolio_projects FOR SELECT USING (true);

-- Applications: Workers manage own
CREATE POLICY "Workers manage own applications" ON job_applications FOR ALL USING (worker_id = auth.uid());

-- Earnings: Workers view own
CREATE POLICY "Workers view own earnings" ON earnings FOR SELECT USING (worker_id = auth.uid());

-- Reviews: Workers view own, employers can insert
CREATE POLICY "Workers view own reviews" ON reviews FOR SELECT USING (worker_id = auth.uid());
CREATE POLICY "Employers insert reviews" ON reviews FOR INSERT WITH CHECK (employer_id = auth.uid());
CREATE POLICY "Public view reviews" ON reviews FOR SELECT USING (true);

-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '✅ Tables created successfully!';
  RAISE NOTICE 'Portfolio, Applications, Earnings, Reviews ready';
END $$;
