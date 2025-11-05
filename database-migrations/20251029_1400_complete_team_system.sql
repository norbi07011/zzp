-- ============================================
-- MIGRATION: Complete Team System - Finalizacja systemu zespołowego
-- Date: 2025-10-29
-- Purpose: Dodanie brakujących tabel dla pełnej funkcjonalności
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE IF EXISTS project_chat_messages CASCADE;
-- DROP TABLE IF EXISTS project_members CASCADE;
-- DROP TYPE IF EXISTS member_role CASCADE;

-- ============================================
-- STEP 1: Create member_role ENUM
-- ============================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'member_role') THEN
        CREATE TYPE member_role AS ENUM (
            'owner',           -- właściciel projektu
            'manager',         -- menadżer (może wszystko oprócz usunięcia projektu)
            'member',          -- zwykły członek (może edytować/tworzyć)
            'viewer',          -- tylko podgląd
            'guest'            -- gość czasowy
        );
    END IF;
END $$;

-- ============================================
-- STEP 2: Create project_members table
-- ============================================

CREATE TABLE IF NOT EXISTS project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role member_role NOT NULL DEFAULT 'member',
    
    -- Metadata
    joined_at TIMESTAMPTZ DEFAULT now(),
    invited_by UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Constraints
    UNIQUE(project_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_active ON project_members(is_active) WHERE is_active = true;

-- ============================================
-- STEP 3: Create project_chat_messages table
-- ============================================

CREATE TABLE IF NOT EXISTS project_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Message content
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text', -- text, image, file, system
    
    -- Attachments
    attachments JSONB DEFAULT '[]'::jsonb,
    
    -- Mentions and reactions
    mentions UUID[] DEFAULT '{}',
    reactions JSONB DEFAULT '{}'::jsonb,
    
    -- Thread support
    parent_message_id UUID REFERENCES project_chat_messages(id) ON DELETE CASCADE,
    thread_count INTEGER DEFAULT 0,
    
    -- Status
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    is_deleted BOOLEAN DEFAULT false,
    deleted_at TIMESTAMPTZ,
    is_pinned BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_project ON project_chat_messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON project_chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_parent ON project_chat_messages(parent_message_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_pinned ON project_chat_messages(is_pinned) WHERE is_pinned = true;

-- ============================================
-- STEP 4: Add RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_chat_messages ENABLE ROW LEVEL SECURITY;

-- Project Members Policies
CREATE POLICY "project_members_select"
ON project_members FOR SELECT
TO public
USING (
    -- Widzi członków projektów do których należy
    project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
    OR
    -- Albo jest właścicielem projektu
    project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "project_members_insert"
ON project_members FOR INSERT
TO public
WITH CHECK (
    -- Tylko właściciel lub manager może dodawać członków
    project_id IN (
        SELECT pm.project_id 
        FROM project_members pm
        WHERE pm.user_id = auth.uid() 
        AND pm.role IN ('owner', 'manager')
    )
    OR
    project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "project_members_update"
ON project_members FOR UPDATE
TO public
USING (
    project_id IN (
        SELECT pm.project_id 
        FROM project_members pm
        WHERE pm.user_id = auth.uid() 
        AND pm.role IN ('owner', 'manager')
    )
);

CREATE POLICY "project_members_delete"
ON project_members FOR DELETE
TO public
USING (
    project_id IN (
        SELECT pm.project_id 
        FROM project_members pm
        WHERE pm.user_id = auth.uid() 
        AND pm.role IN ('owner', 'manager')
    )
);

-- Chat Messages Policies
CREATE POLICY "chat_messages_select"
ON project_chat_messages FOR SELECT
TO public
USING (
    -- Widzi wiadomości z projektów do których należy
    project_id IN (
        SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
    OR
    project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
    )
);

CREATE POLICY "chat_messages_insert"
ON project_chat_messages FOR INSERT
TO public
WITH CHECK (
    -- Może pisać jeśli jest członkiem (nie viewer/guest)
    user_id = auth.uid()
    AND
    project_id IN (
        SELECT pm.project_id 
        FROM project_members pm
        WHERE pm.user_id = auth.uid() 
        AND pm.role IN ('owner', 'manager', 'member')
    )
);

CREATE POLICY "chat_messages_update"
ON project_chat_messages FOR UPDATE
TO public
USING (
    -- Może edytować tylko swoje wiadomości
    user_id = auth.uid()
);

CREATE POLICY "chat_messages_delete"
ON project_chat_messages FOR DELETE
TO public
USING (
    -- Może usuwać swoje lub jeśli jest owner/manager
    user_id = auth.uid()
    OR
    project_id IN (
        SELECT pm.project_id 
        FROM project_members pm
        WHERE pm.user_id = auth.uid() 
        AND pm.role IN ('owner', 'manager')
    )
);

-- ============================================
-- STEP 5: Create triggers for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_project_members_updated_at ON project_members;
CREATE TRIGGER update_project_members_updated_at
    BEFORE UPDATE ON project_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON project_chat_messages;
CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON project_chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 6: Add initial data for existing projects
-- ============================================

-- Dodaj właścicieli projektów jako members
INSERT INTO project_members (project_id, user_id, role, invited_by)
SELECT 
    id as project_id,
    owner_id as user_id,
    'owner'::member_role as role,
    owner_id as invited_by
FROM projects
WHERE NOT EXISTS (
    SELECT 1 FROM project_members pm 
    WHERE pm.project_id = projects.id 
    AND pm.user_id = projects.owner_id
);

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Migration completed successfully!' as status;

-- Show tables
SELECT 
    table_name,
    'CREATED' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('project_members', 'project_chat_messages')
ORDER BY table_name;

-- Show member counts
SELECT 
    'project_members' as table_name,
    count(*) as row_count
FROM project_members
UNION ALL
SELECT 
    'project_chat_messages',
    count(*)
FROM project_chat_messages;