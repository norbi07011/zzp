-- =====================================================
-- ZZP WERKPLAATS - QUICK MIGRATION (Essential Tables)
-- =====================================================
-- Run this SQL in Supabase Dashboard → SQL Editor
-- This creates only the most critical missing tables

-- =====================================================
-- 1. COMPANIES TABLE (Missing - Used by companies service)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_nip TEXT UNIQUE,
  company_regon TEXT,
  company_address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Poland',
  industry TEXT,
  company_size TEXT,
  website TEXT,
  description TEXT,
  logo_url TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  subscription_plan TEXT NOT NULL DEFAULT 'free',
  subscription_status TEXT NOT NULL DEFAULT 'trial',
  subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  monthly_fee NUMERIC(10, 2) DEFAULT 0.00,
  workers_limit INTEGER DEFAULT 5,
  active_workers_count INTEGER DEFAULT 0,
  total_appointments INTEGER DEFAULT 0,
  total_spent NUMERIC(10, 2) DEFAULT 0.00,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Companies policies
CREATE POLICY "Admins view companies" ON public.companies FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins manage companies" ON public.companies FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 2. APPOINTMENTS TABLE (Missing - Used by appointments service)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_id UUID,
  slot_id UUID,
  appointment_date TIMESTAMP WITH TIME ZONE,
  appointment_time TEXT,
  location TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Appointments policies
CREATE POLICY "Anyone can read appointments" ON public.appointments FOR SELECT USING (true);
CREATE POLICY "Admins manage appointments" ON public.appointments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 3. TEST_SLOTS TABLE (Missing - Used by testSlots service)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.test_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  capacity INTEGER DEFAULT 10,
  booked_count INTEGER DEFAULT 0,
  location TEXT,
  test_type TEXT,
  status TEXT DEFAULT 'available',
  instructor_id UUID,
  price NUMERIC(10, 2) DEFAULT 0.00,
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.test_slots ENABLE ROW LEVEL SECURITY;

-- Test slots policies
CREATE POLICY "Anyone can read test_slots" ON public.test_slots FOR SELECT USING (true);
CREATE POLICY "Admins manage test_slots" ON public.test_slots FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 4. PAYMENTS TABLE (Missing - Used by payments service)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments policies
CREATE POLICY "Users view own payments" ON public.payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 5. SYSTEM_SETTINGS TABLE (Missing - Used by settings service)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  category TEXT DEFAULT 'general',
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- System settings policies
CREATE POLICY "Public settings readable" ON public.system_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Admins manage settings" ON public.system_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =====================================================
-- 6. ADD SOME SAMPLE DATA
-- =====================================================

-- Sample system settings
INSERT INTO public.system_settings (key, value, category, description, is_public) VALUES
('app_name', '"ZZP Werkplaats"', 'general', 'Application name', true),
('app_version', '"1.0.0"', 'general', 'Application version', true),
('maintenance_mode', 'false', 'general', 'Maintenance mode flag', false),
('max_file_size', '10485760', 'upload', 'Maximum file upload size in bytes', false)
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created
SELECT 
  schemaname, 
  tablename, 
  tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'appointments', 'test_slots', 'payments', 'system_settings')
ORDER BY tablename;

-- Check RLS status
SELECT 
  schemaname, 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'appointments', 'test_slots', 'payments', 'system_settings')
ORDER BY tablename;