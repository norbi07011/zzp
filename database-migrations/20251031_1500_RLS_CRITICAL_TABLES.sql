-- ============================================
-- MIGRATION: RLS dla kluczowych tabel (PRIORYTET 1)
-- Date: 2025-10-31
-- Author: AI Copilot
-- ============================================

-- ROLLBACK PLAN:
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE workers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE employers DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE accountants DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS ... (wszystkie policies poniżej)

BEGIN;

-- ============================================
-- 1. PROFILES - główna tabela użytkowników
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users mogą widzieć swój własny profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users mogą edytować swój profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins mogą widzieć wszystkie profile
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Workers i Employers mogą widzieć public profile info
CREATE POLICY "Authenticated users can view public profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true); -- każdy zalogowany może zobaczyć podstawowe info

-- ============================================
-- 2. WORKERS - profile pracowników
-- ============================================

ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Worker może widzieć/edytować swój profil
CREATE POLICY "Workers can view own profile"
  ON workers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND id = workers.profile_id
    )
  );

CREATE POLICY "Workers can update own profile"
  ON workers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND id = workers.profile_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND id = workers.profile_id
    )
  );

-- Employers i Accountants mogą widzieć worker profiles
CREATE POLICY "Employers and accountants can view workers"
  ON workers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role IN ('employer', 'accountant', 'admin')
    )
  );

-- Admins mogą wszystko
CREATE POLICY "Admins can manage workers"
  ON workers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 3. EMPLOYERS - profile pracodawców
-- ============================================

ALTER TABLE employers ENABLE ROW LEVEL SECURITY;

-- Employer może widzieć/edytować swój profil
CREATE POLICY "Employers can view own profile"
  ON employers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND id = employers.profile_id
    )
  );

CREATE POLICY "Employers can update own profile"
  ON employers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND id = employers.profile_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND id = employers.profile_id
    )
  );

-- Workers i Accountants mogą widzieć employer profiles
CREATE POLICY "Workers and accountants can view employers"
  ON employers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
      AND role IN ('worker', 'accountant', 'admin')
    )
  );

-- Admins mogą wszystko
CREATE POLICY "Admins can manage employers"
  ON employers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 4. ACCOUNTANTS - profile księgowych
-- ============================================

ALTER TABLE accountants ENABLE ROW LEVEL SECURITY;

-- Accountant może widzieć/edytować swój profil
CREATE POLICY "Accountants can view own profile"
  ON accountants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND id = accountants.profile_id
    )
  );

CREATE POLICY "Accountants can update own profile"
  ON accountants FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND id = accountants.profile_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND id = accountants.profile_id
    )
  );

-- Wszyscy zalogowani mogą widzieć accountant profiles (dla wyszukiwania)
CREATE POLICY "Authenticated users can view accountants"
  ON accountants FOR SELECT
  TO authenticated
  USING (true);

-- Admins mogą wszystko
CREATE POLICY "Admins can manage accountants"
  ON accountants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 5. JOBS - oferty pracy
-- ============================================

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Wszyscy zalogowani mogą widzieć otwarte oferty
CREATE POLICY "Authenticated users can view open jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (status = 'open');

-- Employer może widzieć wszystkie swoje oferty
CREATE POLICY "Employers can view own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employers e
      WHERE e.id = jobs.employer_id
      AND e.profile_id = auth.uid()
    )
  );

-- Employer może tworzyć oferty
CREATE POLICY "Employers can create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employers e
      WHERE e.id = jobs.employer_id
      AND e.profile_id = auth.uid()
    )
  );

-- Employer może edytować swoje oferty
CREATE POLICY "Employers can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employers e
      WHERE e.id = jobs.employer_id
      AND e.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employers e
      WHERE e.id = jobs.employer_id
      AND e.profile_id = auth.uid()
    )
  );

-- Employer może usuwać swoje oferty
CREATE POLICY "Employers can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employers e
      WHERE e.id = jobs.employer_id
      AND e.profile_id = auth.uid()
    )
  );

-- Admins mogą wszystko
CREATE POLICY "Admins can manage all jobs"
  ON jobs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 6. MESSAGES - wiadomości prywatne
-- ============================================

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- User może widzieć wiadomości gdzie jest sender lub recipient
CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (
    sender_id = auth.uid() OR recipient_id = auth.uid()
  );

-- User może wysyłać wiadomości
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

-- User może edytować własne wysłane wiadomości (np. oznaczanie jako przeczytane)
CREATE POLICY "Users can update own sent messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid())
  WITH CHECK (sender_id = auth.uid() OR recipient_id = auth.uid());

-- User może usuwać własne wiadomości
CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  TO authenticated
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

-- ============================================
-- 7. NOTIFICATIONS - powiadomienia
-- ============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- User może widzieć swoje powiadomienia
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- System może tworzyć powiadomienia (service_role)
-- User nie może tworzyć własnych notyfikacji ręcznie

-- User może oznaczać powiadomienia jako przeczytane
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- User może usuwać swoje powiadomienia
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- WERYFIKACJA
-- ============================================

-- Sprawdź czy RLS jest włączony
SELECT 
    tablename,
    CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'employers', 'accountants', 'jobs', 'messages', 'notifications')
ORDER BY tablename;

-- Sprawdź liczba policies
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'workers', 'employers', 'accountants', 'jobs', 'messages', 'notifications')
GROUP BY tablename
ORDER BY tablename;

COMMIT;

-- ============================================
-- KONIEC MIGRACJI
-- ============================================
SELECT '✅ MIGRATION COMPLETE: RLS enabled for 7 critical tables' as status;
