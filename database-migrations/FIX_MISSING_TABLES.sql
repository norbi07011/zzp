-- ================================
-- FIX MISSING TABLES AND DATA
-- ================================

-- 1. CREATE certificates TABLE (if not exists)
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_type VARCHAR(50) NOT NULL, -- 'zzp_exam', 'experience', etc.
  certificate_number VARCHAR(100) UNIQUE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'revoked'
  pdf_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE INDEX for faster lookups
CREATE INDEX IF NOT EXISTS idx_certificates_worker_id ON public.certificates(worker_id);
CREATE INDEX IF NOT EXISTS idx_certificates_type ON public.certificates(certificate_type);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON public.certificates(status);

-- 3. ENABLE RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- 4. DROP existing policies if any
DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can insert own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can update own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admins can view all certificates" ON public.certificates;

-- 5. CREATE RLS POLICIES
-- Workers can view their own certificates
CREATE POLICY "Users can view own certificates"
ON public.certificates
FOR SELECT
USING (auth.uid() = worker_id);

-- Workers can insert their own certificates (for future self-upload)
CREATE POLICY "Users can insert own certificates"
ON public.certificates
FOR INSERT
WITH CHECK (auth.uid() = worker_id);

-- Workers can update their own certificates
CREATE POLICY "Users can update own certificates"
ON public.certificates
FOR UPDATE
USING (auth.uid() = worker_id);

-- Admins can view all certificates
CREATE POLICY "Admins can view all certificates"
ON public.certificates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- 6. GRANT permissions
GRANT SELECT, INSERT, UPDATE ON public.certificates TO authenticated;
GRANT SELECT ON public.certificates TO anon;

-- 7. CREATE updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_certificates_updated_at ON public.certificates;

CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- VERIFICATION QUERIES
-- ================================

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'certificates'
) as certificates_table_exists;

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'certificates';

-- Count certificates
SELECT COUNT(*) as total_certificates FROM public.certificates;
