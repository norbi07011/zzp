-- ============================================
-- TEST: Building Communication System
-- Weryfikacja połączenia z bazą danych
-- ============================================

-- STEP 1: Sprawdzenie czy tabele istnieją
SELECT 
  schemaname,
  tablename,
  tableowner 
FROM pg_tables 
WHERE tablename IN ('project_messages', 'project_chat_groups', 'building_notifications', 'progress_reports', 'safety_alerts')
ORDER BY tablename;

-- STEP 2: Sprawdzenie struktury tabeli project_messages
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'project_messages'
ORDER BY ordinal_position;

-- STEP 3: Dodanie testowej wiadomości (jeśli tabela jest pusta)
INSERT INTO project_messages (
  project_id,
  sender_id,
  message,
  message_type,
  priority,
  status
) VALUES (
  'demo-project-123',
  'demo-user-123',
  'Test wiadomość z systemu komunikacji budowlanej! 🏗️',
  'text',
  'normal',
  'sent'
) 
ON CONFLICT DO NOTHING;

-- STEP 4: Sprawdzenie czy wiadomość została dodana
SELECT 
  id,
  project_id,
  sender_id,
  message,
  message_type,
  priority,
  status,
  created_at
FROM project_messages 
WHERE project_id = 'demo-project-123'
ORDER BY created_at DESC
LIMIT 5;

-- STEP 5: Sprawdzenie czy group został utworzony automatycznie
SELECT 
  id,
  project_id,
  name,
  description,
  created_at
FROM project_chat_groups
WHERE project_id = 'demo-project-123'
ORDER BY created_at DESC;

-- STEP 6: Dodanie testowej grupy jeśli nie istnieje
INSERT INTO project_chat_groups (
  project_id,
  name,
  description,
  group_type,
  is_active
) VALUES (
  'demo-project-123',
  'General',
  'Główny czat projektowy',
  'general',
  true
)
ON CONFLICT DO NOTHING;

-- STEP 7: Finalne sprawdzenie wszystkich tabel
SELECT 'project_messages' as table_name, COUNT(*) as record_count 
FROM project_messages WHERE project_id = 'demo-project-123'
UNION ALL
SELECT 'project_chat_groups' as table_name, COUNT(*) as record_count 
FROM project_chat_groups WHERE project_id = 'demo-project-123'
UNION ALL
SELECT 'building_notifications' as table_name, COUNT(*) as record_count 
FROM building_notifications WHERE project_id = 'demo-project-123'
UNION ALL
SELECT 'progress_reports' as table_name, COUNT(*) as record_count 
FROM progress_reports WHERE project_id = 'demo-project-123'
UNION ALL
SELECT 'safety_alerts' as table_name, COUNT(*) as record_count 
FROM safety_alerts WHERE project_id = 'demo-project-123';