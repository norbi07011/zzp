-- ============================================
-- MIGRATION: System Komunikacji Budowlanej
-- Date: 2025-10-29
-- Author: AI Copilot
-- Purpose: Rozszerzenie systemu komunikacji o funkcje budowlane
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE IF EXISTS public.safety_alerts CASCADE;
-- DROP TABLE IF EXISTS public.progress_reports CASCADE;
-- DROP TABLE IF EXISTS public.building_notifications CASCADE;
-- DROP TABLE IF EXISTS public.project_chat_groups CASCADE;
-- DROP TABLE IF EXISTS public.project_messages CASCADE;

-- STEP 1: Analyze current state
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('messages', 'conversations', 'jobs', 'profiles')
ORDER BY table_name, ordinal_position;

-- STEP 2: Create new tables for building communication
BEGIN;

-- ============================================
-- 1. PROJECT MESSAGES (Wiadomości projektowe)
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID, -- Będzie referencja do projects gdy tabela zostanie utworzona
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'message' CHECK (
    message_type IN ('message', 'progress_update', 'safety_alert', 'quality_check', 'voice', 'image', 'file')
  ),
  task_id UUID, -- Opcjonalne powiązanie z zadaniem
  location_data JSONB, -- GPS coordinates i opis lokalizacji
  attachment_data JSONB, -- Dane załączników (url, name, size, type)
  voice_note_data JSONB, -- Dane nagrań głosowych (url, duration)
  reactions JSONB DEFAULT '{}'::jsonb, -- Reakcje emoji {emoji: [user_ids]}
  status VARCHAR(20) DEFAULT 'sent' CHECK (
    status IN ('sending', 'sent', 'delivered', 'read')
  ),
  reply_to_id UUID REFERENCES public.project_messages(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pinned_at TIMESTAMPTZ,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (
    priority IN ('low', 'normal', 'high', 'urgent')
  ),
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  edited_at TIMESTAMPTZ,
  thread_messages UUID[], -- IDs wiadomości w wątku
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy dla project_messages
CREATE INDEX IF NOT EXISTS idx_project_messages_project_id ON public.project_messages(project_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_sender_id ON public.project_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_task_id ON public.project_messages(task_id);
CREATE INDEX IF NOT EXISTS idx_project_messages_type ON public.project_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_project_messages_priority ON public.project_messages(priority);
CREATE INDEX IF NOT EXISTS idx_project_messages_created_at ON public.project_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_messages_pinned ON public.project_messages(is_pinned);
CREATE INDEX IF NOT EXISTS idx_project_messages_approval ON public.project_messages(requires_approval, approved_by);

-- Enable RLS
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies dla project_messages
CREATE POLICY "Users can view project messages if they're project members" 
ON public.project_messages FOR SELECT 
USING (
  -- Dla testu pozwalamy wszystkim zalogowanym użytkownikom
  auth.uid() IS NOT NULL
  -- TODO: Dodać sprawdzenie członkostwa w projekcie gdy tabela projects będzie gotowa
  -- EXISTS (
  --   SELECT 1 FROM public.project_members pm 
  --   WHERE pm.project_id = project_messages.project_id 
  --   AND pm.user_id = auth.uid()
  -- )
);

CREATE POLICY "Users can insert project messages if they're project members" 
ON public.project_messages FOR INSERT 
WITH CHECK (
  auth.uid() = sender_id
  -- TODO: Dodać sprawdzenie członkostwa w projekcie
);

CREATE POLICY "Users can update their own project messages" 
ON public.project_messages FOR UPDATE 
USING (auth.uid() = sender_id)
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their own project messages" 
ON public.project_messages FOR DELETE 
USING (auth.uid() = sender_id);

COMMENT ON TABLE public.project_messages IS 'Wiadomości w projektach budowlanych z kontekstem zadań';

-- ============================================
-- 2. PROJECT CHAT GROUPS (Grupy czatów projektowych)
-- ============================================
CREATE TABLE IF NOT EXISTS public.project_chat_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID, -- Referencja do projects
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10), -- Emoji
  color VARCHAR(20) DEFAULT 'blue',
  group_type VARCHAR(50) DEFAULT 'project' CHECK (
    group_type IN ('project', 'team', 'safety', 'quality', 'logistics', 'admin')
  ),
  members UUID[] DEFAULT '{}', -- Array user IDs
  auto_join_roles TEXT[], -- Role które automatycznie dołączają
  location_zone VARCHAR(100), -- Strefa budowy
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy dla project_chat_groups
CREATE INDEX IF NOT EXISTS idx_project_chat_groups_project_id ON public.project_chat_groups(project_id);
CREATE INDEX IF NOT EXISTS idx_project_chat_groups_type ON public.project_chat_groups(group_type);
CREATE INDEX IF NOT EXISTS idx_project_chat_groups_created_by ON public.project_chat_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_project_chat_groups_members ON public.project_chat_groups USING GIN(members);

-- Enable RLS
ALTER TABLE public.project_chat_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies dla project_chat_groups
CREATE POLICY "Users can view groups they're members of" 
ON public.project_chat_groups FOR SELECT 
USING (
  auth.uid() = ANY(members) OR auth.uid() = created_by
);

CREATE POLICY "Project managers can create groups" 
ON public.project_chat_groups FOR INSERT 
WITH CHECK (
  auth.uid() = created_by
  -- TODO: Sprawdzenie uprawnień do projektu
);

CREATE POLICY "Group creators can update groups" 
ON public.project_chat_groups FOR UPDATE 
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

COMMENT ON TABLE public.project_chat_groups IS 'Grupy komunikacyjne w projektach budowlanych';

-- ============================================
-- 3. BUILDING NOTIFICATIONS (Powiadomienia budowlane)
-- ============================================
CREATE TABLE IF NOT EXISTS public.building_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (
    notification_type IN (
      'task_assigned', 'task_completed', 'task_overdue', 'safety_alert', 
      'quality_issue', 'weather_warning', 'material_delivery', 'approval_needed',
      'shift_reminder', 'inspection_scheduled', 'geofence_entry', 'geofence_exit'
    )
  ),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  project_id UUID, -- Referencja do projektu
  task_id UUID, -- Referencja do zadania
  location_id VARCHAR(100), -- ID lokalizacji
  is_read BOOLEAN DEFAULT FALSE,
  is_urgent BOOLEAN DEFAULT FALSE,
  is_actionable BOOLEAN DEFAULT FALSE,
  action_type VARCHAR(50) CHECK (
    action_type IN ('approve', 'reject', 'acknowledge', 'view_details', 'navigate_to_location')
  ),
  action_data JSONB, -- Dodatkowe dane dla akcji
  expires_at TIMESTAMPTZ, -- Powiadomienie wygasa
  geofence_triggered BOOLEAN DEFAULT FALSE,
  related_data JSONB, -- Dodatkowe dane kontekstowe
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy dla building_notifications
CREATE INDEX IF NOT EXISTS idx_building_notifications_user_id ON public.building_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_building_notifications_type ON public.building_notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_building_notifications_project_id ON public.building_notifications(project_id);
CREATE INDEX IF NOT EXISTS idx_building_notifications_task_id ON public.building_notifications(task_id);
CREATE INDEX IF NOT EXISTS idx_building_notifications_read ON public.building_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_building_notifications_urgent ON public.building_notifications(is_urgent);
CREATE INDEX IF NOT EXISTS idx_building_notifications_created_at ON public.building_notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_building_notifications_expires_at ON public.building_notifications(expires_at);

-- Enable RLS
ALTER TABLE public.building_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies dla building_notifications
CREATE POLICY "Users can view their own notifications" 
ON public.building_notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications for users" 
ON public.building_notifications FOR INSERT 
WITH CHECK (true); -- System może tworzyć powiadomienia

CREATE POLICY "Users can update their own notifications" 
ON public.building_notifications FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

COMMENT ON TABLE public.building_notifications IS 'Powiadomienia związane z projektami budowlanymi';

-- ============================================
-- 4. PROGRESS REPORTS (Raporty postępu)
-- ============================================
CREATE TABLE IF NOT EXISTS public.progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID, -- Referencja do zadania
  project_id UUID, -- Referencja do projektu
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress_percentage INTEGER NOT NULL CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  description TEXT NOT NULL,
  issues TEXT[], -- Lista problemów
  materials_used JSONB DEFAULT '[]'::jsonb, -- [{material_id, name, quantity, unit, cost}]
  workers_present UUID[], -- IDs pracowników obecnych
  weather_conditions JSONB, -- {temperature, humidity, condition, description}
  quality_check_passed BOOLEAN DEFAULT FALSE,
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
  photos_before TEXT[], -- URLs zdjęć przed
  photos_after TEXT[], -- URLs zdjęć po
  location_data JSONB, -- GPS coordinates
  estimated_completion_time TIMESTAMPTZ,
  next_steps TEXT,
  supervisor_approval JSONB DEFAULT '{
    "status": "pending",
    "approved_by": null,
    "comments": null,
    "approved_at": null
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy dla progress_reports
CREATE INDEX IF NOT EXISTS idx_progress_reports_task_id ON public.progress_reports(task_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_project_id ON public.progress_reports(project_id);
CREATE INDEX IF NOT EXISTS idx_progress_reports_reported_by ON public.progress_reports(reported_by);
CREATE INDEX IF NOT EXISTS idx_progress_reports_progress ON public.progress_reports(progress_percentage);
CREATE INDEX IF NOT EXISTS idx_progress_reports_quality ON public.progress_reports(quality_check_passed);
CREATE INDEX IF NOT EXISTS idx_progress_reports_created_at ON public.progress_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_progress_reports_approval ON public.progress_reports((supervisor_approval->>'status'));

-- Enable RLS
ALTER TABLE public.progress_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies dla progress_reports
CREATE POLICY "Users can view progress reports for their projects" 
ON public.progress_reports FOR SELECT 
USING (
  auth.uid() = reported_by OR
  -- TODO: Dodać sprawdzenie członkostwa w projekcie
  true
);

CREATE POLICY "Users can create progress reports" 
ON public.progress_reports FOR INSERT 
WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Users can update their own progress reports" 
ON public.progress_reports FOR UPDATE 
USING (auth.uid() = reported_by)
WITH CHECK (auth.uid() = reported_by);

COMMENT ON TABLE public.progress_reports IS 'Raporty postępu prac w projektach budowlanych';

-- ============================================
-- 5. SAFETY ALERTS (Alerty BHP)
-- ============================================
CREATE TABLE IF NOT EXISTS public.safety_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID, -- Referencja do projektu
  alert_type VARCHAR(50) NOT NULL CHECK (
    alert_type IN ('accident', 'near_miss', 'unsafe_condition', 'equipment_issue', 'weather_warning')
  ),
  severity VARCHAR(20) NOT NULL CHECK (
    severity IN ('low', 'medium', 'high', 'critical')
  ),
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_data JSONB NOT NULL, -- {lat, lng, description, zone}
  description TEXT NOT NULL,
  photos TEXT[], -- URLs zdjęć
  immediate_action TEXT,
  status VARCHAR(20) DEFAULT 'reported' CHECK (
    status IN ('reported', 'acknowledged', 'investigating', 'resolved')
  ),
  assigned_to UUID[], -- IDs odpowiedzialnych osób
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  incident_number VARCHAR(50) UNIQUE, -- Unikalny numer incydentu
  witnesses_present UUID[], -- IDs świadków
  equipment_involved TEXT[], -- Lista sprzętu
  injuries_reported BOOLEAN DEFAULT FALSE,
  emergency_services_contacted BOOLEAN DEFAULT FALSE,
  preventive_measures TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indeksy dla safety_alerts
CREATE INDEX IF NOT EXISTS idx_safety_alerts_project_id ON public.safety_alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_type ON public.safety_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_severity ON public.safety_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_reported_by ON public.safety_alerts(reported_by);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_status ON public.safety_alerts(status);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_incident_number ON public.safety_alerts(incident_number);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_created_at ON public.safety_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_assigned_to ON public.safety_alerts USING GIN(assigned_to);

-- Enable RLS
ALTER TABLE public.safety_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies dla safety_alerts
CREATE POLICY "Users can view safety alerts for their projects" 
ON public.safety_alerts FOR SELECT 
USING (
  auth.uid() = reported_by OR
  auth.uid() = ANY(assigned_to) OR
  -- TODO: Sprawdzenie członkostwa w projekcie
  true
);

CREATE POLICY "Users can create safety alerts" 
ON public.safety_alerts FOR INSERT 
WITH CHECK (auth.uid() = reported_by);

CREATE POLICY "Assigned users can update safety alerts" 
ON public.safety_alerts FOR UPDATE 
USING (
  auth.uid() = reported_by OR 
  auth.uid() = ANY(assigned_to)
)
WITH CHECK (
  auth.uid() = reported_by OR 
  auth.uid() = ANY(assigned_to)
);

COMMENT ON TABLE public.safety_alerts IS 'Alerty bezpieczeństwa i incydenty BHP';

-- ============================================
-- 6. Rozszerzenie istniejącej tabeli messages o kontekst budowlany
-- ============================================
DO $$
BEGIN
  -- Dodaj kolumny do messages jeśli nie istnieją
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'messages' 
    AND column_name = 'project_id'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN project_id UUID;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'messages' 
    AND column_name = 'task_id'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN task_id UUID;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'messages' 
    AND column_name = 'message_type'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN message_type VARCHAR(50) DEFAULT 'message';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'messages' 
    AND column_name = 'location_data'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN location_data JSONB;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'messages' 
    AND column_name = 'priority'
  ) THEN
    ALTER TABLE public.messages ADD COLUMN priority VARCHAR(20) DEFAULT 'normal';
  END IF;
END $$;

-- Dodaj indeksy dla nowych kolumn w messages
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON public.messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_task_id ON public.messages(task_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON public.messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_priority ON public.messages(priority);

COMMIT;

-- STEP 3: Verify results
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'project_messages', 
    'project_chat_groups', 
    'building_notifications', 
    'progress_reports', 
    'safety_alerts'
  )
ORDER BY tablename;

-- Sprawdź czy nowe kolumny zostały dodane do messages
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'messages'
  AND column_name IN ('project_id', 'task_id', 'message_type', 'location_data', 'priority')
ORDER BY column_name;