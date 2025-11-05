-- ============================================
-- MIGRATION: Add Chat System Only
-- Date: 2025-10-29
-- Purpose: Dodanie chatu grupowego (project_members już istnieje)
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE IF EXISTS project_chat_messages CASCADE;

-- ============================================
-- STEP 1: Create project_chat_messages table
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
-- STEP 2: Add RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE project_chat_messages ENABLE ROW LEVEL SECURITY;

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
    -- Może pisać jeśli jest członkiem projektu
    user_id = auth.uid()
    AND
    (
        project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        )
        OR
        project_id IN (
            SELECT id FROM projects WHERE owner_id = auth.uid()
        )
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
    -- Może usuwać swoje lub jeśli jest owner projektu
    user_id = auth.uid()
    OR
    project_id IN (
        SELECT id FROM projects WHERE owner_id = auth.uid()
    )
);

-- ============================================
-- STEP 3: Create trigger for updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_chat_messages_updated_at ON project_chat_messages;
CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON project_chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'Chat system migration completed successfully!' as status;

-- Show table
SELECT 
    table_name,
    'CREATED' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'project_chat_messages';

-- Show count
SELECT 
    'project_chat_messages' as table_name,
    count(*) as row_count
FROM project_chat_messages;