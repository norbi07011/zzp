/*
  # RESET CAŁEJ BAZY DANYCH - Czysty Start

  ## Krok 1: Usunięcie Wszystkich Tabel
  - Usuwa wszystkie istniejące tabele w poprawnej kolejności (foreign keys)
  - Usuwa wszystkie triggery
  - Usuwa wszystkie funkcje

  ## Krok 2: Tworzenie Tabel Od Nowa
  1. profiles - Profile użytkowników
  2. workers - Profile pracowników
  3. employers - Profile pracodawców
  4. certificates - Certyfikaty pracowników
  5. jobs - Oferty pracy
  6. applications - Aplikacje do pracy
  7. reviews - Opinie
  8. zzp_exam_applications - Aplikacje egzaminacyjne

  ## Krok 3: Row Level Security (RLS)
  - Wszystkie tabele mają włączone RLS
  - Polityki umożliwiają użytkownikom dostęp tylko do swoich danych
  - Admini mają pełny dostęp

  ## Krok 4: Trigger dla Auto-tworzenia Profili
  - Automatycznie tworzy profil po rejestracji użytkownika
*/

-- =====================================================
-- KROK 1: USUNIĘCIE WSZYSTKIEGO
-- =====================================================

-- Usuń triggery
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_workers_updated_at ON workers;
DROP TRIGGER IF EXISTS update_employers_updated_at ON employers;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
DROP TRIGGER IF EXISTS update_zzp_exam_applications_updated_at ON zzp_exam_applications;

-- Usuń funkcje
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Usuń tabele w poprawnej kolejności (od zależnych do głównych)
DROP TABLE IF EXISTS zzp_exam_applications CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS employers CASCADE;
DROP TABLE IF EXISTS workers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- KROK 2: TWORZENIE TABEL OD NOWA
-- =====================================================

-- 1. PROFILES - Profile użytkowników
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  phone text,
  language text DEFAULT 'nl',
  role text NOT NULL CHECK (role IN ('worker', 'employer', 'admin')),
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. WORKERS - Profile pracowników
CREATE TABLE workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kvk_number text DEFAULT '',
  btw_number text,
  specialization text DEFAULT '',
  hourly_rate numeric DEFAULT 0,
  years_experience integer DEFAULT 0,
  location_city text DEFAULT '',
  location_coords point,
  radius_km integer DEFAULT 25,
  available_from timestamptz,
  rating numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  verified boolean DEFAULT false,
  verification_documents jsonb,
  bio text,
  skills text[] DEFAULT ARRAY[]::text[],
  certifications text[] DEFAULT ARRAY[]::text[],

  -- Subskrypcje
  subscription_tier text DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'plus')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_expires_at timestamptz,

  -- Praca zespołowa
  worker_type text DEFAULT 'individual' CHECK (worker_type IN ('individual', 'team_leader', 'duo_partner', 'helper_available')),
  team_size integer DEFAULT 1,
  team_description text,
  team_hourly_rate numeric,
  is_on_demand_available boolean DEFAULT false,
  is_available_now boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. EMPLOYERS - Profile pracodawców
CREATE TABLE employers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  kvk_number text NOT NULL,
  industry text,
  location_city text,
  location_coords point,
  company_size text,
  verified boolean DEFAULT false,
  rating numeric DEFAULT 0,
  rating_count integer DEFAULT 0,
  description text,
  website text,

  -- Subskrypcje
  subscription_tier text DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'pro')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_expires_at timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. CERTIFICATES - Certyfikaty pracowników
CREATE TABLE certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  certificate_type text NOT NULL,
  certificate_number text,
  issuer text NOT NULL,
  issue_date date NOT NULL,
  expiry_date date,
  file_url text,
  verified boolean DEFAULT false,
  ocr_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. JOBS - Oferty pracy
CREATE TABLE jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  specialization text NOT NULL,
  location_city text NOT NULL,
  location_coords point,
  hourly_rate_min numeric,
  hourly_rate_max numeric,
  start_date date,
  end_date date,
  required_skills text[] DEFAULT ARRAY[]::text[],
  required_certifications text[] DEFAULT ARRAY[]::text[],
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
  application_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. APPLICATIONS - Aplikacje do pracy
CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  cover_letter text,
  hourly_rate numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. REVIEWS - Opinie
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  employer_id uuid NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. ZZP_EXAM_APPLICATIONS - Aplikacje egzaminacyjne
CREATE TABLE zzp_exam_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  specialization text NOT NULL,
  preferred_date date NOT NULL,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  exam_status text DEFAULT 'scheduled' CHECK (exam_status IN ('scheduled', 'completed', 'passed', 'failed', 'cancelled')),
  stripe_session_id text,
  stripe_payment_intent_id text,
  exam_result jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- KROK 3: FUNKCJE POMOCNICZE
-- =====================================================

-- Funkcja do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Funkcja do automatycznego tworzenia profilu po rejestracji
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Wyciągnij role z raw_user_meta_data
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'worker')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- KROK 4: TRIGGERY
-- =====================================================

-- Trigger dla auto-tworzenia profilu
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Triggery dla updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employers_updated_at BEFORE UPDATE ON employers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certificates_updated_at BEFORE UPDATE ON certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_zzp_exam_applications_updated_at BEFORE UPDATE ON zzp_exam_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- KROK 5: ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Włącz RLS na wszystkich tabelach
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE zzp_exam_applications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES - RLS POLICIES
-- =====================================================

-- Admini mogą wszystko
CREATE POLICY "Admins have full access to profiles"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Użytkownicy mogą widzieć swój profil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Użytkownicy mogą aktualizować swój profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- =====================================================
-- WORKERS - RLS POLICIES
-- =====================================================

-- Wszyscy mogą przeglądać pracowników
CREATE POLICY "Anyone can view workers"
  ON workers FOR SELECT
  TO authenticated
  USING (true);

-- Pracownicy mogą aktualizować swój profil
CREATE POLICY "Workers can update own profile"
  ON workers FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Nowi użytkownicy mogą tworzyć profil pracownika
CREATE POLICY "Users can create worker profile"
  ON workers FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- =====================================================
-- EMPLOYERS - RLS POLICIES
-- =====================================================

-- Wszyscy mogą przeglądać pracodawców
CREATE POLICY "Anyone can view employers"
  ON employers FOR SELECT
  TO authenticated
  USING (true);

-- Pracodawcy mogą aktualizować swój profil
CREATE POLICY "Employers can update own profile"
  ON employers FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Nowi użytkownicy mogą tworzyć profil pracodawcy
CREATE POLICY "Users can create employer profile"
  ON employers FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- =====================================================
-- CERTIFICATES - RLS POLICIES
-- =====================================================

-- Wszyscy mogą widzieć zweryfikowane certyfikaty
CREATE POLICY "Anyone can view verified certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (verified = true);

-- Pracownicy mogą widzieć swoje certyfikaty
CREATE POLICY "Workers can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

-- Pracownicy mogą dodawać certyfikaty
CREATE POLICY "Workers can insert own certificates"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

-- Pracownicy mogą aktualizować swoje certyfikaty
CREATE POLICY "Workers can update own certificates"
  ON certificates FOR UPDATE
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- JOBS - RLS POLICIES
-- =====================================================

-- Wszyscy mogą widzieć otwarte oferty pracy
CREATE POLICY "Anyone can view open jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (status = 'open');

-- Pracodawcy mogą dodawać oferty
CREATE POLICY "Employers can insert jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

-- Pracodawcy mogą aktualizować swoje oferty
CREATE POLICY "Employers can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  )
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- APPLICATIONS - RLS POLICIES
-- =====================================================

-- Pracownicy mogą widzieć swoje aplikacje
CREATE POLICY "Workers can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

-- Pracodawcy mogą widzieć aplikacje do swoich ofert
CREATE POLICY "Employers can view applications to their jobs"
  ON applications FOR SELECT
  TO authenticated
  USING (
    job_id IN (
      SELECT id FROM jobs WHERE employer_id IN (
        SELECT id FROM employers WHERE profile_id = auth.uid()
      )
    )
  );

-- Pracownicy mogą tworzyć aplikacje
CREATE POLICY "Workers can create applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- REVIEWS - RLS POLICIES
-- =====================================================

-- Wszyscy mogą widzieć opinie
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

-- Pracodawcy mogą dodawać opinie o pracownikach
CREATE POLICY "Employers can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- ZZP_EXAM_APPLICATIONS - RLS POLICIES
-- =====================================================

-- Pracownicy mogą widzieć swoje aplikacje egzaminacyjne
CREATE POLICY "Workers can view own exam applications"
  ON zzp_exam_applications FOR SELECT
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

-- Pracownicy mogą tworzyć aplikacje egzaminacyjne
CREATE POLICY "Workers can create exam applications"
  ON zzp_exam_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- KROK 6: INDEKSY DLA WYDAJNOŚCI
-- =====================================================

CREATE INDEX idx_workers_profile_id ON workers(profile_id);
CREATE INDEX idx_workers_specialization ON workers(specialization);
CREATE INDEX idx_workers_location_city ON workers(location_city);
CREATE INDEX idx_employers_profile_id ON employers(profile_id);
CREATE INDEX idx_certificates_worker_id ON certificates(worker_id);
CREATE INDEX idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_applications_worker_id ON applications(worker_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_reviews_worker_id ON reviews(worker_id);
CREATE INDEX idx_reviews_employer_id ON reviews(employer_id);
CREATE INDEX idx_zzp_exam_applications_worker_id ON zzp_exam_applications(worker_id);

-- =====================================================
-- GOTOWE!
-- =====================================================
