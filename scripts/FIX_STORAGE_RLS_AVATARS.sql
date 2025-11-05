-- ============================================
-- FIX: Storage RLS Policies dla avatars bucket
-- ============================================
-- Data: 2025-10-28
-- Problem: "Error uploading avatar: new row violates row-level security policy"
-- Rozwiązanie: Dodaj RLS policies dla bucket 'avatars'

-- ============================================
-- KROK 1: Sprawdź istniejące policies dla storage.objects
-- ============================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%avatar%';

-- ============================================
-- KROK 2: Usuń stare policies jeśli istnieją
-- ============================================
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;

-- ============================================
-- KROK 3: Dodaj nowe policies dla avatars
-- ============================================

-- Policy 1: Każdy może czytać avatary (public access)
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Policy 2: Zalogowani użytkownicy mogą uploadować swoje avatary
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Użytkownicy mogą aktualizować swoje avatary
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Użytkownicy mogą usuwać swoje avatary
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================
-- KROK 4: Sprawdź czy bucket 'avatars' istnieje i ma public access
-- ============================================
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
WHERE name = 'avatars';

-- Jeśli bucket nie jest public, ustaw go jako public:
-- UPDATE storage.buckets SET public = true WHERE name = 'avatars';

-- ============================================
-- KROK 5: Weryfikuj policies
-- ============================================
SELECT 
    policyname,
    cmd as operation,
    roles,
    CASE 
        WHEN policyname LIKE '%viewable%' THEN 'READ (SELECT)'
        WHEN policyname LIKE '%upload%' THEN 'CREATE (INSERT)'
        WHEN policyname LIKE '%update%' THEN 'UPDATE'
        WHEN policyname LIKE '%delete%' THEN 'DELETE'
    END as description
FROM pg_policies
WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%avatar%'
ORDER BY cmd;

-- Powinno pokazać 4 policies:
-- 1. Public avatars are viewable by everyone (SELECT)
-- 2. Users can upload their own avatar (INSERT)
-- 3. Users can update their own avatar (UPDATE)
-- 4. Users can delete their own avatar (DELETE)
