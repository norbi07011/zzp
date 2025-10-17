-- =====================================================
-- EMPLOYER DASHBOARD - MINIMAL VERSION (NO RLS)
-- =====================================================
-- Copy and paste this ENTIRE file into Supabase SQL Editor
-- Then click RUN

-- 1. Search History
CREATE TABLE IF NOT EXISTS employer_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  search_date TIMESTAMPTZ DEFAULT NOW(),
  category TEXT NOT NULL,
  level TEXT,
  location_city TEXT,
  results_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Saved Workers
CREATE TABLE IF NOT EXISTS employer_saved_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  worker_id UUID NOT NULL,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  UNIQUE(employer_id, worker_id)
);

-- 3. Stats
CREATE TABLE IF NOT EXISTS employer_stats (
  employer_id UUID PRIMARY KEY,
  total_searches INTEGER DEFAULT 0,
  searches_this_month INTEGER DEFAULT 0,
  total_saved_workers INTEGER DEFAULT 0,
  total_contacts INTEGER DEFAULT 0,
  contacts_this_month INTEGER DEFAULT 0,
  subscription_expires_at TIMESTAMPTZ,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_search_employer ON employer_search_history(employer_id);
CREATE INDEX IF NOT EXISTS idx_saved_employer ON employer_saved_workers(employer_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);

-- Function to update stats
CREATE OR REPLACE FUNCTION update_employer_stats(p_employer_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO employer_stats (employer_id, total_searches, total_saved_workers)
  VALUES (p_employer_id, 0, 0)
  ON CONFLICT (employer_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
