/*
  # Dodanie Brakujących Tabel dla Employer Dashboard

  ## Problem
  Aplikacja wymaga 4 dodatkowych tabel dla panelu pracodawcy:
  - employer_stats (statystyki)
  - employer_search_history (historia wyszukiwań)
  - employer_saved_workers (zapisani pracownicy)
  - messages (wiadomości)

  ## Nowe Tabele

  ### 1. employer_stats
  Statystyki pracodawcy:
  - total_searches (łączna liczba wyszukiwań)
  - searches_this_month (wyszukiwania w tym miesiącu)
  - total_saved_workers (zapisani pracownicy)
  - total_contacts (łączna liczba kontaktów)
  - contacts_this_month (kontakty w tym miesiącu)

  ### 2. employer_search_history
  Historia wyszukiwań pracodawcy:
  - search_date (data wyszukiwania)
  - category (kategoria/specjalizacja)
  - level (poziom)
  - location_city (miasto)
  - results_count (liczba wyników)

  ### 3. employer_saved_workers
  Zapisani pracownicy:
  - worker_id (ID pracownika)
  - saved_at (data zapisania)
  - notes (notatki)
  - tags (tagi)

  ### 4. messages
  Wiadomości między użytkownikami:
  - sender_id (nadawca)
  - recipient_id (odbiorca)
  - subject (temat)
  - content (treść)
  - read (przeczytana)

  ## Bezpieczeństwo
  - RLS włączone dla wszystkich tabel
  - Użytkownicy widzą tylko swoje dane
  - Właściwe polityki dostępu
*/

-- =====================================================
-- 1. EMPLOYER_STATS
-- =====================================================

CREATE TABLE IF NOT EXISTS employer_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  total_searches integer DEFAULT 0,
  searches_this_month integer DEFAULT 0,
  total_saved_workers integer DEFAULT 0,
  total_contacts integer DEFAULT 0,
  contacts_this_month integer DEFAULT 0,
  subscription_expires_at timestamptz,
  last_updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(employer_id)
);

ALTER TABLE employer_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employer can view own stats"
  ON employer_stats FOR SELECT
  TO authenticated
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- 2. EMPLOYER_SEARCH_HISTORY
-- =====================================================

CREATE TABLE IF NOT EXISTS employer_search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  search_date timestamptz DEFAULT now(),
  category text,
  level text,
  location_city text,
  results_count integer DEFAULT 0,
  search_filters jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_history_employer 
  ON employer_search_history(employer_id, search_date DESC);

ALTER TABLE employer_search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employer can view own search history"
  ON employer_search_history FOR SELECT
  TO authenticated
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Employer can insert own search history"
  ON employer_search_history FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- 3. EMPLOYER_SAVED_WORKERS
-- =====================================================

CREATE TABLE IF NOT EXISTS employer_saved_workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  saved_at timestamptz DEFAULT now(),
  notes text,
  tags text[] DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  UNIQUE(employer_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_workers_employer 
  ON employer_saved_workers(employer_id, saved_at DESC);

ALTER TABLE employer_saved_workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employer can view own saved workers"
  ON employer_saved_workers FOR SELECT
  TO authenticated
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Employer can insert own saved workers"
  ON employer_saved_workers FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Employer can update own saved workers"
  ON employer_saved_workers FOR UPDATE
  TO authenticated
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Employer can delete own saved workers"
  ON employer_saved_workers FOR DELETE
  TO authenticated
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- 4. MESSAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_recipient 
  ON messages(recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_sender 
  ON messages(sender_id, created_at DESC);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (
    recipient_id = auth.uid()
  )
  WITH CHECK (
    recipient_id = auth.uid()
  );

-- =====================================================
-- 5. FUNKCJE POMOCNICZE
-- =====================================================

-- Funkcja aktualizująca statystyki pracodawcy
CREATE OR REPLACE FUNCTION update_employer_stats(p_employer_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO employer_stats (
    employer_id,
    total_searches,
    searches_this_month,
    total_saved_workers,
    total_contacts,
    contacts_this_month,
    subscription_expires_at
  )
  SELECT 
    p_employer_id,
    COALESCE(COUNT(DISTINCT sh.id), 0) as total_searches,
    COALESCE(COUNT(DISTINCT sh.id) FILTER (
      WHERE sh.search_date >= date_trunc('month', now())
    ), 0) as searches_this_month,
    COALESCE(COUNT(DISTINCT sw.id), 0) as total_saved_workers,
    COALESCE(COUNT(DISTINCT m.id), 0) as total_contacts,
    COALESCE(COUNT(DISTINCT m.id) FILTER (
      WHERE m.created_at >= date_trunc('month', now())
    ), 0) as contacts_this_month,
    e.subscription_expires_at
  FROM employers e
  LEFT JOIN employer_search_history sh ON sh.employer_id = e.id
  LEFT JOIN employer_saved_workers sw ON sw.employer_id = e.id
  LEFT JOIN messages m ON m.sender_id = e.profile_id
  WHERE e.id = p_employer_id
  GROUP BY e.id, e.subscription_expires_at
  ON CONFLICT (employer_id) DO UPDATE SET
    total_searches = EXCLUDED.total_searches,
    searches_this_month = EXCLUDED.searches_this_month,
    total_saved_workers = EXCLUDED.total_saved_workers,
    total_contacts = EXCLUDED.total_contacts,
    contacts_this_month = EXCLUDED.contacts_this_month,
    subscription_expires_at = EXCLUDED.subscription_expires_at,
    last_updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. INICJALIZACJA STATYSTYK DLA ISTNIEJĄCYCH EMPLOYERS
-- =====================================================

-- Utwórz statystyki dla wszystkich istniejących pracodawców
INSERT INTO employer_stats (employer_id, subscription_expires_at)
SELECT 
  id,
  subscription_expires_at
FROM employers
ON CONFLICT (employer_id) DO NOTHING;
