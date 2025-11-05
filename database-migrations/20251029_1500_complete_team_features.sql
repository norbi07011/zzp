-- ============================================
-- COMPLETE TEAM SYSTEM - Full Implementation
-- Date: 2025-10-29
-- Purpose: Pełna implementacja systemu zespołowego według planu
-- ============================================

-- ============================================
-- PART 1: ROZSZERZENIE PROJECT_TASKS
-- ============================================

-- Dodaj kolumny dla zaawansowanych features
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS building_address TEXT;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS room_floor TEXT;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS area_m2 DECIMAL(10,2);
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS color_paint TEXT;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS client_order_number TEXT;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS parent_task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS is_subtask BOOLEAN DEFAULT false;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100);
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT false;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT; -- daily, weekly, monthly
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS requires_photo_proof BOOLEAN DEFAULT false;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS photo_proof_url TEXT;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS geo_lat DECIMAL(10, 8);
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS geo_lng DECIMAL(11, 8);
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS geo_timestamp TIMESTAMPTZ;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS voice_note_url TEXT;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS voice_note_transcription TEXT;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS client_signature_url TEXT;
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS sla_hours INTEGER; -- czas na wykonanie w godzinach
ALTER TABLE project_tasks ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'low'; -- low, medium, high

-- ============================================
-- PART 2: TASK DEPENDENCIES (zależności)
-- ============================================

CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    dependency_type TEXT DEFAULT 'finish_to_start', -- finish_to_start, start_to_start, etc
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(task_id, depends_on_task_id),
    CHECK (task_id != depends_on_task_id)
);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_task ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends ON task_dependencies(depends_on_task_id);

-- ============================================
-- PART 3: TASK CHECKLISTS (checklisty)
-- ============================================

CREATE TABLE IF NOT EXISTS task_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    item_text TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id),
    sort_order INTEGER DEFAULT 0,
    requires_proof BOOLEAN DEFAULT false,
    proof_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_checklists_task ON task_checklists(task_id, sort_order);

-- ============================================
-- PART 4: TASK TEMPLATES (szablony SOP)
-- ============================================

CREATE TABLE IF NOT EXISTS task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- "painting", "construction", "inspection"
    default_priority TEXT DEFAULT 'medium',
    estimated_hours INTEGER,
    checklist_items JSONB DEFAULT '[]'::jsonb,
    required_fields JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_task_templates_category ON task_templates(category) WHERE is_active = true;

-- ============================================
-- PART 5: ROZSZERZENIE EVENTS - Availability & Resources
-- ============================================

-- Dodaj kolumny dla zaawansowanych features kalendarza
ALTER TABLE project_events ADD COLUMN IF NOT EXISTS is_all_day BOOLEAN DEFAULT false;
ALTER TABLE project_events ADD COLUMN IF NOT EXISTS recurrence_rule TEXT; -- RFC 5545 RRULE
ALTER TABLE project_events ADD COLUMN IF NOT EXISTS recurrence_exception_dates JSONB DEFAULT '[]'::jsonb;
ALTER TABLE project_events ADD COLUMN IF NOT EXISTS location_address TEXT;
ALTER TABLE project_events ADD COLUMN IF NOT EXISTS location_geo_lat DECIMAL(10, 8);
ALTER TABLE project_events ADD COLUMN IF NOT EXISTS location_geo_lng DECIMAL(11, 8);
ALTER TABLE project_events ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE project_events ADD COLUMN IF NOT EXISTS meeting_url TEXT;
ALTER TABLE project_events ADD COLUMN IF NOT EXISTS reminder_minutes_before INTEGER DEFAULT 30;
ALTER TABLE project_events ADD COLUMN IF NOT EXISTS color_hex TEXT DEFAULT '#3B82F6';

-- ============================================
-- PART 6: RESOURCE BOOKING (sprzęt, samochody)
-- ============================================

CREATE TABLE IF NOT EXISTS project_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- equipment, vehicle, room, tool
    description TEXT,
    is_available BOOLEAN DEFAULT true,
    current_location TEXT,
    owner_user_id UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS resource_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES project_resources(id) ON DELETE CASCADE,
    event_id UUID REFERENCES project_events(id) ON DELETE CASCADE,
    booked_by UUID NOT NULL REFERENCES auth.users(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    purpose TEXT,
    status TEXT DEFAULT 'confirmed', -- confirmed, cancelled
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_resource_bookings_resource ON resource_bookings(resource_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_resource_bookings_event ON resource_bookings(event_id);

-- ============================================
-- PART 7: TEAM AVAILABILITY (dostępność)
-- ============================================

CREATE TABLE IF NOT EXISTS team_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_team_availability_user ON team_availability(user_id, day_of_week);

-- ============================================
-- PART 8: AUTOMATION RULES (automatyzacje)
-- ============================================

CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT NOT NULL, -- task_status_change, task_deadline, task_overdue
    trigger_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
    action_type TEXT NOT NULL, -- send_notification, require_photo, assign_user, create_task
    action_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_project ON automation_rules(project_id) WHERE is_active = true;

-- ============================================
-- PART 9: WEBHOOKS (integracje)
-- ============================================

CREATE TABLE IF NOT EXISTS project_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    webhook_url TEXT NOT NULL,
    secret_key TEXT,
    event_types TEXT[] DEFAULT '{}', -- task_completed, project_milestone, etc
    is_active BOOLEAN DEFAULT true,
    last_triggered_at TIMESTAMPTZ,
    last_response_status INTEGER,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_webhooks_project ON project_webhooks(project_id) WHERE is_active = true;

-- ============================================
-- PART 10: PROJECT TEMPLATES (szablony grup)
-- ============================================

CREATE TABLE IF NOT EXISTS project_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    template_config JSONB NOT NULL DEFAULT '{}'::jsonb, -- struktura zadań, eventów, etc
    default_tasks JSONB DEFAULT '[]'::jsonb,
    default_events JSONB DEFAULT '[]'::jsonb,
    default_roles JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_templates_category ON project_templates(category) WHERE is_public = true;

-- ============================================
-- PART 11: ANALYTICS & KPI
-- ============================================

CREATE TABLE IF NOT EXISTS project_kpi_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    in_progress_tasks INTEGER DEFAULT 0,
    blocked_tasks INTEGER DEFAULT 0,
    overdue_tasks INTEGER DEFAULT 0,
    avg_completion_time_hours DECIMAL(10,2),
    team_utilization_percentage DECIMAL(5,2),
    budget_used_percentage DECIMAL(5,2),
    client_satisfaction_score DECIMAL(3,2),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_kpi_snapshots_project_date ON project_kpi_snapshots(project_id, snapshot_date DESC);

-- ============================================
-- PART 12: TAGS & LABELS (etykiety)
-- ============================================

CREATE TABLE IF NOT EXISTS project_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color_hex TEXT DEFAULT '#6B7280',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(project_id, name)
);

CREATE TABLE IF NOT EXISTS task_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES project_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(task_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_task_tags_task ON task_tags(task_id);
CREATE INDEX IF NOT EXISTS idx_task_tags_tag ON task_tags(tag_id);

-- ============================================
-- PART 13: AUDIT LOG ENHANCEMENT
-- ============================================

ALTER TABLE project_activity_log ADD COLUMN IF NOT EXISTS ip_address INET;
ALTER TABLE project_activity_log ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE project_activity_log ADD COLUMN IF NOT EXISTS changes_before JSONB;
ALTER TABLE project_activity_log ADD COLUMN IF NOT EXISTS changes_after JSONB;

-- ============================================
-- PART 14: ACCOUNTANT PROFILE & INTEGRATION
-- ============================================

-- Upewnij się że tabela accountants istnieje
CREATE TABLE IF NOT EXISTS accountants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name TEXT,
    tax_number TEXT,
    specializations TEXT[] DEFAULT '{}',
    hourly_rate DECIMAL(10,2),
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Dodaj accountant do project_members jeśli nie ma
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'project_members' 
        AND column_name = 'accountant_id'
    ) THEN
        ALTER TABLE project_members ADD COLUMN accountant_id UUID REFERENCES accountants(id);
    END IF;
END $$;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Complete team system migration finished!' as status;

-- Count tables
SELECT 
    'Tables created/updated' as info,
    COUNT(*) as count
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'project_tasks', 'task_dependencies', 'task_checklists', 'task_templates',
    'project_resources', 'resource_bookings', 'team_availability',
    'automation_rules', 'project_webhooks', 'project_templates',
    'project_kpi_snapshots', 'project_tags', 'task_tags', 'accountants'
);