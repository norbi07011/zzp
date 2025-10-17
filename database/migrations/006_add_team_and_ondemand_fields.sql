-- =====================================================
-- MIGRATION 006: Add Team & On-Demand Worker Features
-- Date: 2025-01-XX
-- Description: Adds support for team workers and on-demand availability
-- =====================================================

-- Add new columns to zzp_worker_profiles
ALTER TABLE zzp_worker_profiles 
ADD COLUMN IF NOT EXISTS worker_type TEXT DEFAULT 'individual' CHECK (worker_type IN ('individual', 'team_leader', 'duo_partner', 'helper_available')),
ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 1 CHECK (team_size >= 1 AND team_size <= 10),
ADD COLUMN IF NOT EXISTS team_description TEXT,
ADD COLUMN IF NOT EXISTS team_hourly_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS is_on_demand_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_available_now BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN zzp_worker_profiles.worker_type IS 'Type of worker: individual (solo), team_leader (has helpers), duo_partner (2 equal partners), or helper_available (can work as helper)';
COMMENT ON COLUMN zzp_worker_profiles.team_size IS 'Number of people in team (1-10). For individual workers = 1';
COMMENT ON COLUMN zzp_worker_profiles.team_description IS 'Description of team composition and skills. Required for team_leader and duo_partner';
COMMENT ON COLUMN zzp_worker_profiles.team_hourly_rate IS 'Combined hourly rate for entire team (€/hour). Used instead of hourly_rate when working as team';
COMMENT ON COLUMN zzp_worker_profiles.is_on_demand_available IS 'Worker opted-in for on-demand/emergency jobs (Springer feature)';
COMMENT ON COLUMN zzp_worker_profiles.is_available_now IS 'Worker is currently available for immediate work (toggle ON/OFF in dashboard)';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_workers_on_demand 
ON zzp_worker_profiles(is_on_demand_available, is_available_now) 
WHERE subscription_tier = 'premium' AND subscription_status = 'active';

CREATE INDEX IF NOT EXISTS idx_workers_teams 
ON zzp_worker_profiles(worker_type, team_size)
WHERE subscription_tier = 'premium' AND subscription_status = 'active';

CREATE INDEX IF NOT EXISTS idx_workers_available_now
ON zzp_worker_profiles(is_available_now)
WHERE is_available_now = true AND subscription_tier = 'premium';

-- Update RLS policy to include team info in visibility
DROP POLICY IF EXISTS "Employers can view premium workers" ON zzp_worker_profiles;

CREATE POLICY "Employers can view premium workers with team info"
ON zzp_worker_profiles
FOR SELECT
TO authenticated
USING (
  -- Employers can see premium workers (including team & on-demand info)
  (
    EXISTS (
      SELECT 1 FROM employers e
      WHERE e.user_id = auth.uid()
      AND e.subscription_status = 'active'
    )
    AND subscription_tier = 'premium'
    AND subscription_status = 'active'
  )
  -- Workers can see their own profile
  OR user_id = auth.uid()
  -- Admins can see all
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- Grant necessary permissions
GRANT SELECT ON zzp_worker_profiles TO authenticated;
GRANT INSERT, UPDATE ON zzp_worker_profiles TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES (Run these to test)
-- =====================================================

-- Test 1: Check if new columns exist
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'zzp_worker_profiles' 
  AND column_name IN ('worker_type', 'team_size', 'team_description', 'team_hourly_rate', 'is_on_demand_available', 'is_available_now')
ORDER BY column_name;

-- Test 2: Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'zzp_worker_profiles' 
  AND indexname LIKE '%workers%'
ORDER BY indexname;

-- Test 3: Count workers by type (after some data is added)
-- SELECT worker_type, COUNT(*) as count
-- FROM zzp_worker_profiles
-- GROUP BY worker_type
-- ORDER BY count DESC;

-- Test 4: Count on-demand workers available now
-- SELECT 
--   COUNT(*) FILTER (WHERE is_on_demand_available = true) as opted_in_total,
--   COUNT(*) FILTER (WHERE is_on_demand_available = true AND is_available_now = true) as available_now
-- FROM zzp_worker_profiles
-- WHERE subscription_tier = 'premium';
