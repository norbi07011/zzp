-- Migration: Add capacity column to test_appointments
-- Created: 2025-11-12 23:30
-- Purpose: Add capacity field for test slot management
--
-- REASON: TestSchedulerPageNew requires capacity to calculate slot availability
-- This enables proper slot booking logic: booked_count / capacity

-- =====================================================
-- ADD CAPACITY COLUMN
-- =====================================================

ALTER TABLE test_appointments 
ADD COLUMN IF NOT EXISTS capacity INTEGER DEFAULT 10 
CHECK (capacity > 0 AND capacity <= 100);

-- =====================================================
-- UPDATE COMMENT
-- =====================================================

COMMENT ON COLUMN test_appointments.capacity IS 'Maximum number of workers that can be assigned to this test slot (default: 10, max: 100)';

-- =====================================================
-- CREATE INDEX FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_test_appointments_capacity 
ON test_appointments(capacity) 
WHERE capacity > 0;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================

-- Check if capacity column exists:
-- SELECT column_name, data_type, column_default, is_nullable
-- FROM information_schema.columns 
-- WHERE table_name = 'test_appointments' 
-- AND column_name = 'capacity';

-- =====================================================
-- ROLLBACK PLAN
-- =====================================================

-- ALTER TABLE test_appointments DROP COLUMN IF EXISTS capacity;
-- DROP INDEX IF EXISTS idx_test_appointments_capacity;
