/**
 * AUTHENTICATION SERVICES INDEX
 * Main export for all authentication services
 */

export { emailVerificationService } from './emailVerificationService';
export { passwordResetService } from './passwordResetService';
export { twoFactorAuthService } from './twoFactorAuthService';
export { socialAuthService } from './socialAuthService';

// Export types
export type {
  EmailVerification,
  VerifyEmailRequest,
  VerifyEmailResponse,
  PasswordReset,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  PasswordResetResponse,
  TwoFactorAuth,
  Enable2FARequest,
  Enable2FAResponse,
  Verify2FARequest,
  Verify2FAResponse,
  SocialProvider,
  SocialLoginRequest,
  SocialLoginResponse,
  SocialProfile,
} from '../../types/auth';

