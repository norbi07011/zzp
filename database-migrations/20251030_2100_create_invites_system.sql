-- ============================================
-- MIGRATION: System Zaproszeń (Invites)
-- Date: 2025-10-30
-- Author: AI Copilot
-- Description: Tworzy system zaproszeń do projektów/grup
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE IF EXISTS project_invites CASCADE;
-- DROP TYPE IF EXISTS invite_status;

-- ============================================
-- STEP 1: Create ENUM for invite status
-- ============================================

DO $$ BEGIN
    CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- STEP 2: Create project_invites table
-- ============================================

CREATE TABLE IF NOT EXISTS project_invites (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Relations
    project_id UUID NOT NULL REFERENCES communication_projects(id) ON DELETE CASCADE,
    inviter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    invitee_email TEXT NOT NULL,
    invitee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Invite details
    role TEXT NOT NULL DEFAULT 'member',
    status invite_status NOT NULL DEFAULT 'pending',
    
    -- Permissions flags (same as project_members)
    can_invite BOOLEAN DEFAULT false,
    can_manage_project BOOLEAN DEFAULT false,
    can_view_reports BOOLEAN DEFAULT false,
    
    -- Optional message from inviter
    invite_message TEXT,
    
    -- Token for email confirmation
    invite_token TEXT UNIQUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ,
    
    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (invitee_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_role CHECK (role IN ('owner', 'admin', 'manager', 'member', 'viewer', 'supervisor'))
);

-- ============================================
-- STEP 3: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_project_invites_project_id ON project_invites(project_id);
CREATE INDEX IF NOT EXISTS idx_project_invites_inviter_id ON project_invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_project_invites_invitee_email ON project_invites(invitee_email);
CREATE INDEX IF NOT EXISTS idx_project_invites_invitee_id ON project_invites(invitee_id) WHERE invitee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_project_invites_status ON project_invites(status);
CREATE INDEX IF NOT EXISTS idx_project_invites_token ON project_invites(invite_token) WHERE invite_token IS NOT NULL;

-- ============================================
-- STEP 4: Add RLS (Row Level Security)
-- ============================================

ALTER TABLE project_invites ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see invites they sent
CREATE POLICY "Users can view their sent invites"
    ON project_invites FOR SELECT
    USING (auth.uid() = inviter_id);

-- Policy: Users can see invites sent to them (by email or user_id)
CREATE POLICY "Users can view invites sent to them"
    ON project_invites FOR SELECT
    USING (
        auth.uid() = invitee_id 
        OR 
        (SELECT email FROM auth.users WHERE id = auth.uid()) = invitee_email
    );

-- Policy: Project members can see all invites for their project
CREATE POLICY "Project members can view project invites"
    ON project_invites FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_members.project_id = project_invites.project_id
            AND project_members.user_id = auth.uid()
        )
    );

-- Policy: Users with can_invite permission can create invites
CREATE POLICY "Users with permission can create invites"
    ON project_invites FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM project_members
            WHERE project_members.project_id = project_invites.project_id
            AND project_members.user_id = auth.uid()
            AND (project_members.can_invite = true OR project_members.role IN ('owner', 'admin'))
        )
    );

-- Policy: Invitees can update their own invites (accept/reject)
CREATE POLICY "Invitees can update their invites"
    ON project_invites FOR UPDATE
    USING (
        auth.uid() = invitee_id 
        OR 
        (SELECT email FROM auth.users WHERE id = auth.uid()) = invitee_email
    )
    WITH CHECK (
        auth.uid() = invitee_id 
        OR 
        (SELECT email FROM auth.users WHERE id = auth.uid()) = invitee_email
    );

-- Policy: Inviters can delete their own invites (cancel)
CREATE POLICY "Inviters can delete their invites"
    ON project_invites FOR DELETE
    USING (auth.uid() = inviter_id);

-- ============================================
-- STEP 5: Create function to auto-expire invites
-- ============================================

CREATE OR REPLACE FUNCTION expire_old_invites()
RETURNS void AS $$
BEGIN
    UPDATE project_invites
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- STEP 6: Create trigger to set invitee_id when user accepts
-- ============================================

CREATE OR REPLACE FUNCTION set_invitee_id_on_accept()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
        -- Set accepted_at timestamp
        NEW.accepted_at = NOW();
        
        -- If invitee_id is not set, try to find user by email
        IF NEW.invitee_id IS NULL THEN
            SELECT id INTO NEW.invitee_id
            FROM auth.users
            WHERE email = NEW.invitee_email
            LIMIT 1;
        END IF;
        
        -- Auto-add user to project_members
        IF NEW.invitee_id IS NOT NULL THEN
            INSERT INTO project_members (
                project_id,
                user_id,
                role,
                can_invite,
                can_manage_project,
                can_view_reports
            )
            VALUES (
                NEW.project_id,
                NEW.invitee_id,
                NEW.role,
                NEW.can_invite,
                NEW.can_manage_project,
                NEW.can_view_reports
            )
            ON CONFLICT (project_id, user_id) DO NOTHING;
        END IF;
    END IF;
    
    IF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
        NEW.rejected_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_invitee_id_on_accept
    BEFORE UPDATE ON project_invites
    FOR EACH ROW
    EXECUTE FUNCTION set_invitee_id_on_accept();

-- ============================================
-- STEP 7: Create helper function to generate invite token
-- ============================================

CREATE OR REPLACE FUNCTION generate_invite_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'project_invites'
) AS table_exists;

-- Check ENUM type
SELECT EXISTS (
    SELECT FROM pg_type 
    WHERE typname = 'invite_status'
) AS enum_exists;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'project_invites';

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'project_invites';

-- Count indexes
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE tablename = 'project_invites';

-- ============================================
-- EXAMPLE USAGE
-- ============================================

-- Generate invite token
-- SELECT generate_invite_token();

-- Create invite
-- INSERT INTO project_invites (project_id, inviter_id, invitee_email, role, invite_token)
-- VALUES (
--     '8e26765d-3fca-45c5-b51f-79df1411c19f',
--     'e15f1bef-4268-49c4-ad4f-788494342b9d',
--     'worker@example.com',
--     'member',
--     generate_invite_token()
-- );

-- Accept invite
-- UPDATE project_invites
-- SET status = 'accepted', invitee_id = 'user-uuid-here'
-- WHERE id = 'invite-uuid-here';

-- Expire old invites (run periodically)
-- SELECT expire_old_invites();
