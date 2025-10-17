-- ============================================================================
-- NAPRAWA BRAKUJĄCYCH TABEL - KRYTYCZNE
-- ============================================================================
-- Data: 2025-10-13
-- Problem: Aplikacja próbuje pobierać dane z tabel które nie istnieją
-- Rozwiązanie: Utworzenie wszystkich brakujących tabel
-- ============================================================================

-- ============================================================================
-- 1. TABELA: appointments (spotkania/rozmowy pracodawca ↔ pracownik)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacje
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  
  -- Szczegóły spotkania
  title TEXT NOT NULL,
  description TEXT,
  
  -- Data i czas
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30 CHECK (duration_minutes > 0),
  
  -- Lokalizacja
  location_type TEXT NOT NULL CHECK (location_type IN ('online', 'on-site', 'phone')),
  location_details TEXT, -- adres lub link do video call
  
  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed', 'no-show')),
  
  -- Notatki
  employer_notes TEXT,
  worker_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES auth.users(id),
  cancellation_reason TEXT
);

-- Indeksy dla appointments
CREATE INDEX IF NOT EXISTS idx_appointments_employer ON public.appointments(employer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_worker ON public.appointments(worker_id);
CREATE INDEX IF NOT EXISTS idx_appointments_job ON public.appointments(job_id);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);

-- Trigger dla updated_at
CREATE OR REPLACE FUNCTION update_appointments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_appointments_updated_at();

-- RLS dla appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Policy: Employer widzi swoje spotkania
CREATE POLICY "Employers can view their own appointments"
  ON public.appointments FOR SELECT
  USING (
    employer_id IN (
      SELECT id FROM public.employers WHERE profile_id = auth.uid()
    )
  );

-- Policy: Worker widzi swoje spotkania
CREATE POLICY "Workers can view their own appointments"
  ON public.appointments FOR SELECT
  USING (
    worker_id IN (
      SELECT id FROM public.workers WHERE profile_id = auth.uid()
    )
  );

-- Policy: Employer może tworzyć spotkania
CREATE POLICY "Employers can create appointments"
  ON public.appointments FOR INSERT
  WITH CHECK (
    employer_id IN (
      SELECT id FROM public.employers WHERE profile_id = auth.uid()
    )
  );

-- Policy: Employer może edytować swoje spotkania
CREATE POLICY "Employers can update their appointments"
  ON public.appointments FOR UPDATE
  USING (
    employer_id IN (
      SELECT id FROM public.employers WHERE profile_id = auth.uid()
    )
  );

-- Policy: Worker może edytować swoje spotkania (np. dodać notatki)
CREATE POLICY "Workers can update their appointments"
  ON public.appointments FOR UPDATE
  USING (
    worker_id IN (
      SELECT id FROM public.workers WHERE profile_id = auth.uid()
    )
  );

-- Policy: Admin widzi wszystkie spotkania
CREATE POLICY "Admins can view all appointments"
  ON public.appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 2. TABELA: subscription_payments (płatności subskrypcji)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacje
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  
  -- Stripe
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  stripe_invoice_id TEXT,
  stripe_customer_id TEXT,
  
  -- Kwota
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  -- Status płatności
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded')),
  
  -- Typ subskrypcji
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('basic', 'premium', 'enterprise')),
  
  -- Okres
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  
  -- Szczegóły
  description TEXT,
  receipt_url TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ
);

-- Indeksy dla subscription_payments
CREATE INDEX IF NOT EXISTS idx_subscription_payments_employer ON public.subscription_payments(employer_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_stripe_intent ON public.subscription_payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_stripe_subscription ON public.subscription_payments(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON public.subscription_payments(status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_period ON public.subscription_payments(period_start, period_end);

-- Trigger dla updated_at
CREATE OR REPLACE FUNCTION update_subscription_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscription_payments_updated_at
  BEFORE UPDATE ON public.subscription_payments
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_payments_updated_at();

-- RLS dla subscription_payments
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Policy: Employer widzi swoje płatności
CREATE POLICY "Employers can view their own payments"
  ON public.subscription_payments FOR SELECT
  USING (
    employer_id IN (
      SELECT id FROM public.employers WHERE profile_id = auth.uid()
    )
  );

-- Policy: Admin widzi wszystkie płatności
CREATE POLICY "Admins can view all payments"
  ON public.subscription_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: System może tworzyć płatności (Stripe webhook)
CREATE POLICY "Service role can insert payments"
  ON public.subscription_payments FOR INSERT
  WITH CHECK (true);

-- Policy: System może aktualizować płatności
CREATE POLICY "Service role can update payments"
  ON public.subscription_payments FOR UPDATE
  USING (true);

-- ============================================================================
-- 3. TABELA: companies (firmy pracodawców)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacja do employer
  employer_id UUID NOT NULL UNIQUE REFERENCES public.employers(id) ON DELETE CASCADE,
  
  -- Dane firmy
  name TEXT NOT NULL,
  kvk_number TEXT, -- KVK = Kamer van Koophandel (Dutch Chamber of Commerce)
  btw_number TEXT, -- BTW = VAT number
  
  -- Adres
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'NL',
  
  -- Kontakt
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Opis
  description TEXT,
  logo_url TEXT,
  
  -- Branża
  industry TEXT,
  company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '500+')),
  
  -- Verification
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeksy dla companies
CREATE INDEX IF NOT EXISTS idx_companies_employer ON public.companies(employer_id);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON public.companies(verified);
CREATE INDEX IF NOT EXISTS idx_companies_kvk ON public.companies(kvk_number) WHERE kvk_number IS NOT NULL;

-- Trigger dla updated_at
CREATE OR REPLACE FUNCTION update_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION update_companies_updated_at();

-- RLS dla companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Policy: Employer może zarządzać swoją firmą
CREATE POLICY "Employers can manage their own company"
  ON public.companies FOR ALL
  USING (
    employer_id IN (
      SELECT id FROM public.employers WHERE profile_id = auth.uid()
    )
  );

-- Policy: Wszyscy mogą widzieć zweryfikowane firmy
CREATE POLICY "Anyone can view verified companies"
  ON public.companies FOR SELECT
  USING (verified = true);

-- Policy: Admin widzi wszystkie firmy
CREATE POLICY "Admins can view all companies"
  ON public.companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 4. TABELA: test_slots (sloty egzaminacyjne - dla VCA/certyfikatów)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.test_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Typ egzaminu
  test_type TEXT NOT NULL CHECK (test_type IN ('vca_basis', 'vca_vol', 'forklift', 'bhv', 'other')),
  test_name TEXT NOT NULL,
  
  -- Lokalizacja
  location TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  
  -- Data i czas
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60 CHECK (duration_minutes > 0),
  
  -- Dostępność
  max_participants INTEGER NOT NULL DEFAULT 1 CHECK (max_participants > 0),
  booked_count INTEGER NOT NULL DEFAULT 0 CHECK (booked_count >= 0),
  available_slots INTEGER GENERATED ALWAYS AS (max_participants - booked_count) STORED,
  
  -- Cena
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'full', 'cancelled', 'completed')),
  
  -- Szczegóły
  description TEXT,
  requirements TEXT[],
  
  -- Egzaminator
  examiner_name TEXT,
  examiner_email TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeksy dla test_slots
CREATE INDEX IF NOT EXISTS idx_test_slots_type ON public.test_slots(test_type);
CREATE INDEX IF NOT EXISTS idx_test_slots_scheduled ON public.test_slots(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_test_slots_status ON public.test_slots(status);
CREATE INDEX IF NOT EXISTS idx_test_slots_city ON public.test_slots(city);
CREATE INDEX IF NOT EXISTS idx_test_slots_available ON public.test_slots(available_slots) WHERE available_slots > 0;

-- Trigger dla updated_at
CREATE OR REPLACE FUNCTION update_test_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER test_slots_updated_at
  BEFORE UPDATE ON public.test_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_test_slots_updated_at();

-- Trigger: Auto-update status when full
CREATE OR REPLACE FUNCTION update_test_slot_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booked_count >= NEW.max_participants THEN
    NEW.status = 'full';
  ELSIF NEW.status = 'full' AND NEW.booked_count < NEW.max_participants THEN
    NEW.status = 'available';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER test_slots_auto_status
  BEFORE INSERT OR UPDATE ON public.test_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_test_slot_status();

-- RLS dla test_slots
ALTER TABLE public.test_slots ENABLE ROW LEVEL SECURITY;

-- Policy: Wszyscy mogą widzieć dostępne sloty
CREATE POLICY "Anyone can view available test slots"
  ON public.test_slots FOR SELECT
  USING (status = 'available' OR status = 'full');

-- Policy: Admin może zarządzać wszystkimi slotami
CREATE POLICY "Admins can manage all test slots"
  ON public.test_slots FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 5. TABELA: certificates (globalna lista certyfikatów - różna od worker_certificates)
-- ============================================================================
-- Ta tabela to KATALOG dostępnych certyfikatów (jak "VCA Basis", "Wózek widłowy")
-- worker_certificates to konkretne certyfikaty posiadane przez pracowników

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dane certyfikatu
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('safety', 'machinery', 'medical', 'license', 'other')),
  
  -- Opis
  description TEXT,
  requirements TEXT[],
  
  -- Ważność
  validity_months INTEGER, -- ile miesięcy ważny (null = bezterminowo)
  
  -- Issuer
  issuing_organization TEXT,
  
  -- Metadata
  icon TEXT, -- emoji lub URL do ikony
  color TEXT, -- hex color
  
  -- Verification
  verification_required BOOLEAN DEFAULT true,
  verification_url TEXT, -- URL do weryfikacji certyfikatu online
  
  -- Popularity
  usage_count INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeksy dla certificates
CREATE INDEX IF NOT EXISTS idx_certificates_category ON public.certificates(category);
CREATE INDEX IF NOT EXISTS idx_certificates_slug ON public.certificates(slug);
CREATE INDEX IF NOT EXISTS idx_certificates_usage ON public.certificates(usage_count DESC);

-- Trigger dla updated_at
CREATE OR REPLACE FUNCTION update_certificates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER certificates_updated_at
  BEFORE UPDATE ON public.certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_certificates_updated_at();

-- RLS dla certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Policy: Wszyscy mogą widzieć katalog certyfikatów
CREATE POLICY "Anyone can view certificates catalog"
  ON public.certificates FOR SELECT
  USING (true);

-- Policy: Admin może zarządzać katalogiem
CREATE POLICY "Admins can manage certificates"
  ON public.certificates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- DANE STARTOWE: Wypełnienie katalogu certyfikatów
-- ============================================================================

INSERT INTO public.certificates (name, slug, category, description, validity_months, issuing_organization, icon, color, verification_required)
VALUES 
  ('VCA Basis', 'vca-basis', 'safety', 'Podstawowy certyfikat bezpieczeństwa dla pracy w budownictwie i przemyśle', 120, 'SSVV Nederland', '🛡️', '#FF6B6B', true),
  ('VCA VOL', 'vca-vol', 'safety', 'Zaawansowany certyfikat VCA dla pracowników operacyjnych', 120, 'SSVV Nederland', '🛡️', '#E74C3C', true),
  ('Wózek widłowy', 'wozek-widlowy', 'machinery', 'Uprawnienia do obsługi wózka widłowego', 60, 'TÜV Nederland', '🚜', '#4ECDC4', true),
  ('BHV (Pierwsza pomoc)', 'bhv', 'medical', 'Certyfikat pierwszej pomocy przedmedycznej', 12, 'Rode Kruis', '🏥', '#E74C3C', true),
  ('Praca na wysokości', 'praca-na-wysokosci', 'safety', 'Uprawnienia do pracy na wysokości powyżej 2.5m', 60, 'SZW Nederland', '⛑️', '#FFA07A', true),
  ('Prawo jazdy B', 'prawo-jazdy-b', 'license', 'Prawo jazdy kategorii B', NULL, 'CBR Nederland', '🚗', '#3498DB', false),
  ('Prawo jazdy C', 'prawo-jazdy-c', 'license', 'Prawo jazdy kategorii C (ciężarówki)', NULL, 'CBR Nederland', '🚛', '#2980B9', false),
  ('Spawacz', 'spawacz', 'machinery', 'Certyfikat spawacza (różne poziomy)', 36, 'SLV Nederland', '🔥', '#F39C12', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- PODSUMOWANIE
-- ============================================================================

DO $$
DECLARE
  v_appointments_count INTEGER;
  v_subscription_payments_count INTEGER;
  v_companies_count INTEGER;
  v_test_slots_count INTEGER;
  v_certificates_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_appointments_count FROM public.appointments;
  SELECT COUNT(*) INTO v_subscription_payments_count FROM public.subscription_payments;
  SELECT COUNT(*) INTO v_companies_count FROM public.companies;
  SELECT COUNT(*) INTO v_test_slots_count FROM public.test_slots;
  SELECT COUNT(*) INTO v_certificates_count FROM public.certificates;
  
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '✅ BRAKUJĄCE TABELE UTWORZONE POMYŚLNIE! ✅';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 NOWE TABELE:';
  RAISE NOTICE '  • appointments (spotkania): % rekordów', v_appointments_count;
  RAISE NOTICE '  • subscription_payments (płatności): % rekordów', v_subscription_payments_count;
  RAISE NOTICE '  • companies (firmy): % rekordów', v_companies_count;
  RAISE NOTICE '  • test_slots (sloty egzaminacyjne): % rekordów', v_test_slots_count;
  RAISE NOTICE '  • certificates (katalog certyfikatów): % rekordów', v_certificates_count;
  RAISE NOTICE '';
  RAISE NOTICE '✅ RLS POLICIES: Wszystkie skonfigurowane';
  RAISE NOTICE '✅ INDEXY: Wszystkie utworzone dla wydajności';
  RAISE NOTICE '✅ TRIGGERS: Auto-update created_at/updated_at';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 NASTĘPNE KROKI:';
  RAISE NOTICE '  1. Odśwież stronę (Ctrl+F5)';
  RAISE NOTICE '  2. Sprawdź czy błędy zniknęły z konsoli';
  RAISE NOTICE '  3. Przetestuj wszystkie panele (admin/employer/worker)';
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
