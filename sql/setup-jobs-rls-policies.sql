-- ============================================
-- ENABLE RLS AND ADD POLICIES FOR JOBS
-- ============================================
-- Aby JobBrowser mógł czytać jobs z anon key (public access)

-- 1. Enable RLS on jobs table (jeśli jeszcze nie włączone)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Wszyscy mogą czytać aktywne jobs (public read)
CREATE POLICY "Anyone can view active jobs"
ON jobs
FOR SELECT
USING (status = 'active');

-- 3. Policy: Tylko employer może tworzyć jobs dla siebie
CREATE POLICY "Employers can create their own jobs"
ON jobs
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT profile_id FROM employers WHERE id = employer_id
  )
);

-- 4. Policy: Tylko employer może edytować swoje jobs
CREATE POLICY "Employers can update their own jobs"
ON jobs
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT profile_id FROM employers WHERE id = employer_id
  )
);

-- 5. Policy: Tylko employer może usuwać swoje jobs
CREATE POLICY "Employers can delete their own jobs"
ON jobs
FOR DELETE
USING (
  auth.uid() IN (
    SELECT profile_id FROM employers WHERE id = employer_id
  )
);

-- Verify policies
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
WHERE tablename = 'jobs';
