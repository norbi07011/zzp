/*
  # Kompletna konfiguracja bazy danych ZZP Werkplaats
  
  ## 1. Główne tabele
    - `profiles` - profile użytkowników (admin, employer, worker)
    - `workers` - szczegółowe dane pracowników
    - `employers` - szczegółowe dane pracodawców
    - `certificates` - certyfikaty pracowników
    - `jobs` - oferty pracy
    - `applications` - aplikacje na oferty
    - `reviews` - opinie
    - `zzp_exam_applications` - aplikacje na egzamin ZZP
  
  ## 2. Bezpieczeństwo
    - RLS włączone na wszystkich tabelach
    - Polityki dostępu dla każdej roli
    - Automatyczne tworzenie profilu po rejestracji
  
  ## 3. Funkcje
    - Automatyczne tworzenie profilu
    - Zarządzanie subskrypcjami
*/

-- ============================================================================
-- PROFILES TABLE - główna tabela użytkowników
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  avatar_url text,
  phone text,
  language text DEFAULT 'nl',
  role text NOT NULL CHECK (role IN ('worker', 'employer', 'admin')),
  is_premium boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS dla profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- WORKERS TABLE - szczegółowe dane pracowników
-- ============================================================================
CREATE TABLE IF NOT EXISTS workers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  kvk_number text DEFAULT '',
  btw_number text,
  specialization text DEFAULT '',
  hourly_rate decimal(10,2) DEFAULT 0,
  years_experience integer DEFAULT 0,
  location_city text DEFAULT '',
  location_coords point,
  radius_km integer DEFAULT 25,
  available_from timestamptz,
  rating decimal(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  verified boolean DEFAULT false,
  verification_documents jsonb,
  bio text,
  skills text[] DEFAULT ARRAY[]::text[],
  certifications text[] DEFAULT ARRAY[]::text[],
  subscription_tier text DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'plus')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_expires_at timestamptz,
  worker_type text DEFAULT 'individual' CHECK (worker_type IN ('individual', 'team_leader', 'duo_partner', 'helper_available')),
  team_size integer DEFAULT 1,
  team_description text,
  team_hourly_rate decimal(10,2),
  is_on_demand_available boolean DEFAULT false,
  is_available_now boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS dla workers
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view own data"
  ON workers FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Workers can update own data"
  ON workers FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Employers can view workers"
  ON workers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('employer', 'admin')
    )
  );

CREATE POLICY "Admins can manage workers"
  ON workers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- EMPLOYERS TABLE - szczegółowe dane pracodawców
-- ============================================================================
CREATE TABLE IF NOT EXISTS employers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  company_name text NOT NULL,
  kvk_number text NOT NULL,
  industry text,
  location_city text,
  location_coords point,
  company_size text,
  verified boolean DEFAULT false,
  rating decimal(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  description text,
  website text,
  subscription_tier text DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'pro')),
  subscription_status text DEFAULT 'active' CHECK (subscription_status IN ('active', 'inactive', 'cancelled')),
  subscription_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS dla employers
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employers can view own data"
  ON employers FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Employers can update own data"
  ON employers FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Workers can view employers"
  ON employers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('worker', 'admin')
    )
  );

CREATE POLICY "Admins can manage employers"
  ON employers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- CERTIFICATES TABLE - certyfikaty pracowników
-- ============================================================================
CREATE TABLE IF NOT EXISTS certificates (
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

-- RLS dla certificates
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view own certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Workers can insert own certificates"
  ON certificates FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Workers can update own certificates"
  ON certificates FOR UPDATE
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Employers can view certificates"
  ON certificates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('employer', 'admin')
    )
  );

CREATE POLICY "Admins can manage certificates"
  ON certificates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- JOBS TABLE - oferty pracy
-- ============================================================================
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  specialization text NOT NULL,
  location_city text NOT NULL,
  location_coords point,
  hourly_rate_min decimal(10,2),
  hourly_rate_max decimal(10,2),
  start_date date,
  end_date date,
  required_skills text[] DEFAULT ARRAY[]::text[],
  required_certifications text[] DEFAULT ARRAY[]::text[],
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'filled')),
  application_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS dla jobs
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view open jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (status = 'open');

CREATE POLICY "Employers can view own jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Employers can insert own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage jobs"
  ON jobs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- APPLICATIONS TABLE - aplikacje na oferty
-- ============================================================================
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  cover_letter text,
  hourly_rate decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, worker_id)
);

-- RLS dla applications
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Workers can insert own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Employers can view applications to own jobs"
  ON applications FOR SELECT
  TO authenticated
  USING (
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN employers e ON e.id = j.employer_id
      WHERE e.profile_id = auth.uid()
    )
  );

CREATE POLICY "Employers can update applications to own jobs"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    job_id IN (
      SELECT j.id FROM jobs j
      JOIN employers e ON e.id = j.employer_id
      WHERE e.profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage applications"
  ON applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- REVIEWS TABLE - opinie
-- ============================================================================
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id uuid NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  employer_id uuid NOT NULL REFERENCES employers(id) ON DELETE CASCADE,
  job_id uuid REFERENCES jobs(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(worker_id, employer_id, job_id)
);

-- RLS dla reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Employers can insert reviews for workers"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    employer_id IN (
      SELECT id FROM employers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage reviews"
  ON reviews FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- ZZP EXAM APPLICATIONS TABLE - aplikacje na egzamin ZZP
-- ============================================================================
CREATE TABLE IF NOT EXISTS zzp_exam_applications (
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

-- RLS dla zzp_exam_applications
ALTER TABLE zzp_exam_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workers can view own exam applications"
  ON zzp_exam_applications FOR SELECT
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Workers can insert own exam applications"
  ON zzp_exam_applications FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id IN (
      SELECT id FROM workers WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage exam applications"
  ON zzp_exam_applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- FUNCTIONS - Automatyczne tworzenie profilu
-- ============================================================================

-- Funkcja do automatycznego tworzenia profilu po rejestracji
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'fullName', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'worker')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger dla automatycznego tworzenia profilu
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- INDEXES - Indeksy dla wydajności
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_workers_profile_id ON workers(profile_id);
CREATE INDEX IF NOT EXISTS idx_workers_specialization ON workers(specialization);
CREATE INDEX IF NOT EXISTS idx_workers_location_city ON workers(location_city);
CREATE INDEX IF NOT EXISTS idx_employers_profile_id ON employers(profile_id);
CREATE INDEX IF NOT EXISTS idx_certificates_worker_id ON certificates(worker_id);
CREATE INDEX IF NOT EXISTS idx_jobs_employer_id ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_worker_id ON applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_worker_id ON reviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_reviews_employer_id ON reviews(employer_id);

-- ============================================================================
-- COMPLETE
-- ============================================================================
