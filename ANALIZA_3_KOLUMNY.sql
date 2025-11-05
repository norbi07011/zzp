-- KOLUMNY DLA TABEL PROJEKTOWYCH
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('communication_projects', 'project_tasks', 'project_invites', 'project_members')
ORDER BY table_name, ordinal_position;
