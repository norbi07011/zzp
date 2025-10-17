-- =====================================================
-- EMPLOYER DASHBOARD TABLES - Backend Integration
-- =====================================================
-- Created: 2025-01-13
-- Purpose: Support employer dashboard with real data
-- Tables: search_history, saved_workers, employer_stats

-- =====================================================
-- 1. EMPLOYER SEARCH HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS employer_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  search_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category TEXT NOT NULL,
  level TEXT, -- Junior, Mid, Senior
  location_city TEXT,
  radius_km INTEGER,
  min_hourly_rate DECIMAL(10,2),
  max_hourly_rate DECIMAL(10,2),
  skills TEXT[],
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_employer_search_history_employer ON employer_search_history(employer_id, search_date DESC);
CREATE INDEX idx_employer_search_history_date ON employer_search_history(search_date DESC);

-- =====================================================
-- 2. EMPLOYER SAVED WORKERS (Bookmarks)
-- =====================================================
CREATE TABLE IF NOT EXISTS employer_saved_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Prevent duplicates
  UNIQUE(employer_id, worker_id)
);

-- Indexes
CREATE INDEX idx_saved_workers_employer ON employer_saved_workers(employer_id, saved_at DESC);
CREATE INDEX idx_saved_workers_worker ON employer_saved_workers(worker_id);

-- =====================================================
-- 3. EMPLOYER STATS (Cached aggregations)
-- =====================================================
CREATE TABLE IF NOT EXISTS employer_stats (
  employer_id UUID PRIMARY KEY REFERENCES employers(id) ON DELETE CASCADE,
  total_searches INTEGER DEFAULT 0,
  searches_this_month INTEGER DEFAULT 0,
  total_saved_workers INTEGER DEFAULT 0,
  total_contacts INTEGER DEFAULT 0,
  contacts_this_month INTEGER DEFAULT 0,
  subscription_expires_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. MESSAGES TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  replied BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  
  -- For threading
  thread_id UUID,
  parent_message_id UUID REFERENCES messages(id) ON DELETE SET NULL
);

-- Indexes for messages
CREATE INDEX idx_messages_recipient ON messages(recipient_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id, created_at DESC);
CREATE INDEX idx_messages_thread ON messages(thread_id, created_at ASC);
CREATE INDEX idx_messages_unread ON messages(recipient_id, read) WHERE read = FALSE;

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

-- employer_search_history policies
ALTER TABLE employer_search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can view own search history"
  ON employer_search_history FOR SELECT
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Employers can insert own search history"
  ON employer_search_history FOR INSERT
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Employers can delete own search history"
  ON employer_search_history FOR DELETE
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

-- employer_saved_workers policies
ALTER TABLE employer_saved_workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can view own saved workers"
  ON employer_saved_workers FOR SELECT
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Employers can save workers"
  ON employer_saved_workers FOR INSERT
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update own saved workers"
  ON employer_saved_workers FOR UPDATE
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Employers can delete own saved workers"
  ON employer_saved_workers FOR DELETE
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

-- employer_stats policies
ALTER TABLE employer_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can view own stats"
  ON employer_stats FOR SELECT
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

-- messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
  );

CREATE POLICY "Recipients can update own messages"
  ON messages FOR UPDATE
  USING (
    recipient_id = auth.uid()
  );

-- =====================================================
-- 6. FUNCTIONS FOR STATS UPDATE
-- =====================================================

-- Function to update employer stats
CREATE OR REPLACE FUNCTION update_employer_stats(p_employer_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_searches INTEGER;
  v_searches_this_month INTEGER;
  v_total_saved INTEGER;
BEGIN
  -- Count total searches
  SELECT COUNT(*) INTO v_total_searches
  FROM employer_search_history
  WHERE employer_id = p_employer_id;
  
  -- Count searches this month
  SELECT COUNT(*) INTO v_searches_this_month
  FROM employer_search_history
  WHERE employer_id = p_employer_id
    AND search_date >= date_trunc('month', NOW());
  
  -- Count saved workers
  SELECT COUNT(*) INTO v_total_saved
  FROM employer_saved_workers
  WHERE employer_id = p_employer_id;
  
  -- Upsert stats
  INSERT INTO employer_stats (
    employer_id,
    total_searches,
    searches_this_month,
    total_saved_workers,
    last_updated
  ) VALUES (
    p_employer_id,
    v_total_searches,
    v_searches_this_month,
    v_total_saved,
    NOW()
  )
  ON CONFLICT (employer_id)
  DO UPDATE SET
    total_searches = v_total_searches,
    searches_this_month = v_searches_this_month,
    total_saved_workers = v_total_saved,
    last_updated = NOW();
END;
$$;

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Trigger to update stats when search history changes
CREATE OR REPLACE FUNCTION trigger_update_employer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'DELETE' THEN
    PERFORM update_employer_stats(COALESCE(NEW.employer_id, OLD.employer_id));
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_stats_on_search
AFTER INSERT OR DELETE ON employer_search_history
FOR EACH ROW
EXECUTE FUNCTION trigger_update_employer_stats();

CREATE TRIGGER update_stats_on_saved
AFTER INSERT OR DELETE ON employer_saved_workers
FOR EACH ROW
EXECUTE FUNCTION trigger_update_employer_stats();

-- =====================================================
-- 8. INITIAL DATA FOR EXISTING EMPLOYERS
-- =====================================================

-- Initialize stats for all existing employers
INSERT INTO employer_stats (employer_id)
SELECT id FROM employers
ON CONFLICT (employer_id) DO NOTHING;

-- =====================================================
-- DONE! 🎉
-- =====================================================

COMMENT ON TABLE employer_search_history IS 'Stores employer search history for analytics and quick repeat searches';
COMMENT ON TABLE employer_saved_workers IS 'Workers bookmarked/saved by employers for later contact';
COMMENT ON TABLE employer_stats IS 'Cached aggregations for employer dashboard stats';
COMMENT ON TABLE messages IS 'Internal messaging system between employers and workers';
