-- ============================================================================
-- NAPRAWA BRAKUJĄCYCH TABEL - MINIMALNA WERSJA
-- ============================================================================

-- 1. Tabela certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_type VARCHAR(50) NOT NULL DEFAULT 'zzp_exam',
  certificate_number VARCHAR(100) UNIQUE,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  pdf_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela zzp_exam_applications (jeśli nie istnieje)
CREATE TABLE IF NOT EXISTS public.zzp_exam_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft',
  payment_intent_id TEXT,
  exam_date TIMESTAMP,
  practical_score INTEGER CHECK (practical_score >= 1 AND practical_score <= 10),
  certificate_number TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela subscription_payments (jeśli nie istnieje)
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'EUR',
  status VARCHAR(20) DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela appointments (jeśli nie istnieje)
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  appointment_date TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEKSY DLA WYDAJNOŚCI
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_certificates_worker_id ON public.certificates(worker_id);
CREATE INDEX IF NOT EXISTS idx_certificates_type ON public.certificates(certificate_type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_zzp_exam_worker_id ON public.zzp_exam_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_user_id ON public.subscription_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_appointments_worker_id ON public.appointments(worker_id);
CREATE INDEX IF NOT EXISTS idx_appointments_employer_id ON public.appointments(employer_id);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Certificates RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
CREATE POLICY "Users can view own certificates"
ON public.certificates FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Admins can view all certificates" ON public.certificates;
CREATE POLICY "Admins can view all certificates"
ON public.certificates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Notifications RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

-- ZZP Exam Applications RLS
ALTER TABLE public.zzp_exam_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Workers can view own exam applications" ON public.zzp_exam_applications;
CREATE POLICY "Workers can view own exam applications"
ON public.zzp_exam_applications FOR SELECT
USING (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Admins can manage exam applications" ON public.zzp_exam_applications;
CREATE POLICY "Admins can manage exam applications"
ON public.zzp_exam_applications FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Subscription Payments RLS
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own payments" ON public.subscription_payments;
CREATE POLICY "Users can view own payments"
ON public.subscription_payments FOR SELECT
USING (auth.uid() = user_id);

-- Appointments RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own appointments" ON public.appointments;
CREATE POLICY "Users can view own appointments"
ON public.appointments FOR SELECT
USING (auth.uid() = worker_id OR auth.uid() = employer_id);

-- ============================================================================
-- FUNKCJE POMOCNICZE
-- ============================================================================

-- Funkcja do generowania numeru certyfikatu
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_part TEXT;
  full_number TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  
  SELECT LPAD(COUNT(*)::TEXT, 5, '0')
  INTO sequence_part
  FROM public.certificates
  WHERE certificate_number LIKE 'ZZP-' || year_part || '-%';
  
  full_number := 'ZZP-' || year_part || '-' || sequence_part;
  
  RETURN full_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DANE TESTOWE (opcjonalne)
-- ============================================================================

-- Dodaj przykładowe powiadomienie dla testów
INSERT INTO public.notifications (user_id, type, title, message, action_url)
SELECT 
  id,
  'welcome',
  'Witamy w ZZP Werkplaats!',
  'Dziękujemy za rejestrację. Rozpocznij od uzupełnienia swojego profilu.',
  '/worker/profile'
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.notifications WHERE type = 'welcome')
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PODSUMOWANIE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migracja zakończona pomyślnie!';
  RAISE NOTICE '📊 Utworzone tabele: certificates, notifications, zzp_exam_applications, subscription_payments, appointments';
  RAISE NOTICE '🔒 Włączone RLS policies dla wszystkich tabel';
  RAISE NOTICE '⚡ Dodane indeksy dla wydajności';
  RAISE NOTICE '🎯 Aplikacja powinna teraz działać poprawnie!';
END $$;
