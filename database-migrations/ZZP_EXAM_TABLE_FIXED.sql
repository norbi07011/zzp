-- =========================================
-- ZZP EXAM TABLE - CLEAN INSTALLATION
-- =========================================
-- FIXED: Drop existing table first
-- Data: 2025-01-29
-- =========================================

-- =========================================
-- STEP 1: DROP OLD TABLE (if exists)
-- =========================================

DROP TABLE IF EXISTS zzp_exam_applications CASCADE;

-- =========================================
-- STEP 2: CREATE NEW TABLE
-- =========================================

CREATE TABLE zzp_exam_applications (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- APPLICATION FORM
  exam_date DATE NOT NULL,
  warehouse_location TEXT NOT NULL,
  experience_description TEXT NOT NULL,
  specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  contact_phone TEXT,
  
  -- PAYMENT (€230 = €190 + 21% BTW)
  payment_status TEXT NOT NULL DEFAULT 'pending',
  payment_amount DECIMAL(10,2) DEFAULT 230.00,
  payment_currency TEXT DEFAULT 'EUR',
  payment_date TIMESTAMP,
  stripe_payment_id TEXT,
  stripe_session_id TEXT,
  invoice_number TEXT,
  
  -- EXAM RESULTS
  exam_completed_at TIMESTAMP,
  practical_score INTEGER CHECK (practical_score >= 1 AND practical_score <= 10),
  exam_notes TEXT,
  exam_result TEXT CHECK (exam_result IN ('passed', 'failed', NULL)),
  examiner_id UUID REFERENCES profiles(id),
  
  -- CERTIFICATION
  certificate_number TEXT UNIQUE,
  certificate_issued_at TIMESTAMP,
  certificate_issued_by UUID REFERENCES profiles(id),
  certificate_expires_at DATE,
  certificate_revoked BOOLEAN DEFAULT FALSE,
  certificate_revoke_reason TEXT,
  certificate_revoked_at TIMESTAMP,
  
  -- STATUS
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- TIMESTAMPS
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================
-- STEP 3: CREATE INDEXES
-- =========================================

CREATE INDEX idx_zzp_exam_worker_id ON zzp_exam_applications(worker_id);
CREATE INDEX idx_zzp_exam_status ON zzp_exam_applications(status);
CREATE INDEX idx_zzp_exam_date ON zzp_exam_applications(exam_date);
CREATE INDEX idx_zzp_exam_certificate_number ON zzp_exam_applications(certificate_number);
CREATE INDEX idx_zzp_exam_payment_status ON zzp_exam_applications(payment_status);

-- =========================================
-- STEP 4: CREATE TRIGGER
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
-- STEP 5: CREATE CERTIFICATE NUMBER GENERATOR
-- =========================================

CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
  next_number INTEGER;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(certificate_number FROM 10) AS INTEGER)
  ), 0) + 1
  INTO next_number
  FROM zzp_exam_applications
  WHERE certificate_number LIKE 'ZZP-' || year_part || '-%';
  
  sequence_part := LPAD(next_number::TEXT, 5, '0');
  
  RETURN 'ZZP-' || year_part || '-' || sequence_part;
END;
$$ LANGUAGE plpgsql;

-- =========================================
-- STEP 6: ENABLE RLS
-- =========================================

ALTER TABLE zzp_exam_applications ENABLE ROW LEVEL SECURITY;

-- =========================================
-- STEP 7: CREATE RLS POLICIES
-- =========================================

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
-- STEP 8: ADD COMMENT
-- =========================================

COMMENT ON TABLE zzp_exam_applications IS 'ZZP Exam & Certification System - Complete workflow from application to certification';

-- =========================================
-- VERIFICATION
-- =========================================

SELECT '✅ ZZP Exam table created successfully!' as status;

SELECT 'Table structure:' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'zzp_exam_applications'
ORDER BY ordinal_position
LIMIT 10;

SELECT 'RLS Policies:' as info;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'zzp_exam_applications'
ORDER BY policyname;

-- =========================================
-- MIGRATION COMPLETE ✅
-- =========================================
