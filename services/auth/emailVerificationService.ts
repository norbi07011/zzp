// @ts-nocheck
/**
 * EMAIL VERIFICATION SERVICE
 * Handles email verification tokens, sending verification emails, and verifying emails
 */

import { supabase } from '@/lib/supabase';
import type {
  EmailVerification,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '../../types/auth';
import crypto from 'crypto';

class EmailVerificationService {
  /**
   * Generate secure verification token
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Send verification email to user
   */
  async sendVerificationEmail(userId: string, email: string, language: 'nl' | 'en' | 'pl' = 'nl'): Promise<boolean> {
    try {
      // Generate verification token
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

      // Store verification token in database
      const { error: insertError } = await supabase
        .from('email_verifications')
        .insert({
          user_id: userId,
          email,
          token,
          expires_at: expiresAt.toISOString(),
        });

      if (insertError) {
        console.error('Failed to create email verification:', insertError);
        return false;
      }

      // Generate verification URL
      const verificationUrl = `${window.location.origin}/verify-email?token=${token}`;

      // Send email via Resend
      const response = await fetch('/api/email/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          language,
          verification_url: verificationUrl,
        }),
      });

      if (!response.ok) {
        console.error('Failed to send verification email');
        return false;
      }

      console.log(`[Email Verification] Sent to ${email}`);
      return true;
    } catch (error) {
      console.error('[Email Verification] Error:', error);
      return false;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(request: VerifyEmailRequest): Promise<VerifyEmailResponse> {
    try {
      // Find verification record
      const { data: verification, error: fetchError } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('token', request.token)
        .is('verified_at', null)
        .single();

      if (fetchError || !verification) {
        return {
          success: false,
          message: 'Ongeldige of verlopen verificatie link.',
        };
      }

      // Check if token is expired
      const now = new Date();
      const expiresAt = new Date(verification.expires_at);

      if (now > expiresAt) {
        return {
          success: false,
          message: 'Verificatie link is verlopen. Vraag een nieuwe aan.',
        };
      }

      // Mark as verified
      const { error: updateError } = await supabase
        .from('email_verifications')
        .update({
          verified_at: now.toISOString(),
        })
        .eq('id', verification.id);

      if (updateError) {
        console.error('Failed to update verification:', updateError);
        return {
          success: false,
          message: 'Er is een fout opgetreden bij het verifiëren.',
        };
      }

      // Update user's email_verified status
      const { error: userUpdateError } = await supabase
        .from('profiles')
        .update({
          email_verified: true,
          email_verified_at: now.toISOString(),
        })
        .eq('id', verification.user_id);

      if (userUpdateError) {
        console.error('Failed to update user:', userUpdateError);
      }

      // Get updated user
      const { data: user } = await supabase
        .from('profiles')
        .select('id, email, email_verified')
        .eq('id', verification.user_id)
        .single();

      return {
        success: true,
        message: 'Je email is succesvol geverifieerd!',
        user: user || undefined,
      };
    } catch (error) {
      console.error('[Email Verification] Verify error:', error);
      return {
        success: false,
        message: 'Er is een onverwachte fout opgetreden.',
      };
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(userId: string): Promise<boolean> {
    try {
      // Get user's email
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email, language')
        .eq('id', userId)
        .single();

      if (userError || !user) {
        console.error('User not found');
        return false;
      }

      // Check if already verified
      if (user.email_verified) {
        console.log('Email already verified');
        return false;
      }

      // Invalidate old tokens
      await supabase
        .from('email_verifications')
        .delete()
        .eq('user_id', userId)
        .is('verified_at', null);

      // Send new verification email
      return await this.sendVerificationEmail(userId, user.email, user.language || 'nl');
    } catch (error) {
      console.error('[Email Verification] Resend error:', error);
      return false;
    }
  }

  /**
   * Check if email is verified
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    try {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return false;
      }

      return user.email_verified || false;
    } catch (error) {
      console.error('[Email Verification] Check error:', error);
      return false;
    }
  }

  /**
   * Clean up expired tokens (run as cron job)
   */
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const now = new Date();

      const { error } = await supabase
        .from('email_verifications')
        .delete()
        .lt('expires_at', now.toISOString())
        .is('verified_at', null);

      if (error) {
        console.error('Failed to cleanup tokens:', error);
        return 0;
      }

      console.log('[Email Verification] Cleaned up expired tokens');
      return 1;
    } catch (error) {
      console.error('[Email Verification] Cleanup error:', error);
      return 0;
    }
  }
}

export const emailVerificationService = new EmailVerificationService();
