-- ============================================================================
-- TEST DATA - Add sample data after creating tables
-- ============================================================================
-- Replace 'YOUR-WORKER-ID' with your actual worker profile_id
-- Get it from: SELECT profile_id FROM workers LIMIT 1;
-- ============================================================================

-- 1. SAMPLE PORTFOLIO PROJECT
INSERT INTO portfolio_projects (worker_id, title, description, start_date, tags, client_name)
VALUES (
  'YOUR-WORKER-ID', -- REPLACE THIS!
  'Electrical Installation - Office Building',
  'Complete electrical system installation for 3-story office building in Amsterdam. Included lighting, power distribution, and emergency systems.',
  '2024-01-15',
  ARRAY['electrical', 'commercial', 'VCA', 'office'],
  'ABC Construction B.V.'
);

-- 2. SAMPLE EARNINGS
INSERT INTO earnings (worker_id, amount, hours_worked, payment_date, status, description)
VALUES 
  ('YOUR-WORKER-ID', 450.00, 10, '2025-01-15', 'paid', 'Week 1 - Office building project'),
  ('YOUR-WORKER-ID', 540.00, 12, '2025-01-22', 'paid', 'Week 2 - Office building project'),
  ('YOUR-WORKER-ID', 360.00, 8, '2025-01-29', 'pending', 'Week 3 - Office building project');

-- 3. SAMPLE REVIEW
INSERT INTO reviews (worker_id, employer_id, rating, comment, created_at)
VALUES (
  'YOUR-WORKER-ID', -- REPLACE THIS!
  (SELECT profile_id FROM employers LIMIT 1), -- Uses first employer
  5,
  'Excellent work! Very professional and completed the job on time. Highly recommended!',
  NOW()
);

-- 4. VERIFY DATA
SELECT 
  (SELECT COUNT(*) FROM portfolio_projects WHERE worker_id = 'YOUR-WORKER-ID') as portfolio_count,
  (SELECT COUNT(*) FROM earnings WHERE worker_id = 'YOUR-WORKER-ID') as earnings_count,
  (SELECT COUNT(*) FROM reviews WHERE worker_id = 'YOUR-WORKER-ID') as reviews_count;

-- SUCCESS MESSAGE
DO $$
BEGIN
  RAISE NOTICE '✅ Test data added successfully!';
  RAISE NOTICE 'Check your Worker Dashboard now - data should appear!';
END $$;
