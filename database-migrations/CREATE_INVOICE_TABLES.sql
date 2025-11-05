-- =====================================================
-- NORBS INVOICE MODULE - COMPLETE DATABASE SCHEMA
-- =====================================================
-- Migration: Create all tables for invoice management system
-- Date: 2025-10-28
-- Author: AI Copilot
-- 
-- This migration creates a complete invoicing system with:
-- - Companies (1 per user)
-- - Clients (many per user)
-- - Products/Services (many per user)
-- - Invoices with multi-line items (many per user)
-- - Expenses tracking (many per user)
-- - BTW/VAT quarterly declarations (many per user)
-- - Kilometer tracking for tax deductions (many per user)
--
-- All tables include user_id for data isolation
-- All tables have RLS policies enabled
-- =====================================================

-- =====================================================
-- TABLE 1: INVOICE_COMPANIES
-- =====================================================
-- Stores company information (1 per user)
-- Each user has their own company profile for invoices

CREATE TABLE IF NOT EXISTS invoice_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic company info
  name TEXT NOT NULL,
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'NL',
  
  -- Tax identifiers
  kvk_number TEXT, -- KVK (Netherlands Chamber of Commerce)
  vat_number TEXT, -- BTW nummer
  eori_number TEXT, -- EORI for international trade
  
  -- Contact details
  email TEXT,
  phone TEXT,
  mobile TEXT,
  whatsapp TEXT,
  website TEXT,
  
  -- Banking details (for SEPA QR codes)
  iban TEXT,
  bic TEXT,
  bank_name TEXT,
  
  -- Invoice settings
  default_payment_term_days INTEGER DEFAULT 14,
  default_vat_rate DECIMAL(5,2) DEFAULT 21.00,
  currency TEXT DEFAULT 'EUR',
  
  -- Logo (base64 or URL)
  logo_url TEXT,
  logo_base64 TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id) -- One company per user
);

CREATE INDEX idx_invoice_companies_user_id ON invoice_companies(user_id);

COMMENT ON TABLE invoice_companies IS 'Company profiles for invoice generation (1 per user)';

-- =====================================================
-- TABLE 2: INVOICE_CLIENTS
-- =====================================================
-- Stores client information (many per user)
-- Supports international clients with different tax systems

CREATE TABLE IF NOT EXISTS invoice_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Client type
  type TEXT NOT NULL CHECK (type IN ('individual', 'company')),
  
  -- Basic info
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  
  -- Address
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'NL',
  
  -- Tax identifiers (varies by country)
  kvk_number TEXT, -- Netherlands: KVK
  vat_number TEXT, -- EU: VAT number
  nip_number TEXT, -- Poland: NIP
  tax_id TEXT, -- Other countries
  
  -- Payment settings
  payment_term_days INTEGER DEFAULT 14,
  
  -- Notes
  notes TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_clients_user_id ON invoice_clients(user_id);
CREATE INDEX idx_invoice_clients_country ON invoice_clients(country);
CREATE INDEX idx_invoice_clients_active ON invoice_clients(is_active);

COMMENT ON TABLE invoice_clients IS 'Client database for invoicing (many per user, supports international tax systems)';

-- =====================================================
-- TABLE 3: INVOICE_PRODUCTS
-- =====================================================
-- Stores products/services catalog (many per user)

CREATE TABLE IF NOT EXISTS invoice_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Product info
  code TEXT,
  name TEXT NOT NULL,
  description TEXT,
  
  -- Pricing
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Net price
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 21.00, -- VAT percentage
  
  -- Unit
  unit TEXT DEFAULT 'uur', -- uur, stuk, dag, maand, etc.
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_products_user_id ON invoice_products(user_id);
CREATE INDEX idx_invoice_products_active ON invoice_products(is_active);
CREATE INDEX idx_invoice_products_code ON invoice_products(code);

COMMENT ON TABLE invoice_products IS 'Products and services catalog for invoices (many per user)';

-- =====================================================
-- TABLE 4: INVOICE_INVOICES
-- =====================================================
-- Stores invoices (many per user)

CREATE TABLE IF NOT EXISTS invoice_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Invoice identification
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Client reference
  client_id UUID REFERENCES invoice_clients(id) ON DELETE SET NULL,
  client_snapshot JSONB, -- Snapshot of client data at invoice time
  
  -- Language
  language TEXT DEFAULT 'nl' CHECK (language IN ('pl', 'nl', 'en')),
  
  -- Status
  status TEXT DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'cancelled')),
  
  -- Amounts
  total_net DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_vat DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_gross DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  
  -- Payment tracking
  paid_amount DECIMAL(10,2) DEFAULT 0.00,
  payment_date DATE,
  
  -- Payment reference (for SEPA QR)
  payment_reference TEXT,
  payment_qr_payload TEXT, -- EPC QR code data
  
  -- EU reverse charge
  is_reverse_charge BOOLEAN DEFAULT FALSE,
  
  -- Notes
  notes TEXT,
  footer_text TEXT,
  
  -- Template
  template_name TEXT DEFAULT 'modern',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, invoice_number)
);

CREATE INDEX idx_invoice_invoices_user_id ON invoice_invoices(user_id);
CREATE INDEX idx_invoice_invoices_client_id ON invoice_invoices(client_id);
CREATE INDEX idx_invoice_invoices_status ON invoice_invoices(status);
CREATE INDEX idx_invoice_invoices_date ON invoice_invoices(invoice_date DESC);
CREATE INDEX idx_invoice_invoices_number ON invoice_invoices(invoice_number);

COMMENT ON TABLE invoice_invoices IS 'Invoice headers with summary totals (many per user)';

-- =====================================================
-- TABLE 5: INVOICE_INVOICE_LINES
-- =====================================================
-- Stores invoice line items (many per invoice)

CREATE TABLE IF NOT EXISTS invoice_invoice_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoice_invoices(id) ON DELETE CASCADE,
  
  -- Line position
  line_number INTEGER NOT NULL,
  
  -- Product reference (optional)
  product_id UUID REFERENCES invoice_products(id) ON DELETE SET NULL,
  
  -- Line data
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  unit TEXT DEFAULT 'uur',
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Net price
  vat_rate DECIMAL(5,2) NOT NULL DEFAULT 21.00,
  
  -- Calculated amounts
  line_net DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  line_vat DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  line_gross DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(invoice_id, line_number)
);

CREATE INDEX idx_invoice_lines_invoice_id ON invoice_invoice_lines(invoice_id);
CREATE INDEX idx_invoice_lines_product_id ON invoice_invoice_lines(product_id);

COMMENT ON TABLE invoice_invoice_lines IS 'Invoice line items (many per invoice)';

-- =====================================================
-- TABLE 6: INVOICE_EXPENSES
-- =====================================================
-- Stores business expenses (many per user)

CREATE TABLE IF NOT EXISTS invoice_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Expense info
  date DATE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  supplier TEXT,
  
  -- Amounts
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  vat_amount DECIMAL(10,2) DEFAULT 0.00,
  vat_rate DECIMAL(5,2) DEFAULT 21.00,
  
  -- Tax deductibility
  is_deductible BOOLEAN DEFAULT TRUE,
  deductible_percentage DECIMAL(5,2) DEFAULT 100.00, -- For mixed private/business expenses
  
  -- Receipt
  receipt_url TEXT,
  receipt_base64 TEXT,
  
  -- Client/Project reference (optional)
  client_id UUID REFERENCES invoice_clients(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoice_invoices(id) ON DELETE SET NULL, -- If rebilled
  
  -- Payment
  payment_method TEXT, -- cash, card, bank_transfer, etc.
  is_paid BOOLEAN DEFAULT TRUE,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_expenses_user_id ON invoice_expenses(user_id);
CREATE INDEX idx_invoice_expenses_date ON invoice_expenses(date DESC);
CREATE INDEX idx_invoice_expenses_category ON invoice_expenses(category);
CREATE INDEX idx_invoice_expenses_client_id ON invoice_expenses(client_id);

COMMENT ON TABLE invoice_expenses IS 'Business expenses tracking with VAT deductibility (many per user)';

-- =====================================================
-- TABLE 7: INVOICE_BTW_DECLARATIONS
-- =====================================================
-- Stores quarterly BTW/VAT declarations (many per user)
-- For Dutch ZZP quarterly VAT reporting

CREATE TABLE IF NOT EXISTS invoice_btw_declarations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Period
  year INTEGER NOT NULL,
  quarter TEXT NOT NULL CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'paid')),
  
  -- Revenue lines (omzet)
  revenue_21 DECIMAL(10,2) DEFAULT 0.00, -- Revenue at 21% VAT
  revenue_9 DECIMAL(10,2) DEFAULT 0.00,  -- Revenue at 9% VAT
  revenue_0 DECIMAL(10,2) DEFAULT 0.00,  -- Revenue at 0% VAT
  revenue_eu DECIMAL(10,2) DEFAULT 0.00, -- EU B2B (reverse charge)
  revenue_export DECIMAL(10,2) DEFAULT 0.00, -- Export outside EU
  
  -- Input VAT (voorbelasting)
  input_vat DECIMAL(10,2) DEFAULT 0.00,
  
  -- Calculated fields
  output_vat_21 DECIMAL(10,2) DEFAULT 0.00, -- revenue_21 * 0.21
  output_vat_9 DECIMAL(10,2) DEFAULT 0.00,  -- revenue_9 * 0.09
  total_output_vat DECIMAL(10,2) DEFAULT 0.00,
  balance DECIMAL(10,2) DEFAULT 0.00, -- To pay (positive) or receive (negative)
  
  -- Submission
  submitted_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id, year, quarter)
);

CREATE INDEX idx_invoice_btw_user_id ON invoice_btw_declarations(user_id);
CREATE INDEX idx_invoice_btw_period ON invoice_btw_declarations(year DESC, quarter);
CREATE INDEX idx_invoice_btw_status ON invoice_btw_declarations(status);

COMMENT ON TABLE invoice_btw_declarations IS 'Quarterly BTW/VAT declarations for Dutch ZZP (many per user)';

-- =====================================================
-- TABLE 8: INVOICE_KILOMETER_ENTRIES
-- =====================================================
-- Stores kilometer tracking for tax deductions (many per user)
-- Netherlands 2025 rates

CREATE TABLE IF NOT EXISTS invoice_kilometer_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Trip info
  date DATE NOT NULL,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  purpose TEXT NOT NULL,
  kilometers DECIMAL(10,2) NOT NULL,
  
  -- Vehicle info
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'bike', 'motorcycle')),
  is_private_vehicle BOOLEAN DEFAULT TRUE,
  
  -- Rate (NL 2025)
  rate DECIMAL(10,4) NOT NULL, -- €/km
  amount DECIMAL(10,2) NOT NULL, -- kilometers * rate
  
  -- Client/Project reference (optional)
  client_id UUID REFERENCES invoice_clients(id) ON DELETE SET NULL,
  project_id TEXT,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_kilometers_user_id ON invoice_kilometer_entries(user_id);
CREATE INDEX idx_invoice_kilometers_date ON invoice_kilometer_entries(date DESC);
CREATE INDEX idx_invoice_kilometers_client_id ON invoice_kilometer_entries(client_id);
CREATE INDEX idx_invoice_kilometers_vehicle ON invoice_kilometer_entries(vehicle_type);

COMMENT ON TABLE invoice_kilometer_entries IS 'Kilometer tracking for tax deductions with NL 2025 rates (many per user)';

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================
-- Enable RLS on all tables
-- Each user can only access their own data

-- Enable RLS
ALTER TABLE invoice_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_btw_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_kilometer_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policy: invoice_companies
CREATE POLICY invoice_companies_isolation ON invoice_companies
  FOR ALL
  USING (user_id = auth.uid());

-- RLS Policy: invoice_clients
CREATE POLICY invoice_clients_isolation ON invoice_clients
  FOR ALL
  USING (user_id = auth.uid());

-- RLS Policy: invoice_products
CREATE POLICY invoice_products_isolation ON invoice_products
  FOR ALL
  USING (user_id = auth.uid());

-- RLS Policy: invoice_invoices
CREATE POLICY invoice_invoices_isolation ON invoice_invoices
  FOR ALL
  USING (user_id = auth.uid());

-- RLS Policy: invoice_invoice_lines
-- Access through invoice ownership
CREATE POLICY invoice_lines_isolation ON invoice_invoice_lines
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM invoice_invoices
      WHERE invoice_invoices.id = invoice_invoice_lines.invoice_id
        AND invoice_invoices.user_id = auth.uid()
    )
  );

-- RLS Policy: invoice_expenses
CREATE POLICY invoice_expenses_isolation ON invoice_expenses
  FOR ALL
  USING (user_id = auth.uid());

-- RLS Policy: invoice_btw_declarations
CREATE POLICY invoice_btw_isolation ON invoice_btw_declarations
  FOR ALL
  USING (user_id = auth.uid());

-- RLS Policy: invoice_kilometer_entries
CREATE POLICY invoice_kilometers_isolation ON invoice_kilometer_entries
  FOR ALL
  USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS: AUTO-UPDATE TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_invoice_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_invoice_companies_timestamp
  BEFORE UPDATE ON invoice_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_updated_at();

CREATE TRIGGER update_invoice_clients_timestamp
  BEFORE UPDATE ON invoice_clients
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_updated_at();

CREATE TRIGGER update_invoice_products_timestamp
  BEFORE UPDATE ON invoice_products
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_updated_at();

CREATE TRIGGER update_invoice_invoices_timestamp
  BEFORE UPDATE ON invoice_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_updated_at();

CREATE TRIGGER update_invoice_expenses_timestamp
  BEFORE UPDATE ON invoice_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_updated_at();

CREATE TRIGGER update_invoice_btw_timestamp
  BEFORE UPDATE ON invoice_btw_declarations
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_updated_at();

CREATE TRIGGER update_invoice_kilometers_timestamp
  BEFORE UPDATE ON invoice_kilometer_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_updated_at();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- You can verify the schema was created correctly:

-- List all invoice tables
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_name LIKE 'invoice_%' AND table_schema = 'public';

-- Check RLS policies
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE tablename LIKE 'invoice_%';

-- Check indexes
-- SELECT tablename, indexname FROM pg_indexes 
-- WHERE tablename LIKE 'invoice_%';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- All tables created successfully!
-- Next steps:
-- 1. Run this migration in Supabase SQL Editor
-- 2. Verify tables were created
-- 3. Create TypeScript types (src/modules/invoices/types/)
-- 4. Create Supabase hooks (src/modules/invoices/hooks/)
-- 5. Build UI components
-- =====================================================
