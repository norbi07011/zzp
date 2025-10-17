-- =========================================
-- ZZP EXAM & CERTIFICATION SYSTEM
-- Migration: 2025-01-11
-- FIXED: Added DROP TABLE for zzp_exam_applications
-- =========================================

-- Drop old tables if they exist (from incorrect implementation)
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS premium_certificates CASCADE;

-- Drop zzp_exam_applications if exists (to recreate with correct structure)
DROP TABLE IF EXISTS zzp_exam_applications CASCADE;

-- =========================================
-- TABLE: zzp_exam_applications
-- Handles entire exam process: application → payment → exam → certification
-- =========================================

CREATE TABLE zzp_exam_applications (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- =====================================
  -- STEP 1: APPLICATION FORM
  -- =====================================
  exam_date DATE NOT NULL, -- Preferred exam date chosen by worker
  warehouse_location TEXT NOT NULL, -- Which warehouse/location
  experience_description TEXT NOT NULL, -- Worker's experience details
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['forklift', 'warehouse', 'logistics', 'heavy_machinery']
  contact_phone TEXT, -- Additional contact
  
  -- =====================================
  -- STEP 2: PAYMENT (€230 = €190 + 21% BTW)
  -- =====================================
  payment_status TEXT NOT NULL DEFAULT 'pending', -- pending/paid/refunded
  payment_amount DECIMAL(10,2) DEFAULT 230.00, -- €190 + BTW
  payment_currency TEXT DEFAULT 'EUR',
  payment_date TIMESTAMP,
  stripe_payment_id TEXT, -- Stripe Payment Intent ID
  stripe_session_id TEXT, -- Stripe Checkout Session ID
  invoice_number TEXT, -- Generated invoice number
  
  -- =====================================
  -- STEP 3: EXAM (filled by admin after practical exam)
  -- =====================================
  exam_completed_at TIMESTAMP, -- When exam was conducted
  practical_score INTEGER CHECK (practical_score >= 1 AND practical_score <= 10), -- 1-10 score
  exam_notes TEXT, -- Admin notes about exam performance
  exam_result TEXT CHECK (exam_result IN ('passed', 'failed', NULL)), -- Result
  examiner_id UUID REFERENCES profiles(id), -- Who conducted the exam
  
  -- =====================================
  -- STEP 4: CERTIFICATION (if passed)
  -- =====================================
  certificate_number TEXT UNIQUE, -- ZZP-2025-00123
  certificate_issued_at TIMESTAMP, -- When admin approved
  certificate_issued_by UUID REFERENCES profiles(id), -- Admin who approved
  certificate_expires_at DATE, -- +7 years from issue date
  certificate_revoked BOOLEAN DEFAULT FALSE,
  certificate_revoke_reason TEXT,
  certificate_revoked_at TIMESTAMP,
  
  -- =====================================
  -- STATUS TRACKING
  -- =====================================
  status TEXT NOT NULL DEFAULT 'draft', 
  -- Possible statuses:
  -- 'draft' - Worker started form but didn't submit/pay
  -- 'pending_payment' - Form submitted, waiting for payment
  -- 'paid' - Payment successful, exam scheduled
  -- 'scheduled' - Exam date confirmed
  -- 'completed' - Exam conducted, waiting for result
  -- 'passed' - Exam passed, certificate can be issued
  -- 'certified' - Certificate issued and active
  -- 'failed' - Exam not passed
  -- 'expired' - Certificate expired (after 1 year)
  -- 'revoked' - Certificate revoked by admin
  -- 'refunded' - Payment refunded, application cancelled
  
  -- =====================================
  -- TIMESTAMPS
  -- =====================================
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- INDEXES for performance
-- =========================================
CREATE INDEX idx_zzp_exam_worker_id ON zzp_exam_applications(worker_id);
CREATE INDEX idx_zzp_exam_status ON zzp_exam_applications(status);
CREATE INDEX idx_zzp_exam_date ON zzp_exam_applications(exam_date);
CREATE INDEX idx_zzp_exam_certificate_number ON zzp_exam_applications(certificate_number);
CREATE INDEX idx_zzp_exam_payment_status ON zzp_exam_applications(payment_status);

-- =========================================
-- TRIGGER: Update timestamp on modification
-- =========================================
CREATE OR REPLACE FUNCTION update_zzp_exam_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_zzp_exam_applications_timestamp
BEFORE UPDATE ON zzp_exam_applications
FOR EACH ROW
EXECUTE FUNCTION update_zzp_exam_timestamp();

-- =========================================
-- FUNCTION: Generate certificate number
-- Format: ZZP-YYYY-XXXXX (e.g. ZZP-2025-00123)
-- =========================================
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
  next_number INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  -- Get next number for this year
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(certificate_number FROM 10) AS INTEGER)
  ), 0) + 1
  INTO next_number
  FROM zzp_exam_applications
  WHERE certificate_number LIKE 'ZZP-' || year_part || '-%';
  
  -- Format as 5-digit number with leading zeros
  sequence_part := LPAD(next_number::TEXT, 5, '0');
  
  RETURN 'ZZP-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- RLS (Row Level Security) Policies
-- =========================================
ALTER TABLE zzp_exam_applications ENABLE ROW LEVEL SECURITY;

-- Workers can view their own applications
CREATE POLICY "Workers can view own exam applications"
  ON zzp_exam_applications
  FOR SELECT
  USING (auth.uid() = worker_id);

-- Workers can insert their own applications
CREATE POLICY "Workers can create exam applications"
  ON zzp_exam_applications
  FOR INSERT
  WITH CHECK (auth.uid() = worker_id);

-- Workers can update their draft applications only
CREATE POLICY "Workers can update draft applications"
  ON zzp_exam_applications
  FOR UPDATE
  USING (auth.uid() = worker_id AND status = 'draft');

-- Admins can view all applications
CREATE POLICY "Admins can view all exam applications"
  ON zzp_exam_applications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =========================================
-- SAMPLE DATA (for testing)
-- =========================================
-- Uncomment below to insert sample data

/*
INSERT INTO zzp_exam_applications (
  worker_id,
  exam_date,
  warehouse_location,
  experience_description,
  specializations,
  payment_status,
  status
) VALUES (
  (SELECT id FROM profiles WHERE email = 'jan.devries@example.com' LIMIT 1),
  '2025-02-15',
  'Amsterdam Warehouse',
  'Doświadczenie w pracy magazynowej - 5 lat obsługi wózków widłowych',
  ARRAY['forklift', 'warehouse', 'logistics'],
  'paid',
  'scheduled'
);
*/

-- =========================================
-- MIGRATION COMPLETE
-- =========================================
COMMENT ON TABLE zzp_exam_applications IS 'ZZP Exam & Certification System - Complete workflow from application to certification';
