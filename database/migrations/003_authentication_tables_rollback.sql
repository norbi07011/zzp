-- =============================================================================
-- ROLLBACK MIGRATION 003: AUTHENTICATION TABLES
-- =============================================================================
-- Description: Rolls back authentication tables migration
-- Author: ZZP Werkplaats Team
-- Date: 2025-10-08
-- =============================================================================

-- WARNING: This will delete all authentication data!
-- Only run this if you need to completely reset the authentication system.

BEGIN;

-- Drop triggers
DROP TRIGGER IF EXISTS trigger_update_2fa_updated_at ON public.two_factor_auth;

-- Drop functions
DROP FUNCTION IF EXISTS public.cleanup_expired_tokens();
DROP FUNCTION IF EXISTS public.update_2fa_updated_at();

-- Drop policies (must be done before dropping tables)
DROP POLICY IF EXISTS "Users can view their own verification tokens" ON public.email_verification_tokens;
DROP POLICY IF EXISTS "Users can create their own verification tokens" ON public.email_verification_tokens;
DROP POLICY IF EXISTS "Users can update their own verification tokens" ON public.email_verification_tokens;
DROP POLICY IF EXISTS "Service role can manage all verification tokens" ON public.email_verification_tokens;

DROP POLICY IF EXISTS "Users can view their own reset tokens" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "Anyone can create reset tokens" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "Users can update their own reset tokens" ON public.password_reset_tokens;
DROP POLICY IF EXISTS "Service role can manage all reset tokens" ON public.password_reset_tokens;

DROP POLICY IF EXISTS "Users can view their own 2FA settings" ON public.two_factor_auth;
DROP POLICY IF EXISTS "Users can create their own 2FA settings" ON public.two_factor_auth;
DROP POLICY IF EXISTS "Users can update their own 2FA settings" ON public.two_factor_auth;
DROP POLICY IF EXISTS "Users can delete their own 2FA settings" ON public.two_factor_auth;
DROP POLICY IF EXISTS "Service role can manage all 2FA settings" ON public.two_factor_auth;

-- Drop indexes
DROP INDEX IF EXISTS public.idx_evt_token;
DROP INDEX IF EXISTS public.idx_evt_user_id;
DROP INDEX IF EXISTS public.idx_evt_expires_at;
DROP INDEX IF EXISTS public.idx_evt_verified_at;

DROP INDEX IF EXISTS public.idx_prt_token;
DROP INDEX IF EXISTS public.idx_prt_user_id;
DROP INDEX IF EXISTS public.idx_prt_expires_at;
DROP INDEX IF EXISTS public.idx_prt_used_at;

DROP INDEX IF EXISTS public.idx_2fa_user_id;
DROP INDEX IF EXISTS public.idx_2fa_enabled;

DROP INDEX IF EXISTS public.idx_security_logs_metadata;
DROP INDEX IF EXISTS public.idx_security_logs_provider;
DROP INDEX IF EXISTS public.idx_security_logs_success;

-- Drop tables (CASCADE will remove foreign key references)
DROP TABLE IF EXISTS public.two_factor_auth CASCADE;
DROP TABLE IF EXISTS public.password_reset_tokens CASCADE;
DROP TABLE IF EXISTS public.email_verification_tokens CASCADE;

-- Remove added columns from security_logs (if they exist)
ALTER TABLE public.security_logs DROP COLUMN IF EXISTS metadata;
ALTER TABLE public.security_logs DROP COLUMN IF EXISTS provider;
ALTER TABLE public.security_logs DROP COLUMN IF EXISTS success;

COMMIT;

-- Log rollback completion
DO $$
BEGIN
  RAISE NOTICE '✅ Rollback 003: Authentication tables removed successfully';
  RAISE NOTICE '⚠️  All authentication data has been deleted';
END $$;
