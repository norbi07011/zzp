-- ============================================
-- CERTIFICATE GENERATOR - DATABASE MIGRATION
-- Date: 15 November 2025
-- Purpose: Certificate generation and verification system
-- ============================================

-- ============================================
-- 1. CREATE CERTIFICATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS certificates (
  -- Primary
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id VARCHAR UNIQUE NOT NULL, -- ZZP-2025-00142

  -- Worker Reference (Snapshot - data preserved even if worker changes)
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  worker_full_name VARCHAR NOT NULL,
  worker_btw_sofi VARCHAR NOT NULL,
  worker_kvk VARCHAR NOT NULL,
  worker_specialization VARCHAR NOT NULL,

  -- Certificate Details
  verification_reason TEXT NOT NULL, -- Admin input explaining why certificate was issued
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE, -- NULL = lifetime validity

  -- File Storage
  pdf_url TEXT NOT NULL, -- Supabase Storage public URL
  pdf_storage_path TEXT NOT NULL, -- certificates/2025/ZZP-2025-00142.pdf

  -- Metadata
  issued_by_admin_id UUID REFERENCES profiles(id),
  issued_by_admin_name VARCHAR,

  -- Status
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,

  -- Verification Tracking
  qr_code_scans INTEGER DEFAULT 0,
  last_verified_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_certificates_worker ON certificates(worker_id);
CREATE INDEX IF NOT EXISTS idx_certificates_cert_id ON certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_issue_date ON certificates(issue_date DESC);

-- ============================================
-- 3. SEQUENTIAL CERTIFICATE ID GENERATOR
-- ============================================

-- Create sequence for certificate numbering
CREATE SEQUENCE IF NOT EXISTS certificate_sequence START 1;

-- Function to generate sequential certificate IDs (ZZP-2025-00001, ZZP-2025-00002, etc.)
CREATE OR REPLACE FUNCTION generate_certificate_id()
RETURNS VARCHAR AS $$
DECLARE
  year_suffix VARCHAR := TO_CHAR(CURRENT_DATE, 'YYYY');
  seq_num INTEGER;
  cert_id VARCHAR;
BEGIN
  seq_num := nextval('certificate_sequence');
  cert_id := 'ZZP-' || year_suffix || '-' || LPAD(seq_num::TEXT, 5, '0');
  RETURN cert_id;
END;
$$ LANGUAGE plpgsql;

-- Function to set certificate_id before insert
CREATE OR REPLACE FUNCTION set_certificate_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.certificate_id IS NULL THEN
    NEW.certificate_id := generate_certificate_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate certificate_id on insert
DROP TRIGGER IF EXISTS auto_certificate_id ON certificates;
CREATE TRIGGER auto_certificate_id
  BEFORE INSERT ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION set_certificate_id();

-- ============================================
-- 4. UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_certificates_timestamp ON certificates;
CREATE TRIGGER update_certificates_timestamp
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificates_updated_at();

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins manage certificates" ON certificates;
DROP POLICY IF EXISTS "Workers view own certificates" ON certificates;
DROP POLICY IF EXISTS "Public verify certificates" ON certificates;

-- Policy 1: Admins have full access (CRUD)
CREATE POLICY "Admins manage certificates"
  ON certificates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy 2: Workers can view their own certificates
CREATE POLICY "Workers view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

-- Policy 3: Public can verify active certificates (QR code scan)
CREATE POLICY "Public verify certificates"
  ON certificates FOR SELECT
  TO anon
  USING (status = 'active');

-- ============================================
-- 6. SUPABASE STORAGE BUCKET
-- ============================================

-- Create storage bucket for certificate PDFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Admins can upload
DROP POLICY IF EXISTS "Admins upload certificates" ON storage.objects;
CREATE POLICY "Admins upload certificates"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'certificates'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Storage policy: Everyone can read certificates (public bucket)
DROP POLICY IF EXISTS "Public read certificates" ON storage.objects;
CREATE POLICY "Public read certificates"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'certificates');

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Function to revoke a certificate
CREATE OR REPLACE FUNCTION revoke_certificate(
  cert_id UUID,
  reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE certificates
  SET 
    status = 'revoked',
    revoked_at = NOW(),
    revoked_reason = reason
  WHERE id = cert_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment QR code scan counter
CREATE OR REPLACE FUNCTION increment_certificate_scan(cert_id_text VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE certificates
  SET 
    qr_code_scans = qr_code_scans + 1,
    last_verified_at = NOW()
  WHERE certificate_id = cert_id_text
  AND status = 'active';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON TABLE certificates IS 'Professional skill verification certificates for ZZP workers';
COMMENT ON COLUMN certificates.certificate_id IS 'Sequential unique ID: ZZP-YYYY-XXXXX';
COMMENT ON COLUMN certificates.worker_full_name IS 'Snapshot of worker name at issue time';
COMMENT ON COLUMN certificates.verification_reason IS 'Admin explanation of why certificate was issued';
COMMENT ON COLUMN certificates.qr_code_scans IS 'Number of times QR code was scanned for verification';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
