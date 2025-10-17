-- ============================================================================
-- COMPLETE MIGRATION - WSZYSTKIE BRAKUJĄCE TABELE
-- ============================================================================
-- Data: 2025-10-12
-- Cel: Utworzenie wszystkich tabel wymaganych przez panele
-- Priorytet: KRYTYCZNY
-- ============================================================================

-- ============================================================================
-- PRIORYTET 1: TABELE PRACOWNIKA (KRYTYCZNE)
-- ============================================================================

-- 1. WORKER CERTIFICATES (Certyfikaty pracownika)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.worker_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_type VARCHAR(100) NOT NULL,
  certificate_number VARCHAR(100),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expiry_date DATE,
  file_url TEXT,
  pdf_url TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worker_certificates_worker_id ON public.worker_certificates(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_certificates_status ON public.worker_certificates(status);
CREATE INDEX IF NOT EXISTS idx_worker_certificates_type ON public.worker_certificates(certificate_type);

COMMENT ON TABLE public.worker_certificates IS 'Certyfikaty przypisane do konkretnych pracowników';

-- 2. PORTFOLIO PROJECTS (Projekty portfolio)
-- ----------------------------------------------------------------------------
-- Uwaga: Ta tabela może już istnieć z FIX_BEZPIECZNY.sql
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  project_url TEXT,
  tags TEXT[],
  start_date DATE NOT NULL,
  end_date DATE,
  client_name VARCHAR(255),
  location VARCHAR(255),
  project_value DECIMAL(10, 2),
  team_size INTEGER,
  role VARCHAR(100),
  technologies TEXT[],
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dodaj brakujące kolumny jeśli nie istnieją (tabela mogła być utworzona wcześniej)
DO $$
BEGIN
  -- Dodaj visible
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_projects' 
    AND column_name = 'visible'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN visible BOOLEAN DEFAULT true;
  END IF;
  
  -- Dodaj tags
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_projects' 
    AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN tags TEXT[];
  END IF;
  
  -- Dodaj project_value
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_projects' 
    AND column_name = 'project_value'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN project_value DECIMAL(10, 2);
  END IF;
  
  -- Dodaj team_size
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_projects' 
    AND column_name = 'team_size'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN team_size INTEGER;
  END IF;
  
  -- Dodaj role
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_projects' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN role VARCHAR(100);
  END IF;
  
  -- Dodaj technologies
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_projects' 
    AND column_name = 'technologies'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN technologies TEXT[];
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_portfolio_worker_id ON public.portfolio_projects(worker_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON public.portfolio_projects(created_at DESC);

-- Utwórz indeksy tylko jeśli kolumny istnieją
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_projects' 
    AND column_name = 'visible'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_portfolio_visible ON public.portfolio_projects(visible);
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'portfolio_projects' 
    AND column_name = 'tags'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_portfolio_tags ON public.portfolio_projects USING GIN(tags);
  END IF;
END $$;

COMMENT ON TABLE public.portfolio_projects IS 'Portfolio projektów pracowników';

-- 3. JOB APPLICATIONS (Aplikacje do ofert pracy)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'shortlisted', 'accepted', 'rejected', 'withdrawn')),
  cover_letter TEXT,
  resume_url TEXT,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_worker_job_application UNIQUE (worker_id, job_id)
);

-- Dodaj brakujące kolumny jeśli nie istnieją (tabela mogła być utworzona wcześniej)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'job_applications' 
    AND column_name = 'applied_at'
  ) THEN
    ALTER TABLE public.job_applications ADD COLUMN applied_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'job_applications' 
    AND column_name = 'viewed_at'
  ) THEN
    ALTER TABLE public.job_applications ADD COLUMN viewed_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'job_applications' 
    AND column_name = 'responded_at'
  ) THEN
    ALTER TABLE public.job_applications ADD COLUMN responded_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'job_applications' 
    AND column_name = 'resume_url'
  ) THEN
    ALTER TABLE public.job_applications ADD COLUMN resume_url TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'job_applications' 
    AND column_name = 'rating'
  ) THEN
    ALTER TABLE public.job_applications ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_applications_worker_id ON public.job_applications(worker_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.job_applications(status);

-- Utwórz indeks tylko jeśli kolumna istnieje
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'job_applications' 
    AND column_name = 'applied_at'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON public.job_applications(applied_at DESC);
  END IF;
END $$;

COMMENT ON TABLE public.job_applications IS 'Aplikacje pracowników do ofert pracy';

-- 4. EARNINGS (Zarobki pracownika)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
  currency VARCHAR(3) DEFAULT 'EUR',
  hours_worked DECIMAL(5, 2) CHECK (hours_worked >= 0),
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'cancelled', 'disputed')),
  invoice_number VARCHAR(100),
  invoice_url TEXT,
  description TEXT,
  tax_amount DECIMAL(10, 2),
  net_amount DECIMAL(10, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dodaj brakujące kolumny jeśli nie istnieją
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'earnings' 
    AND column_name = 'job_id'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'earnings' 
    AND column_name = 'application_id'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'earnings' 
    AND column_name = 'currency'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN currency VARCHAR(3) DEFAULT 'EUR';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'earnings' 
    AND column_name = 'hours_worked'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN hours_worked DECIMAL(5, 2) CHECK (hours_worked >= 0);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'earnings' 
    AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN payment_method VARCHAR(50);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'earnings' 
    AND column_name = 'invoice_number'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN invoice_number VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'earnings' 
    AND column_name = 'invoice_url'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN invoice_url TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'earnings' 
    AND column_name = 'description'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'earnings' 
    AND column_name = 'tax_amount'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN tax_amount DECIMAL(10, 2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'earnings' 
    AND column_name = 'net_amount'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN net_amount DECIMAL(10, 2);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_earnings_worker_id ON public.earnings(worker_id);
CREATE INDEX IF NOT EXISTS idx_earnings_payment_date ON public.earnings(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_earnings_status ON public.earnings(status);

-- Utwórz indeksy tylko jeśli kolumny istnieją
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'earnings' 
    AND column_name = 'job_id'
  ) THEN
    CREATE INDEX IF NOT EXISTS idx_earnings_job_id ON public.earnings(job_id);
  END IF;
END $$;

COMMENT ON TABLE public.earnings IS 'Zarobki i płatności pracowników';

-- 5. WORKER SKILLS (Umiejętności pracownika)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  skill_category VARCHAR(50),
  proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
  years_experience INTEGER CHECK (years_experience >= 0),
  verified BOOLEAN DEFAULT false,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  endorsements_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_worker_skill UNIQUE (worker_id, skill_name)
);

CREATE INDEX IF NOT EXISTS idx_worker_skills_worker_id ON public.worker_skills(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_skills_name ON public.worker_skills(skill_name);
CREATE INDEX IF NOT EXISTS idx_worker_skills_category ON public.worker_skills(skill_category);
CREATE INDEX IF NOT EXISTS idx_worker_skills_verified ON public.worker_skills(verified);

COMMENT ON TABLE public.worker_skills IS 'Umiejętności i kompetencje pracowników';

-- 6. WORKER REVIEWS (Opinie o pracowniku)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.worker_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  comment TEXT,
  pros TEXT,
  cons TEXT,
  would_hire_again BOOLEAN,
  visible BOOLEAN DEFAULT true,
  flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_review_per_job UNIQUE (worker_id, employer_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_worker_reviews_worker_id ON public.worker_reviews(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_reviews_employer_id ON public.worker_reviews(employer_id);
CREATE INDEX IF NOT EXISTS idx_worker_reviews_job_id ON public.worker_reviews(job_id);
CREATE INDEX IF NOT EXISTS idx_worker_reviews_rating ON public.worker_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_worker_reviews_visible ON public.worker_reviews(visible);
CREATE INDEX IF NOT EXISTS idx_worker_reviews_created_at ON public.worker_reviews(created_at DESC);

COMMENT ON TABLE public.worker_reviews IS 'Opinie pracodawców o pracownikach';

-- 7. WORKER EXPERIENCES (Doświadczenie zawodowe)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.worker_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name VARCHAR(255) NOT NULL,
  position VARCHAR(255) NOT NULL,
  employment_type VARCHAR(50) CHECK (employment_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')),
  start_date DATE NOT NULL,
  end_date DATE,
  current BOOLEAN DEFAULT false,
  location VARCHAR(255),
  description TEXT,
  achievements TEXT[],
  technologies TEXT[],
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worker_experiences_worker_id ON public.worker_experiences(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_experiences_current ON public.worker_experiences(current);
CREATE INDEX IF NOT EXISTS idx_worker_experiences_start_date ON public.worker_experiences(start_date DESC);

COMMENT ON TABLE public.worker_experiences IS 'Historia zatrudnienia i doświadczenie zawodowe pracowników';

-- 8. WORKER AVAILABILITY (Dostępność pracownika)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.worker_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  available_from DATE,
  available_to DATE,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'busy', 'partially-available', 'unavailable')),
  hours_per_week INTEGER CHECK (hours_per_week >= 0 AND hours_per_week <= 168),
  preferred_work_type VARCHAR(50) CHECK (preferred_work_type IN ('on-site', 'remote', 'hybrid')),
  max_distance_km INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worker_availability_worker_id ON public.worker_availability(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_availability_status ON public.worker_availability(status);
CREATE INDEX IF NOT EXISTS idx_worker_availability_available_from ON public.worker_availability(available_from);

COMMENT ON TABLE public.worker_availability IS 'Dostępność i preferencje pracowników';

-- ============================================================================
-- PRIORYTET 2: TABELE PRACODAWCY
-- ============================================================================

-- 9. EMPLOYER SEARCHES (Historia wyszukiwań)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.employer_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT,
  filters JSONB,
  category VARCHAR(100),
  location VARCHAR(255),
  experience_level VARCHAR(50),
  results_count INTEGER DEFAULT 0,
  workers_viewed UUID[],
  workers_contacted UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_employer_searches_employer_id ON public.employer_searches(employer_id);
CREATE INDEX IF NOT EXISTS idx_employer_searches_created_at ON public.employer_searches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_employer_searches_category ON public.employer_searches(category);

COMMENT ON TABLE public.employer_searches IS 'Historia wyszukiwań pracowników przez pracodawców';

-- 10. SAVED WORKERS (Zapisani pracownicy)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  folder VARCHAR(100),
  tags TEXT[],
  notes TEXT,
  priority VARCHAR(20) CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  contacted BOOLEAN DEFAULT false,
  contacted_at TIMESTAMPTZ,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_saved_worker UNIQUE (employer_id, worker_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_workers_employer_id ON public.saved_workers(employer_id);
CREATE INDEX IF NOT EXISTS idx_saved_workers_worker_id ON public.saved_workers(worker_id);
CREATE INDEX IF NOT EXISTS idx_saved_workers_folder ON public.saved_workers(folder);
CREATE INDEX IF NOT EXISTS idx_saved_workers_priority ON public.saved_workers(priority);
CREATE INDEX IF NOT EXISTS idx_saved_workers_saved_at ON public.saved_workers(saved_at DESC);

COMMENT ON TABLE public.saved_workers IS 'Pracownicy zapisani przez pracodawców';

-- 11. WORKER VIEWS (Wyświetlenia profili)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.worker_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address INET,
  user_agent TEXT,
  referer TEXT,
  duration_seconds INTEGER,
  viewed_sections TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_worker_views_worker_id ON public.worker_views(worker_id);
CREATE INDEX IF NOT EXISTS idx_worker_views_employer_id ON public.worker_views(employer_id);
CREATE INDEX IF NOT EXISTS idx_worker_views_created_at ON public.worker_views(created_at DESC);

COMMENT ON TABLE public.worker_views IS 'Wyświetlenia profili pracowników - analityka';

-- ============================================================================
-- PRIORYTET 3: KOMUNIKACJA
-- ============================================================================

-- 12. CONVERSATIONS (Konwersacje)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  subject VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_conversation UNIQUE (participant_1_id, participant_2_id),
  CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

COMMENT ON TABLE public.conversations IS 'Konwersacje między użytkownikami';

-- 13. MESSAGES (Wiadomości)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  deleted_by_sender BOOLEAN DEFAULT false,
  deleted_by_recipient BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);

COMMENT ON TABLE public.messages IS 'Wiadomości w konwersacjach';

-- ============================================================================
-- PRIORYTET 4: ADMINISTRACJA I ANALITYKA
-- ============================================================================

-- 14. ADMIN ACTIONS (Akcje administratorów)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type VARCHAR(100) NOT NULL,
  target_type VARCHAR(50),
  target_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON public.admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_type ON public.admin_actions(target_type);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);

COMMENT ON TABLE public.admin_actions IS 'Log wszystkich akcji wykonanych przez administratorów';

-- 15. SYSTEM METRICS (Metryki systemowe)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(15, 4) NOT NULL,
  metric_unit VARCHAR(20),
  metric_category VARCHAR(50),
  tags JSONB,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON public.system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_category ON public.system_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON public.system_metrics(recorded_at DESC);

COMMENT ON TABLE public.system_metrics IS 'Metryki systemowe w czasie rzeczywistym';

-- 16. FEATURE FLAGS (Flagi funkcjonalności)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name VARCHAR(100) NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_users UUID[],
  target_roles VARCHAR(50)[],
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON public.feature_flags(enabled);
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON public.feature_flags(feature_name);

COMMENT ON TABLE public.feature_flags IS 'Zarządzanie włączaniem/wyłączaniem funkcjonalności';

-- ============================================================================
-- FUNKCJE POMOCNICZE
-- ============================================================================

-- Funkcja do automatycznej aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERY DLA UPDATED_AT
-- ============================================================================

DROP TRIGGER IF EXISTS update_worker_certificates_updated_at ON public.worker_certificates;
CREATE TRIGGER update_worker_certificates_updated_at
  BEFORE UPDATE ON public.worker_certificates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolio_projects_updated_at ON public.portfolio_projects;
CREATE TRIGGER update_portfolio_projects_updated_at
  BEFORE UPDATE ON public.portfolio_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_earnings_updated_at ON public.earnings;
CREATE TRIGGER update_earnings_updated_at
  BEFORE UPDATE ON public.earnings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_worker_skills_updated_at ON public.worker_skills;
CREATE TRIGGER update_worker_skills_updated_at
  BEFORE UPDATE ON public.worker_skills
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_worker_reviews_updated_at ON public.worker_reviews;
CREATE TRIGGER update_worker_reviews_updated_at
  BEFORE UPDATE ON public.worker_reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_worker_experiences_updated_at ON public.worker_experiences;
CREATE TRIGGER update_worker_experiences_updated_at
  BEFORE UPDATE ON public.worker_experiences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_worker_availability_updated_at ON public.worker_availability;
CREATE TRIGGER update_worker_availability_updated_at
  BEFORE UPDATE ON public.worker_availability
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ZAKOŃCZENIE
-- ============================================================================

-- Podsumowanie utworzonych tabel
SELECT 
  'Sukces! Utworzono 16 nowych tabel:' as status,
  '1. worker_certificates, 2. portfolio_projects, 3. job_applications' as grupa_1,
  '4. earnings, 5. worker_skills, 6. worker_reviews' as grupa_2,
  '7. worker_experiences, 8. worker_availability' as grupa_3,
  '9. employer_searches, 10. saved_workers, 11. worker_views' as grupa_4,
  '12. conversations, 13. messages' as grupa_5,
  '14. admin_actions, 15. system_metrics, 16. feature_flags' as grupa_6;

-- GOTOWE! ✅
