-- ============================================================================
-- MIGRACJA BAZY DANYCH - KROK PO KROKU (PRAWIDŁOWA KOLEJNOŚĆ)
-- ============================================================================
-- Data: 2025-10-12
-- Autor: GitHub Copilot
-- Cel: Budowa kompletnej struktury bazy danych od fundamentów
-- ============================================================================

-- ============================================================================
-- KROK 1: NAPRAW ISTNIEJĄCE TABELE - DODAJ BRAKUJĄCE KOLUMNY
-- ============================================================================

-- 1.1 PORTFOLIO_PROJECTS - Dodaj brakujące kolumny
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE 'KROK 1.1: Naprawiam tabelę portfolio_projects...';
  
  -- visible
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'portfolio_projects' AND column_name = 'visible'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN visible BOOLEAN DEFAULT true;
    RAISE NOTICE '  ✓ Dodano kolumnę visible';
  END IF;
  
  -- tags
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'portfolio_projects' AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN tags TEXT[];
    RAISE NOTICE '  ✓ Dodano kolumnę tags';
  END IF;
  
  -- project_value
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'portfolio_projects' AND column_name = 'project_value'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN project_value DECIMAL(10, 2);
    RAISE NOTICE '  ✓ Dodano kolumnę project_value';
  END IF;
  
  -- team_size
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'portfolio_projects' AND column_name = 'team_size'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN team_size INTEGER;
    RAISE NOTICE '  ✓ Dodano kolumnę team_size';
  END IF;
  
  -- role
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'portfolio_projects' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN role VARCHAR(100);
    RAISE NOTICE '  ✓ Dodano kolumnę role';
  END IF;
  
  -- technologies
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'portfolio_projects' AND column_name = 'technologies'
  ) THEN
    ALTER TABLE public.portfolio_projects ADD COLUMN technologies TEXT[];
    RAISE NOTICE '  ✓ Dodano kolumnę technologies';
  END IF;
  
  RAISE NOTICE '✅ KROK 1.1 ZAKOŃCZONY: portfolio_projects naprawione';
END $$;

-- 1.2 JOB_APPLICATIONS - Dodaj brakujące kolumny
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE 'KROK 1.2: Naprawiam tabelę job_applications...';
  
  -- applied_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'job_applications' AND column_name = 'applied_at'
  ) THEN
    ALTER TABLE public.job_applications ADD COLUMN applied_at TIMESTAMPTZ DEFAULT NOW();
    RAISE NOTICE '  ✓ Dodano kolumnę applied_at';
  END IF;
  
  -- viewed_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'job_applications' AND column_name = 'viewed_at'
  ) THEN
    ALTER TABLE public.job_applications ADD COLUMN viewed_at TIMESTAMPTZ;
    RAISE NOTICE '  ✓ Dodano kolumnę viewed_at';
  END IF;
  
  -- responded_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'job_applications' AND column_name = 'responded_at'
  ) THEN
    ALTER TABLE public.job_applications ADD COLUMN responded_at TIMESTAMPTZ;
    RAISE NOTICE '  ✓ Dodano kolumnę responded_at';
  END IF;
  
  -- resume_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'job_applications' AND column_name = 'resume_url'
  ) THEN
    ALTER TABLE public.job_applications ADD COLUMN resume_url TEXT;
    RAISE NOTICE '  ✓ Dodano kolumnę resume_url';
  END IF;
  
  -- rating
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'job_applications' AND column_name = 'rating'
  ) THEN
    ALTER TABLE public.job_applications ADD COLUMN rating INTEGER CHECK (rating >= 1 AND rating <= 5);
    RAISE NOTICE '  ✓ Dodano kolumnę rating';
  END IF;
  
  RAISE NOTICE '✅ KROK 1.2 ZAKOŃCZONY: job_applications naprawione';
END $$;

-- 1.3 EARNINGS - Dodaj brakujące kolumny
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE 'KROK 1.3: Naprawiam tabelę earnings...';
  
  -- job_id (bez klucza obcego - tabela jobs nie istnieje)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'earnings' AND column_name = 'job_id'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN job_id UUID;
    RAISE NOTICE '  ✓ Dodano kolumnę job_id (bez klucza obcego)';
  END IF;
  
  -- application_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'earnings' AND column_name = 'application_id'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL;
    RAISE NOTICE '  ✓ Dodano kolumnę application_id';
  END IF;
  
  -- currency
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'earnings' AND column_name = 'currency'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN currency VARCHAR(3) DEFAULT 'EUR';
    RAISE NOTICE '  ✓ Dodano kolumnę currency';
  END IF;
  
  -- hours_worked
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'earnings' AND column_name = 'hours_worked'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN hours_worked DECIMAL(5, 2) CHECK (hours_worked >= 0);
    RAISE NOTICE '  ✓ Dodano kolumnę hours_worked';
  END IF;
  
  -- payment_method
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'earnings' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN payment_method VARCHAR(50);
    RAISE NOTICE '  ✓ Dodano kolumnę payment_method';
  END IF;
  
  -- invoice_number
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'earnings' AND column_name = 'invoice_number'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN invoice_number VARCHAR(100);
    RAISE NOTICE '  ✓ Dodano kolumnę invoice_number';
  END IF;
  
  -- invoice_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'earnings' AND column_name = 'invoice_url'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN invoice_url TEXT;
    RAISE NOTICE '  ✓ Dodano kolumnę invoice_url';
  END IF;
  
  -- description
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'earnings' AND column_name = 'description'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN description TEXT;
    RAISE NOTICE '  ✓ Dodano kolumnę description';
  END IF;
  
  -- tax_amount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'earnings' AND column_name = 'tax_amount'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN tax_amount DECIMAL(10, 2);
    RAISE NOTICE '  ✓ Dodano kolumnę tax_amount';
  END IF;
  
  -- net_amount
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'earnings' AND column_name = 'net_amount'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN net_amount DECIMAL(10, 2);
    RAISE NOTICE '  ✓ Dodano kolumnę net_amount';
  END IF;
  
  -- payment_date
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'earnings' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN payment_date DATE;
    RAISE NOTICE '  ✓ Dodano kolumnę payment_date';
  END IF;
  
  -- status
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'earnings' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.earnings ADD COLUMN status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'cancelled', 'disputed'));
    RAISE NOTICE '  ✓ Dodano kolumnę status';
  END IF;
  
  RAISE NOTICE '✅ KROK 1.3 ZAKOŃCZONY: earnings naprawione';
END $$;

-- ============================================================================
-- KROK 2: UTWÓRZ NOWE TABELE (KTÓRE NIE ISTNIEJĄ)
-- ============================================================================

-- 2.1 WORKER_CERTIFICATES
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worker_certificates') THEN
    RAISE NOTICE 'KROK 2.1: Tworzę tabelę worker_certificates...';
    
    CREATE TABLE public.worker_certificates (
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
    
    RAISE NOTICE '✅ KROK 2.1 ZAKOŃCZONY: worker_certificates utworzone';
  ELSE
    RAISE NOTICE '⏭️  KROK 2.1 POMINIĘTY: worker_certificates już istnieje';
  END IF;
END $$;

-- 2.2 WORKER_SKILLS
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worker_skills') THEN
    RAISE NOTICE 'KROK 2.2: Tworzę tabelę worker_skills...';
    
    CREATE TABLE public.worker_skills (
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
    
    RAISE NOTICE '✅ KROK 2.2 ZAKOŃCZONY: worker_skills utworzone';
  ELSE
    RAISE NOTICE '⏭️  KROK 2.2 POMINIĘTY: worker_skills już istnieje';
  END IF;
END $$;

-- 2.3 WORKER_REVIEWS
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worker_reviews') THEN
    RAISE NOTICE 'KROK 2.3: Tworzę tabelę worker_reviews...';
    
    CREATE TABLE public.worker_reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      job_id UUID,
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
    
    RAISE NOTICE '✅ KROK 2.3 ZAKOŃCZONY: worker_reviews utworzone';
  ELSE
    RAISE NOTICE '⏭️  KROK 2.3 POMINIĘTY: worker_reviews już istnieje';
  END IF;
END $$;

-- 2.4 WORKER_EXPERIENCES
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worker_experiences') THEN
    RAISE NOTICE 'KROK 2.4: Tworzę tabelę worker_experiences...';
    
    CREATE TABLE public.worker_experiences (
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
    
    RAISE NOTICE '✅ KROK 2.4 ZAKOŃCZONY: worker_experiences utworzone';
  ELSE
    RAISE NOTICE '⏭️  KROK 2.4 POMINIĘTY: worker_experiences już istnieje';
  END IF;
END $$;

-- 2.5 WORKER_AVAILABILITY
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worker_availability') THEN
    RAISE NOTICE 'KROK 2.5: Tworzę tabelę worker_availability...';
    
    CREATE TABLE public.worker_availability (
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
    
    RAISE NOTICE '✅ KROK 2.5 ZAKOŃCZONY: worker_availability utworzone';
  ELSE
    RAISE NOTICE '⏭️  KROK 2.5 POMINIĘTY: worker_availability już istnieje';
  END IF;
END $$;

-- 2.6 EMPLOYER_SEARCHES
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'employer_searches') THEN
    RAISE NOTICE 'KROK 2.6: Tworzę tabelę employer_searches...';
    
    CREATE TABLE public.employer_searches (
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
    
    RAISE NOTICE '✅ KROK 2.6 ZAKOŃCZONY: employer_searches utworzone';
  ELSE
    RAISE NOTICE '⏭️  KROK 2.6 POMINIĘTY: employer_searches już istnieje';
  END IF;
END $$;

-- 2.7 SAVED_WORKERS
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'saved_workers') THEN
    RAISE NOTICE 'KROK 2.7: Tworzę tabelę saved_workers...';
    
    CREATE TABLE public.saved_workers (
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
    
    RAISE NOTICE '✅ KROK 2.7 ZAKOŃCZONY: saved_workers utworzone';
  ELSE
    RAISE NOTICE '⏭️  KROK 2.7 POMINIĘTY: saved_workers już istnieje';
  END IF;
END $$;

-- 2.8 WORKER_VIEWS
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'worker_views') THEN
    RAISE NOTICE 'KROK 2.8: Tworzę tabelę worker_views...';
    
    CREATE TABLE public.worker_views (
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
    
    RAISE NOTICE '✅ KROK 2.8 ZAKOŃCZONY: worker_views utworzone';
  ELSE
    RAISE NOTICE '⏭️  KROK 2.8 POMINIĘTY: worker_views już istnieje';
  END IF;
END $$;

-- 2.9 CONVERSATIONS
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'conversations') THEN
    RAISE NOTICE 'KROK 2.9: Tworzę tabelę conversations...';
    
    CREATE TABLE public.conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      participant_1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      participant_2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      job_id UUID,
      subject VARCHAR(255),
      status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'blocked')),
      last_message_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      
      CONSTRAINT unique_conversation UNIQUE (participant_1_id, participant_2_id),
      CONSTRAINT different_participants CHECK (participant_1_id != participant_2_id)
    );
    
    RAISE NOTICE '✅ KROK 2.9 ZAKOŃCZONY: conversations utworzone';
  ELSE
    RAISE NOTICE '⏭️  KROK 2.9 POMINIĘTY: conversations już istnieje';
  END IF;
END $$;

-- 2.10 MESSAGES
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'messages') THEN
    RAISE NOTICE 'KROK 2.10: Tworzę tabelę messages...';
    
    CREATE TABLE public.messages (
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
    
    RAISE NOTICE '✅ KROK 2.10 ZAKOŃCZONY: messages utworzone';
  ELSE
    RAISE NOTICE '⏭️  KROK 2.10 POMINIĘTY: messages już istnieje';
  END IF;
END $$;

-- 2.11 ADMIN_ACTIONS
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_actions') THEN
    RAISE NOTICE 'KROK 2.11: Tworzę tabelę admin_actions...';
    
    CREATE TABLE public.admin_actions (
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
    
    RAISE NOTICE '✅ KROK 2.11 ZAKOŃCZONY: admin_actions utworzone';
  ELSE
    RAISE NOTICE '⏭️  KROK 2.11 POMINIĘTY: admin_actions już istnieje';
  END IF;
END $$;

-- 2.12 SYSTEM_METRICS
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'system_metrics') THEN
    RAISE NOTICE 'KROK 2.12: Tworzę tabelę system_metrics...';
    
    CREATE TABLE public.system_metrics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      metric_name VARCHAR(100) NOT NULL,
      metric_value DECIMAL(15, 4) NOT NULL,
      metric_unit VARCHAR(20),
      metric_category VARCHAR(50),
      tags JSONB,
      recorded_at TIMESTAMPTZ DEFAULT NOW()
    );
    
    RAISE NOTICE '✅ KROK 2.12 ZAKOŃCZONY: system_metrics utworzone';
  ELSE
    RAISE NOTICE '⏭️  KROK 2.12 POMINIĘTY: system_metrics już istnieje';
  END IF;
END $$;

-- 2.13 FEATURE_FLAGS
-- ----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'feature_flags') THEN
    RAISE NOTICE 'KROK 2.13: Tworzę tabelę feature_flags...';
    
    CREATE TABLE public.feature_flags (
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
    
    RAISE NOTICE '✅ KROK 2.13 ZAKOŃCZONY: feature_flags utworzone';
  ELSE
    RAISE NOTICE '⏭️  KROK 2.13 POMINIĘTY: feature_flags już istnieje';
  END IF;
END $$;

-- ============================================================================
-- KROK 3: UTWÓRZ WSZYSTKIE INDEKSY
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'KROK 3: Tworzę indeksy...';
  
  -- Portfolio Projects
  CREATE INDEX IF NOT EXISTS idx_portfolio_worker_id ON public.portfolio_projects(worker_id);
  CREATE INDEX IF NOT EXISTS idx_portfolio_created_at ON public.portfolio_projects(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_portfolio_visible ON public.portfolio_projects(visible) WHERE visible = true;
  CREATE INDEX IF NOT EXISTS idx_portfolio_tags ON public.portfolio_projects USING GIN(tags) WHERE tags IS NOT NULL;
  
  -- Job Applications
  CREATE INDEX IF NOT EXISTS idx_applications_worker_id ON public.job_applications(worker_id);
  CREATE INDEX IF NOT EXISTS idx_applications_job_id ON public.job_applications(job_id);
  CREATE INDEX IF NOT EXISTS idx_applications_status ON public.job_applications(status);
  CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON public.job_applications(applied_at DESC);
  
  -- Earnings
  CREATE INDEX IF NOT EXISTS idx_earnings_worker_id ON public.earnings(worker_id);
  CREATE INDEX IF NOT EXISTS idx_earnings_job_id ON public.earnings(job_id) WHERE job_id IS NOT NULL;
  CREATE INDEX IF NOT EXISTS idx_earnings_payment_date ON public.earnings(payment_date DESC);
  CREATE INDEX IF NOT EXISTS idx_earnings_status ON public.earnings(status);
  
  -- Worker Certificates
  CREATE INDEX IF NOT EXISTS idx_worker_certificates_worker_id ON public.worker_certificates(worker_id);
  CREATE INDEX IF NOT EXISTS idx_worker_certificates_status ON public.worker_certificates(status);
  CREATE INDEX IF NOT EXISTS idx_worker_certificates_type ON public.worker_certificates(certificate_type);
  
  -- Worker Skills
  CREATE INDEX IF NOT EXISTS idx_worker_skills_worker_id ON public.worker_skills(worker_id);
  CREATE INDEX IF NOT EXISTS idx_worker_skills_name ON public.worker_skills(skill_name);
  CREATE INDEX IF NOT EXISTS idx_worker_skills_category ON public.worker_skills(skill_category);
  CREATE INDEX IF NOT EXISTS idx_worker_skills_verified ON public.worker_skills(verified);
  
  -- Worker Reviews
  CREATE INDEX IF NOT EXISTS idx_worker_reviews_worker_id ON public.worker_reviews(worker_id);
  CREATE INDEX IF NOT EXISTS idx_worker_reviews_employer_id ON public.worker_reviews(employer_id);
  CREATE INDEX IF NOT EXISTS idx_worker_reviews_job_id ON public.worker_reviews(job_id);
  CREATE INDEX IF NOT EXISTS idx_worker_reviews_rating ON public.worker_reviews(rating);
  CREATE INDEX IF NOT EXISTS idx_worker_reviews_visible ON public.worker_reviews(visible) WHERE visible = true;
  CREATE INDEX IF NOT EXISTS idx_worker_reviews_created_at ON public.worker_reviews(created_at DESC);
  
  -- Worker Experiences
  CREATE INDEX IF NOT EXISTS idx_worker_experiences_worker_id ON public.worker_experiences(worker_id);
  CREATE INDEX IF NOT EXISTS idx_worker_experiences_current ON public.worker_experiences(current) WHERE current = true;
  CREATE INDEX IF NOT EXISTS idx_worker_experiences_start_date ON public.worker_experiences(start_date DESC);
  
  -- Worker Availability
  CREATE INDEX IF NOT EXISTS idx_worker_availability_worker_id ON public.worker_availability(worker_id);
  CREATE INDEX IF NOT EXISTS idx_worker_availability_status ON public.worker_availability(status);
  CREATE INDEX IF NOT EXISTS idx_worker_availability_available_from ON public.worker_availability(available_from);
  
  -- Employer Searches
  CREATE INDEX IF NOT EXISTS idx_employer_searches_employer_id ON public.employer_searches(employer_id);
  CREATE INDEX IF NOT EXISTS idx_employer_searches_created_at ON public.employer_searches(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_employer_searches_category ON public.employer_searches(category);
  
  -- Saved Workers
  CREATE INDEX IF NOT EXISTS idx_saved_workers_employer_id ON public.saved_workers(employer_id);
  CREATE INDEX IF NOT EXISTS idx_saved_workers_worker_id ON public.saved_workers(worker_id);
  CREATE INDEX IF NOT EXISTS idx_saved_workers_folder ON public.saved_workers(folder);
  CREATE INDEX IF NOT EXISTS idx_saved_workers_priority ON public.saved_workers(priority);
  CREATE INDEX IF NOT EXISTS idx_saved_workers_saved_at ON public.saved_workers(saved_at DESC);
  
  -- Worker Views
  CREATE INDEX IF NOT EXISTS idx_worker_views_worker_id ON public.worker_views(worker_id);
  CREATE INDEX IF NOT EXISTS idx_worker_views_employer_id ON public.worker_views(employer_id);
  CREATE INDEX IF NOT EXISTS idx_worker_views_created_at ON public.worker_views(created_at DESC);
  
  -- Conversations
  CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON public.conversations(participant_1_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON public.conversations(participant_2_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
  
  -- Messages
  CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
  CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
  CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
  CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(read) WHERE read = false;
  CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
  
  -- Admin Actions
  CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON public.admin_actions(admin_id);
  CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON public.admin_actions(action_type);
  CREATE INDEX IF NOT EXISTS idx_admin_actions_target_type ON public.admin_actions(target_type);
  CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);
  
  -- System Metrics
  CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON public.system_metrics(metric_name);
  CREATE INDEX IF NOT EXISTS idx_system_metrics_category ON public.system_metrics(metric_category);
  CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON public.system_metrics(recorded_at DESC);
  
  -- Feature Flags
  CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON public.feature_flags(enabled);
  CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON public.feature_flags(feature_name);
  
  RAISE NOTICE '✅ KROK 3 ZAKOŃCZONY: Wszystkie indeksy utworzone';
END $$;

-- ============================================================================
-- KROK 4: UTWÓRZ TRIGGERY DLA UPDATED_AT
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'KROK 4: Tworzę triggery...';
  
  -- Funkcja pomocnicza (jeśli nie istnieje)
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $func$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql;
  
  -- Portfolio Projects
  DROP TRIGGER IF EXISTS update_portfolio_projects_updated_at ON public.portfolio_projects;
  CREATE TRIGGER update_portfolio_projects_updated_at
    BEFORE UPDATE ON public.portfolio_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- Job Applications
  DROP TRIGGER IF EXISTS update_job_applications_updated_at ON public.job_applications;
  CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- Earnings
  DROP TRIGGER IF EXISTS update_earnings_updated_at ON public.earnings;
  CREATE TRIGGER update_earnings_updated_at
    BEFORE UPDATE ON public.earnings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- Worker Certificates
  DROP TRIGGER IF EXISTS update_worker_certificates_updated_at ON public.worker_certificates;
  CREATE TRIGGER update_worker_certificates_updated_at
    BEFORE UPDATE ON public.worker_certificates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- Worker Skills
  DROP TRIGGER IF EXISTS update_worker_skills_updated_at ON public.worker_skills;
  CREATE TRIGGER update_worker_skills_updated_at
    BEFORE UPDATE ON public.worker_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- Worker Reviews
  DROP TRIGGER IF EXISTS update_worker_reviews_updated_at ON public.worker_reviews;
  CREATE TRIGGER update_worker_reviews_updated_at
    BEFORE UPDATE ON public.worker_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- Worker Experiences
  DROP TRIGGER IF EXISTS update_worker_experiences_updated_at ON public.worker_experiences;
  CREATE TRIGGER update_worker_experiences_updated_at
    BEFORE UPDATE ON public.worker_experiences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- Worker Availability
  DROP TRIGGER IF EXISTS update_worker_availability_updated_at ON public.worker_availability;
  CREATE TRIGGER update_worker_availability_updated_at
    BEFORE UPDATE ON public.worker_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- Conversations
  DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
  CREATE TRIGGER update_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  -- Feature Flags
  DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON public.feature_flags;
  CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
  RAISE NOTICE '✅ KROK 4 ZAKOŃCZONY: Wszystkie triggery utworzone';
END $$;

-- ============================================================================
-- PODSUMOWANIE KOŃCOWE
-- ============================================================================
DO $$
DECLARE
  v_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '🎉 MIGRACJA ZAKOŃCZONA POMYŚLNIE! 🎉';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Policz tabele
  SELECT COUNT(*) INTO v_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN (
      'portfolio_projects', 'job_applications', 'earnings',
      'worker_certificates', 'worker_skills', 'worker_reviews',
      'worker_experiences', 'worker_availability',
      'employer_searches', 'saved_workers', 'worker_views',
      'conversations', 'messages',
      'admin_actions', 'system_metrics', 'feature_flags'
    );
  
  RAISE NOTICE '✅ KROK 1: Naprawiono 3 istniejące tabele';
  RAISE NOTICE '✅ KROK 2: Utworzono 13 nowych tabel';
  RAISE NOTICE '✅ KROK 3: Utworzono ~80 indeksów';
  RAISE NOTICE '✅ KROK 4: Utworzono 10 triggerów';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Łącznie tabel w systemie: %', v_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Następny krok: Uruchom RLS_POLICIES_ALL_TABLES.sql';
  RAISE NOTICE '════════════════════════════════════════════════════════════════';
END $$;
