-- ============================================
-- MIGRATION: Dodaj activity_log i notifications do istniejącego systemu
-- Date: 2025-10-29
-- Author: AI Copilot  
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE project_notifications CASCADE;
-- DROP TABLE project_activity_log CASCADE;
-- DROP TYPE notification_status CASCADE;
-- DROP TYPE notification_type CASCADE;
-- DROP TYPE activity_type CASCADE;

-- ===========================================
-- CZĘŚĆ 1: TYPY ENUM
-- ===========================================

-- Typ aktywności w projekcie
DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM (
    'project_created',       -- projekt utworzony
    'project_updated',       -- projekt zaktualizowany
    'project_status_changed', -- zmiana statusu projektu
    'task_created',          -- zadanie utworzone
    'task_updated',          -- zadanie zaktualizowane
    'task_completed',        -- zadanie ukończone
    'task_assigned',         -- zadanie przypisane
    'task_comment_added',    -- komentarz do zadania
    'event_created',         -- wydarzenie utworzone
    'event_updated',         -- wydarzenie zaktualizowane
    'event_cancelled',       -- wydarzenie anulowane
    'member_invited',        -- członek zaproszony
    'member_joined',         -- członek dołączył
    'member_left',           -- członek opuścił
    'member_removed',        -- członek usunięty
    'permissions_changed',   -- uprawnienia zmienione
    'budget_updated',        -- budżet zaktualizowany
    'deadline_changed',      -- termin zmieniony
    'file_uploaded',         -- plik przesłany
    'file_removed',          -- plik usunięty
    'milestone_reached',     -- kamień milowy osiągnięty
    'milestone_missed',      -- kamień milowy minięty
    'report_generated',      -- raport wygenerowany
    'backup_created',        -- backup utworzony
    'system_maintenance'     -- konserwacja systemu
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type activity_type already exists, skipping...';
END $$;

-- Typ powiadomienia
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'task_assigned',         -- zadanie przypisane
    'task_due_soon',         -- zadanie wkrótce deadline
    'task_overdue',          -- zadanie po terminie
    'event_reminder',        -- przypomnienie o wydarzeniu
    'event_cancelled',       -- wydarzenie anulowane
    'project_update',        -- aktualizacja projektu
    'team_invitation',       -- zaproszenie do zespołu
    'permission_granted',    -- uprawnienie nadane
    'permission_revoked',    -- uprawnienie odebrane
    'budget_alert',          -- alert budżetu
    'deadline_alert',        -- alert terminu
    'milestone_achieved',    -- kamień milowy osiągnięty
    'system_message',        -- wiadomość systemowa
    'weekly_summary'         -- tygodniowe podsumowanie
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type notification_type already exists, skipping...';
END $$;

-- Status powiadomienia
DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM (
    'unread',       -- nieprzeczytane
    'read',         -- przeczytane
    'archived',     -- zarchiwizowane
    'dismissed'     -- odrzucone
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type notification_status already exists, skipping...';
END $$;

-- ===========================================
-- CZĘŚĆ 2: TABELA ACTIVITY LOG
-- ===========================================

-- Logi aktywności projektów
CREATE TABLE IF NOT EXISTS project_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Podstawowe relacje
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- może być NULL dla działań systemowych
  
  -- Szczegóły aktywności
  activity_type activity_type NOT NULL,
  description TEXT, -- opis w języku naturalnym
  details JSONB, -- szczegóły techniczne (JSON)
  
  -- Metadata
  ip_address INET, -- adres IP użytkownika
  user_agent TEXT, -- przeglądarka/aplikacja
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Indeksy kompozytowe już w definicji
  CONSTRAINT valid_details CHECK (
    details IS NULL OR jsonb_typeof(details) = 'object'
  )
);

-- Indeksy dla project_activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_project ON project_activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON project_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON project_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON project_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_project_created ON project_activity_log(project_id, created_at DESC);

-- ===========================================
-- CZĘŚĆ 3: TABELA POWIADOMIEŃ
-- ===========================================

-- Powiadomienia dla użytkowników
CREATE TABLE IF NOT EXISTS project_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Podstawowe relacje
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Szczegóły powiadomienia
  notification_type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL, -- tytuł powiadomienia
  message TEXT NOT NULL, -- treść powiadomienia
  action_url TEXT, -- link do akcji (np. /project/123/task/456)
  
  -- Metadata
  data JSONB, -- dodatkowe dane (JSON)
  priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5), -- priorytet 1-5
  
  -- Status
  status notification_status NOT NULL DEFAULT 'unread',
  read_at TIMESTAMP, -- kiedy przeczytane
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_read_status CHECK (
    (status = 'read' AND read_at IS NOT NULL) OR 
    (status != 'read' AND read_at IS NULL)
  )
);

-- Indeksy dla project_notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON project_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_project ON project_notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON project_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON project_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON project_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON project_notifications(user_id, status) WHERE status = 'unread';

-- ===========================================
-- CZĘŚĆ 4: TRIGGERY I FUNKCJE
-- ===========================================

-- Trigger dla auto-update updated_at w notifications
DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON project_notifications;
CREATE TRIGGER trigger_notifications_updated_at
  BEFORE UPDATE ON project_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Funkcja do automatycznego logowania aktywności
CREATE OR REPLACE FUNCTION log_project_activity(
  p_project_id UUID,
  p_user_id UUID,
  p_activity_type activity_type,
  p_description TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO project_activity_log (
    project_id,
    user_id,
    activity_type,
    description,
    details
  ) VALUES (
    p_project_id,
    p_user_id,
    p_activity_type,
    p_description,
    p_details
  ) RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$ LANGUAGE plpgsql;

-- Funkcja do tworzenia powiadomień
CREATE OR REPLACE FUNCTION create_notification(
  p_project_id UUID,
  p_user_id UUID,
  p_notification_type notification_type,
  p_title TEXT,
  p_message TEXT,
  p_action_url TEXT DEFAULT NULL,
  p_data JSONB DEFAULT NULL,
  p_priority INTEGER DEFAULT 1
) RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO project_notifications (
    project_id,
    user_id,
    notification_type,
    title,
    message,
    action_url,
    data,
    priority
  ) VALUES (
    p_project_id,
    p_user_id,
    p_notification_type,
    p_title,
    p_message,
    p_action_url,
    p_data,
    p_priority
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- ===========================================
-- CZĘŚĆ 5: RLS POLICIES
-- ===========================================

-- Włącz RLS
ALTER TABLE project_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notifications ENABLE ROW LEVEL SECURITY;

-- Polityki dla project_activity_log
DROP POLICY IF EXISTS "Users can view activity log for their projects" ON project_activity_log;
CREATE POLICY "Users can view activity log for their projects" ON project_activity_log
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_permissions 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Polityki dla project_notifications
DROP POLICY IF EXISTS "Users can manage their own notifications" ON project_notifications;
CREATE POLICY "Users can manage their own notifications" ON project_notifications
  FOR ALL USING (user_id = auth.uid());

-- ===========================================
-- CZĘŚĆ 6: DANE TESTOWE
-- ===========================================

DO $$
DECLARE
  test_project_id UUID;
  test_user_id UUID;
  activity_id UUID;
BEGIN
  -- Znajdź istniejący projekt testowy
  SELECT id INTO test_project_id 
  FROM projects 
  WHERE title = 'Demo Building Project - Amsterdam'
  LIMIT 1;
  
  -- Znajdź użytkownika testowego
  SELECT owner_id INTO test_user_id 
  FROM projects 
  WHERE id = test_project_id;
  
  IF test_project_id IS NOT NULL AND test_user_id IS NOT NULL THEN
    RAISE NOTICE 'Dodawanie danych testowych do activity log i notifications...';
    
    -- 1. Activity log entries
    INSERT INTO project_activity_log (project_id, user_id, activity_type, description, details) VALUES
    (test_project_id, test_user_id, 'project_created', 'Projekt "Demo Building Project - Amsterdam" został utworzony', 
     '{"budget": 250000, "location": "Amsterdam", "client": "Van der Berg Familie"}'::jsonb),
    
    (test_project_id, test_user_id, 'task_created', 'Utworzono zadanie: Przygotowanie fundamentów', 
     '{"task_id": "demo-task-1", "priority": "high", "estimated_hours": 40}'::jsonb),
     
    (test_project_id, test_user_id, 'event_created', 'Zaplanowano spotkanie: Kontrola postępu prac', 
     '{"event_date": "2025-02-01", "participants": 4, "location": "Na miejscu budowy"}'::jsonb),
     
    (test_project_id, test_user_id, 'member_invited', 'Zaproszono nowego członka zespołu: worker@example.com', 
     '{"invited_email": "worker@example.com", "role": "Pracownik budowlany", "permissions": ["view_tasks", "create_tasks"]}'::jsonb),
     
    (test_project_id, test_user_id, 'budget_updated', 'Budżet projektu został zaktualizowany', 
     '{"old_budget": 200000, "new_budget": 250000, "reason": "Dodatkowe prace wykończeniowe"}'::jsonb);
    
    -- 2. Notifications
    INSERT INTO project_notifications (project_id, user_id, notification_type, title, message, action_url, priority) VALUES
    (test_project_id, test_user_id, 'project_update', 'Projekt rozpoczęty!', 
     'Twój projekt "Demo Building Project - Amsterdam" został pomyślnie utworzony i jest gotowy do pracy.', 
     '/projects/' || test_project_id, 3),
     
    (test_project_id, test_user_id, 'task_assigned', 'Nowe zadanie przypisane', 
     'Zostało Ci przypisane zadanie: Przygotowanie fundamentów. Deadline: 15 lutego 2025.', 
     '/projects/' || test_project_id || '/tasks', 4),
     
    (test_project_id, test_user_id, 'team_invitation', 'Zaproszenie wysłane', 
     'Wysłano zaproszenie do projektu dla worker@example.com. Oczekiwanie na odpowiedź.', 
     '/projects/' || test_project_id || '/team', 2),
     
    (test_project_id, test_user_id, 'event_reminder', 'Przypomnienie o spotkaniu', 
     'Za 3 dni odbędzie się spotkanie: Kontrola postępu prac. Lokalizacja: Na miejscu budowy.', 
     '/projects/' || test_project_id || '/calendar', 5),
     
    (test_project_id, test_user_id, 'budget_alert', 'Budżet zaktualizowany', 
     'Budżet projektu został zwiększony do 250,000 EUR z powodu dodatkowych prac wykończeniowych.', 
     '/projects/' || test_project_id || '/budget', 3);
    
    RAISE NOTICE 'Dodano 5 wpisów do activity log i 5 powiadomień';
    
  ELSE
    RAISE NOTICE 'Brak projektu testowego - pomijam tworzenie danych testowych';
  END IF;
END $$;

-- ===========================================
-- CZĘŚĆ 7: VERIFICATION
-- ===========================================

-- Sprawdź utworzone tabele
SELECT 
  'project_activity_log' as table_name,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_activity_log') 
    THEN '✅ CREATED' ELSE '❌ FAILED' END as status
UNION ALL
SELECT 'project_notifications', 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_notifications') 
    THEN '✅ CREATED' ELSE '❌ FAILED' END;

-- Sprawdź ENUM types
SELECT 
  t.typname as enum_type,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as possible_values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname IN ('activity_type', 'notification_type', 'notification_status')
GROUP BY t.typname
ORDER BY t.typname;

-- Podsumowanie danych
SELECT 
  'Activity Log Entries' as data_type,
  count(*) as count
FROM project_activity_log
UNION ALL
SELECT 'Notifications', count(*) 
FROM project_notifications;