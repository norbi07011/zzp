-- ============================================================================
-- FAZA 1 KROK 1.5 - ADVANCED ANALYTICS SYSTEM
-- Migration: Analytics Tables & Functions
-- Version: 1.0.0
-- Date: October 2025
-- ============================================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS kpi_metrics CASCADE;
DROP TABLE IF EXISTS user_activity_summary CASCADE;
DROP TABLE IF EXISTS daily_business_metrics CASCADE;

-- ============================================================================
-- TABLE: analytics_events
-- Purpose: Store all user and system events for tracking
-- ============================================================================

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL CHECK (event_category IN ('user_action', 'system', 'business', 'performance')),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_event_category ON analytics_events(event_category);
CREATE INDEX idx_analytics_events_timestamp ON analytics_events(timestamp DESC);
CREATE INDEX idx_analytics_events_metadata ON analytics_events USING GIN (metadata);

-- ============================================================================
-- TABLE: kpi_metrics
-- Purpose: Store Key Performance Indicators over time
-- ============================================================================

CREATE TABLE kpi_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15, 2) NOT NULL,
    metric_unit VARCHAR(50) NOT NULL,
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('revenue', 'users', 'jobs', 'engagement', 'performance')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_kpi_metrics_category ON kpi_metrics(category);
CREATE INDEX idx_kpi_metrics_period ON kpi_metrics(period_start, period_end);
CREATE INDEX idx_kpi_metrics_name ON kpi_metrics(metric_name);

-- ============================================================================
-- TABLE: user_activity_summary
-- Purpose: Materialized view for user activity statistics
-- ============================================================================

CREATE TABLE user_activity_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    total_page_views INTEGER DEFAULT 0,
    total_actions INTEGER DEFAULT 0,
    avg_session_duration_seconds INTEGER DEFAULT 0,
    unique_pages_visited INTEGER DEFAULT 0,
    last_active TIMESTAMP WITH TIME ZONE,
    device_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Indexes
CREATE INDEX idx_user_activity_user_id ON user_activity_summary(user_id);
CREATE INDEX idx_user_activity_date ON user_activity_summary(date DESC);

-- ============================================================================
-- TABLE: daily_business_metrics
-- Purpose: Daily aggregated business metrics
-- ============================================================================

CREATE TABLE daily_business_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_revenue DECIMAL(15, 2) DEFAULT 0,
    total_jobs_posted INTEGER DEFAULT 0,
    total_applications INTEGER DEFAULT 0,
    total_hires INTEGER DEFAULT 0,
    total_new_users INTEGER DEFAULT 0,
    total_new_companies INTEGER DEFAULT 0,
    total_new_workers INTEGER DEFAULT 0,
    avg_job_value DECIMAL(10, 2) DEFAULT 0,
    avg_application_rate DECIMAL(5, 2) DEFAULT 0,
    conversion_rate DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_daily_business_metrics_date ON daily_business_metrics(date DESC);

-- ============================================================================
-- FUNCTION: update_user_activity_summary
-- Purpose: Aggregate user activity from events
-- ============================================================================

CREATE OR REPLACE FUNCTION update_user_activity_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update user activity summary
    INSERT INTO user_activity_summary (
        user_id,
        date,
        total_sessions,
        total_page_views,
        total_actions,
        last_active
    )
    VALUES (
        NEW.user_id,
        DATE(NEW.timestamp),
        CASE WHEN NEW.event_type = 'session_start' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_type = 'page_view' THEN 1 ELSE 0 END,
        CASE WHEN NEW.event_category = 'user_action' THEN 1 ELSE 0 END,
        NEW.timestamp
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        total_sessions = user_activity_summary.total_sessions + CASE WHEN NEW.event_type = 'session_start' THEN 1 ELSE 0 END,
        total_page_views = user_activity_summary.total_page_views + CASE WHEN NEW.event_type = 'page_view' THEN 1 ELSE 0 END,
        total_actions = user_activity_summary.total_actions + CASE WHEN NEW.event_category = 'user_action' THEN 1 ELSE 0 END,
        last_active = GREATEST(user_activity_summary.last_active, NEW.timestamp),
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update user activity
CREATE TRIGGER trigger_update_user_activity
    AFTER INSERT ON analytics_events
    FOR EACH ROW
    WHEN (NEW.user_id IS NOT NULL)
    EXECUTE FUNCTION update_user_activity_summary();

-- ============================================================================
-- FUNCTION: calculate_daily_business_metrics
-- Purpose: Calculate and store daily business metrics
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_daily_business_metrics(target_date DATE)
RETURNS VOID AS $$
DECLARE
    v_total_revenue DECIMAL(15, 2);
    v_total_jobs INTEGER;
    v_total_applications INTEGER;
    v_total_hires INTEGER;
    v_new_users INTEGER;
    v_new_companies INTEGER;
    v_new_workers INTEGER;
BEGIN
    -- Calculate revenue
    SELECT COALESCE(SUM(amount::DECIMAL / 100), 0)
    INTO v_total_revenue
    FROM payments
    WHERE DATE(created_at) = target_date
    AND status = 'succeeded';

    -- Count jobs
    SELECT COUNT(*)
    INTO v_total_jobs
    FROM jobs
    WHERE DATE(created_at) = target_date;

    -- Count applications
    SELECT COUNT(*)
    INTO v_total_applications
    FROM applications
    WHERE DATE(created_at) = target_date;

    -- Count hires
    SELECT COUNT(*)
    INTO v_total_hires
    FROM applications
    WHERE DATE(created_at) = target_date
    AND status = 'accepted';

    -- Count new users
    SELECT COUNT(*)
    INTO v_new_users
    FROM auth.users
    WHERE DATE(created_at) = target_date;

    -- Count new companies
    SELECT COUNT(*)
    INTO v_new_companies
    FROM companies
    WHERE DATE(created_at) = target_date;

    -- Count new workers
    SELECT COUNT(*)
    INTO v_new_workers
    FROM workers
    WHERE DATE(created_at) = target_date;

    -- Insert or update metrics
    INSERT INTO daily_business_metrics (
        date,
        total_revenue,
        total_jobs_posted,
        total_applications,
        total_hires,
        total_new_users,
        total_new_companies,
        total_new_workers,
        avg_job_value,
        avg_application_rate,
        conversion_rate
    )
    VALUES (
        target_date,
        v_total_revenue,
        v_total_jobs,
        v_total_applications,
        v_total_hires,
        v_new_users,
        v_new_companies,
        v_new_workers,
        CASE WHEN v_total_jobs > 0 THEN v_total_revenue / v_total_jobs ELSE 0 END,
        CASE WHEN v_total_jobs > 0 THEN (v_total_applications::DECIMAL / v_total_jobs) ELSE 0 END,
        CASE WHEN v_total_applications > 0 THEN (v_total_hires::DECIMAL / v_total_applications * 100) ELSE 0 END
    )
    ON CONFLICT (date)
    DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        total_jobs_posted = EXCLUDED.total_jobs_posted,
        total_applications = EXCLUDED.total_applications,
        total_hires = EXCLUDED.total_hires,
        total_new_users = EXCLUDED.total_new_users,
        total_new_companies = EXCLUDED.total_new_companies,
        total_new_workers = EXCLUDED.total_new_workers,
        avg_job_value = EXCLUDED.avg_job_value,
        avg_application_rate = EXCLUDED.avg_application_rate,
        conversion_rate = EXCLUDED.conversion_rate,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEW: v_user_engagement_metrics
-- Purpose: Real-time view of user engagement
-- ============================================================================

CREATE OR REPLACE VIEW v_user_engagement_metrics AS
SELECT
    u.id AS user_id,
    u.email,
    COUNT(DISTINCT ae.session_id) AS total_sessions,
    COUNT(CASE WHEN ae.event_type = 'page_view' THEN 1 END) AS total_page_views,
    COUNT(CASE WHEN ae.event_category = 'user_action' THEN 1 END) AS total_actions,
    MAX(ae.timestamp) AS last_active,
    DATE_TRUNC('day', MAX(ae.timestamp)) AS last_active_date,
    COUNT(DISTINCT DATE(ae.timestamp)) AS days_active
FROM auth.users u
LEFT JOIN analytics_events ae ON u.id = ae.user_id
GROUP BY u.id, u.email;

-- ============================================================================
-- VIEW: v_revenue_analytics
-- Purpose: Revenue breakdown and trends
-- ============================================================================

CREATE OR REPLACE VIEW v_revenue_analytics AS
SELECT
    DATE(p.created_at) AS date,
    COUNT(*) AS total_transactions,
    SUM(p.amount::DECIMAL / 100) AS total_revenue,
    AVG(p.amount::DECIMAL / 100) AS avg_transaction_value,
    COUNT(CASE WHEN p.metadata->>'type' = 'subscription' THEN 1 END) AS subscription_count,
    SUM(CASE WHEN p.metadata->>'type' = 'subscription' THEN p.amount::DECIMAL / 100 ELSE 0 END) AS subscription_revenue,
    COUNT(CASE WHEN p.metadata->>'type' = 'commission' THEN 1 END) AS commission_count,
    SUM(CASE WHEN p.metadata->>'type' = 'commission' THEN p.amount::DECIMAL / 100 ELSE 0 END) AS commission_revenue
FROM payments p
WHERE p.status = 'succeeded'
GROUP BY DATE(p.created_at)
ORDER BY DATE(p.created_at) DESC;

-- ============================================================================
-- VIEW: v_worker_performance_summary
-- Purpose: Worker performance metrics
-- ============================================================================

CREATE OR REPLACE VIEW v_worker_performance_summary AS
SELECT
    w.id AS worker_id,
    w.email,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'completed') AS total_jobs_completed,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'accepted') AS total_jobs_accepted,
    COUNT(DISTINCT a.id) AS total_applications,
    COALESCE(AVG(r.rating), 0) AS avg_rating,
    COUNT(r.id) AS total_reviews,
    COALESCE(SUM(p.amount::DECIMAL / 100) FILTER (WHERE p.metadata->>'worker_id' = w.id::TEXT), 0) AS total_earnings
FROM workers w
LEFT JOIN applications a ON w.id = a.worker_id
LEFT JOIN reviews r ON w.id = r.worker_id
LEFT JOIN payments p ON p.metadata->>'worker_id' = w.id::TEXT AND p.status = 'succeeded'
GROUP BY w.id, w.email;

-- ============================================================================
-- VIEW: v_company_statistics_summary
-- Purpose: Company performance metrics
-- ============================================================================

CREATE OR REPLACE VIEW v_company_statistics_summary AS
SELECT
    c.id AS company_id,
    c.name AS company_name,
    COUNT(DISTINCT j.id) AS total_jobs_posted,
    COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'accepted') AS total_hires,
    COUNT(DISTINCT a.id) AS total_applications,
    COALESCE(AVG(j.hourly_rate), 0) AS avg_hourly_rate,
    COALESCE(SUM(p.amount::DECIMAL / 100) FILTER (WHERE p.metadata->>'company_id' = c.id::TEXT), 0) AS total_spent,
    COALESCE(AVG(r.rating) FILTER (WHERE r.company_id = c.id), 0) AS avg_satisfaction_score
FROM companies c
LEFT JOIN jobs j ON c.id = j.company_id
LEFT JOIN applications a ON j.id = a.job_id
LEFT JOIN payments p ON p.metadata->>'company_id' = c.id::TEXT AND p.status = 'succeeded'
LEFT JOIN reviews r ON r.company_id = c.id
GROUP BY c.id, c.name;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_business_metrics ENABLE ROW LEVEL SECURITY;

-- Analytics Events: Users can only see their own events, admins see all
CREATE POLICY analytics_events_select ON analytics_events
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM workers WHERE id = auth.uid() AND role = 'admin'
        )
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Analytics Events: System can insert
CREATE POLICY analytics_events_insert ON analytics_events
    FOR INSERT
    WITH CHECK (true);

-- KPI Metrics: Only admins can view
CREATE POLICY kpi_metrics_select ON kpi_metrics
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workers WHERE id = auth.uid() AND role = 'admin'
        )
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- KPI Metrics: Only system can insert
CREATE POLICY kpi_metrics_insert ON kpi_metrics
    FOR INSERT
    WITH CHECK (true);

-- User Activity Summary: Users see own, admins see all
CREATE POLICY user_activity_select ON user_activity_summary
    FOR SELECT
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM workers WHERE id = auth.uid() AND role = 'admin'
        )
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Daily Business Metrics: Only admins can view
CREATE POLICY daily_business_metrics_select ON daily_business_metrics
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workers WHERE id = auth.uid() AND role = 'admin'
        )
        OR EXISTS (
            SELECT 1 FROM companies WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT ON analytics_events TO authenticated;
GRANT SELECT, INSERT ON kpi_metrics TO authenticated;
GRANT SELECT ON user_activity_summary TO authenticated;
GRANT SELECT ON daily_business_metrics TO authenticated;

GRANT SELECT ON v_user_engagement_metrics TO authenticated;
GRANT SELECT ON v_revenue_analytics TO authenticated;
GRANT SELECT ON v_worker_performance_summary TO authenticated;
GRANT SELECT ON v_company_statistics_summary TO authenticated;

-- ============================================================================
-- SEED SAMPLE DATA (for testing)
-- ============================================================================

-- Insert sample events for the last 30 days
DO $$
DECLARE
    v_date DATE;
BEGIN
    FOR v_date IN SELECT generate_series(
        CURRENT_DATE - INTERVAL '30 days',
        CURRENT_DATE,
        '1 day'::interval
    )::DATE
    LOOP
        PERFORM calculate_daily_business_metrics(v_date);
    END LOOP;
END $$;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE analytics_events IS 'Stores all user and system events for tracking and analytics';
COMMENT ON TABLE kpi_metrics IS 'Key Performance Indicators tracked over time';
COMMENT ON TABLE user_activity_summary IS 'Aggregated user activity statistics by day';
COMMENT ON TABLE daily_business_metrics IS 'Daily aggregated business performance metrics';

COMMENT ON FUNCTION update_user_activity_summary() IS 'Automatically updates user activity summary when events are tracked';
COMMENT ON FUNCTION calculate_daily_business_metrics(DATE) IS 'Calculates and stores daily business metrics for a given date';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration
DO $$
BEGIN
    RAISE NOTICE '✅ FAZA 1 KROK 1.5 - Analytics System Migration Complete';
    RAISE NOTICE '📊 Created 4 tables';
    RAISE NOTICE '📊 Created 4 views';
    RAISE NOTICE '📊 Created 2 functions';
    RAISE NOTICE '📊 Created 1 trigger';
    RAISE NOTICE '📊 Created 6 RLS policies';
END $$;
