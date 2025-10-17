// @ts-nocheck
/**
 * SOCIAL AUTHENTICATION SERVICE
 * Handles OAuth authentication with Google, LinkedIn, GitHub, etc.
 */

import { supabase } from '@/lib/supabase';
import type {
  SocialProvider,
  SocialLoginRequest,
  SocialLoginResponse,
  SocialProfile,
} from '../../types/auth';

class SocialAuthService {
  /**
   * Initiate social login
   */
  async initiateLogin(request: SocialLoginRequest): Promise<SocialLoginResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: request.provider,
        options: {
          redirectTo: request.redirect_to || `${window.location.origin}/auth/callback`,
          scopes: this.getProviderScopes(request.provider),
        },
      });

      if (error) {
        console.error('[Social Auth] Login error:', error);
        return {
          success: false,
          auth_url: '',
        };
      }

      return {
        success: true,
        auth_url: data.url || '',
      };
    } catch (error) {
      console.error('[Social Auth] Initiate login error:', error);
      return {
        success: false,
        auth_url: '',
      };
    }
  }

  /**
   * Get provider-specific scopes
   */
  private getProviderScopes(provider: SocialProvider): string {
    switch (provider) {
      case 'google':
        return 'email profile';
      
      case 'linkedin':
        return 'r_emailaddress r_liteprofile';
      
      case 'github':
        return 'user:email read:user';
      
      case 'microsoft':
        return 'openid email profile';
      
      case 'apple':
        return 'email name';
      
      default:
        return 'email profile';
    }
  }

  /**
   * Link social account to existing user
   */
  async linkAccount(provider: SocialProvider, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.linkIdentity({
        provider,
      });

      if (error) {
        console.error('[Social Auth] Link account error:', error);
        return false;
      }

      // Log security event
      await this.logSecurityEvent(userId, 'social_login_connected', { provider });

      console.log(`[Social Auth] Linked ${provider} account for user ${userId}`);

      return true;
    } catch (error) {
      console.error('[Social Auth] Link account error:', error);
      return false;
    }
  }

  /**
   * Unlink social account
   */
  async unlinkAccount(provider: SocialProvider, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.unlinkIdentity({
        provider,
      });

      if (error) {
        console.error('[Social Auth] Unlink account error:', error);
        return false;
      }

      // Log security event
      await this.logSecurityEvent(userId, 'social_login_disconnected', { provider });

      console.log(`[Social Auth] Unlinked ${provider} account for user ${userId}`);

      return true;
    } catch (error) {
      console.error('[Social Auth] Unlink account error:', error);
      return false;
    }
  }

  /**
   * Get user's linked social accounts
   */
  async getLinkedAccounts(userId: string): Promise<SocialProvider[]> {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        return [];
      }

      // Extract providers from user identities
      const providers: SocialProvider[] = [];
      
      if (data.user.app_metadata?.providers) {
        providers.push(...data.user.app_metadata.providers);
      }

      return providers;
    } catch (error) {
      console.error('[Social Auth] Get linked accounts error:', error);
      return [];
    }
  }

  /**
   * Extract social profile from OAuth data
   */
  extractSocialProfile(provider: SocialProvider, rawData: any): SocialProfile {
    let profile: SocialProfile = {
      id: '',
      email: '',
      name: '',
      provider,
      provider_id: '',
      raw_data: rawData,
    };

    switch (provider) {
      case 'google':
        profile.id = rawData.sub;
        profile.email = rawData.email;
        profile.name = rawData.name;
        profile.avatar_url = rawData.picture;
        profile.provider_id = rawData.sub;
        break;

      case 'linkedin':
        profile.id = rawData.id;
        profile.email = rawData.email;
        profile.name = `${rawData.firstName} ${rawData.lastName}`;
        profile.avatar_url = rawData.profilePicture;
        profile.provider_id = rawData.id;
        break;

      case 'github':
        profile.id = rawData.id.toString();
        profile.email = rawData.email;
        profile.name = rawData.name || rawData.login;
        profile.avatar_url = rawData.avatar_url;
        profile.provider_id = rawData.id.toString();
        break;

      case 'microsoft':
        profile.id = rawData.sub;
        profile.email = rawData.email;
        profile.name = rawData.name;
        profile.avatar_url = rawData.picture;
        profile.provider_id = rawData.sub;
        break;

      case 'apple':
        profile.id = rawData.sub;
        profile.email = rawData.email;
        profile.name = rawData.name || 'Apple User';
        profile.provider_id = rawData.sub;
        break;
    }

    return profile;
  }

  /**
   * Check if email is already registered
   */
  async isEmailRegistered(email: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      return !error && data !== null;
    } catch (error) {
      console.error('[Social Auth] Check email error:', error);
      return false;
    }
  }

  /**
   * Create or update profile from social login
   */
  async syncSocialProfile(profile: SocialProfile, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: profile.email,
          full_name: profile.name,
          avatar_url: profile.avatar_url,
          email_verified: true, // Social logins are pre-verified
          social_providers: [profile.provider],
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (error) {
        console.error('[Social Auth] Sync profile error:', error);
        return false;
      }

      console.log(`[Social Auth] Synced ${profile.provider} profile for user ${userId}`);

      return true;
    } catch (error) {
      console.error('[Social Auth] Sync profile error:', error);
      return false;
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(): Promise<boolean> {
    try {
      // Get session from URL hash
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        console.error('[Social Auth] Callback error:', sessionError);
        return false;
      }

      const user = sessionData.session.user;

      // Extract provider from metadata
      const provider = user.app_metadata?.provider as SocialProvider;
      
      if (!provider) {
        console.error('[Social Auth] No provider in metadata');
        return false;
      }

      // Extract and sync social profile
      const socialProfile = this.extractSocialProfile(provider, user.user_metadata);
      await this.syncSocialProfile(socialProfile, user.id);

      // Log security event
      await this.logSecurityEvent(user.id, 'login_success', { provider });

      console.log(`[Social Auth] Callback successful for ${provider}`);

      return true;
    } catch (error) {
      console.error('[Social Auth] Handle callback error:', error);
      return false;
    }
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(
    userId: string,
    eventType: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      await supabase.from('security_logs').insert({
        user_id: userId,
        event_type: eventType,
        ip_address: 'unknown',
        user_agent: navigator.userAgent,
        metadata,
        created_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

export const socialAuthService = new SocialAuthService();
