-- =============================================================================
-- MIGRATION 003: AUTHENTICATION TABLES
-- =============================================================================
-- Description: Creates tables for email verification, password reset, and 2FA
-- Author: ZZP Werkplaats Team
-- Date: 2025-10-08
-- Dependencies: 001_initial_schema.sql, 002_payments_schema.sql
-- =============================================================================

-- =============================================================================
-- 1. EMAIL VERIFICATION TOKENS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_token_length CHECK (LENGTH(token) >= 32),
  CONSTRAINT check_expires_future CHECK (expires_at > created_at)
);

-- Indexes for email_verification_tokens
CREATE INDEX IF NOT EXISTS idx_evt_token ON public.email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_evt_user_id ON public.email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_evt_expires_at ON public.email_verification_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_evt_verified_at ON public.email_verification_tokens(verified_at);

-- RLS Policies for email_verification_tokens
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tokens
CREATE POLICY "Users can view their own verification tokens"
  ON public.email_verification_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own tokens
CREATE POLICY "Users can create their own verification tokens"
  ON public.email_verification_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens (for verification)
CREATE POLICY "Users can update their own verification tokens"
  ON public.email_verification_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can manage all tokens (for cleanup)
CREATE POLICY "Service role can manage all verification tokens"
  ON public.email_verification_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.email_verification_tokens IS 'Stores email verification tokens for user registration';
COMMENT ON COLUMN public.email_verification_tokens.token IS 'Crypto-random 32-byte hex token (64 characters)';
COMMENT ON COLUMN public.email_verification_tokens.expires_at IS 'Token expiry time (default: 1 hour from creation)';
COMMENT ON COLUMN public.email_verification_tokens.verified_at IS 'Timestamp when email was verified (NULL if not verified)';

-- =============================================================================
-- 2. PASSWORD RESET TOKENS
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_prt_token_length CHECK (LENGTH(token) >= 32),
  CONSTRAINT check_prt_expires_future CHECK (expires_at > created_at),
  CONSTRAINT check_prt_used_after_created CHECK (used_at IS NULL OR used_at >= created_at)
);

-- Indexes for password_reset_tokens
CREATE INDEX IF NOT EXISTS idx_prt_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_prt_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_prt_expires_at ON public.password_reset_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_prt_used_at ON public.password_reset_tokens(used_at);

-- RLS Policies for password_reset_tokens
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Users can only see their own tokens
CREATE POLICY "Users can view their own reset tokens"
  ON public.password_reset_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can insert reset tokens (needed for "forgot password" flow)
CREATE POLICY "Anyone can create reset tokens"
  ON public.password_reset_tokens
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own tokens (for marking as used)
CREATE POLICY "Users can update their own reset tokens"
  ON public.password_reset_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role can manage all tokens (for cleanup)
CREATE POLICY "Service role can manage all reset tokens"
  ON public.password_reset_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.password_reset_tokens IS 'Stores password reset tokens for secure password recovery';
COMMENT ON COLUMN public.password_reset_tokens.token IS 'Crypto-random 32-byte hex token (64 characters)';
COMMENT ON COLUMN public.password_reset_tokens.expires_at IS 'Token expiry time (default: 1 hour from creation)';
COMMENT ON COLUMN public.password_reset_tokens.used_at IS 'Timestamp when token was used (NULL if not used, ensures single-use)';

-- =============================================================================
-- 3. TWO-FACTOR AUTHENTICATION
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.two_factor_auth (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_secret_length CHECK (LENGTH(secret) >= 16),
  CONSTRAINT check_backup_codes_count CHECK (
    backup_codes IS NULL OR array_length(backup_codes, 1) <= 10
  )
);

-- Indexes for two_factor_auth
CREATE INDEX IF NOT EXISTS idx_2fa_user_id ON public.two_factor_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_2fa_enabled ON public.two_factor_auth(enabled);

-- RLS Policies for two_factor_auth
ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;

-- Users can only see their own 2FA settings
CREATE POLICY "Users can view their own 2FA settings"
  ON public.two_factor_auth
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own 2FA settings
CREATE POLICY "Users can create their own 2FA settings"
  ON public.two_factor_auth
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own 2FA settings
CREATE POLICY "Users can update their own 2FA settings"
  ON public.two_factor_auth
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own 2FA settings
CREATE POLICY "Users can delete their own 2FA settings"
  ON public.two_factor_auth
  FOR DELETE
  USING (auth.uid() = user_id);

-- Service role can manage all 2FA settings
CREATE POLICY "Service role can manage all 2FA settings"
  ON public.two_factor_auth
  FOR ALL
  USING (auth.role() = 'service_role');

COMMENT ON TABLE public.two_factor_auth IS 'Stores TOTP secrets and backup codes for two-factor authentication';
COMMENT ON COLUMN public.two_factor_auth.secret IS 'TOTP secret for generating 6-digit codes (base32 encoded)';
COMMENT ON COLUMN public.two_factor_auth.enabled IS 'Whether 2FA is enabled for this user';
COMMENT ON COLUMN public.two_factor_auth.backup_codes IS 'Array of bcrypt-hashed backup codes (max 10)';

-- =============================================================================
-- 4. SECURITY LOGS (Enhanced for Authentication Events)
-- =============================================================================

-- Add columns to existing security_logs table if they don't exist
DO $$ 
BEGIN
  -- Add metadata column for additional event data
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'security_logs' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.security_logs ADD COLUMN metadata JSONB;
  END IF;

  -- Add provider column for social login tracking
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'security_logs' AND column_name = 'provider'
  ) THEN
    ALTER TABLE public.security_logs ADD COLUMN provider TEXT;
  END IF;

  -- Add success column for tracking failed attempts
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'security_logs' AND column_name = 'success'
  ) THEN
    ALTER TABLE public.security_logs ADD COLUMN success BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Create index on metadata for faster queries
CREATE INDEX IF NOT EXISTS idx_security_logs_metadata ON public.security_logs USING GIN(metadata);
CREATE INDEX IF NOT EXISTS idx_security_logs_provider ON public.security_logs(provider);
CREATE INDEX IF NOT EXISTS idx_security_logs_success ON public.security_logs(success);

COMMENT ON COLUMN public.security_logs.metadata IS 'Additional event data in JSON format (e.g., 2FA method, OAuth provider)';
COMMENT ON COLUMN public.security_logs.provider IS 'OAuth provider name for social login events (google, linkedin, github, etc.)';
COMMENT ON COLUMN public.security_logs.success IS 'Whether the authentication attempt was successful';

-- =============================================================================
-- 5. HELPER FUNCTIONS
-- =============================================================================

-- Function to clean up expired tokens
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Delete expired email verification tokens (older than 24 hours)
  DELETE FROM public.email_verification_tokens
  WHERE expires_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete expired password reset tokens (older than 24 hours)
  DELETE FROM public.password_reset_tokens
  WHERE expires_at < NOW() - INTERVAL '24 hours';
  
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  -- Delete verified email tokens (older than 7 days)
  DELETE FROM public.email_verification_tokens
  WHERE verified_at IS NOT NULL 
    AND verified_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  -- Delete used password reset tokens (older than 7 days)
  DELETE FROM public.password_reset_tokens
  WHERE used_at IS NOT NULL 
    AND used_at < NOW() - INTERVAL '7 days';
  
  GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_tokens IS 'Cleans up expired and used authentication tokens (run daily via cron)';

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_2fa_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_update_2fa_updated_at ON public.two_factor_auth;
CREATE TRIGGER trigger_update_2fa_updated_at
  BEFORE UPDATE ON public.two_factor_auth
  FOR EACH ROW
  EXECUTE FUNCTION public.update_2fa_updated_at();

-- =============================================================================
-- 6. GRANTS
-- =============================================================================

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_verification_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.password_reset_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.two_factor_auth TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_verification_tokens TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.password_reset_tokens TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.two_factor_auth TO service_role;

-- Grant execute on cleanup function to service_role only
GRANT EXECUTE ON FUNCTION public.cleanup_expired_tokens TO service_role;

-- =============================================================================
-- 7. SAMPLE DATA (Development Only)
-- =============================================================================

-- Uncomment below for development/testing
/*
-- Note: Replace 'your-user-id' with actual user UUID from auth.users
INSERT INTO public.email_verification_tokens (user_id, token, expires_at) VALUES
  ('your-user-id', 'test_token_' || md5(random()::text), NOW() + INTERVAL '1 hour');

INSERT INTO public.password_reset_tokens (user_id, token, expires_at) VALUES
  ('your-user-id', 'reset_token_' || md5(random()::text), NOW() + INTERVAL '1 hour');
*/

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Log migration completion
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 003: Authentication tables created successfully';
  RAISE NOTICE '✅ Created tables: email_verification_tokens, password_reset_tokens, two_factor_auth';
  RAISE NOTICE '✅ Created indexes for performance optimization';
  RAISE NOTICE '✅ Enabled RLS policies for security';
  RAISE NOTICE '✅ Created helper functions for token cleanup';
  RAISE NOTICE '📊 Run SELECT cleanup_expired_tokens(); to clean up old tokens';
END $$;
