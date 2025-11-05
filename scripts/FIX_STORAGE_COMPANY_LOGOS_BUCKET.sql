-- =====================================================
-- CREATE STORAGE BUCKET FOR COMPANY LOGOS
-- =====================================================
-- Creates bucket and RLS policies for employer company logos
-- Execute in Supabase SQL Editor
-- Date: 2025-10-28

-- Create company-logos bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- RLS POLICIES FOR company-logos BUCKET
-- =====================================================

-- Policy 1: Allow authenticated users to upload logos to their own folder
CREATE POLICY "Users can upload company logos to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'company-logos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Allow public read access to all company logos
CREATE POLICY "Public read access to company logos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- Policy 3: Allow authenticated users to update their own logos
CREATE POLICY "Users can update own company logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'company-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow authenticated users to delete their own logos
CREATE POLICY "Users can delete own company logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- VERIFY BUCKET CONFIGURATION
-- =====================================================

-- Check if bucket exists
SELECT * FROM storage.buckets WHERE id = 'company-logos';

-- Check all policies for company-logos bucket
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects' 
AND policyname ILIKE '%company%logo%';
