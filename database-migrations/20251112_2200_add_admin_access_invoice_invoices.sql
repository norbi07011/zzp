-- ============================================
-- MIGRATION: Add admin access to invoice_invoices
-- Date: 2025-11-12
-- Author: AI Copilot
-- ============================================
-- PROBLEM: Admin panel nie może czytać invoice_invoices bo RLS policy wymaga user_id = auth.uid()
-- FIX: Dodaj policy która pozwala adminom (profiles.role = 'admin') czytać wszystkie faktury
-- ============================================

-- ROLLBACK PLAN:
-- DROP POLICY IF EXISTS "invoice_invoices_admin_select" ON invoice_invoices;

-- ============================================
-- STEP 1: Verify current policies
-- ============================================
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'invoice_invoices';

-- Expected: invoice_invoices_select z USING (user_id = auth.uid())

-- ============================================
-- STEP 2: Add admin policy for SELECT
-- ============================================
CREATE POLICY "invoice_invoices_admin_select"
ON invoice_invoices
FOR SELECT
TO authenticated
USING (
  -- Allow if user is admin
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
  OR
  -- OR if user owns the invoice (keep existing logic)
  user_id = auth.uid()
);

-- ============================================
-- STEP 3: Drop old policy (replaced by combined one)
-- ============================================
DROP POLICY IF EXISTS "invoice_invoices_select" ON invoice_invoices;

-- ============================================
-- STEP 4: Rename admin policy to standard name
-- ============================================
ALTER POLICY "invoice_invoices_admin_select" ON invoice_invoices RENAME TO "invoice_invoices_select";

-- ============================================
-- STEP 5: Verify new policy
-- ============================================
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'invoice_invoices' AND policyname = 'invoice_invoices_select';

-- Expected: (EXISTS ( SELECT 1 FROM profiles WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'admin'::text)))) OR (user_id = auth.uid())

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Test as admin (should return 4 invoices):
-- SELECT invoice_number, total_gross, status FROM invoice_invoices ORDER BY invoice_date DESC;

-- Test as regular user (should return only their invoices):
-- SELECT invoice_number, total_gross, status FROM invoice_invoices ORDER BY invoice_date DESC;

-- ============================================
-- NOTES
-- ============================================
-- This policy allows:
-- 1. Admins (profiles.role = 'admin') to see ALL invoices
-- 2. Regular users to see only THEIR invoices (user_id = auth.uid())
-- No changes to INSERT/UPDATE/DELETE policies needed (admins already have access via user_id check)
