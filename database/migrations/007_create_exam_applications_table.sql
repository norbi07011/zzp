-- Migration: Create exam_applications table for ZZP Exam registrations
-- Description: Store exam application submissions from ExperienceCertificatePage
-- Date: 2025-01-11
-- EXECUTE THIS IN SUPABASE SQL EDITOR

-- Create exam_applications table
CREATE TABLE IF NOT EXISTS public.exam_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  years_experience INTEGER NOT NULL CHECK (years_experience >= 1 AND years_experience <= 50),
  city VARCHAR(100) NOT NULL,
  motivation TEXT,
  preferred_exam_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'paid', 'completed', 'passed', 'failed', 'cancelled')),
  exam_date TIMESTAMP WITH TIME ZONE,
  exam_score INTEGER CHECK (exam_score >= 0 AND exam_score <= 100),
  passed BOOLEAN,
  certificate_issued BOOLEAN DEFAULT FALSE,
  certificate_number VARCHAR(50) UNIQUE,
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
  payment_amount DECIMAL(10, 2) DEFAULT 230.00,
  payment_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  admin_notes TEXT,
  application_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_exam_applications_email ON public.exam_applications(email);
CREATE INDEX IF NOT EXISTS idx_exam_applications_status ON public.exam_applications(status);
CREATE INDEX IF NOT EXISTS idx_exam_applications_application_date ON public.exam_applications(application_date DESC);
CREATE INDEX IF NOT EXISTS idx_exam_applications_certificate_number ON public.exam_applications(certificate_number);

-- Enable Row Level Security
ALTER TABLE public.exam_applications ENABLE ROW LEVEL SECURITY;

-- Policy: Public can insert their own applications
CREATE POLICY "Anyone can submit exam application"
  ON public.exam_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Policy: Admins can view all applications
CREATE POLICY "Admins can view all exam applications"
  ON public.exam_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can update applications
CREATE POLICY "Admins can update exam applications"
  ON public.exam_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Policy: Admins can delete applications
CREATE POLICY "Admins can delete exam applications"
  ON public.exam_applications
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_exam_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER exam_applications_updated_at
  BEFORE UPDATE ON public.exam_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_exam_applications_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.exam_applications IS 'Stores ZZP Exam application submissions from the public website';
COMMENT ON COLUMN public.exam_applications.status IS 'Application status: pending (new) -> contacted (team reached out) -> scheduled (date confirmed) -> paid (payment received) -> completed (exam taken) -> passed/failed';
COMMENT ON COLUMN public.exam_applications.payment_status IS 'Payment tracking: unpaid -> paid -> refunded (if failed)';
COMMENT ON COLUMN public.exam_applications.certificate_number IS 'Unique certificate number generated after passing exam (e.g., ZZP-2025-001234)';
COMMENT ON COLUMN public.exam_applications.exam_score IS 'Exam score percentage (0-100). Passing score is 70%.';

-- Success message
SELECT 'Migration 007: exam_applications table created successfully!' AS message;
