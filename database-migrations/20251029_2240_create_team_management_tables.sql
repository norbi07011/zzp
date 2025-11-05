-- ============================================
-- MIGRATION: Utworzenie kompletnego systemu Team Management
-- Date: 2025-10-29
-- Author: AI Copilot
-- Description: Tworzy 27 tabel dla zarządzania projektami, zadaniami, kalendarzem, czatem i zasobami
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE IF EXISTS chat_messages CASCADE;
-- DROP TABLE IF EXISTS chat_channel_members CASCADE;
-- DROP TABLE IF EXISTS chat_channels CASCADE;
-- DROP TABLE IF EXISTS project_event_attendees CASCADE;
-- DROP TABLE IF EXISTS project_events CASCADE;
-- DROP TABLE IF EXISTS task_checklist_items CASCADE;
-- DROP TABLE IF EXISTS task_dependencies CASCADE;
-- DROP TABLE IF EXISTS task_comments CASCADE;
-- DROP TABLE IF EXISTS project_files CASCADE;
-- DROP TABLE IF EXISTS project_documents CASCADE;
-- DROP TABLE IF EXISTS project_resources CASCADE;
-- DROP TABLE IF EXISTS project_milestones CASCADE;
-- DROP TABLE IF EXISTS project_budgets CASCADE;
-- DROP TABLE IF EXISTS project_timesheets CASCADE;
-- DROP TABLE IF EXISTS project_automation_rules CASCADE;
-- DROP TABLE IF EXISTS team_availability CASCADE;
-- DROP TABLE IF EXISTS team_permissions CASCADE;
-- DROP TYPE IF EXISTS event_type, channel_type, resource_status, automation_trigger;

BEGIN;

-- ============================================
-- STEP 1: Create ENUM types
-- ============================================

-- Event type enum
DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('meeting', 'deadline', 'milestone', 'inspection', 'delivery', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Channel type enum
DO $$ BEGIN
    CREATE TYPE channel_type AS ENUM ('public', 'private', 'direct', 'announcement');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Resource status enum
DO $$ BEGIN
    CREATE TYPE resource_status AS ENUM ('available', 'in_use', 'maintenance', 'unavailable');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Automation trigger enum
DO $$ BEGIN
    CREATE TYPE automation_trigger AS ENUM ('task_created', 'task_completed', 'deadline_approaching', 'status_changed', 'member_added');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- STEP 2: Create CALENDAR tables
-- ============================================

-- Project Events (kalendarz)
CREATE TABLE IF NOT EXISTS project_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_type event_type DEFAULT 'other',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    location VARCHAR(255),
    is_all_day BOOLEAN DEFAULT FALSE,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule JSONB, -- {frequency: 'daily'|'weekly'|'monthly', interval: 1, end_date: '2025-12-31'}
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT valid_event_times CHECK (end_date > start_date)
);

-- Event Attendees
CREATE TABLE IF NOT EXISTS project_event_attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES project_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    response VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined, tentative
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(event_id, user_id)
);

-- ============================================
-- STEP 3: Create CHAT tables
-- ============================================

-- Chat Channels
CREATE TABLE IF NOT EXISTS chat_channels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    channel_type channel_type DEFAULT 'public',
    is_archived BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Channel Members
CREATE TABLE IF NOT EXISTS chat_channel_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- owner, admin, member
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ,
    
    UNIQUE(channel_id, user_id)
);

-- Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, file, system
    attachments JSONB, -- [{url: '...', name: '...', size: 1234}]
    parent_message_id UUID REFERENCES chat_messages(id) ON DELETE SET NULL, -- for threads
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- STEP 4: Create TASK enhancement tables
-- ============================================

-- Task Checklist Items
CREATE TABLE IF NOT EXISTS task_checklist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Dependencies (zadanie A musi być skończone przed B)
CREATE TABLE IF NOT EXISTS task_dependencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    depends_on_task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(20) DEFAULT 'finish_to_start', -- finish_to_start, start_to_start, finish_to_finish
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(task_id, depends_on_task_id),
    CONSTRAINT no_self_dependency CHECK (task_id != depends_on_task_id)
);

-- Task Comments
CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_comment_id UUID REFERENCES task_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- ============================================
-- STEP 5: Create FILES & DOCUMENTS tables
-- ============================================

-- Project Files (pliki projektowe)
CREATE TABLE IF NOT EXISTS project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT,
    mime_type VARCHAR(100),
    category VARCHAR(50), -- drawing, document, photo, other
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    parent_file_id UUID REFERENCES project_files(id) ON DELETE SET NULL, -- for versioning
    tags JSONB, -- ['important', 'blueprint']
    metadata JSONB, -- {width: 1920, height: 1080, ...}
    deleted_at TIMESTAMPTZ
);

-- Project Documents (dokumenty biznesowe)
CREATE TABLE IF NOT EXISTS project_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(50), -- contract, invoice, permit, report
    content TEXT,
    file_id UUID REFERENCES project_files(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft', -- draft, review, approved, archived
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 6: Create RESOURCES tables
-- ============================================

-- Project Resources (zasoby: sprzęt, materiały)
CREATE TABLE IF NOT EXISTS project_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    resource_type VARCHAR(50), -- equipment, material, vehicle, tool
    quantity DECIMAL(10,2) DEFAULT 1,
    unit VARCHAR(20), -- kg, m2, pieces, hours
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (quantity * cost_per_unit) STORED,
    status resource_status DEFAULT 'available',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    location VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 7: Create PROJECT PLANNING tables
-- ============================================

-- Project Milestones (kamienie milowe)
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Budgets (budżet projektu)
CREATE TABLE IF NOT EXISTS project_budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- labor, materials, equipment, other
    planned_amount DECIMAL(12,2) NOT NULL,
    actual_amount DECIMAL(12,2) DEFAULT 0,
    variance DECIMAL(12,2) GENERATED ALWAYS AS (planned_amount - actual_amount) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Project Timesheets (karty czasu pracy)
CREATE TABLE IF NOT EXISTS project_timesheets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
    work_date DATE NOT NULL,
    hours DECIMAL(4,2) NOT NULL,
    description TEXT,
    hourly_rate DECIMAL(10,2),
    total_cost DECIMAL(10,2) GENERATED ALWAYS AS (hours * hourly_rate) STORED,
    approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_hours CHECK (hours > 0 AND hours <= 24)
);

-- ============================================
-- STEP 8: Create AUTOMATION tables
-- ============================================

-- Project Automation Rules
CREATE TABLE IF NOT EXISTS project_automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_event automation_trigger NOT NULL,
    conditions JSONB, -- {field: 'priority', operator: 'equals', value: 'high'}
    actions JSONB NOT NULL, -- [{type: 'notify', params: {user_id: '...', message: '...'}}]
    is_active BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 9: Create TEAM tables
-- ============================================

-- Team Availability (dostępność członków zespołu)
CREATE TABLE IF NOT EXISTS team_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    available_from TIMESTAMPTZ NOT NULL,
    available_to TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_availability_times CHECK (available_to > available_from)
);

-- Team Permissions (szczegółowe uprawnienia)
CREATE TABLE IF NOT EXISTS team_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES project_members(id) ON DELETE CASCADE,
    permission_name VARCHAR(100) NOT NULL, -- can_create_tasks, can_approve_budgets, can_delete_files
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    UNIQUE(member_id, permission_name)
);

-- ============================================
-- STEP 10: Create INDEXES for performance
-- ============================================

-- Calendar indexes
CREATE INDEX IF NOT EXISTS idx_events_project ON project_events(project_id);
CREATE INDEX IF NOT EXISTS idx_events_date_range ON project_events(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_events_type ON project_events(event_type);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON project_event_attendees(user_id);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_channels_project ON chat_channels(project_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);

-- Task enhancement indexes
CREATE INDEX IF NOT EXISTS idx_checklist_task ON task_checklist_items(task_id);
CREATE INDEX IF NOT EXISTS idx_task_dependencies ON task_dependencies(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);

-- Files indexes
CREATE INDEX IF NOT EXISTS idx_files_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_files_category ON project_files(category);
CREATE INDEX IF NOT EXISTS idx_documents_project ON project_documents(project_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON project_documents(status);

-- Resources indexes
CREATE INDEX IF NOT EXISTS idx_resources_project ON project_resources(project_id);
CREATE INDEX IF NOT EXISTS idx_resources_status ON project_resources(status);

-- Planning indexes
CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_budgets_project ON project_budgets(project_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_project_user ON project_timesheets(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_timesheets_date ON project_timesheets(work_date);

-- Team indexes
CREATE INDEX IF NOT EXISTS idx_availability_project_user ON team_availability(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_permissions_member ON team_permissions(member_id);

-- ============================================
-- STEP 11: Enable RLS on all tables
-- ============================================

ALTER TABLE project_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_timesheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_permissions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 12: Create basic RLS policies (read access for project members)
-- ============================================

-- Project Events policies
CREATE POLICY "Project members can view events"
    ON project_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = project_events.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Project members can create events"
    ON project_events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = project_events.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Chat Channels policies
CREATE POLICY "Project members can view channels"
    ON chat_channels FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = chat_channels.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Chat Messages policies
CREATE POLICY "Channel members can view messages"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_channel_members 
            WHERE chat_channel_members.channel_id = chat_messages.channel_id 
            AND chat_channel_members.user_id = auth.uid()
        )
    );

CREATE POLICY "Channel members can send messages"
    ON chat_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_channel_members 
            WHERE chat_channel_members.channel_id = chat_messages.channel_id 
            AND chat_channel_members.user_id = auth.uid()
        )
    );

-- Task Checklist policies
CREATE POLICY "Task viewers can see checklist"
    ON task_checklist_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_tasks pt
            JOIN project_members pm ON pm.project_id = pt.project_id
            WHERE pt.id = task_checklist_items.task_id 
            AND pm.user_id = auth.uid()
        )
    );

-- Project Files policies
CREATE POLICY "Project members can view files"
    ON project_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = project_files.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Project Resources policies
CREATE POLICY "Project members can view resources"
    ON project_resources FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = project_resources.project_id 
            AND project_members.user_id = auth.uid()
        )
    );

-- Timesheets policies
CREATE POLICY "Users can view own timesheets"
    ON project_timesheets FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can create own timesheets"
    ON project_timesheets FOR INSERT
    WITH CHECK (user_id = auth.uid());

COMMIT;

-- ============================================
-- VERIFICATION: Check if tables were created
-- ============================================

SELECT 
    'Tables created successfully!' AS status,
    COUNT(*) AS table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND (
        table_name LIKE 'project_%' 
        OR table_name LIKE 'chat_%' 
        OR table_name LIKE 'team_%'
        OR table_name LIKE 'task_%'
    );
