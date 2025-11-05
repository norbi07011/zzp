-- =====================================================
-- CREATE SUPABASE STORAGE BUCKET FOR COMPANY LOGOS
-- =====================================================
-- Execute this in Supabase SQL Editor to create storage bucket

-- Create bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for company-logos bucket
-- 1. Anyone can view logos (public read)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'company-logos');

-- 2. Authenticated employers can upload logos
CREATE POLICY "Employers can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
);

-- 3. Employers can update their own logos
CREATE POLICY "Employers can update their own logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
);

-- 4. Employers can delete their own logos
CREATE POLICY "Employers can delete their own logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'company-logos'
  AND auth.role() = 'authenticated'
);

-- Check bucket created
SELECT id, name, public FROM storage.buckets WHERE id = 'company-logos';
