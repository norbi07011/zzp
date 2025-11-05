-- ============================================
-- FIX_FEED_MEDIA_COMPLETE.sql
-- Naprawia problemy z uploadem mediów do feed
-- Data: 2025-10-28
-- ============================================

-- PROBLEM:
-- Storage RLS używa auth.uid() ale folder używa author_id (employer/accountant ID)
-- Brak relacji posts → profiles
-- Storage policy zbyt restrykcyjna

-- ROZWIĄZANIE:
-- 1. Dodaj profile_id do posts
-- 2. Napraw RLS policies dla storage
-- 3. Umożliw upload dla wszystkich authenticated users

-- ============================================
-- CZĘŚĆ 1: DODAJ profile_id DO TABELI posts
-- ============================================

-- Dodaj kolumnę profile_id (nullable na początek)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id);

-- Wypełnij profile_id dla istniejących postów od employers
UPDATE posts p
SET profile_id = e.profile_id
FROM employers e
WHERE p.author_type = 'employer' 
  AND p.author_id = e.id
  AND p.profile_id IS NULL;

-- Wypełnij profile_id dla istniejących postów od accountants
UPDATE posts p
SET profile_id = a.profile_id
FROM accountants a
WHERE p.author_type = 'accountant' 
  AND p.author_id = a.id
  AND p.profile_id IS NULL;

-- Sprawdź czy wszystkie posty mają profile_id
DO $$
DECLARE
  posts_without_profile INTEGER;
BEGIN
  SELECT COUNT(*) INTO posts_without_profile
  FROM posts
  WHERE profile_id IS NULL;
  
  IF posts_without_profile > 0 THEN
    RAISE EXCEPTION 'Znaleziono % postów bez profile_id! Sprawdź dane przed kontynuacją.', posts_without_profile;
  ELSE
    RAISE NOTICE '✅ Wszystkie posty mają wypełnione profile_id';
  END IF;
END $$;

-- Dodaj NOT NULL constraint
ALTER TABLE posts 
ALTER COLUMN profile_id SET NOT NULL;

-- Dodaj indeks dla wydajności
CREATE INDEX IF NOT EXISTS idx_posts_profile_id ON posts(profile_id);

-- Potwierdzenie zakończenia części 1
DO $$
BEGIN
  RAISE NOTICE '✅ Kolumna profile_id dodana do tabeli posts';
END $$;

-- ============================================
-- CZĘŚĆ 2: NAPRAW RLS POLICIES DLA STORAGE
-- ============================================

-- Usuń stare polityki
DROP POLICY IF EXISTS "Authenticated users can upload feed media" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own feed media" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own feed media" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for feed media" ON storage.objects;

-- NOWA POLITYKA INSERT - pozwala wszystkim authenticated uploadować
-- (sprawdzanie uprawnień jest w aplikacji, nie w RLS)
CREATE POLICY "Authenticated users can upload feed media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'feed-media' AND
  auth.role() = 'authenticated'
);

-- POLITYKA UPDATE - użytkownicy mogą aktualizować swoje pliki
-- Folder musi być nazwany ich profile_id (auth.uid())
CREATE POLICY "Users can update their own feed media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'feed-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- POLITYKA DELETE - użytkownicy mogą usuwać swoje pliki
CREATE POLICY "Users can delete their own feed media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'feed-media' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- POLITYKA SELECT - publiczny dostęp do odczytu (feed jest publiczny)
CREATE POLICY "Public read access for feed media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'feed-media');

-- Potwierdzenie zakończenia części 2
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies dla storage naprawione';
END $$;

-- ============================================
-- CZĘŚĆ 3: WERYFIKACJA
-- ============================================

-- Sprawdź strukturę tabeli posts
DO $$
BEGIN
  RAISE NOTICE '📋 Struktura tabeli posts:';
END $$;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'posts'
  AND column_name IN ('id', 'author_id', 'author_type', 'profile_id', 'media_urls', 'media_types')
ORDER BY ordinal_position;

-- Sprawdź polityki storage
DO $$
BEGIN
  RAISE NOTICE '📋 Polityki RLS dla feed-media:';
END $$;

SELECT 
  policyname,
  cmd,
  roles::text,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects' 
  AND policyname LIKE '%feed%'
ORDER BY policyname;

-- Sprawdź bucket
DO $$
BEGIN
  RAISE NOTICE '📋 Konfiguracja bucketu feed-media:';
END $$;

SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'feed-media';

-- Sprawdź przykładowe posty
DO $$
BEGIN
  RAISE NOTICE '📋 Przykładowe posty z profile_id:';
END $$;

SELECT 
  id,
  author_type,
  author_id,
  profile_id,
  array_length(media_urls, 1) as media_count,
  created_at
FROM posts
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- KONIEC MIGRACJI
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '===========================================';
  RAISE NOTICE '✅ MIGRACJA ZAKOŃCZONA POMYŚLNIE!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'NASTĘPNE KROKI:';
  RAISE NOTICE '1. Zastosuj zmiany w storage.ts (użyj profileId)';
  RAISE NOTICE '2. Zastosuj zmiany w feedService.ts (dodaj profile_id)';
  RAISE NOTICE '3. Zrestartuj aplikację';
  RAISE NOTICE '4. Testuj upload mediów';
  RAISE NOTICE '';
  RAISE NOTICE '===========================================';
END $$;
