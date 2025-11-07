-- =====================================================
-- TABELA DLA FIRM SPRZĄTAJĄCYCH PO BUDOWACH
-- =====================================================
-- Firmy prowadzone głównie przez kobiety
-- Praca dorywcza: zwykle 2 dni w tygodniu
-- Mogą zaznaczyć swoją dostępność w kalendarzu

CREATE TABLE IF NOT EXISTS cleaning_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Powiązanie z profiles
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- PODSTAWOWE DANE FIRMY
  company_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  kvk_number TEXT, -- numer KVK (opcjonalny)
  
  -- LOKALIZACJA
  location_city TEXT,
  location_province TEXT,
  service_radius_km INTEGER DEFAULT 20, -- promień działania (domyślnie 20km)
  
  -- SPECJALIZACJA
  specialization TEXT[] DEFAULT ARRAY['cleaning_after_construction']::TEXT[],
  -- Możliwe wartości:
  -- 'cleaning_after_construction' (sprzątanie po budowach)
  -- 'deep_cleaning' (gruntowne sprzątanie)
  -- 'office_cleaning' (sprzątanie biur)
  -- 'window_cleaning' (mycie okien)
  -- 'maintenance_cleaning' (utrzymanie czystości)
  
  -- DODATKOWE USŁUGI
  additional_services TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- np: 'own_equipment' (własny sprzęt), 'eco_products' (eko produkty), 
  --     'same_day_service' (tego samego dnia), 'weekend_available' (weekendy)
  
  -- DOSTĘPNOŚĆ - KALENDARZ TYGODNIOWY
  -- Format: { "monday": true, "tuesday": false, "wednesday": true, ... }
  availability JSONB DEFAULT '{
    "monday": false,
    "tuesday": false,
    "wednesday": false,
    "thursday": false,
    "friday": false,
    "saturday": false,
    "sunday": false
  }'::jsonb,
  
  -- PREFEROWANA LICZBA DNI PRACY W TYGODNIU
  preferred_days_per_week INTEGER DEFAULT 2,
  
  -- STAWKA
  hourly_rate_min DECIMAL(10,2),
  hourly_rate_max DECIMAL(10,2),
  rate_negotiable BOOLEAN DEFAULT true,
  
  -- DOŚWIADCZENIE
  years_experience INTEGER DEFAULT 0,
  team_size INTEGER DEFAULT 1, -- ile osób w ekipie
  
  -- OPIS
  bio TEXT, -- o firmie / właścicielce
  
  -- PORTFOLIO / ZDJĘCIA
  portfolio_images TEXT[] DEFAULT ARRAY[]::TEXT[], -- URLe do zdjęć prac
  
  -- OCENY I OPINIE
  average_rating DECIMAL(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  
  -- SUBSKRYPCJA
  subscription_tier TEXT DEFAULT 'basic', -- 'basic' | 'pro' | 'premium'
  subscription_status TEXT DEFAULT 'active', -- 'active' | 'inactive' | 'suspended'
  
  -- WIDOCZNOŚĆ
  profile_visibility TEXT DEFAULT 'public', -- 'public' | 'private' | 'draft'
  accepting_new_clients BOOLEAN DEFAULT true,
  
  -- TIMESTAMPS
  last_active TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_cleaning_companies_user_id ON cleaning_companies(user_id);
CREATE INDEX idx_cleaning_companies_profile_id ON cleaning_companies(profile_id);
CREATE INDEX idx_cleaning_companies_location_city ON cleaning_companies(location_city);
CREATE INDEX idx_cleaning_companies_specialization ON cleaning_companies USING GIN(specialization);
CREATE INDEX idx_cleaning_companies_availability ON cleaning_companies USING GIN(availability);
CREATE INDEX idx_cleaning_companies_last_active ON cleaning_companies(last_active DESC);
CREATE INDEX idx_cleaning_companies_visibility ON cleaning_companies(profile_visibility);

-- =====================================================
-- TRIGGER - AUTO UPDATE last_active
-- =====================================================

CREATE OR REPLACE FUNCTION update_cleaning_companies_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleaning_companies_last_active_trigger
  BEFORE UPDATE ON cleaning_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_cleaning_companies_last_active();

-- =====================================================
-- TRIGGER - AUTO UPDATE updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_cleaning_companies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleaning_companies_updated_at_trigger
  BEFORE UPDATE ON cleaning_companies
  FOR EACH ROW
  EXECUTE FUNCTION update_cleaning_companies_updated_at();

-- =====================================================
-- RLS (ROW LEVEL SECURITY) - TYMCZASOWO WYŁĄCZONE
-- =====================================================
-- Możesz włączyć później jak naprawisz RLS w całym systemie

-- ALTER TABLE cleaning_companies ENABLE ROW LEVEL SECURITY;

-- -- Wszyscy mogą czytać publiczne profile
-- CREATE POLICY "cleaning_companies_select_public" 
--   ON cleaning_companies FOR SELECT 
--   USING (profile_visibility = 'public');

-- -- Tylko właściciel może edytować swój profil
-- CREATE POLICY "cleaning_companies_update_own" 
--   ON cleaning_companies FOR UPDATE 
--   USING (auth.uid() = user_id);

-- -- Tylko właściciel może usunąć swój profil
-- CREATE POLICY "cleaning_companies_delete_own" 
--   ON cleaning_companies FOR DELETE 
--   USING (auth.uid() = user_id);

-- =====================================================
-- EXAMPLE QUERIES
-- =====================================================

-- 1. Znajdź firmy dostępne w poniedziałek i środę:
/*
SELECT * FROM cleaning_companies
WHERE profile_visibility = 'public'
  AND (availability->>'monday')::boolean = true
  AND (availability->>'wednesday')::boolean = true
ORDER BY last_active DESC;
*/

-- 2. Znajdź firmy w promieniu 20km od Amsterdamu:
/*
SELECT * FROM cleaning_companies
WHERE profile_visibility = 'public'
  AND location_city = 'Amsterdam'
  AND service_radius_km >= 20
ORDER BY average_rating DESC;
*/

-- 3. Znajdź firmy specjalizujące się w sprzątaniu po budowach:
/*
SELECT * FROM cleaning_companies
WHERE profile_visibility = 'public'
  AND 'cleaning_after_construction' = ANY(specialization)
ORDER BY years_experience DESC;
*/

-- 4. Znajdź firmy z dostępnością min 2 dni w tygodniu:
/*
SELECT *, 
  (
    (CASE WHEN (availability->>'monday')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (availability->>'tuesday')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (availability->>'wednesday')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (availability->>'thursday')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (availability->>'friday')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (availability->>'saturday')::boolean THEN 1 ELSE 0 END) +
    (CASE WHEN (availability->>'sunday')::boolean THEN 1 ELSE 0 END)
  ) as available_days_count
FROM cleaning_companies
WHERE profile_visibility = 'public'
HAVING available_days_count >= 2
ORDER BY available_days_count DESC;
*/

-- =====================================================
-- SAMPLE DATA (opcjonalne - do testów)
-- =====================================================

/*
INSERT INTO cleaning_companies (
  user_id,
  profile_id,
  company_name,
  owner_name,
  phone,
  location_city,
  specialization,
  availability,
  preferred_days_per_week,
  hourly_rate_min,
  hourly_rate_max,
  years_experience,
  team_size,
  bio
) VALUES (
  'user-uuid-here', -- zastąp prawdziwym UUID
  'profile-uuid-here',
  'Clean & Shine BV',
  'Anna Kowalska',
  '+31612345678',
  'Amsterdam',
  ARRAY['cleaning_after_construction', 'deep_cleaning'],
  '{
    "monday": true,
    "tuesday": false,
    "wednesday": true,
    "thursday": false,
    "friday": false,
    "saturday": false,
    "sunday": false
  }'::jsonb,
  2,
  25.00,
  35.00,
  5,
  2,
  'Profesjonalne sprzątanie po budowach. Posiadamy własny sprzęt. Pracujemy szybko i dokładnie.'
);
*/
