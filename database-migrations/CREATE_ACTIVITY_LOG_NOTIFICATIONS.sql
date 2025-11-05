-- ============================================
-- MIGRATION: Activity Log i powiadomienia
-- Date: 2025-10-29
-- Author: AI Copilot
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE project_activity_log CASCADE;
-- DROP TABLE project_notifications CASCADE;
-- DROP TYPE activity_type CASCADE;
-- DROP TYPE notification_type CASCADE;
-- DROP TYPE notification_status CASCADE;

-- ===========================================
-- CZĘŚĆ 1: ACTIVITY LOG SYSTEM
-- ===========================================

-- Typy aktywności w projekcie
DO $$ BEGIN
  CREATE TYPE activity_type AS ENUM (
    -- Aktywności zadań
    'task_created',          -- utworzono zadanie
    'task_updated',          -- zaktualizowano zadanie  
    'task_assigned',         -- przypisano zadanie
    'task_completed',        -- ukończono zadanie
    'task_commented',        -- skomentowano zadanie
    'task_deleted',          -- usunięto zadanie
    
    -- Aktywności wydarzeń
    'event_created',         -- utworzono wydarzenie
    'event_updated',         -- zaktualizowano wydarzenie
    'event_cancelled',       -- anulowano wydarzenie
    'event_completed',       -- ukończono wydarzenie
    
    -- Aktywności zespołu
    'member_invited',        -- zaproszono członka
    'member_joined',         -- członek dołączył
    'member_left',           -- członek opuścił projekt
    'member_removed',        -- usunięto członka
    'permissions_changed',   -- zmieniono uprawnienia
    
    -- Aktywności projektu
    'project_created',       -- utworzono projekt
    'project_updated',       -- zaktualizowano projekt
    'project_status_changed', -- zmieniono status projektu
    'budget_updated',        -- zaktualizowano budżet
    
    -- Aktywności plików
    'file_uploaded',         -- przesłano plik
    'file_deleted',          -- usunięto plik
    'file_downloaded',       -- pobrano plik
    
    -- Inne
    'comment_added',         -- dodano komentarz
    'report_generated',      -- wygenerowano raport
    'backup_created',        -- utworzono kopię zapasową
    'system_maintenance'     -- konserwacja systemu
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type activity_type already exists, skipping...';
END $$;

-- Log aktywności projektu
CREATE TABLE IF NOT EXISTS project_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacje
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- NULL dla systemu
  
  -- Typ aktywności
  activity_type activity_type NOT NULL,
  
  -- Opis aktywności
  activity_title VARCHAR(255) NOT NULL, -- krótki tytuł
  activity_description TEXT, -- szczegółowy opis
  
  -- Metadata
  related_entity_type VARCHAR(100), -- 'task', 'event', 'member', 'file'
  related_entity_id UUID, -- ID powiązanego obiektu
  
  -- Szczegóły zmiany (JSON)
  changes_before JSONB, -- stan przed zmianą
  changes_after JSONB,  -- stan po zmianie
  metadata JSONB DEFAULT '{}', -- dodatkowe dane
  
  -- Lokalizacja i urządzenie
  ip_address INET,
  user_agent TEXT,
  device_info JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Indeksy
  CONSTRAINT activity_log_valid_entity CHECK (
    (related_entity_type IS NULL AND related_entity_id IS NULL) OR
    (related_entity_type IS NOT NULL AND related_entity_id IS NOT NULL)
  )
);

-- ===========================================
-- CZĘŚĆ 2: NOTIFICATION SYSTEM  
-- ===========================================

-- Typy powiadomień
DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM (
    'info',              -- informacyjne
    'success',           -- sukces
    'warning',           -- ostrzeżenie
    'error',             -- błąd
    'task_assigned',     -- przypisano zadanie
    'task_due',          -- zadanie kończy się
    'task_overdue',      -- zadanie przeterminowane
    'event_reminder',    -- przypomnienie o wydarzeniu
    'event_invitation',  -- zaproszenie do wydarzenia
    'team_invitation',   -- zaproszenie do zespołu
    'budget_alert',      -- alert budżetowy
    'deadline_warning',  -- ostrzeżenie o deadline
    'system_update',     -- aktualizacja systemu
    'maintenance'        -- konserwacja
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type notification_type already exists, skipping...';
END $$;

-- Status powiadomienia
DO $$ BEGIN
  CREATE TYPE notification_status AS ENUM (
    'unread',    -- nieprzeczytane
    'read',      -- przeczytane
    'dismissed', -- odrzucone
    'archived'   -- zarchiwizowane
  );
EXCEPTION
  WHEN duplicate_object THEN
    RAISE NOTICE 'Type notification_status already exists, skipping...';
END $$;

-- Tabela powiadomień
CREATE TABLE IF NOT EXISTS project_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Odbiorca
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE, -- NULL dla globalnych
  
  -- Typ i treść
  notification_type notification_type NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  
  -- Metadata
  action_url TEXT, -- URL do akcji (np. link do zadania)
  action_label VARCHAR(100), -- tekst przycisku akcji
  icon VARCHAR(100), -- nazwa ikony
  color VARCHAR(50), -- kolor powiadomienia
  priority INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high, 4=urgent
  
  -- Powiązania
  related_activity_id UUID REFERENCES project_activity_log(id) ON DELETE SET NULL,
  related_entity_type VARCHAR(100),
  related_entity_id UUID,
  
  -- Dane JSON
  data JSONB DEFAULT '{}', -- dodatkowe dane
  
  -- Status i czas
  status notification_status NOT NULL DEFAULT 'unread',
  expires_at TIMESTAMP, -- kiedy powiadomienie wygasa
  read_at TIMESTAMP,
  dismissed_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT notification_priority_range CHECK (priority BETWEEN 1 AND 4),
  CONSTRAINT notification_status_timestamps CHECK (
    (status = 'unread' AND read_at IS NULL) OR
    (status = 'read' AND read_at IS NOT NULL) OR
    (status = 'dismissed' AND dismissed_at IS NOT NULL)
  )
);

-- ===========================================
-- CZĘŚĆ 3: INDEKSY
-- ===========================================

-- Indeksy dla activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_project ON project_activity_log(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON project_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_type ON project_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON project_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON project_activity_log(related_entity_type, related_entity_id);

-- Indeksy dla notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON project_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_project ON project_notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON project_notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON project_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON project_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON project_notifications(priority DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON project_notifications(expires_at);

-- ===========================================
-- CZĘŚĆ 4: TRIGGERY AUTOMATYCZNE
-- ===========================================

-- Trigger: Auto-update updated_at dla notifications
DROP TRIGGER IF EXISTS trigger_notifications_updated_at ON project_notifications;
CREATE TRIGGER trigger_notifications_updated_at
  BEFORE UPDATE ON project_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Auto-set timestamps dla status changes
CREATE OR REPLACE FUNCTION update_notification_timestamps()
RETURNS TRIGGER AS $$
BEGIN
  -- Ustaw read_at przy zmianie na 'read'
  IF NEW.status = 'read' AND OLD.status != 'read' AND NEW.read_at IS NULL THEN
    NEW.read_at = NOW();
  END IF;
  
  -- Ustaw dismissed_at przy zmianie na 'dismissed'
  IF NEW.status = 'dismissed' AND OLD.status != 'dismissed' AND NEW.dismissed_at IS NULL THEN
    NEW.dismissed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notification_status_timestamps ON project_notifications;
CREATE TRIGGER trigger_notification_status_timestamps
  BEFORE UPDATE ON project_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notification_timestamps();

-- ===========================================
-- CZĘŚĆ 5: TRIGGERY ACTIVITY LOG
-- ===========================================

-- Funkcja logowania aktywności dla zadań
CREATE OR REPLACE FUNCTION log_task_activity()
RETURNS TRIGGER AS $$
DECLARE
  activity_title_text VARCHAR(255);
  activity_desc TEXT;
  user_name TEXT;
BEGIN
  -- Pobierz nazwę użytkownika
  SELECT COALESCE(
    (SELECT first_name || ' ' || last_name FROM profiles WHERE id = auth.uid()),
    'System'
  ) INTO user_name;
  
  IF TG_OP = 'INSERT' THEN
    activity_title_text := 'Utworzono zadanie: ' || NEW.title;
    activity_desc := user_name || ' utworzył(a) nowe zadanie "' || NEW.title || '"';
    
    INSERT INTO project_activity_log (
      project_id, user_id, activity_type, activity_title, activity_description,
      related_entity_type, related_entity_id, changes_after
    ) VALUES (
      NEW.project_id, auth.uid(), 'task_created', activity_title_text, activity_desc,
      'task', NEW.id, to_jsonb(NEW)
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    
    -- Zmiana statusu
    IF OLD.status != NEW.status THEN
      IF NEW.status = 'completed' THEN
        activity_title_text := 'Ukończono zadanie: ' || NEW.title;
        activity_desc := user_name || ' oznaczył(a) zadanie "' || NEW.title || '" jako ukończone';
        
        INSERT INTO project_activity_log (
          project_id, user_id, activity_type, activity_title, activity_description,
          related_entity_type, related_entity_id, changes_before, changes_after
        ) VALUES (
          NEW.project_id, auth.uid(), 'task_completed', activity_title_text, activity_desc,
          'task', NEW.id, to_jsonb(OLD), to_jsonb(NEW)
        );
      ELSE
        activity_title_text := 'Zaktualizowano zadanie: ' || NEW.title;
        activity_desc := user_name || ' zmienił(a) status zadania "' || NEW.title || '" z "' || OLD.status || '" na "' || NEW.status || '"';
        
        INSERT INTO project_activity_log (
          project_id, user_id, activity_type, activity_title, activity_description,
          related_entity_type, related_entity_id, changes_before, changes_after
        ) VALUES (
          NEW.project_id, auth.uid(), 'task_updated', activity_title_text, activity_desc,
          'task', NEW.id, to_jsonb(OLD), to_jsonb(NEW)
        );
      END IF;
    END IF;
    
    -- Zmiana przypisania
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      activity_title_text := 'Przypisano zadanie: ' || NEW.title;
      activity_desc := user_name || ' przypisał(a) zadanie "' || NEW.title || '" do nowego wykonawcy';
      
      INSERT INTO project_activity_log (
        project_id, user_id, activity_type, activity_title, activity_description,
        related_entity_type, related_entity_id, changes_before, changes_after
      ) VALUES (
        NEW.project_id, auth.uid(), 'task_assigned', activity_title_text, activity_desc,
        'task', NEW.id, to_jsonb(OLD), to_jsonb(NEW)
      );
    END IF;
    
  ELSIF TG_OP = 'DELETE' THEN
    activity_title_text := 'Usunięto zadanie: ' || OLD.title;
    activity_desc := user_name || ' usunął(a) zadanie "' || OLD.title || '"';
    
    INSERT INTO project_activity_log (
      project_id, user_id, activity_type, activity_title, activity_description,
      related_entity_type, related_entity_id, changes_before
    ) VALUES (
      OLD.project_id, auth.uid(), 'task_deleted', activity_title_text, activity_desc,
      'task', OLD.id, to_jsonb(OLD)
    );
    
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplikuj trigger do project_tasks
DROP TRIGGER IF EXISTS trigger_log_task_activity ON project_tasks;
CREATE TRIGGER trigger_log_task_activity
  AFTER INSERT OR UPDATE OR DELETE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION log_task_activity();

-- Funkcja logowania aktywności dla projektów
CREATE OR REPLACE FUNCTION log_project_activity()
RETURNS TRIGGER AS $$
DECLARE
  activity_title_text VARCHAR(255);
  activity_desc TEXT;
  user_name TEXT;
BEGIN
  SELECT COALESCE(
    (SELECT first_name || ' ' || last_name FROM profiles WHERE id = auth.uid()),
    'System'
  ) INTO user_name;
  
  IF TG_OP = 'INSERT' THEN
    activity_title_text := 'Utworzono projekt: ' || NEW.title;
    activity_desc := user_name || ' utworzył(a) nowy projekt "' || NEW.title || '"';
    
    INSERT INTO project_activity_log (
      project_id, user_id, activity_type, activity_title, activity_description,
      related_entity_type, related_entity_id, changes_after
    ) VALUES (
      NEW.id, auth.uid(), 'project_created', activity_title_text, activity_desc,
      'project', NEW.id, to_jsonb(NEW)
    );
    
  ELSIF TG_OP = 'UPDATE' THEN
    
    IF OLD.status != NEW.status THEN
      activity_title_text := 'Zmieniono status projektu: ' || NEW.title;
      activity_desc := user_name || ' zmienił(a) status projektu z "' || OLD.status || '" na "' || NEW.status || '"';
      
      INSERT INTO project_activity_log (
        project_id, user_id, activity_type, activity_title, activity_description,
        related_entity_type, related_entity_id, changes_before, changes_after
      ) VALUES (
        NEW.id, auth.uid(), 'project_status_changed', activity_title_text, activity_desc,
        'project', NEW.id, to_jsonb(OLD), to_jsonb(NEW)
      );
    END IF;
    
    IF OLD.budget_total IS DISTINCT FROM NEW.budget_total OR OLD.budget_used IS DISTINCT FROM NEW.budget_used THEN
      activity_title_text := 'Zaktualizowano budżet projektu: ' || NEW.title;
      activity_desc := user_name || ' zaktualizował(a) budżet projektu';
      
      INSERT INTO project_activity_log (
        project_id, user_id, activity_type, activity_title, activity_description,
        related_entity_type, related_entity_id, changes_before, changes_after
      ) VALUES (
        NEW.id, auth.uid(), 'budget_updated', activity_title_text, activity_desc,
        'project', NEW.id, to_jsonb(OLD), to_jsonb(NEW)
      );
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplikuj trigger do projects
DROP TRIGGER IF EXISTS trigger_log_project_activity ON projects;
CREATE TRIGGER trigger_log_project_activity
  AFTER INSERT OR UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION log_project_activity();

-- ===========================================
-- CZĘŚĆ 6: RLS POLICIES
-- ===========================================

-- Włącz RLS
ALTER TABLE project_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notifications ENABLE ROW LEVEL SECURITY;

-- Polityki dla activity_log
DROP POLICY IF EXISTS "Users can view activity for their projects" ON project_activity_log;
CREATE POLICY "Users can view activity for their projects" ON project_activity_log
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE owner_id = auth.uid()
      UNION
      SELECT project_id FROM project_permissions 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Polityki dla notifications
DROP POLICY IF EXISTS "Users can manage their own notifications" ON project_notifications;
CREATE POLICY "Users can manage their own notifications" ON project_notifications
  FOR ALL USING (user_id = auth.uid());

-- ===========================================
-- CZĘŚĆ 7: FUNKCJE RPC
-- ===========================================

-- Funkcja oznaczania powiadomień jako przeczytane
CREATE OR REPLACE FUNCTION mark_notifications_as_read(notification_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE project_notifications
  SET status = 'read', read_at = NOW()
  WHERE id = ANY(notification_ids)
    AND user_id = auth.uid()
    AND status = 'unread';
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funkcja pobierania aktywności projektu z paginacją
CREATE OR REPLACE FUNCTION get_project_activity(
  p_project_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  activity_id UUID,
  activity_type activity_type,
  activity_title VARCHAR(255),
  activity_description TEXT,
  user_name TEXT,
  created_at TIMESTAMP,
  metadata JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pal.id,
    pal.activity_type,
    pal.activity_title,
    pal.activity_description,
    COALESCE(p.first_name || ' ' || p.last_name, 'System') as user_name,
    pal.created_at,
    pal.metadata
  FROM project_activity_log pal
  LEFT JOIN profiles p ON pal.user_id = p.id
  WHERE pal.project_id = p_project_id
  ORDER BY pal.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- CZĘŚĆ 8: DANE TESTOWE
-- ===========================================

-- Dodaj przykładową aktywność
DO $$
DECLARE
  test_project_id UUID;
  test_user_id UUID;
BEGIN
  -- Znajdź projekt testowy
  SELECT id INTO test_project_id 
  FROM projects 
  WHERE title = 'Demo Building Project - Amsterdam'
  LIMIT 1;
  
  SELECT id INTO test_user_id
  FROM auth.users
  WHERE email = 'test-employer@example.com'
  LIMIT 1;
  
  IF test_project_id IS NOT NULL AND test_user_id IS NOT NULL THEN
    
    -- Dodaj przykładową aktywność
    INSERT INTO project_activity_log (
      project_id, user_id, activity_type, activity_title, activity_description,
      related_entity_type, metadata
    ) VALUES 
    (test_project_id, test_user_id, 'project_created', 
     'Utworzono projekt: Demo Building Project - Amsterdam',
     'Utworzono nowy projekt budowy domu w Amsterdamie',
     'project', '{"initial_setup": true}'),
    (test_project_id, test_user_id, 'budget_updated',
     'Zaktualizowano budżet projektu',
     'Ustawiono budżet projektu na 250,000 EUR',
     'project', '{"budget_amount": 250000}');
    
    -- Dodaj przykładowe powiadomienia
    INSERT INTO project_notifications (
      user_id, project_id, notification_type, title, message, priority
    ) VALUES
    (test_user_id, test_project_id, 'success', 
     'Projekt utworzony pomyślnie',
     'Twój projekt "Demo Building Project - Amsterdam" został utworzony i jest gotowy do użycia.',
     2),
    (test_user_id, test_project_id, 'info',
     'Zaproszenie wysłane',
     'Wysłano zaproszenie do projektu na adres worker@example.com',
     1);
    
    RAISE NOTICE 'Dodano przykładową aktywność i powiadomienia';
  END IF;
END $$;

-- ===========================================
-- CZĘŚĆ 9: VERIFICATION
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

-- Sprawdź nowe ENUM types
SELECT 
  t.typname as enum_type,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as possible_values
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname IN ('activity_type', 'notification_type', 'notification_status')
GROUP BY t.typname
ORDER BY t.typname;