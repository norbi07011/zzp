-- ============================================
-- MIGRATION: Extended Employer Information
-- Date: 2025-10-29
-- Author: AI Copilot
-- Description: Adds Dutch company verification fields, Google integration, and location data
-- ============================================

-- ROLLBACK PLAN:
-- ALTER TABLE employers DROP COLUMN company_type;
-- ALTER TABLE employers DROP COLUMN btw_number;
-- ALTER TABLE employers DROP COLUMN rsin_number;
-- ALTER TABLE employers DROP COLUMN google_place_id;
-- ALTER TABLE employers DROP COLUMN google_rating;
-- ALTER TABLE employers DROP COLUMN google_review_count;
-- ALTER TABLE employers DROP COLUMN google_maps_url;
-- ALTER TABLE employers DROP COLUMN latitude;
-- ALTER TABLE employers DROP COLUMN longitude;

-- STEP 1: Analyze current employers table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'employers'
ORDER BY ordinal_position;

-- STEP 2: Add new columns for Dutch company verification and Google integration
BEGIN;

-- Company type verification (B.V., Uitzendbureau, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employers' 
    AND column_name = 'company_type'
  ) THEN
    ALTER TABLE public.employers ADD COLUMN company_type TEXT;
    COMMENT ON COLUMN public.employers.company_type IS 'Type: B.V., Uitzendbureau, ZZP, Eenmanszaak';
  END IF;
END $$;

-- BTW/VAT number (separate from KVK)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employers' 
    AND column_name = 'btw_number'
  ) THEN
    ALTER TABLE public.employers ADD COLUMN btw_number TEXT;
    COMMENT ON COLUMN public.employers.btw_number IS 'BTW/VAT number - NL123456789B01';
  END IF;
END $$;

-- RSIN number (Rechtspersonen Samenwerkingsverbanden Informatie Nummer)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employers' 
    AND column_name = 'rsin_number'
  ) THEN
    ALTER TABLE public.employers ADD COLUMN rsin_number TEXT;
    COMMENT ON COLUMN public.employers.rsin_number IS 'RSIN - 9 digit unique identifier for legal entities';
  END IF;
END $$;

-- Google Place ID for Maps integration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employers' 
    AND column_name = 'google_place_id'
  ) THEN
    ALTER TABLE public.employers ADD COLUMN google_place_id TEXT;
    COMMENT ON COLUMN public.employers.google_place_id IS 'Google Place ID for Maps and Reviews';
  END IF;
END $$;

-- Google rating (average)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employers' 
    AND column_name = 'google_rating'
  ) THEN
    ALTER TABLE public.employers ADD COLUMN google_rating DECIMAL(2,1) CHECK (google_rating >= 0 AND google_rating <= 5);
    COMMENT ON COLUMN public.employers.google_rating IS 'Google Reviews average rating (0-5)';
  END IF;
END $$;

-- Google review count
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employers' 
    AND column_name = 'google_review_count'
  ) THEN
    ALTER TABLE public.employers ADD COLUMN google_review_count INTEGER DEFAULT 0;
    COMMENT ON COLUMN public.employers.google_review_count IS 'Total number of Google Reviews';
  END IF;
END $$;

-- Google Maps URL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employers' 
    AND column_name = 'google_maps_url'
  ) THEN
    ALTER TABLE public.employers ADD COLUMN google_maps_url TEXT;
    COMMENT ON COLUMN public.employers.google_maps_url IS 'Direct link to Google Maps listing';
  END IF;
END $$;

-- Latitude for map display
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employers' 
    AND column_name = 'latitude'
  ) THEN
    ALTER TABLE public.employers ADD COLUMN latitude DECIMAL(10,8);
    COMMENT ON COLUMN public.employers.latitude IS 'GPS latitude coordinate';
  END IF;
END $$;

-- Longitude for map display
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'employers' 
    AND column_name = 'longitude'
  ) THEN
    ALTER TABLE public.employers ADD COLUMN longitude DECIMAL(11,8);
    COMMENT ON COLUMN public.employers.longitude IS 'GPS longitude coordinate';
  END IF;
END $$;

COMMIT;

-- STEP 3: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_employers_company_type ON public.employers(company_type);
CREATE INDEX IF NOT EXISTS idx_employers_btw_number ON public.employers(btw_number);
CREATE INDEX IF NOT EXISTS idx_employers_google_place_id ON public.employers(google_place_id);
CREATE INDEX IF NOT EXISTS idx_employers_location ON public.employers(latitude, longitude);

-- STEP 4: Verify changes
SELECT 
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'employers'
  AND column_name IN (
    'company_type', 'btw_number', 'rsin_number', 
    'google_place_id', 'google_rating', 'google_review_count', 
    'google_maps_url', 'latitude', 'longitude'
  )
ORDER BY ordinal_position;

-- STEP 5: Sample data check
SELECT 
  company_name,
  company_type,
  kvk_number,
  btw_number,
  city,
  latitude,
  longitude,
  google_rating,
  google_review_count
FROM public.employers
LIMIT 5;

-- ============================================
-- NOTES:
-- 1. All new columns are nullable to preserve existing data
-- 2. Company types: 'B.V.', 'Uitzendbureau', 'ZZP', 'Eenmanszaak', 'V.O.F.', 'N.V.'
-- 3. BTW format: NL123456789B01 (NL + 9 digits + B + 2 digits)
-- 4. Google Place ID can be used with Google Maps API
-- 5. Coordinates allow for map embedding without API calls
-- ============================================
