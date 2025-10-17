-- =====================================================
-- EMPLOYER DASHBOARD TABLES - Simplified Version
-- =====================================================
-- Run this in Supabase SQL Editor
-- This version checks for dependencies first

-- =====================================================
-- 1. EMPLOYER SEARCH HISTORY
-- =====================================================
CREATE TABLE IF NOT EXISTS employer_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  search_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category TEXT NOT NULL,
  level TEXT,
  location_city TEXT,
  radius_km INTEGER,
  min_hourly_rate DECIMAL(10,2),
  max_hourly_rate DECIMAL(10,2),
  skills TEXT[],
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employer_search_history_employer 
  ON employer_search_history(employer_id, search_date DESC);
CREATE INDEX IF NOT EXISTS idx_employer_search_history_date 
  ON employer_search_history(search_date DESC);

-- =====================================================
-- 2. EMPLOYER SAVED WORKERS
-- =====================================================
CREATE TABLE IF NOT EXISTS employer_saved_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  worker_id UUID NOT NULL,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(employer_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_workers_employer 
  ON employer_saved_workers(employer_id, saved_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_workers_worker 
  ON employer_saved_workers(worker_id);

-- =====================================================
-- 3. EMPLOYER STATS
-- =====================================================
CREATE TABLE IF NOT EXISTS employer_stats (
  employer_id UUID PRIMARY KEY,
  total_searches INTEGER DEFAULT 0,
  searches_this_month INTEGER DEFAULT 0,
  total_saved_workers INTEGER DEFAULT 0,
  total_contacts INTEGER DEFAULT 0,
  contacts_this_month INTEGER DEFAULT 0,
  subscription_expires_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. MESSAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  replied BOOLEAN DEFAULT FALSE,
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  thread_id UUID,
  parent_message_id UUID
);

CREATE INDEX IF NOT EXISTS idx_messages_recipient 
  ON messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender 
  ON messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_thread 
  ON messages(thread_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_messages_unread 
  ON messages(recipient_id, read) WHERE read = FALSE;

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

ALTER TABLE employer_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_saved_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- employer_search_history policies
DROP POLICY IF EXISTS "Employers can view own search history" ON employer_search_history;
CREATE POLICY "Employers can view own search history"
  ON employer_search_history FOR SELECT
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can insert own search history" ON employer_search_history;
CREATE POLICY "Employers can insert own search history"
  ON employer_search_history FOR INSERT
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can delete own search history" ON employer_search_history;
CREATE POLICY "Employers can delete own search history"
  ON employer_search_history FOR DELETE
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

-- employer_saved_workers policies
DROP POLICY IF EXISTS "Employers can view own saved workers" ON employer_saved_workers;
CREATE POLICY "Employers can view own saved workers"
  ON employer_saved_workers FOR SELECT
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can save workers" ON employer_saved_workers;
CREATE POLICY "Employers can save workers"
  ON employer_saved_workers FOR INSERT
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can update own saved workers" ON employer_saved_workers;
CREATE POLICY "Employers can update own saved workers"
  ON employer_saved_workers FOR UPDATE
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Employers can delete own saved workers" ON employer_saved_workers;
CREATE POLICY "Employers can delete own saved workers"
  ON employer_saved_workers FOR DELETE
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

-- employer_stats policies
DROP POLICY IF EXISTS "Employers can view own stats" ON employer_stats;
CREATE POLICY "Employers can view own stats"
  ON employer_stats FOR SELECT
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

-- messages policies
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
  );

DROP POLICY IF EXISTS "Recipients can update own messages" ON messages;
CREATE POLICY "Recipients can update own messages"
  ON messages FOR UPDATE
  USING (
    recipient_id = auth.uid()
  );

-- =====================================================
-- 6. FUNCTION FOR STATS UPDATE
-- =====================================================

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
  SELECT COUNT(*) INTO v_total_searches
  FROM employer_search_history
  WHERE employer_id = p_employer_id;
  
  SELECT COUNT(*) INTO v_searches_this_month
  FROM employer_search_history
  WHERE employer_id = p_employer_id
    AND search_date >= date_trunc('month', NOW());
  
  SELECT COUNT(*) INTO v_total_saved
  FROM employer_saved_workers
  WHERE employer_id = p_employer_id;
  
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
-- DONE!
-- =====================================================
