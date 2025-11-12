-- Migration: Add admin access to all storage buckets
-- Created: 2025-11-12 22:30
-- Updated: 2025-11-12 22:45 - Added SELECT policies (admin was blocked from viewing files!)
-- Updated: 2025-11-12 22:50 - CRITICAL: Added buckets table SELECT policy (admin couldn't list buckets!)
-- Purpose: Allow admin role to manage (SELECT/DELETE/UPDATE) files in ALL buckets
--
-- PROBLEM: Admin nie ma exception w RLS policies → może mieć problem z delete/update plików innych users
-- CRITICAL: Admin nie widział plików bo brak SELECT policy!
-- CRITICAL: Admin nie widział BUCKETS bo brak policy dla storage.buckets!
-- SOLUTION: Dodaj admin policies dla każdego bucket (avatars, certificates, company-logos, feed-media, portfolio-images, project-files)

-- =====================================================
-- BUCKETS LIST ACCESS - MOST CRITICAL!
-- =====================================================

-- Without this, .listBuckets() returns [] and UI shows "No files found"
CREATE POLICY "Anyone can view buckets list"
ON storage.buckets FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- ADMIN SELECT ACCESS (wszystkie buckety) - CRITICAL!
-- =====================================================

CREATE POLICY "Admin can view any avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can view any certificates"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'certificates' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can view any company-logos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can view any feed-media"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'feed-media' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can view any portfolio-images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'portfolio-images' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can view any project-files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-files' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- ADMIN DELETE ACCESS (wszystkie buckety)
-- =====================================================

CREATE POLICY "Admin can delete any avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can delete any certificates"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'certificates' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can delete any company-logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can delete any feed-media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'feed-media' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can delete any portfolio-images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can delete any project-files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- ADMIN UPDATE ACCESS (wszystkie buckety)
-- =====================================================

CREATE POLICY "Admin can update any avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can update any certificates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'certificates' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can update any company-logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'company-logos' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can update any feed-media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'feed-media' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can update any portfolio-images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Admin can update any project-files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-files' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if policies were created:
-- SELECT policyname, cmd FROM pg_policies 
-- WHERE schemaname = 'storage' AND tablename = 'objects' 
-- AND policyname LIKE 'Admin can%'
-- ORDER BY policyname;

-- Test admin delete (as admin user):
-- DELETE FROM storage.objects WHERE bucket_id = 'avatars' AND name = 'test.jpg';

-- =====================================================
-- ROLLBACK PLAN
-- =====================================================

-- DROP POLICY IF EXISTS "Anyone can view buckets list" ON storage.buckets;
-- DROP POLICY IF EXISTS "Admin can view any avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can view any certificates" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can view any company-logos" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can view any feed-media" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can view any portfolio-images" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can view any project-files" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can delete any avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can delete any certificates" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can delete any company-logos" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can delete any feed-media" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can delete any portfolio-images" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can delete any project-files" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can update any avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can update any certificates" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can update any company-logos" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can update any feed-media" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can update any portfolio-images" ON storage.objects;
-- DROP POLICY IF EXISTS "Admin can update any project-files" ON storage.objects;
