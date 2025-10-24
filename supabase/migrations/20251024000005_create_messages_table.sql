-- ===================================================================
-- MIGRATION: Create MESSAGES table
-- Priority: P0 - CRITICAL
-- Description: Messaging system between workers and employers
-- ===================================================================

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Message content
  subject TEXT,
  content TEXT NOT NULL,
  
  -- Read status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  
  -- Optional job context
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  
  -- Attachments
  attachments TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(recipient_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_job ON messages(job_id) WHERE job_id IS NOT NULL;

-- Create function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_as_read()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.read = true AND OLD.read = false THEN
        NEW.read_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mark_message_as_read ON messages;
CREATE TRIGGER trigger_mark_message_as_read
    BEFORE UPDATE ON messages
    FOR EACH ROW
    EXECUTE FUNCTION mark_message_as_read();

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view messages where they are sender or recipient
CREATE POLICY "Users can view their messages"
    ON messages FOR SELECT
    USING (
        sender_id = auth.uid()
        OR recipient_id = auth.uid()
    );

-- Users can send messages
CREATE POLICY "Users can send messages"
    ON messages FOR INSERT
    WITH CHECK (sender_id = auth.uid());

-- Users can update their received messages (mark as read)
CREATE POLICY "Users can update received messages"
    ON messages FOR UPDATE
    USING (recipient_id = auth.uid());

-- Users can delete their sent messages
CREATE POLICY "Users can delete sent messages"
    ON messages FOR DELETE
    USING (sender_id = auth.uid());

-- Admins can do everything
CREATE POLICY "Admins can do everything with messages"
    ON messages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Add comments
COMMENT ON TABLE messages IS 'Messaging system between users (workers, employers, admins)';
COMMENT ON COLUMN messages.read IS 'Whether the recipient has read this message';
COMMENT ON COLUMN messages.job_id IS 'Optional reference to related job posting';
COMMENT ON COLUMN messages.attachments IS 'Array of attachment URLs';

-- Create helper function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(user_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM messages
    WHERE recipient_id = user_id
    AND read = false;
$$ LANGUAGE SQL STABLE;

COMMENT ON FUNCTION get_unread_message_count IS 'Get count of unread messages for a user';
