-- ============================================
-- MIGRATION: Create feed-media storage bucket
-- Date: 2025-10-28
-- Author: AI Copilot
-- ============================================

-- ROLLBACK PLAN:
-- DROP POLICY IF EXISTS "Authenticated users can upload feed media" ON storage.objects;
-- DROP POLICY IF EXISTS "Public read access for feed media" ON storage.objects;
-- DELETE FROM storage.buckets WHERE id = 'feed-media';

-- STEP 1: Create feed-media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'feed-media',
  'feed-media',
  true, -- Public bucket so media can be displayed without auth
  20971520, -- 20MB limit
  ARRAY[
    'image/jpeg',
    'image/png', 
    'image/webp',
    'image/jpg',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/avi',
    'video/mov'
  ]
) ON CONFLICT (id) DO NOTHING;

-- STEP 2: Create RLS policies for feed-media bucket

-- Allow authenticated users to upload files to their own folder
CREATE POLICY "Authenticated users can upload feed media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'feed-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own files
CREATE POLICY "Users can update their own feed media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'feed-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Users can delete their own feed media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'feed-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access (anyone can view feed media)
CREATE POLICY "Public read access for feed media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'feed-media');

-- STEP 3: Verify bucket creation
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'feed-media';