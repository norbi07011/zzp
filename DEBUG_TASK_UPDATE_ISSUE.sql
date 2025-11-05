-- ============================================
-- DEBUG: Dlaczego updateTask nie działa
-- Date: 2025-10-31
-- ============================================

-- STEP 1: Sprawdź czy są jakieś zadania
SELECT 
  id,
  title,
  status,
  project_id,
  created_by,
  assigned_to,
  updated_at
FROM project_tasks
ORDER BY created_at DESC
LIMIT 10;

-- STEP 2: Sprawdź RLS policies dla UPDATE
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
WHERE tablename = 'project_tasks'
AND cmd = 'UPDATE';

-- STEP 3: Sprawdź constraints które mogą blokować UPDATE
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'project_tasks'
ORDER BY tc.constraint_type, tc.constraint_name;

-- STEP 4: Sprawdź czy updated_at ma trigger
SELECT
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'project_tasks';

-- STEP 5: Test UPDATE (symulacja)
-- SELECT current_user, session_user;
-- UPDATE project_tasks SET title = title WHERE id = 'xxx'; -- TEST

-- STEP 6: Sprawdź recent errors w Supabase logs
-- (trzeba sprawdzić w Supabase Dashboard > Logs)
