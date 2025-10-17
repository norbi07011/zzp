-- SUPER MINIMAL - Run each block separately

-- BLOCK 1: Search History
CREATE TABLE employer_search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL,
  search_date TIMESTAMPTZ DEFAULT NOW(),
  category TEXT NOT NULL,
  results_count INTEGER DEFAULT 0
);
