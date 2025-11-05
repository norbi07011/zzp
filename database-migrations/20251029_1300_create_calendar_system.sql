-- ============================================
-- MIGRATION: System kalendarza - pełna implementacja
-- Date: 2025-10-29
-- Purpose: Utworzenie kompletnego systemu zarządzania eventami
-- ============================================

-- ROLLBACK PLAN:
-- DROP TABLE IF EXISTS event_notifications CASCADE;
-- DROP TABLE IF EXISTS event_participants CASCADE;
-- DROP TABLE IF EXISTS project_events CASCADE;
-- DROP TYPE IF EXISTS event_type CASCADE;
-- DROP TYPE IF EXISTS event_status CASCADE;
-- DROP TYPE IF EXISTS attendance_status CASCADE;

-- ============================================
-- STEP 1: Create ENUMS for event system
-- ============================================

-- Event type enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_type') THEN
        CREATE TYPE event_type AS ENUM (
            'meeting',          -- spotkania zespołu
            'deadline',         -- deadline zadania/projektu
            'inspection',       -- kontrole i inspekcje
            'delivery',         -- dostawy materiałów
            'milestone',        -- kamienie milowe projektu
            'safety_check',     -- kontrole bezpieczeństwa
            'client_meeting',   -- spotkania z klientem
            'training',         -- szkolenia
            'other'             -- inne wydarzenia
        );
    END IF;
END $$;

-- Event status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
        CREATE TYPE event_status AS ENUM (
            'planned',          -- zaplanowane
            'confirmed',        -- potwierdzone
            'in_progress',      -- w trakcie
            'completed',        -- zakończone
            'cancelled',        -- anulowane
            'postponed'         -- przełożone
        );
    END IF;
END $$;

-- Attendance status enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status') THEN
        CREATE TYPE attendance_status AS ENUM (
            'invited',          -- zaproszony
            'accepted',         -- przyjął zaproszenie
            'declined',         -- odrzucił zaproszenie
            'tentative',        -- niepewny
            'attended',         -- uczestniczył
            'absent'            -- nieobecny
        );
    END IF;
END $$;

-- ============================================
-- STEP 2: Create main events table
-- ============================================

CREATE TABLE IF NOT EXISTS project_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Project reference
    project_id UUID NOT NULL REFERENCES communication_projects(id) ON DELETE CASCADE,
    
    -- Event basic info
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Event classification
    event_type event_type NOT NULL DEFAULT 'meeting',
    status event_status DEFAULT 'planned',
    
    -- Timing
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ,
    all_day BOOLEAN DEFAULT FALSE,
    timezone VARCHAR(50) DEFAULT 'Europe/Amsterdam',
    
    -- Location
    location TEXT,
    location_type VARCHAR(50) DEFAULT 'physical', -- physical, online, hybrid
    meeting_url TEXT, -- for online meetings
    
    -- Organizer and creation
    organized_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Task integration
    related_task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern JSONB, -- stores recurrence rules (daily, weekly, monthly, etc.)
    recurrence_end_date TIMESTAMPTZ,
    parent_event_id UUID REFERENCES project_events(id) ON DELETE CASCADE, -- for recurring events
    
    -- Settings
    requires_confirmation BOOLEAN DEFAULT FALSE,
    send_reminders BOOLEAN DEFAULT TRUE,
    reminder_minutes INTEGER[] DEFAULT ARRAY[15, 60, 1440], -- 15min, 1h, 1day before
    
    -- Meeting specific
    agenda TEXT,
    meeting_notes TEXT,
    meeting_recording_url TEXT,
    
    -- Metadata
    tags TEXT[], -- array of tags for categorization
    custom_fields JSONB, -- for additional project-specific data
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Soft delete
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_date_range CHECK (end_date IS NULL OR end_date >= start_date),
    CONSTRAINT valid_meeting_url CHECK (
        (location_type = 'online' AND meeting_url IS NOT NULL) OR
        (location_type != 'online')
    )
);

-- ============================================
-- STEP 3: Create event participants table
-- ============================================

CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    event_id UUID NOT NULL REFERENCES project_events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Participation details
    attendance_status attendance_status DEFAULT 'invited',
    role VARCHAR(50) DEFAULT 'participant', -- organizer, presenter, participant, optional
    
    -- Response tracking
    response_date TIMESTAMPTZ,
    response_note TEXT,
    
    -- Attendance tracking
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    
    -- Notifications
    notification_preferences JSONB DEFAULT '{"email": true, "in_app": true, "sms": false}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint
    UNIQUE(event_id, user_id)
);

-- ============================================
-- STEP 4: Create event notifications table
-- ============================================

CREATE TABLE IF NOT EXISTS event_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    event_id UUID NOT NULL REFERENCES project_events(id) ON DELETE CASCADE,
    participant_id UUID REFERENCES event_participants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Notification details
    notification_type VARCHAR(50) NOT NULL, -- reminder, invitation, update, cancellation
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    
    -- Content
    subject VARCHAR(255),
    message TEXT,
    
    -- Delivery channels
    email_sent BOOLEAN DEFAULT FALSE,
    push_sent BOOLEAN DEFAULT FALSE,
    sms_sent BOOLEAN DEFAULT FALSE,
    in_app_read BOOLEAN DEFAULT FALSE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, sent, failed, cancelled
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- STEP 5: Create indexes for performance
-- ============================================

-- Project events indexes
CREATE INDEX IF NOT EXISTS idx_project_events_project_id ON project_events(project_id);
CREATE INDEX IF NOT EXISTS idx_project_events_organized_by ON project_events(organized_by);
CREATE INDEX IF NOT EXISTS idx_project_events_created_by ON project_events(created_by);
CREATE INDEX IF NOT EXISTS idx_project_events_start_date ON project_events(start_date);
CREATE INDEX IF NOT EXISTS idx_project_events_end_date ON project_events(end_date);
CREATE INDEX IF NOT EXISTS idx_project_events_status ON project_events(status);
CREATE INDEX IF NOT EXISTS idx_project_events_type ON project_events(event_type);
CREATE INDEX IF NOT EXISTS idx_project_events_related_task ON project_events(related_task_id);
CREATE INDEX IF NOT EXISTS idx_project_events_active ON project_events(project_id, start_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_project_events_recurring ON project_events(parent_event_id) WHERE is_recurring = TRUE;

-- Event participants indexes
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON event_participants(attendance_status);

-- Event notifications indexes
CREATE INDEX IF NOT EXISTS idx_event_notifications_event_id ON event_notifications(event_id);
CREATE INDEX IF NOT EXISTS idx_event_notifications_user_id ON event_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_event_notifications_scheduled_at ON event_notifications(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_event_notifications_status ON event_notifications(status);
CREATE INDEX IF NOT EXISTS idx_event_notifications_pending ON event_notifications(scheduled_at, status) WHERE status = 'scheduled';

-- ============================================
-- STEP 6: Create RLS policies
-- ============================================

-- Enable RLS
ALTER TABLE project_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_notifications ENABLE ROW LEVEL SECURITY;

-- Project events policies
CREATE POLICY "Users can view events in their projects" ON project_events
    FOR SELECT USING (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create events in their projects" ON project_events
    FOR INSERT WITH CHECK (
        project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid()
        )
        AND created_by = auth.uid()
    );

CREATE POLICY "Users can update events they organize or in their projects" ON project_events
    FOR UPDATE USING (
        organized_by = auth.uid() 
        OR project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() 
            AND role IN ('supervisor', 'accountant')
        )
    );

CREATE POLICY "Users can delete events they organize" ON project_events
    FOR DELETE USING (
        organized_by = auth.uid() 
        OR project_id IN (
            SELECT project_id FROM project_members 
            WHERE user_id = auth.uid() 
            AND role IN ('supervisor', 'accountant')
        )
    );

-- Event participants policies
CREATE POLICY "Users can view participants of accessible events" ON event_participants
    FOR SELECT USING (
        event_id IN (
            SELECT id FROM project_events 
            WHERE project_id IN (
                SELECT project_id FROM project_members 
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage participants of events they organize" ON event_participants
    FOR INSERT WITH CHECK (
        event_id IN (
            SELECT id FROM project_events 
            WHERE organized_by = auth.uid()
        )
    );

CREATE POLICY "Users can update their own participation" ON event_participants
    FOR UPDATE USING (
        user_id = auth.uid() 
        OR event_id IN (
            SELECT id FROM project_events 
            WHERE organized_by = auth.uid()
        )
    );

CREATE POLICY "Users can delete participants if they organize the event" ON event_participants
    FOR DELETE USING (
        event_id IN (
            SELECT id FROM project_events 
            WHERE organized_by = auth.uid()
        )
    );

-- Event notifications policies
CREATE POLICY "Users can view their own notifications" ON event_notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON event_notifications
    FOR INSERT WITH CHECK (true); -- Allow system to create notifications

CREATE POLICY "Users can update their notification read status" ON event_notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- STEP 7: Create updated_at triggers
-- ============================================

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_project_events_updated_at ON project_events;
CREATE TRIGGER update_project_events_updated_at 
    BEFORE UPDATE ON project_events 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_participants_updated_at ON event_participants;
CREATE TRIGGER update_event_participants_updated_at 
    BEFORE UPDATE ON event_participants 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_event_notifications_updated_at ON event_notifications;
CREATE TRIGGER update_event_notifications_updated_at 
    BEFORE UPDATE ON event_notifications 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- STEP 8: Create functions for event automation
-- ============================================

-- Function to automatically create event notifications
CREATE OR REPLACE FUNCTION create_event_reminders()
RETURNS TRIGGER AS $$
DECLARE
    participant_record RECORD;
    reminder_time INTEGER;
    notification_time TIMESTAMPTZ;
BEGIN
    -- Only create reminders for confirmed events with reminders enabled
    IF NEW.status = 'confirmed' AND NEW.send_reminders = TRUE THEN
        -- Create reminders for each participant
        FOR participant_record IN 
            SELECT * FROM event_participants 
            WHERE event_id = NEW.id 
            AND attendance_status IN ('accepted', 'tentative')
        LOOP
            -- Create reminders based on reminder_minutes array
            FOREACH reminder_time IN ARRAY NEW.reminder_minutes
            LOOP
                notification_time := NEW.start_date - (reminder_time || ' minutes')::INTERVAL;
                
                -- Only create future reminders
                IF notification_time > NOW() THEN
                    INSERT INTO event_notifications (
                        event_id,
                        participant_id,
                        user_id,
                        notification_type,
                        scheduled_at,
                        subject,
                        message
                    ) VALUES (
                        NEW.id,
                        participant_record.id,
                        participant_record.user_id,
                        'reminder',
                        notification_time,
                        'Reminder: ' || NEW.title,
                        'You have an upcoming event: ' || NEW.title || ' starting at ' || NEW.start_date
                    );
                END IF;
            END LOOP;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for automatic reminder creation
DROP TRIGGER IF EXISTS create_event_reminders_trigger ON project_events;
CREATE TRIGGER create_event_reminders_trigger 
    AFTER INSERT OR UPDATE ON project_events 
    FOR EACH ROW EXECUTE PROCEDURE create_event_reminders();

-- Function to validate event participants are project members
CREATE OR REPLACE FUNCTION validate_event_participant()
RETURNS TRIGGER AS $$
DECLARE
    event_project_id UUID;
BEGIN
    -- Get the project_id for this event
    SELECT project_id INTO event_project_id 
    FROM project_events 
    WHERE id = NEW.event_id;
    
    -- Check if user is a member of the project
    IF NOT EXISTS (
        SELECT 1 FROM project_members 
        WHERE project_id = event_project_id 
        AND user_id = NEW.user_id
    ) THEN
        RAISE EXCEPTION 'User % is not a member of project %', NEW.user_id, event_project_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for participant validation
DROP TRIGGER IF EXISTS validate_event_participant_trigger ON event_participants;
CREATE TRIGGER validate_event_participant_trigger 
    BEFORE INSERT OR UPDATE ON event_participants 
    FOR EACH ROW EXECUTE PROCEDURE validate_event_participant();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables were created
SELECT 'EVENT TABLES CREATED' as status;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('project_events', 'event_participants', 'event_notifications')
ORDER BY table_name;

-- Check enums
SELECT 'EVENT ENUMS CREATED' as status;
SELECT typname as enum_name, 
       array_agg(enumlabel ORDER BY enumsortorder) as values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid 
WHERE typname IN ('event_type', 'event_status', 'attendance_status')
GROUP BY typname;

COMMIT;