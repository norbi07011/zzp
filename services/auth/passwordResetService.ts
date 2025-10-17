// @ts-nocheck
/**
 * PASSWORD RESET SERVICE
 * Handles password reset tokens, sending reset emails, and resetting passwords
 */

import { supabase } from '@/lib/supabase';
import type {
  PasswordReset,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  PasswordResetResponse,
  PasswordStrength,
} from '../../types/auth';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

class PasswordResetService {
  /**
   * Generate secure reset token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Check password strength
   */
  checkPasswordStrength(password: string): PasswordStrength {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const feedback: string[] = [];
    let score = 0;

    if (hasMinLength) score++;
    else feedback.push('Wachtwoord moet minimaal 8 tekens bevatten');

    if (hasUppercase) score++;
    else feedback.push('Voeg een hoofdletter toe');

    if (hasLowercase) score++;
    else feedback.push('Voeg een kleine letter toe');

    if (hasNumber) score++;
    else feedback.push('Voeg een cijfer toe');

    if (hasSpecialChar) score++;
    else feedback.push('Voeg een speciaal teken toe (!@#$%^&*)');

    return {
      score: score as 0 | 1 | 2 | 3 | 4 | 5,
      feedback,
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    };
  }

  /**
   * Request password reset (forgot password)
   */
  async requestPasswordReset(request: ForgotPasswordRequest): Promise<PasswordResetResponse> {
    try {
      // Find user by email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', request.email)
        .single();

      // Always return success (security: don't reveal if email exists)
      if (userError || !user) {
        console.log('[Password Reset] User not found:', request.email);
        return {
          success: true,
          message: 'Als dit emailadres bestaat, is er een wachtwoord reset link verzonden.',
        };
      }

      // Generate reset token
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

      // Store reset token
      const { error: insertError } = await supabase
        .from('password_resets')
        .insert({
          user_id: user.id,
          email: user.email,
          token,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error('Failed to create reset token:', insertError);
        return {
          success: false,
          message: 'Er is een fout opgetreden. Probeer het later opnieuw.',
        };
      }

      // Generate reset URL
      const resetUrl = `${window.location.origin}/reset-password?token=${token}`;

      // Send reset email
      const response = await fetch('/api/email/send-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.email,
          language: request.language || 'nl',
          reset_url: resetUrl,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send reset email');
      }

      console.log(`[Password Reset] Email sent to ${user.email}`);

      return {
        success: true,
        message: 'Als dit emailadres bestaat, is er een wachtwoord reset link verzonden.',
      };
    } catch (error) {
      console.error('[Password Reset] Request error:', error);
      return {
        success: false,
        message: 'Er is een onverwachte fout opgetreden.',
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(request: ResetPasswordRequest): Promise<PasswordResetResponse> {
    try {
      // Validate passwords match
      if (request.new_password !== request.confirm_password) {
        return {
          success: false,
          message: 'Wachtwoorden komen niet overeen.',
        };
      }

      // Check password strength
      const strength = this.checkPasswordStrength(request.new_password);
      if (strength.score < 3) {
        return {
          success: false,
          message: `Wachtwoord is te zwak. ${strength.feedback.join('. ')}.`,
        };
      }

      // Find reset token
      const { data: resetToken, error: fetchError } = await supabase
        .from('password_resets')
        .select('*')
        .eq('token', request.token)
        .is('used_at', null)
        .single();

      if (fetchError || !resetToken) {
        return {
          success: false,
          message: 'Ongeldige of verlopen reset link.',
        };
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(resetToken.expires_at);

      if (now > expiresAt) {
        return {
          success: false,
          message: 'Reset link is verlopen. Vraag een nieuwe aan.',
        };
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(request.new_password, 10);

      // Update user password (assuming auth.users table)
      const { error: updateError } = await supabase.auth.updateUser({
        password: request.new_password,
      });

      if (updateError) {
        console.error('Failed to update password:', updateError);
        return {
          success: false,
          message: 'Er is een fout opgetreden bij het wijzigen van het wachtwoord.',
        };
      }

      // Mark token as used
      await supabase
        .from('password_resets')
        .update({
          used_at: now.toISOString(),
        })
        .eq('id', resetToken.id);

      // Update password_last_changed in profiles
      await supabase
        .from('profiles')
        .update({
          password_last_changed: now.toISOString(),
        })
        .eq('id', resetToken.user_id);

      // Log security event
      await this.logSecurityEvent(resetToken.user_id, 'password_reset_completed');

      console.log(`[Password Reset] Password reset for user ${resetToken.user_id}`);

      return {
        success: true,
        message: 'Je wachtwoord is succesvol gewijzigd. Je kunt nu inloggen.',
      };
    } catch (error) {
      console.error('[Password Reset] Reset error:', error);
      return {
        success: false,
        message: 'Er is een onverwachte fout opgetreden.',
      };
    }
  }

  /**
   * Validate reset token
   */
  async validateResetToken(token: string): Promise<{ valid: boolean; expired: boolean }> {
    try {
      const { data: resetToken, error } = await supabase
        .from('password_resets')
        .select('expires_at, used_at')
        .eq('token', token)
        .single();

      if (error || !resetToken) {
        return { valid: false, expired: false };
      }

      // Check if already used
      if (resetToken.used_at) {
        return { valid: false, expired: false };
      }

      // Check if expired
      const now = new Date();
      const expiresAt = new Date(resetToken.expires_at);

      if (now > expiresAt) {
        return { valid: false, expired: true };
      }

      return { valid: true, expired: false };
    } catch (error) {
      console.error('[Password Reset] Validate token error:', error);
      return { valid: false, expired: false };
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const now = new Date();

      const { error } = await supabase
        .from('password_resets')
        .delete()
        .lt('expires_at', now.toISOString())
        .is('used_at', null);

      if (error) {
        console.error('Failed to cleanup tokens:', error);
        return 0;
      }

      console.log('[Password Reset] Cleaned up expired tokens');
      return 1;
    } catch (error) {
      console.error('[Password Reset] Cleanup error:', error);
      return 0;
    }
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(userId: string, eventType: string): Promise<void> {
    try {
      await supabase.from('security_logs').insert({
        user_id: userId,
        event_type: eventType,
        ip_address: 'unknown', // Would need to capture from request
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

export const passwordResetService = new PasswordResetService();
