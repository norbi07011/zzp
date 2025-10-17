-- =========================================
-- CREATE VIEWS FOR WORKERS AND PROFILES
-- =========================================
-- Data: 2025-01-29
-- Cel: Naprawić błędy "relation v_workers does not exist"
-- =========================================

-- =========================================
-- VIEW 1: v_profiles (profiles table view)
-- =========================================

CREATE OR REPLACE VIEW v_profiles AS
SELECT 
  id,
  email,
  full_name,
  role,
  phone,
  language,
  avatar_url,
  created_at,
  updated_at
FROM profiles;

-- =========================================
-- VIEW 2: v_workers (workers + profiles combined)
-- =========================================

CREATE OR REPLACE VIEW v_workers AS
SELECT 
  w.id,
  w.profile_id,
  w.profile_id as user_id, -- alias dla kompatybilności
  
  -- Profile fields (from profiles table)
  p.email,
  p.full_name,
  p.role,
  p.phone,
  p.language,
  p.avatar_url,
  
  -- Worker-specific fields (from workers table)
  w.specialization,
  w.hourly_rate,
  w.years_experience,
  w.location_city,
  w.bio,
  w.available_from,
  w.skills,
  
  -- Team & On-Demand fields
  w.worker_type,
  w.team_size,
  w.team_description,
  w.team_hourly_rate,
  w.is_on_demand_available,
  w.is_available_now,
  w.on_demand_message,
  w.on_demand_updated_at,
  
  -- Subscription fields
  w.subscription_tier,
  w.subscription_status,
  w.subscription_started_at,
  w.subscription_ends_at,
  w.stripe_customer_id,
  w.stripe_subscription_id,
  
  -- Timestamps
  w.created_at,
  w.updated_at
FROM workers w
LEFT JOIN profiles p ON w.profile_id = p.id;

-- =========================================
-- GRANT SELECT PERMISSIONS
-- =========================================

-- Wszyscy authenticated users mogą czytać te widoki
GRANT SELECT ON v_profiles TO authenticated;
GRANT SELECT ON v_workers TO authenticated;

-- Anon users też mogą czytać (dla publicznych profili)
GRANT SELECT ON v_profiles TO anon;
GRANT SELECT ON v_workers TO anon;

-- =========================================
-- VERIFICATION
-- =========================================

SELECT '✅ Views created successfully!' as status;

-- Test v_profiles view
SELECT COUNT(*) as profiles_count FROM v_profiles;

-- Test v_workers view
SELECT COUNT(*) as workers_count FROM v_workers;

-- Show v_workers structure
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_name = 'v_workers'
ORDER BY ordinal_position
LIMIT 10;
