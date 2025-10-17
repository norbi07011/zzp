-- ============================================
-- SQL MIGRATION VERIFICATION SCRIPT
-- ============================================
-- Run this AFTER executing COMPLETE_SQL_MIGRATION.sql
-- Purpose: Verify all tables, indexes, and policies created
-- ============================================

-- ============================================
-- TEST 1: Check all tables exist (Should return 20)
-- ============================================
SELECT 
  '✅ TEST 1: Tables Count' as test_name,
  COUNT(*) as total_tables,
  CASE 
    WHEN COUNT(*) = 20 THEN '✅ PASS' 
    ELSE '❌ FAIL - Expected 20 tables'
  END as status
FROM pg_tables
WHERE schemaname = 'public';

-- ============================================
-- TEST 2: List all tables
-- ============================================
SELECT 
  '📋 TEST 2: Table List' as test_name,
  schemaname as schema,
  tablename as table_name,
  tableowner as owner
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- TEST 3: Check indexes (Should be ~60+)
-- ============================================
SELECT 
  '✅ TEST 3: Indexes Count' as test_name,
  COUNT(*) as total_indexes,
  CASE 
    WHEN COUNT(*) >= 60 THEN '✅ PASS' 
    ELSE '⚠️ WARNING - Expected 60+ indexes'
  END as status
FROM pg_indexes
WHERE schemaname = 'public';

-- ============================================
-- TEST 4: Check RLS policies (Should be ~42)
-- ============================================
SELECT 
  '✅ TEST 4: RLS Policies Count' as test_name,
  COUNT(*) as total_policies,
  CASE 
    WHEN COUNT(*) >= 40 THEN '✅ PASS' 
    ELSE '⚠️ WARNING - Expected 40+ policies'
  END as status
FROM pg_policies
WHERE schemaname = 'public';

-- ============================================
-- TEST 5: Check sample data in test_slots
-- ============================================
SELECT 
  '✅ TEST 5: Sample Data (test_slots)' as test_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ PASS - Sample data exists' 
    ELSE '⚠️ WARNING - Expected 3+ records'
  END as status
FROM test_slots;

-- ============================================
-- TEST 6: Check sample data in blog_categories
-- ============================================
SELECT 
  '✅ TEST 6: Sample Data (blog_categories)' as test_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ PASS - Sample data exists' 
    ELSE '⚠️ WARNING - Expected 3+ records'
  END as status
FROM blog_categories;

-- ============================================
-- TEST 7: Check sample data in system_settings
-- ============================================
SELECT 
  '✅ TEST 7: Sample Data (system_settings)' as test_name,
  COUNT(*) as record_count,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✅ PASS - Sample data exists' 
    ELSE '⚠️ WARNING - Expected 5+ records'
  END as status
FROM system_settings;

-- ============================================
-- TEST 8: Check triggers (Should be ~17)
-- ============================================
SELECT 
  '✅ TEST 8: Triggers Count' as test_name,
  COUNT(*) as total_triggers,
  CASE 
    WHEN COUNT(*) >= 15 THEN '✅ PASS' 
    ELSE '⚠️ WARNING - Expected 15+ triggers'
  END as status
FROM pg_trigger
WHERE tgname NOT LIKE 'RI_%' -- Exclude foreign key triggers
  AND tgname NOT LIKE 'pg_%'; -- Exclude system triggers

-- ============================================
-- TEST 9: Check foreign keys
-- ============================================
SELECT 
  '✅ TEST 9: Foreign Keys' as test_name,
  COUNT(*) as total_fks,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ PASS' 
    ELSE '⚠️ WARNING - Expected 10+ foreign keys'
  END as status
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
  AND table_schema = 'public';

-- ============================================
-- TEST 10: Full detailed table summary
-- ============================================
SELECT 
  t.schemaname as schema,
  t.tablename as table_name,
  (SELECT COUNT(*) 
   FROM pg_indexes i 
   WHERE i.schemaname = t.schemaname 
     AND i.tablename = t.tablename) as indexes_count,
  (SELECT COUNT(*) 
   FROM pg_policies p 
   WHERE p.schemaname = t.schemaname 
     AND p.tablename = t.tablename) as policies_count,
  pg_size_pretty(pg_total_relation_size(quote_ident(t.schemaname)||'.'||quote_ident(t.tablename))) as size
FROM pg_tables t
WHERE t.schemaname = 'public'
ORDER BY t.tablename;

-- ============================================
-- FINAL SUMMARY
-- ============================================
SELECT 
  '🎉 FINAL SUMMARY' as test_name,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') as total_tables,
  (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  (SELECT COUNT(*) FROM pg_trigger WHERE tgname NOT LIKE 'RI_%' AND tgname NOT LIKE 'pg_%') as total_triggers,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') = 20 
     AND (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') >= 60
     AND (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') >= 40
    THEN '✅✅✅ ALL TESTS PASSED! Migration successful!' 
    ELSE '⚠️ Some tests failed - check details above'
  END as overall_status;

-- ============================================
-- USAGE INSTRUCTIONS:
-- ============================================
-- 1. Execute COMPLETE_SQL_MIGRATION.sql first
-- 2. Wait for completion (30-60 seconds)
-- 3. Then run this verification script
-- 4. All tests should show "✅ PASS"
-- 5. If any test fails, check TROUBLESHOOTING section
-- ============================================
