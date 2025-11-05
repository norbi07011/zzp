-- =====================================================
-- ACCOUNTANT SYSTEM - DATABASE MIGRATION
-- =====================================================
-- Creates tables for accountant (księgowy) system
-- Execute in Supabase SQL Editor
-- Date: 2025-10-28

-- =====================================================
-- 1. ACCOUNTANTS TABLE (Księgowi)
-- =====================================================

CREATE TABLE accountants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Dane podstawowe
  full_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  
  -- Licencje i certyfikaty
  kvk_number VARCHAR(50),
  btw_number VARCHAR(50),
  license_number VARCHAR(100),
  
  -- Lokalizacja
  city VARCHAR(100),
  address VARCHAR(255),
  postal_code VARCHAR(20),
  country VARCHAR(50) DEFAULT 'Nederland',
  
  -- Profil publiczny
  bio TEXT,
  specializations TEXT[], -- ['BTW', 'Salarisadministratie', 'Jaarrekening']
  languages TEXT[] DEFAULT ARRAY['Nederlands'], -- ['Nederlands', 'English', 'Polski']
  website VARCHAR(255),
  
  -- Zdjęcia
  avatar_url TEXT,
  cover_image_url TEXT,
  portfolio_images TEXT[], -- Galeria zdjęć biura/certyfikatów
  
  -- Statystyki
  rating NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  total_clients INTEGER DEFAULT 0,
  years_experience INTEGER DEFAULT 0,
  
  -- Status
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_accountants_profile ON accountants(profile_id);
CREATE INDEX idx_accountants_city ON accountants(city);
CREATE INDEX idx_accountants_specializations ON accountants USING GIN(specializations);
CREATE INDEX idx_accountants_active ON accountants(is_active);
CREATE INDEX idx_accountants_email ON accountants(email);

-- Trigger: Auto-update updated_at
CREATE OR REPLACE FUNCTION update_accountants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accountants_updated_at_trigger
BEFORE UPDATE ON accountants
FOR EACH ROW
EXECUTE FUNCTION update_accountants_updated_at();

-- =====================================================
-- 2. ACCOUNTANT_SERVICES TABLE (Usługi księgowe)
-- =====================================================

CREATE TABLE accountant_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  
  -- Typ usługi
  service_type VARCHAR(100) NOT NULL, -- 'btw-aangifte', 'jaarrekening', 'salarisadministratie', etc.
  
  -- Opis
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Cennik
  price_type VARCHAR(50) DEFAULT 'fixed', -- 'fixed', 'hourly', 'monthly', 'custom'
  price_amount DECIMAL(10,2),
  price_currency VARCHAR(10) DEFAULT 'EUR',
  
  -- Dodatkowe info
  delivery_time VARCHAR(100), -- np. '24 uur', '3-5 dagen'
  includes TEXT[], -- Co zawiera usługa
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0, -- Kolejność wyświetlania
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_services_accountant ON accountant_services(accountant_id);
CREATE INDEX idx_services_type ON accountant_services(service_type);
CREATE INDEX idx_services_active ON accountant_services(is_active);

-- =====================================================
-- 3. ACCOUNTANT_FORMS TABLE (Formularze zgłoszeniowe)
-- =====================================================

CREATE TABLE accountant_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  
  -- Typ formularza
  form_type VARCHAR(100) NOT NULL, -- 'btw-aangifte', 'jaarrekening', 'salarisadministratie'
  form_name VARCHAR(255) NOT NULL,
  
  -- Konfiguracja formularza (JSON schema)
  form_fields JSONB NOT NULL,
  /*
  Przykład form_fields:
  [
    {
      "name": "btw_number",
      "label": "BTW-nummer",
      "type": "text",
      "required": true,
      "placeholder": "bijv. NL123456789B01"
    },
    {
      "name": "belastingjaar",
      "label": "Belastingjaar",
      "type": "number",
      "required": true
    }
  ]
  */
  
  -- Ustawienia
  is_active BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_forms_accountant ON accountant_forms(accountant_id);
CREATE INDEX idx_forms_type ON accountant_forms(form_type);
CREATE INDEX idx_forms_active ON accountant_forms(is_active);

-- =====================================================
-- 4. FORM_SUBMISSIONS TABLE (Zgłoszenia klientów)
-- =====================================================

CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES accountant_forms(id) ON DELETE CASCADE,
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  
  -- Kto wysłał
  submitter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  submitter_type VARCHAR(20) NOT NULL, -- 'worker' lub 'employer'
  submitter_name VARCHAR(255),
  submitter_email VARCHAR(255),
  submitter_phone VARCHAR(50),
  
  -- Dane z formularza
  form_data JSONB NOT NULL,
  
  -- Załączniki
  attachments TEXT[], -- URLe do plików w storage
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'rejected'
  
  -- Odpowiedź księgowego
  accountant_response TEXT,
  accountant_files TEXT[], -- Pliki zwrotne od księgowego
  
  -- Timestamps
  submitted_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Indexes
CREATE INDEX idx_submissions_form ON form_submissions(form_id);
CREATE INDEX idx_submissions_accountant ON form_submissions(accountant_id);
CREATE INDEX idx_submissions_submitter ON form_submissions(submitter_id);
CREATE INDEX idx_submissions_status ON form_submissions(status);
CREATE INDEX idx_submissions_submitted_at ON form_submissions(submitted_at);

-- =====================================================
-- 5. ACCOUNTANT_REVIEWS TABLE (Opinie o księgowych)
-- =====================================================

CREATE TABLE accountant_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accountant_id UUID NOT NULL REFERENCES accountants(id) ON DELETE CASCADE,
  
  -- Kto wystawił
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_type VARCHAR(20) NOT NULL, -- 'worker' lub 'employer'
  reviewer_name VARCHAR(255),
  
  -- Ocena
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  
  -- Szczegółowe oceny (opcjonalne)
  professionalism_rating INTEGER CHECK (professionalism_rating >= 1 AND professionalism_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeliness_rating INTEGER CHECK (timeliness_rating >= 1 AND timeliness_rating <= 5),
  
  -- Komentarz
  comment TEXT,
  would_recommend BOOLEAN DEFAULT true,
  
  -- Status
  status VARCHAR(50) DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_review UNIQUE (accountant_id, reviewer_id)
);

-- Indexes
CREATE INDEX idx_accountant_reviews_accountant ON accountant_reviews(accountant_id);
CREATE INDEX idx_accountant_reviews_reviewer ON accountant_reviews(reviewer_id);
CREATE INDEX idx_accountant_reviews_status ON accountant_reviews(status);
CREATE INDEX idx_accountant_reviews_rating ON accountant_reviews(rating);

-- Trigger: Auto-update accountant rating
CREATE OR REPLACE FUNCTION update_accountant_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE accountants
  SET 
    rating = (
      SELECT AVG(rating)::NUMERIC(3,2)
      FROM accountant_reviews
      WHERE accountant_id = NEW.accountant_id
      AND status = 'approved'
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM accountant_reviews
      WHERE accountant_id = NEW.accountant_id
      AND status = 'approved'
    )
  WHERE id = NEW.accountant_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accountant_reviews_update_rating
AFTER INSERT OR UPDATE ON accountant_reviews
FOR EACH ROW
WHEN (NEW.status = 'approved')
EXECUTE FUNCTION update_accountant_rating();

-- =====================================================
-- 6. EXTEND POSTS TABLE (Feed dla księgowych)
-- =====================================================

-- Sprawdź czy tabela posts istnieje
DO $$ 
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'posts'
  ) THEN
    -- Dodaj kolumnę accountant_id jeśli nie istnieje
    ALTER TABLE posts 
      ADD COLUMN IF NOT EXISTS accountant_id UUID REFERENCES accountants(id) ON DELETE CASCADE;

    -- Index
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'posts' 
      AND indexname = 'idx_posts_accountant'
    ) THEN
      CREATE INDEX idx_posts_accountant ON posts(accountant_id);
    END IF;

    -- Drop old constraint if exists
    ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_one_author;

    -- Add new constraint: post musi mieć JEDNO źródło (employer LUB accountant)
    ALTER TABLE posts
      ADD CONSTRAINT posts_one_author CHECK (
        (employer_id IS NOT NULL AND accountant_id IS NULL) OR
        (employer_id IS NULL AND accountant_id IS NOT NULL)
      );
    
    RAISE NOTICE 'Posts table extended with accountant_id column';
  ELSE
    RAISE NOTICE 'Posts table does not exist, skipping';
  END IF;
END $$;

-- =====================================================
-- 7. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE accountants ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountant_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountant_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accountant_reviews ENABLE ROW LEVEL SECURITY;

-- ACCOUNTANTS: Everyone can view active accountants
CREATE POLICY "Everyone can view active accountants"
  ON accountants FOR SELECT
  USING (is_active = true);

-- ACCOUNTANTS: Accountant can view own profile (even if inactive)
CREATE POLICY "Accountants can view own profile"
  ON accountants FOR SELECT
  USING (
    profile_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  );

-- ACCOUNTANTS: Authenticated users can create own accountant profile
CREATE POLICY "Authenticated users can create own accountant profile"
  ON accountants FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- ACCOUNTANTS: Accountant can update own profile
CREATE POLICY "Accountants can update own profile"
  ON accountants FOR UPDATE
  USING (
    profile_id IN (SELECT id FROM profiles WHERE id = auth.uid())
  );

-- SERVICES: Everyone can view active services
CREATE POLICY "Everyone can view active services"
  ON accountant_services FOR SELECT
  USING (is_active = true);

-- SERVICES: Accountant can manage own services
CREATE POLICY "Accountants can manage own services"
  ON accountant_services FOR ALL
  USING (
    accountant_id IN (SELECT id FROM accountants WHERE profile_id = auth.uid())
  );

-- FORMS: Everyone can view active forms
CREATE POLICY "Everyone can view active forms"
  ON accountant_forms FOR SELECT
  USING (is_active = true);

-- FORMS: Accountant can manage own forms
CREATE POLICY "Accountants can manage own forms"
  ON accountant_forms FOR ALL
  USING (
    accountant_id IN (SELECT id FROM accountants WHERE profile_id = auth.uid())
  );

-- SUBMISSIONS: Users can create submissions
CREATE POLICY "Authenticated users can create submissions"
  ON form_submissions FOR INSERT
  TO authenticated
  WITH CHECK (submitter_id = auth.uid());

-- SUBMISSIONS: Accountant can view own submissions
CREATE POLICY "Accountants can view own submissions"
  ON form_submissions FOR SELECT
  USING (
    accountant_id IN (SELECT id FROM accountants WHERE profile_id = auth.uid())
  );

-- SUBMISSIONS: Submitter can view own submissions
CREATE POLICY "Users can view own submissions"
  ON form_submissions FOR SELECT
  USING (submitter_id = auth.uid());

-- SUBMISSIONS: Accountant can update own submissions
CREATE POLICY "Accountants can update own submissions"
  ON form_submissions FOR UPDATE
  USING (
    accountant_id IN (SELECT id FROM accountants WHERE profile_id = auth.uid())
  );

-- REVIEWS: Everyone can view approved reviews
CREATE POLICY "Everyone can view approved reviews"
  ON accountant_reviews FOR SELECT
  USING (status = 'approved');

-- REVIEWS: Users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON accountant_reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

-- REVIEWS: Reviewer can update own review
CREATE POLICY "Users can update own review"
  ON accountant_reviews FOR UPDATE
  USING (reviewer_id = auth.uid());

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('accountants', 'accountant_services', 'accountant_forms', 'form_submissions', 'accountant_reviews')
ORDER BY table_name;

-- Check posts table has accountant_id column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts' 
AND column_name = 'accountant_id';

-- Check RLS policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('accountants', 'accountant_services', 'accountant_forms', 'form_submissions', 'accountant_reviews')
ORDER BY tablename, policyname;
