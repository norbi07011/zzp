/**
 * AUTHENTICATION TYPES
 * Type definitions for advanced authentication features
 */

// =============================================================================
// SOCIAL AUTHENTICATION
// =============================================================================

export type SocialProvider = 'google' | 'linkedin' | 'github' | 'microsoft' | 'apple';

export interface SocialLoginRequest {
  provider: SocialProvider;
  redirect_to?: string;
}

export interface SocialLoginResponse {
  success: boolean;
  auth_url: string;
}

export interface SocialProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  provider: SocialProvider;
  provider_id: string;
  raw_data?: Record<string, any>;
}

// =============================================================================
// EMAIL VERIFICATION
// =============================================================================

export interface EmailVerification {
  id: string;
  user_id: string;
  email: string;
  token: string;
  expires_at: string;
  verified_at: string | null;
  created_at: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    email_verified: boolean;
  };
}

// =============================================================================
// PASSWORD RESET
// =============================================================================

export interface PasswordReset {
  id: string;
  user_id: string;
  email: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface ForgotPasswordRequest {
  email: string;
  language?: 'nl' | 'en' | 'pl';
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4 | 5; // 0=very weak, 5=very strong
  feedback: string[];
  hasMinLength: boolean; // min 8 characters
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

// =============================================================================
// TWO-FACTOR AUTHENTICATION (2FA)
// =============================================================================

export interface TwoFactorAuth {
  id: string;
  user_id: string;
  secret: string; // TOTP secret
  backup_codes: string[]; // 10 one-time backup codes
  enabled: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Enable2FARequest {
  user_id: string;
}

export interface Enable2FAResponse {
  success: boolean;
  secret: string;
  qr_code_url: string; // Data URL for QR code image
  backup_codes: string[];
  manual_entry_key: string; // For manual entry in authenticator apps
}

export interface Verify2FARequest {
  user_id: string;
  code: string; // 6-digit TOTP code
}

export interface Verify2FAResponse {
  success: boolean;
  message: string;
  valid: boolean;
}

export interface Disable2FARequest {
  user_id: string;
  password: string; // Require password to disable 2FA
  code?: string; // Optional: current TOTP code
}

export interface BackupCodeVerification {
  user_id: string;
  backup_code: string;
}

// SMS 2FA (optional - requires Twilio)
export interface SMS2FARequest {
  user_id: string;
  phone_number: string;
}

export interface SMS2FAResponse {
  success: boolean;
  message: string;
  verification_id: string;
}

export interface VerifySMSCodeRequest {
  verification_id: string;
  code: string; // 6-digit SMS code
}

// =============================================================================
// SOCIAL LOGIN (OAuth) - Already defined at top of file
// =============================================================================

// Social login types moved to top section

// =============================================================================
// AUTHENTICATION SESSION
// =============================================================================

export interface AuthSession {
  user: {
    id: string;
    email: string;
    email_verified: boolean;
    two_factor_enabled: boolean;
    social_providers: SocialProvider[];
    created_at: string;
  };
  access_token: string;
  refresh_token: string;
  expires_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
  two_factor_code?: string; // If 2FA is enabled
}

export interface LoginResponse {
  success: boolean;
  message: string;
  requires_2fa?: boolean;
  session?: AuthSession;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  role: 'worker' | 'employer' | 'admin';
  language?: 'nl' | 'en' | 'pl';
  send_verification_email?: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    email_verified: boolean;
  };
  verification_email_sent?: boolean;
}

// =============================================================================
// SECURITY LOGS
// =============================================================================

export interface SecurityLog {
  id: string;
  user_id: string;
  event_type: SecurityEventType;
  ip_address: string;
  user_agent: string;
  location?: {
    country?: string;
    city?: string;
    coordinates?: [number, number];
  };
  metadata?: Record<string, any>;
  created_at: string;
}

export type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'password_changed'
  | 'password_reset_requested'
  | 'password_reset_completed'
  | 'email_verified'
  | '2fa_enabled'
  | '2fa_disabled'
  | '2fa_verified'
  | '2fa_failed'
  | 'social_login_connected'
  | 'social_login_disconnected'
  | 'account_locked'
  | 'suspicious_activity';

// =============================================================================
// ACCOUNT SECURITY SETTINGS
// =============================================================================

export interface AccountSecurity {
  user_id: string;
  email_verified: boolean;
  phone_verified: boolean;
  two_factor_enabled: boolean;
  two_factor_method: '2fa_app' | 'sms' | null;
  backup_codes_remaining: number;
  password_last_changed: string;
  last_login_at: string;
  last_login_ip: string;
  failed_login_attempts: number;
  account_locked_until: string | null;
  security_questions_set: boolean;
  trusted_devices: TrustedDevice[];
}

export interface TrustedDevice {
  id: string;
  device_name: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  last_used_at: string;
  trusted_at: string;
}

// =============================================================================
// RATE LIMITING
// =============================================================================

export interface RateLimitConfig {
  max_attempts: number;
  window_ms: number; // Time window in milliseconds
  block_duration_ms: number; // How long to block after exceeding limit
}

export interface RateLimitCheck {
  allowed: boolean;
  remaining_attempts: number;
  reset_at: string;
  blocked_until?: string;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: AuthError[];
}
