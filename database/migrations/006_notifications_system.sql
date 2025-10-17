-- ============================================================================
-- FAZA 1 KROK 1.6 - REAL-TIME NOTIFICATIONS SYSTEM
-- Migration: Notifications Tables & Functions
-- Version: 1.0.0
-- Date: October 2025
-- ============================================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS notification_preferences CASCADE;
DROP TABLE IF EXISTS notification_history CASCADE;

-- ============================================================================
-- TABLE: notifications
-- Purpose: Store all user notifications
-- ============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'job_posted', 'application_received', 'application_accepted', 
        'application_rejected', 'payment_received', 'payment_failed',
        'message_received', 'review_received', 'certificate_expiring',
        'system_announcement', 'custom'
    )),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    channels TEXT[] DEFAULT ARRAY['in_app']::TEXT[],
    read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;

-- ============================================================================
-- TABLE: notification_preferences
-- Purpose: User notification settings
-- ============================================================================

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    enabled_channels TEXT[] DEFAULT ARRAY['in_app', 'email']::TEXT[],
    job_notifications BOOLEAN DEFAULT TRUE,
    application_notifications BOOLEAN DEFAULT TRUE,
    payment_notifications BOOLEAN DEFAULT TRUE,
    message_notifications BOOLEAN DEFAULT TRUE,
    marketing_notifications BOOLEAN DEFAULT FALSE,
    do_not_disturb BOOLEAN DEFAULT FALSE,
    dnd_start_time TIME,
    dnd_end_time TIME,
    email_frequency VARCHAR(20) DEFAULT 'immediate' CHECK (email_frequency IN ('immediate', 'hourly', 'daily', 'weekly')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_notification_prefs_user_id ON notification_preferences(user_id);

-- ============================================================================
-- TABLE: notification_history
-- Purpose: Audit trail of sent notifications
-- ============================================================================

CREATE TABLE notification_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'delivered', 'clicked')),
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notification_history_notification_id ON notification_history(notification_id);
CREATE INDEX idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX idx_notification_history_channel ON notification_history(channel);
CREATE INDEX idx_notification_history_status ON notification_history(status);

-- ============================================================================
-- FUNCTION: auto_update_notification_prefs_timestamp
-- Purpose: Update updated_at on preference changes
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_update_notification_prefs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_prefs_timestamp
    BEFORE UPDATE ON notification_preferences
    FOR EACH ROW
    EXECUTE FUNCTION auto_update_notification_prefs_timestamp();

-- ============================================================================
-- FUNCTION: cleanup_expired_notifications
-- Purpose: Delete expired notifications
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: get_unread_notification_count
-- Purpose: Get count of unread notifications for a user
-- ============================================================================

CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = p_user_id
        AND read = FALSE
        AND (expires_at IS NULL OR expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNCTION: mark_notifications_as_read
-- Purpose: Bulk mark notifications as read
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_notifications_as_read(
    p_user_id UUID,
    p_notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    IF p_notification_ids IS NULL THEN
        -- Mark all unread as read
        UPDATE notifications
        SET read = TRUE, read_at = NOW()
        WHERE user_id = p_user_id
        AND read = FALSE;
    ELSE
        -- Mark specific notifications as read
        UPDATE notifications
        SET read = TRUE, read_at = NOW()
        WHERE user_id = p_user_id
        AND id = ANY(p_notification_ids)
        AND read = FALSE;
    END IF;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEW: v_notification_stats
-- Purpose: User notification statistics
-- ============================================================================

CREATE OR REPLACE VIEW v_notification_stats AS
SELECT
    n.user_id,
    COUNT(*) AS total_notifications,
    COUNT(*) FILTER (WHERE n.read = FALSE) AS unread_count,
    COUNT(*) FILTER (WHERE DATE(n.created_at) = CURRENT_DATE) AS today_count,
    COUNT(*) FILTER (WHERE n.priority = 'urgent') AS urgent_count,
    MAX(n.created_at) AS last_notification_at
FROM notifications n
WHERE (n.expires_at IS NULL OR n.expires_at > NOW())
GROUP BY n.user_id;

-- ============================================================================
-- VIEW: v_notification_summary
-- Purpose: Detailed notification summary by type
-- ============================================================================

CREATE OR REPLACE VIEW v_notification_summary AS
SELECT
    n.user_id,
    n.type,
    COUNT(*) AS total,
    COUNT(*) FILTER (WHERE n.read = FALSE) AS unread,
    MAX(n.created_at) AS last_notification
FROM notifications n
WHERE (n.expires_at IS NULL OR n.expires_at > NOW())
GROUP BY n.user_id, n.type;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

-- Notifications: Users can only see their own
CREATE POLICY notifications_select ON notifications
    FOR SELECT
    USING (auth.uid() = user_id);

-- Notifications: System can insert
CREATE POLICY notifications_insert ON notifications
    FOR INSERT
    WITH CHECK (true);

-- Notifications: Users can update their own (mark as read)
CREATE POLICY notifications_update ON notifications
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Notifications: Users can delete their own
CREATE POLICY notifications_delete ON notifications
    FOR DELETE
    USING (auth.uid() = user_id);

-- Notification Preferences: Users can view/edit their own
CREATE POLICY notification_prefs_all ON notification_preferences
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Notification History: Users can view their own
CREATE POLICY notification_history_select ON notification_history
    FOR SELECT
    USING (auth.uid() = user_id);

-- Notification History: System can insert
CREATE POLICY notification_history_insert ON notification_history
    FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notification_preferences TO authenticated;
GRANT SELECT, INSERT ON notification_history TO authenticated;

GRANT SELECT ON v_notification_stats TO authenticated;
GRANT SELECT ON v_notification_summary TO authenticated;

-- ============================================================================
-- REALTIME PUBLICATION
-- Enable real-time for notifications table
-- ============================================================================

-- Add table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================================================================
-- SEED DEFAULT PREFERENCES
-- Create default preferences for existing users
-- ============================================================================

INSERT INTO notification_preferences (user_id, enabled_channels, email_frequency)
SELECT 
    id,
    ARRAY['in_app', 'email']::TEXT[],
    'immediate'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM notification_preferences)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- SCHEDULED CLEANUP
-- Create cron job to cleanup expired notifications (requires pg_cron extension)
-- ============================================================================

-- Note: This requires pg_cron extension to be enabled
-- You can also run this manually or via a backend cron job

-- Example cron job (run daily at 2 AM):
-- SELECT cron.schedule(
--     'cleanup-expired-notifications',
--     '0 2 * * *',
--     'SELECT cleanup_expired_notifications();'
-- );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE notifications IS 'Stores all user notifications with real-time capabilities';
COMMENT ON TABLE notification_preferences IS 'User notification preferences and DND settings';
COMMENT ON TABLE notification_history IS 'Audit trail of notification delivery status';

COMMENT ON FUNCTION cleanup_expired_notifications() IS 'Deletes expired notifications';
COMMENT ON FUNCTION get_unread_notification_count(UUID) IS 'Returns count of unread notifications for user';
COMMENT ON FUNCTION mark_notifications_as_read(UUID, UUID[]) IS 'Bulk mark notifications as read';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ FAZA 1 KROK 1.6 - Notifications System Migration Complete';
    RAISE NOTICE '📬 Created 3 tables';
    RAISE NOTICE '📬 Created 2 views';
    RAISE NOTICE '📬 Created 4 functions';
    RAISE NOTICE '📬 Created 1 trigger';
    RAISE NOTICE '📬 Created 7 RLS policies';
    RAISE NOTICE '📬 Enabled real-time for notifications table';
END $$;
