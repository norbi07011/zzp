-- ============================================================================
-- DIAGNOZA WSZYSTKICH TABEL - SPRAWDZENIE CO ISTNIEJE
-- ============================================================================
-- Data: 2025-10-12
-- Cel: Sprawdzić które tabele istnieją i jakie mają kolumny
-- ============================================================================

-- 1. LISTA WSZYSTKICH TABEL W SCHEMACIE PUBLIC
-- ----------------------------------------------------------------------------
SELECT 
  table_name,
  'EXISTS' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- 2. SZCZEGÓŁOWA ANALIZA KAŻDEJ TABELI
-- ============================================================================

-- WORKER_CERTIFICATES
-- ----------------------------------------------------------------------------
SELECT 
  'worker_certificates' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'worker_certificates'
ORDER BY ordinal_position;

-- PORTFOLIO_PROJECTS
-- ----------------------------------------------------------------------------
SELECT 
  'portfolio_projects' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'portfolio_projects'
ORDER BY ordinal_position;

-- JOB_APPLICATIONS
-- ----------------------------------------------------------------------------
SELECT 
  'job_applications' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'job_applications'
ORDER BY ordinal_position;

-- EARNINGS
-- ----------------------------------------------------------------------------
SELECT 
  'earnings' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'earnings'
ORDER BY ordinal_position;

-- WORKER_SKILLS
-- ----------------------------------------------------------------------------
SELECT 
  'worker_skills' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'worker_skills'
ORDER BY ordinal_position;

-- WORKER_REVIEWS
-- ----------------------------------------------------------------------------
SELECT 
  'worker_reviews' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'worker_reviews'
ORDER BY ordinal_position;

-- WORKER_EXPERIENCES
-- ----------------------------------------------------------------------------
SELECT 
  'worker_experiences' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'worker_experiences'
ORDER BY ordinal_position;

-- WORKER_AVAILABILITY
-- ----------------------------------------------------------------------------
SELECT 
  'worker_availability' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'worker_availability'
ORDER BY ordinal_position;

-- EMPLOYER_SEARCHES
-- ----------------------------------------------------------------------------
SELECT 
  'employer_searches' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'employer_searches'
ORDER BY ordinal_position;

-- SAVED_WORKERS
-- ----------------------------------------------------------------------------
SELECT 
  'saved_workers' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'saved_workers'
ORDER BY ordinal_position;

-- WORKER_VIEWS
-- ----------------------------------------------------------------------------
SELECT 
  'worker_views' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'worker_views'
ORDER BY ordinal_position;

-- CONVERSATIONS
-- ----------------------------------------------------------------------------
SELECT 
  'conversations' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'conversations'
ORDER BY ordinal_position;

-- MESSAGES
-- ----------------------------------------------------------------------------
SELECT 
  'messages' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'messages'
ORDER BY ordinal_position;

-- ADMIN_ACTIONS
-- ----------------------------------------------------------------------------
SELECT 
  'admin_actions' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'admin_actions'
ORDER BY ordinal_position;

-- SYSTEM_METRICS
-- ----------------------------------------------------------------------------
SELECT 
  'system_metrics' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'system_metrics'
ORDER BY ordinal_position;

-- FEATURE_FLAGS
-- ----------------------------------------------------------------------------
SELECT 
  'feature_flags' as tabela,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'feature_flags'
ORDER BY ordinal_position;

-- ============================================================================
-- PODSUMOWANIE
-- ============================================================================

-- Sprawdź które z 16 kluczowych tabel NIE istnieją
SELECT 
  unnest(ARRAY[
    'worker_certificates',
    'portfolio_projects',
    'job_applications',
    'earnings',
    'worker_skills',
    'worker_reviews',
    'worker_experiences',
    'worker_availability',
    'employer_searches',
    'saved_workers',
    'worker_views',
    'conversations',
    'messages',
    'admin_actions',
    'system_metrics',
    'feature_flags'
  ]) as required_table
EXCEPT
SELECT table_name
FROM information_schema.tables 
WHERE table_schema = 'public';
