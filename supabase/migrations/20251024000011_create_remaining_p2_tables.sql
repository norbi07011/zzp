-- ===================================================================
-- MIGRATION: Create remaining P2 tables
-- Priority: P2 - MEDIUM
-- Description: worker_availability, earnings, employer_search_history, 
--              certificates, admin_logs, analytics_events
-- ===================================================================

-- ===================================================================
-- WORKER_AVAILABILITY - Worker calendar/availability
-- ===================================================================

CREATE TABLE IF NOT EXISTS worker_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  is_booked BOOLEAN DEFAULT false,
  booking_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(worker_id, date, start_time)
);

CREATE INDEX idx_worker_availability_worker ON worker_availability(worker_id, date);
CREATE INDEX idx_worker_availability_date ON worker_availability(date);

ALTER TABLE worker_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view available slots"
    ON worker_availability FOR SELECT
    USING (is_booked = false);

CREATE POLICY "Workers can manage own availability"
    ON worker_availability FOR ALL
    USING (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

COMMENT ON TABLE worker_availability IS 'Worker availability calendar';

-- ===================================================================
-- EARNINGS - Worker earnings tracking
-- ===================================================================

CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  employer_id UUID REFERENCES employers(id),
  
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  payment_date DATE NOT NULL,
  payment_method TEXT,
  invoice_number TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_earnings_worker ON earnings(worker_id, payment_date DESC);
CREATE INDEX idx_earnings_status ON earnings(status);

ALTER TABLE earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view own earnings"
    ON earnings FOR SELECT
    USING (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

CREATE POLICY "Workers can create own earnings"
    ON earnings FOR INSERT
    WITH CHECK (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

COMMENT ON TABLE earnings IS 'Worker earnings and payment tracking';

-- ===================================================================
-- EMPLOYER_SEARCH_HISTORY - Employer search tracking
-- ===================================================================

CREATE TABLE IF NOT EXISTS employer_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  
  search_date TIMESTAMPTZ DEFAULT NOW(),
  category TEXT,
  subcategory TEXT,
  level TEXT,
  location_city TEXT,
  radius_km INTEGER,
  min_rate NUMERIC(10,2),
  max_rate NUMERIC(10,2),
  skills TEXT[],
  results_count INTEGER,
  filters JSONB
);

CREATE INDEX idx_employer_search_history_employer ON employer_search_history(employer_id, search_date DESC);

ALTER TABLE employer_search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can view own search history"
    ON employer_search_history FOR SELECT
    USING (employer_id = (SELECT id FROM employers WHERE profile_id = auth.uid()));

CREATE POLICY "System can create search history"
    ON employer_search_history FOR INSERT
    WITH CHECK (true);

COMMENT ON TABLE employer_search_history IS 'Employer search history for analytics';

-- ===================================================================
-- CERTIFICATES - Worker certificates/qualifications
-- ===================================================================

CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  
  certificate_type TEXT NOT NULL,
  certificate_name TEXT NOT NULL,
  certificate_number TEXT UNIQUE,
  issuer TEXT,
  issue_date DATE,
  expiry_date DATE,
  file_url TEXT,
  
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_certificates_worker ON certificates(worker_id);
CREATE INDEX idx_certificates_expiry ON certificates(expiry_date);
CREATE INDEX idx_certificates_verified ON certificates(verified);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view verified certificates"
    ON certificates FOR SELECT
    USING (verified = true);

CREATE POLICY "Workers can manage own certificates"
    ON certificates FOR ALL
    USING (worker_id = (SELECT id FROM workers WHERE profile_id = auth.uid()));

COMMENT ON TABLE certificates IS 'Worker certificates and qualifications';

-- ===================================================================
-- ADMIN_LOGS - Administrative action logs
-- ===================================================================

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_admin_logs_admin ON admin_logs(admin_id, created_at DESC);
CREATE INDEX idx_admin_logs_target ON admin_logs(target_type, target_id);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view logs"
    ON admin_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

COMMENT ON TABLE admin_logs IS 'Administrative action audit logs';

-- ===================================================================
-- ANALYTICS_EVENTS - User analytics tracking
-- ===================================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  properties JSONB,
  
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_user ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type, event_name);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analytics"
    ON analytics_events FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "System can create analytics"
    ON analytics_events FOR INSERT
    WITH CHECK (true);

COMMENT ON TABLE analytics_events IS 'User behavior analytics events';

-- ===================================================================
-- Helper Functions
-- ===================================================================

-- Get worker earnings stats
CREATE OR REPLACE FUNCTION get_worker_earnings_stats(p_worker_id UUID)
RETURNS TABLE (
    total_earnings NUMERIC,
    paid_earnings NUMERIC,
    pending_earnings NUMERIC,
    total_jobs INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(amount), 0) as total_earnings,
        COALESCE(SUM(amount) FILTER (WHERE status = 'paid'), 0) as paid_earnings,
        COALESCE(SUM(amount) FILTER (WHERE status = 'pending'), 0) as pending_earnings,
        COUNT(DISTINCT job_id)::INTEGER as total_jobs
    FROM earnings
    WHERE worker_id = p_worker_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_worker_earnings_stats IS 'Get earnings statistics for a worker';
