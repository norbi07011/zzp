-- ==========================================
-- WORKER SUBSCRIPTION SYSTEM MIGRATION
-- Dodaje subscription_tier i subscription_status do worker_profiles
-- ==========================================

-- 1. Dodaj kolumny subscription do worker_profiles
ALTER TABLE worker_profiles
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(10) DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium')),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'cancelled', 'past_due')),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- 2. Dodaj kolumny subscription do employer_profiles (jeśli nie istnieją)
ALTER TABLE employer_profiles
ADD COLUMN IF NOT EXISTS subscription_tier VARCHAR(10) DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'premium')),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('inactive', 'active', 'cancelled', 'past_due')),
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255);

-- 3. Utwórz indeksy dla szybszych queries
CREATE INDEX IF NOT EXISTS idx_worker_subscription_status ON worker_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_worker_subscription_tier ON worker_profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_employer_subscription_status ON employer_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_employer_subscription_tier ON employer_profiles(subscription_tier);

-- 4. Utwórz composite index dla worker visibility
CREATE INDEX IF NOT EXISTS idx_worker_visibility 
ON worker_profiles(subscription_tier, subscription_status, verified) 
WHERE subscription_status = 'active' AND subscription_tier = 'premium';

-- 5. RLS POLICY: Workers widoczni TYLKO jeśli Premium + Active
-- Usuń istniejący policy jeśli istnieje
DROP POLICY IF EXISTS worker_visibility_policy ON worker_profiles;

-- Utwórz nowy policy
CREATE POLICY worker_visibility_policy ON worker_profiles
FOR SELECT
USING (
  -- Admin widzi wszystkich
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  OR
  -- Worker widzi swój własny profil
  user_id = auth.uid()
  OR
  -- Employer widzi TYLKO Premium Workers z aktywną subskrypcją
  (
    auth.uid() IN (SELECT user_id FROM employer_profiles WHERE subscription_status = 'active')
    AND subscription_tier = 'premium'
    AND subscription_status = 'active'
    AND verified = true
  )
);

-- 6. RLS POLICY: Employer access do platformy TYLKO z aktywną subskrypcją
DROP POLICY IF EXISTS employer_access_policy ON employer_profiles;

CREATE POLICY employer_access_policy ON employer_profiles
FOR SELECT
USING (
  -- Admin widzi wszystkich
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
  OR
  -- Employer widzi swój własny profil (zawsze)
  user_id = auth.uid()
);

-- 7. Funkcja pomocnicza: sprawdź czy user ma aktywną subskrypcję
CREATE OR REPLACE FUNCTION has_active_subscription(user_uuid UUID, user_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  IF user_role = 'worker' THEN
    RETURN EXISTS (
      SELECT 1 FROM worker_profiles
      WHERE user_id = user_uuid
      AND subscription_status = 'active'
      AND subscription_end_date > NOW()
    );
  ELSIF user_role = 'employer' THEN
    RETURN EXISTS (
      SELECT 1 FROM employer_profiles
      WHERE user_id = user_uuid
      AND subscription_status = 'active'
      AND subscription_end_date > NOW()
    );
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Funkcja: Activate subscription po płatności Stripe
CREATE OR REPLACE FUNCTION activate_subscription(
  user_uuid UUID,
  user_role TEXT,
  tier TEXT,
  stripe_cust_id TEXT,
  stripe_sub_id TEXT
)
RETURNS VOID AS $$
BEGIN
  IF user_role = 'worker' THEN
    UPDATE worker_profiles
    SET 
      subscription_tier = tier,
      subscription_status = 'active',
      subscription_start_date = NOW(),
      subscription_end_date = NOW() + INTERVAL '1 month',
      stripe_customer_id = stripe_cust_id,
      stripe_subscription_id = stripe_sub_id,
      updated_at = NOW()
    WHERE user_id = user_uuid;
  ELSIF user_role = 'employer' THEN
    UPDATE employer_profiles
    SET 
      subscription_tier = tier,
      subscription_status = 'active',
      subscription_start_date = NOW(),
      subscription_end_date = NOW() + INTERVAL '1 month',
      stripe_customer_id = stripe_cust_id,
      stripe_subscription_id = stripe_sub_id,
      updated_at = NOW()
    WHERE user_id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Funkcja: Cancel subscription
CREATE OR REPLACE FUNCTION cancel_subscription(user_uuid UUID, user_role TEXT)
RETURNS VOID AS $$
BEGIN
  IF user_role = 'worker' THEN
    UPDATE worker_profiles
    SET 
      subscription_status = 'cancelled',
      updated_at = NOW()
    WHERE user_id = user_uuid;
  ELSIF user_role = 'employer' THEN
    UPDATE employer_profiles
    SET 
      subscription_status = 'cancelled',
      updated_at = NOW()
    WHERE user_id = user_uuid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. View: Active Premium Workers (dla Employers)
CREATE OR REPLACE VIEW active_premium_workers AS
SELECT 
  wp.*,
  p.full_name,
  p.email
FROM worker_profiles wp
JOIN profiles p ON wp.user_id = p.id
WHERE wp.subscription_tier = 'premium'
  AND wp.subscription_status = 'active'
  AND wp.verified = true
  AND wp.subscription_end_date > NOW();

-- 11. Dodaj komentarze do kolumn
COMMENT ON COLUMN worker_profiles.subscription_tier IS 'basic = darmowy (brak widoczności), premium = €13/miesiąc (pełna widoczność)';
COMMENT ON COLUMN worker_profiles.subscription_status IS 'inactive = nie aktywny, active = opłacony, cancelled = anulowany, past_due = zaległy';
COMMENT ON COLUMN employer_profiles.subscription_tier IS 'basic = €13/miesiąc, premium = €25/miesiąc';
COMMENT ON COLUMN employer_profiles.subscription_status IS 'inactive = nie aktywny (brak dostępu!), active = opłacony (pełen dostęp)';

-- 12. Trigger: Auto-expire subscriptions
CREATE OR REPLACE FUNCTION check_subscription_expiry()
RETURNS TRIGGER AS $$
BEGIN
  -- Jeśli subscription wygasła, zmień status na 'cancelled'
  IF NEW.subscription_end_date IS NOT NULL AND NEW.subscription_end_date < NOW() THEN
    NEW.subscription_status := 'cancelled';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER worker_subscription_expiry_trigger
BEFORE UPDATE ON worker_profiles
FOR EACH ROW
WHEN (NEW.subscription_end_date IS NOT NULL)
EXECUTE FUNCTION check_subscription_expiry();

CREATE TRIGGER employer_subscription_expiry_trigger
BEFORE UPDATE ON employer_profiles
FOR EACH ROW
WHEN (NEW.subscription_end_date IS NOT NULL)
EXECUTE FUNCTION check_subscription_expiry();

-- 13. Seed data: Ustaw wszystkich istniejących jako Basic/Inactive
UPDATE worker_profiles
SET subscription_tier = 'basic', subscription_status = 'inactive'
WHERE subscription_tier IS NULL;

UPDATE employer_profiles
SET subscription_tier = 'basic', subscription_status = 'inactive'
WHERE subscription_tier IS NULL;

-- ==========================================
-- MIGRATION COMPLETE ✅
-- ==========================================

-- Verify migration
SELECT 
  'Workers' AS table_name,
  subscription_tier,
  subscription_status,
  COUNT(*) AS count
FROM worker_profiles
GROUP BY subscription_tier, subscription_status
UNION ALL
SELECT 
  'Employers' AS table_name,
  subscription_tier,
  subscription_status,
  COUNT(*) AS count
FROM employer_profiles
GROUP BY subscription_tier, subscription_status;
