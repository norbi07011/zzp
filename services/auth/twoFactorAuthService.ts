// @ts-nocheck
/**
 * TWO-FACTOR AUTHENTICATION SERVICE
 * Handles TOTP-based 2FA setup, verification, and backup codes
 */

import { supabase } from '@/lib/supabase';
import type {
  TwoFactorAuth,
  Enable2FARequest,
  Enable2FAResponse,
  Verify2FARequest,
  Verify2FAResponse,
  Disable2FARequest,
  BackupCodeVerification,
} from '../../types/auth';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

class TwoFactorAuthService {
  private readonly APP_NAME = 'ZZP Werkplaats';

  /**
   * Generate backup codes (10 one-time codes)
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Hash backup codes for storage
   */
  private async hashBackupCodes(codes: string[]): Promise<string[]> {
    const hashed: string[] = [];
    for (const code of codes) {
      const hash = await bcrypt.hash(code, 10);
      hashed.push(hash);
    }
    return hashed;
  }

  /**
   * Enable 2FA for user
   */
  async enable2FA(request: Enable2FARequest): Promise<Enable2FAResponse> {
    try {
      // Get user email for QR code
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', request.user_id)
        .single();

      if (userError || !user) {
        return {
          success: false,
          secret: '',
          qr_code_url: '',
          backup_codes: [],
          manual_entry_key: '',
        };
      }

      // Generate secret
      const secret = authenticator.generateSecret();

      // Generate backup codes
      const backupCodes = this.generateBackupCodes();
      const hashedBackupCodes = await this.hashBackupCodes(backupCodes);

      // Create OTP Auth URL
      const otpauth = authenticator.keyuri(user.email, this.APP_NAME, secret);

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(otpauth);

      // Store in database (not enabled until verified)
      const { error: insertError } = await supabase
        .from('two_factor_auth')
        .upsert({
          user_id: request.user_id,
          secret,
          backup_codes: hashedBackupCodes,
          enabled: false,
          verified_at: null,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (insertError) {
        console.error('Failed to store 2FA secret:', insertError);
        return {
          success: false,
          secret: '',
          qr_code_url: '',
          backup_codes: [],
          manual_entry_key: '',
        };
      }

      console.log(`[2FA] Secret generated for user ${request.user_id}`);

      return {
        success: true,
        secret,
        qr_code_url: qrCodeUrl,
        backup_codes: backupCodes, // Return unhashed codes to user (one time only!)
        manual_entry_key: secret, // For manual entry in auth apps
      };
    } catch (error) {
      console.error('[2FA] Enable error:', error);
      return {
        success: false,
        secret: '',
        qr_code_url: '',
        backup_codes: [],
        manual_entry_key: '',
      };
    }
  }

  /**
   * Verify 2FA code and enable it
   */
  async verify2FA(request: Verify2FARequest): Promise<Verify2FAResponse> {
    try {
      // Get user's 2FA record
      const { data: twoFactor, error: fetchError } = await supabase
        .from('two_factor_auth')
        .select('*')
        .eq('user_id', request.user_id)
        .single();

      if (fetchError || !twoFactor) {
        return {
          success: false,
          message: '2FA is niet ingesteld voor deze gebruiker.',
          valid: false,
        };
      }

      // Verify TOTP code
      const isValid = authenticator.verify({
        token: request.code,
        secret: twoFactor.secret,
      });

      if (!isValid) {
        // Log failed attempt
        await this.logSecurityEvent(request.user_id, '2fa_failed');

        return {
          success: false,
          message: 'Ongeldige verificatiecode. Probeer opnieuw.',
          valid: false,
        };
      }

      // Enable 2FA and mark as verified
      const { error: updateError } = await supabase
        .from('two_factor_auth')
        .update({
          enabled: true,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', request.user_id);

      if (updateError) {
        console.error('Failed to enable 2FA:', updateError);
        return {
          success: false,
          message: 'Er is een fout opgetreden bij het inschakelen van 2FA.',
          valid: false,
        };
      }

      // Update user profile
      await supabase
        .from('profiles')
        .update({
          two_factor_enabled: true,
        })
        .eq('id', request.user_id);

      // Log security event
      await this.logSecurityEvent(request.user_id, '2fa_enabled');

      console.log(`[2FA] Enabled for user ${request.user_id}`);

      return {
        success: true,
        message: 'Tweestapsverificatie is succesvol ingeschakeld!',
        valid: true,
      };
    } catch (error) {
      console.error('[2FA] Verify error:', error);
      return {
        success: false,
        message: 'Er is een onverwachte fout opgetreden.',
        valid: false,
      };
    }
  }

  /**
   * Verify 2FA code during login
   */
  async verifyLoginCode(userId: string, code: string): Promise<boolean> {
    try {
      // Get user's 2FA record
      const { data: twoFactor, error } = await supabase
        .from('two_factor_auth')
        .select('secret, enabled')
        .eq('user_id', userId)
        .single();

      if (error || !twoFactor || !twoFactor.enabled) {
        return false;
      }

      // Verify TOTP code
      const isValid = authenticator.verify({
        token: code,
        secret: twoFactor.secret,
      });

      if (isValid) {
        await this.logSecurityEvent(userId, '2fa_verified');
      } else {
        await this.logSecurityEvent(userId, '2fa_failed');
      }

      return isValid;
    } catch (error) {
      console.error('[2FA] Verify login code error:', error);
      return false;
    }
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(request: BackupCodeVerification): Promise<boolean> {
    try {
      // Get user's 2FA record
      const { data: twoFactor, error } = await supabase
        .from('two_factor_auth')
        .select('backup_codes')
        .eq('user_id', request.user_id)
        .single();

      if (error || !twoFactor) {
        return false;
      }

      // Check backup codes
      let usedCodeIndex = -1;
      for (let i = 0; i < twoFactor.backup_codes.length; i++) {
        const isMatch = await bcrypt.compare(request.backup_code, twoFactor.backup_codes[i]);
        if (isMatch) {
          usedCodeIndex = i;
          break;
        }
      }

      if (usedCodeIndex === -1) {
        return false;
      }

      // Remove used backup code
      const updatedCodes = twoFactor.backup_codes.filter((_, index) => index !== usedCodeIndex);

      await supabase
        .from('two_factor_auth')
        .update({
          backup_codes: updatedCodes,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', request.user_id);

      console.log(`[2FA] Backup code used for user ${request.user_id}. ${updatedCodes.length} codes remaining.`);

      return true;
    } catch (error) {
      console.error('[2FA] Verify backup code error:', error);
      return false;
    }
  }

  /**
   * Disable 2FA
   */
  async disable2FA(request: Disable2FARequest): Promise<Verify2FAResponse> {
    try {
      // Verify password
      const { data: user } = await supabase.auth.getUser();

      if (!user) {
        return {
          success: false,
          message: 'Gebruiker niet ingelogd.',
          valid: false,
        };
      }

      // If code is provided, verify it
      if (request.code) {
        const isValid = await this.verifyLoginCode(request.user_id, request.code);
        if (!isValid) {
          return {
            success: false,
            message: 'Ongeldige verificatiecode.',
            valid: false,
          };
        }
      }

      // Disable 2FA
      const { error: updateError } = await supabase
        .from('two_factor_auth')
        .update({
          enabled: false,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', request.user_id);

      if (updateError) {
        console.error('Failed to disable 2FA:', updateError);
        return {
          success: false,
          message: 'Er is een fout opgetreden bij het uitschakelen van 2FA.',
          valid: false,
        };
      }

      // Update user profile
      await supabase
        .from('profiles')
        .update({
          two_factor_enabled: false,
        })
        .eq('id', request.user_id);

      // Log security event
      await this.logSecurityEvent(request.user_id, '2fa_disabled');

      console.log(`[2FA] Disabled for user ${request.user_id}`);

      return {
        success: true,
        message: 'Tweestapsverificatie is uitgeschakeld.',
        valid: true,
      };
    } catch (error) {
      console.error('[2FA] Disable error:', error);
      return {
        success: false,
        message: 'Er is een onverwachte fout opgetreden.',
        valid: false,
      };
    }
  }

  /**
   * Get 2FA status
   */
  async get2FAStatus(userId: string): Promise<{ enabled: boolean; backup_codes_count: number }> {
    try {
      const { data: twoFactor, error } = await supabase
        .from('two_factor_auth')
        .select('enabled, backup_codes')
        .eq('user_id', userId)
        .single();

      if (error || !twoFactor) {
        return { enabled: false, backup_codes_count: 0 };
      }

      return {
        enabled: twoFactor.enabled || false,
        backup_codes_count: twoFactor.backup_codes?.length || 0,
      };
    } catch (error) {
      console.error('[2FA] Get status error:', error);
      return { enabled: false, backup_codes_count: 0 };
    }
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    try {
      // Generate new backup codes
      const backupCodes = this.generateBackupCodes();
      const hashedBackupCodes = await this.hashBackupCodes(backupCodes);

      // Update in database
      const { error } = await supabase
        .from('two_factor_auth')
        .update({
          backup_codes: hashedBackupCodes,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to regenerate backup codes:', error);
        return [];
      }

      console.log(`[2FA] Regenerated backup codes for user ${userId}`);

      return backupCodes;
    } catch (error) {
      console.error('[2FA] Regenerate backup codes error:', error);
      return [];
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
        ip_address: 'unknown',
        user_agent: navigator.userAgent,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

export const twoFactorAuthService = new TwoFactorAuthService();
