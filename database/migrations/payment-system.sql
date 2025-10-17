-- ===================================
-- PAYMENT SYSTEM MIGRATION - Dutch Market
-- Version: 1.0
-- Database: PostgreSQL (Supabase)
-- Date: 2025
-- ===================================

-- ===================================
-- 1. SUBSCRIPTIONS TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id VARCHAR(50) NOT NULL, -- 'basic', 'premium', 'enterprise'
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'past_due', 'canceled', 'incomplete', 'trialing'
  billing_cycle VARCHAR(20) NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  trial_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast company lookups
CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);

-- ===================================
-- 2. TRANSACTIONS TABLE (Worker Payments)
-- ===================================

CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE RESTRICT,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  amount_excl_btw INTEGER NOT NULL, -- in cents (€49.00 = 4900)
  btw_amount INTEGER NOT NULL, -- BTW amount in cents
  amount_incl_btw INTEGER NOT NULL, -- Total amount in cents
  platform_fee_percentage INTEGER NOT NULL DEFAULT 5, -- 5%
  platform_fee_amount INTEGER NOT NULL, -- Platform fee in cents
  worker_receives INTEGER NOT NULL, -- Amount worker receives (after fee)
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded'
  payment_method VARCHAR(50), -- 'ideal', 'credit_card', 'sepa_debit', 'bancontact'
  invoice_id UUID REFERENCES invoices(id),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- Indexes for fast lookups
CREATE INDEX idx_transactions_job_id ON transactions(job_id);
CREATE INDEX idx_transactions_company_id ON transactions(company_id);
CREATE INDEX idx_transactions_worker_id ON transactions(worker_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_stripe_payment_intent ON transactions(stripe_payment_intent_id);

-- ===================================
-- 3. INVOICES TABLE (Dutch Facturen)
-- ===================================

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL, -- Format: 2025-0001
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  company_name VARCHAR(255) NOT NULL,
  company_kvk VARCHAR(20) NOT NULL,
  company_btw VARCHAR(50), -- BTW/VAT number
  company_address TEXT NOT NULL,
  worker_id UUID REFERENCES workers(id) ON DELETE RESTRICT,
  worker_name VARCHAR(255),
  worker_kvk VARCHAR(20),
  worker_btw VARCHAR(50),
  invoice_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ NOT NULL,
  payment_date TIMESTAMPTZ,
  items JSONB NOT NULL, -- Array of invoice items
  subtotal_excl_btw INTEGER NOT NULL, -- in cents
  btw_amount INTEGER NOT NULL, -- BTW in cents
  total_incl_btw INTEGER NOT NULL, -- Total in cents
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue', 'canceled'
  payment_terms_days INTEGER DEFAULT 14, -- Usually 14 or 30 days
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_worker_id ON invoices(worker_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- ===================================
-- 4. PAYMENT METHODS TABLE
-- ===================================

CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'ideal', 'credit_card', 'sepa_debit', 'bancontact'
  is_default BOOLEAN DEFAULT FALSE,
  last_four VARCHAR(4), -- Last 4 digits for cards
  bank_name VARCHAR(100), -- For iDEAL
  card_brand VARCHAR(50), -- For credit cards (Visa, Mastercard, etc.)
  expiry_month INTEGER, -- For cards
  expiry_year INTEGER, -- For cards
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for company lookups
CREATE INDEX idx_payment_methods_company_id ON payment_methods(company_id);

-- Ensure only one default payment method per company
CREATE UNIQUE INDEX idx_payment_methods_default ON payment_methods(company_id) 
WHERE is_default = TRUE;

-- ===================================
-- 5. PAYOUTS TABLE (Worker Payouts)
-- ===================================

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES workers(id) ON DELETE RESTRICT,
  amount INTEGER NOT NULL, -- in cents
  stripe_payout_id VARCHAR(255) UNIQUE,
  iban VARCHAR(50) NOT NULL, -- Worker's IBAN
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'in_transit', 'paid', 'failed', 'canceled'
  arrival_date TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Index for worker lookups
CREATE INDEX idx_payouts_worker_id ON payouts(worker_id);
CREATE INDEX idx_payouts_status ON payouts(status);

-- ===================================
-- 6. FUNCTIONS & TRIGGERS
-- ===================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for subscriptions
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for invoices
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ===================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ===================================

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- Subscriptions: Companies can only see their own
CREATE POLICY subscriptions_company_policy ON subscriptions
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM companies WHERE id = company_id
  )
);

-- Transactions: Companies and workers can see their own
CREATE POLICY transactions_access_policy ON transactions
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM companies WHERE id = company_id
    UNION
    SELECT user_id FROM workers WHERE id = worker_id
  )
);

-- Invoices: Companies and workers can see their own
CREATE POLICY invoices_access_policy ON invoices
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM companies WHERE id = company_id
    UNION
    SELECT user_id FROM workers WHERE id = worker_id
  )
);

-- Payment methods: Companies can only see their own
CREATE POLICY payment_methods_company_policy ON payment_methods
FOR ALL
USING (
  auth.uid() IN (
    SELECT user_id FROM companies WHERE id = company_id
  )
);

-- Payouts: Workers can only see their own
CREATE POLICY payouts_worker_policy ON payouts
FOR SELECT
USING (
  auth.uid() IN (
    SELECT user_id FROM workers WHERE id = worker_id
  )
);

-- ===================================
-- 8. STATISTICS VIEWS
-- ===================================

-- Revenue statistics per company
CREATE OR REPLACE VIEW company_revenue_stats AS
SELECT
  c.id AS company_id,
  c.company_name,
  COUNT(DISTINCT s.id) AS active_subscriptions,
  COUNT(DISTINCT t.id) AS total_transactions,
  SUM(CASE WHEN t.status = 'completed' THEN t.amount_incl_btw ELSE 0 END) AS total_revenue,
  SUM(CASE WHEN t.status = 'completed' THEN t.platform_fee_amount ELSE 0 END) AS total_platform_fees
FROM companies c
LEFT JOIN subscriptions s ON c.id = s.company_id AND s.status = 'active'
LEFT JOIN transactions t ON c.id = t.company_id
GROUP BY c.id, c.company_name;

-- Worker earnings statistics
CREATE OR REPLACE VIEW worker_earnings_stats AS
SELECT
  w.id AS worker_id,
  w.full_name,
  COUNT(DISTINCT t.id) AS total_jobs,
  SUM(CASE WHEN t.status = 'completed' THEN t.worker_receives ELSE 0 END) AS total_earnings,
  SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) AS total_paid_out,
  SUM(CASE WHEN t.status = 'completed' THEN t.worker_receives ELSE 0 END) - 
  SUM(CASE WHEN p.status = 'paid' THEN p.amount ELSE 0 END) AS pending_payout
FROM workers w
LEFT JOIN transactions t ON w.id = t.worker_id
LEFT JOIN payouts p ON w.id = p.worker_id
GROUP BY w.id, w.full_name;

-- ===================================
-- MIGRATION COMPLETE
-- ===================================

-- Grant necessary permissions (adjust based on your setup)
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON invoices TO authenticated;
GRANT ALL ON payment_methods TO authenticated;
GRANT ALL ON payouts TO authenticated;

GRANT SELECT ON company_revenue_stats TO authenticated;
GRANT SELECT ON worker_earnings_stats TO authenticated;

-- ===================================
-- VERIFICATION QUERIES
-- ===================================

-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('subscriptions', 'transactions', 'invoices', 'payment_methods', 'payouts');

-- Verify indexes created
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('subscriptions', 'transactions', 'invoices', 'payment_methods', 'payouts');

COMMENT ON TABLE subscriptions IS 'Company subscription plans (Basic, Premium, Enterprise)';
COMMENT ON TABLE transactions IS 'Worker payment transactions with platform fees';
COMMENT ON TABLE invoices IS 'Dutch invoices (facturen) with BTW compliance';
COMMENT ON TABLE payment_methods IS 'Saved payment methods (iDEAL, cards, SEPA)';
COMMENT ON TABLE payouts IS 'Worker payouts to IBAN accounts';
