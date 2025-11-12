-- Migration: Unify appointments system
-- Created: 2025-11-12 23:00
-- Purpose: Extend test_appointments to handle ALL appointment types (tests + meetings + consultations)
--
-- STRATEGY: OPCJA A - Single unified table for all appointments
-- - test_appointments becomes universal appointments table
-- - Add missing columns from appointments.ts requirements
-- - Preserve test-specific fields (examiner_name, result, score, passed)
--
-- BENEFIT: One source of truth, easier queries, no data duplication

-- =====================================================
-- ADD MISSING COLUMNS FOR MEETINGS/CONSULTATIONS
-- =====================================================

-- Client/Employer who requested appointment (for meetings)
ALTER TABLE test_appointments 
ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Service type (cleaning, interview, consultation, test)
ALTER TABLE test_appointments 
ADD COLUMN IF NOT EXISTS service_type TEXT;

-- Priority level
ALTER TABLE test_appointments 
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal';

-- Video call integration
ALTER TABLE test_appointments 
ADD COLUMN IF NOT EXISTS video_call_provider TEXT;

ALTER TABLE test_appointments 
ADD COLUMN IF NOT EXISTS video_call_meeting_id TEXT;

ALTER TABLE test_appointments 
ADD COLUMN IF NOT EXISTS video_call_join_url TEXT;

ALTER TABLE test_appointments 
ADD COLUMN IF NOT EXISTS video_call_password TEXT;

-- Reminders
ALTER TABLE test_appointments 
ADD COLUMN IF NOT EXISTS reminder_sms BOOLEAN DEFAULT FALSE;

ALTER TABLE test_appointments 
ADD COLUMN IF NOT EXISTS reminder_email BOOLEAN DEFAULT FALSE;

-- Rename test_type to appointment_type (more generic)
-- Keep backward compatibility by defaulting to 'test'
ALTER TABLE test_appointments 
ADD COLUMN IF NOT EXISTS appointment_type TEXT DEFAULT 'test';

-- Update existing records: migrate test_type → appointment_type
UPDATE test_appointments 
SET appointment_type = 
  CASE 
    WHEN test_type = 'zzp_exam' THEN 'test'
    WHEN test_type = 'certification' THEN 'test'
    ELSE 'test'
  END
WHERE appointment_type = 'test'; -- only if not already set

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_test_appointments_client 
ON test_appointments(client_id);

CREATE INDEX IF NOT EXISTS idx_test_appointments_appointment_type 
ON test_appointments(appointment_type);

CREATE INDEX IF NOT EXISTS idx_test_appointments_priority 
ON test_appointments(priority);

CREATE INDEX IF NOT EXISTS idx_test_appointments_date 
ON test_appointments(test_date);

-- =====================================================
-- UPDATE COMMENTS
-- =====================================================

COMMENT ON TABLE test_appointments IS 'Unified appointments table: tests, meetings, consultations. Worker-centric scheduling.';
COMMENT ON COLUMN test_appointments.appointment_type IS 'Type: test, meeting, consultation, interview';
COMMENT ON COLUMN test_appointments.client_id IS 'Employer/client who requested meeting (NULL for admin-scheduled tests)';
COMMENT ON COLUMN test_appointments.worker_id IS 'Worker attending appointment';
COMMENT ON COLUMN test_appointments.test_type IS 'DEPRECATED: Use appointment_type instead. Legacy field for tests.';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check new columns exist:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'test_appointments' 
-- AND column_name IN ('client_id', 'appointment_type', 'priority', 'video_call_provider', 'reminder_sms')
-- ORDER BY column_name;

-- Check data migration:
-- SELECT appointment_type, test_type, COUNT(*) 
-- FROM test_appointments 
-- GROUP BY appointment_type, test_type;

-- =====================================================
-- ROLLBACK PLAN
-- =====================================================

-- ALTER TABLE test_appointments DROP COLUMN IF EXISTS client_id;
-- ALTER TABLE test_appointments DROP COLUMN IF EXISTS service_type;
-- ALTER TABLE test_appointments DROP COLUMN IF EXISTS priority;
-- ALTER TABLE test_appointments DROP COLUMN IF EXISTS video_call_provider;
-- ALTER TABLE test_appointments DROP COLUMN IF EXISTS video_call_meeting_id;
-- ALTER TABLE test_appointments DROP COLUMN IF EXISTS video_call_join_url;
-- ALTER TABLE test_appointments DROP COLUMN IF EXISTS video_call_password;
-- ALTER TABLE test_appointments DROP COLUMN IF EXISTS reminder_sms;
-- ALTER TABLE test_appointments DROP COLUMN IF EXISTS reminder_email;
-- ALTER TABLE test_appointments DROP COLUMN IF EXISTS appointment_type;
-- DROP INDEX IF EXISTS idx_test_appointments_client;
-- DROP INDEX IF EXISTS idx_test_appointments_appointment_type;
-- DROP INDEX IF EXISTS idx_test_appointments_priority;
