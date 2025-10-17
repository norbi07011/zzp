import { vi } from 'vitest';
import type { SocialProvider } from '../../../types/auth';

/**
 * MOCK SOCIAL AUTH SERVICE
 */

export const mockSocialAuthService = {
  initiateLogin: vi.fn((params: { provider: SocialProvider; redirect_to: string }) =>
    Promise.resolve({
      success: true,
      auth_url: `https://oauth.provider.com/authorize?provider=${params.provider}`,
    })
  ),

  handleCallback: vi.fn(() => Promise.resolve(true)),

  linkAccount: vi.fn(() =>
    Promise.resolve({
      success: true,
      auth_url: 'https://oauth.provider.com/authorize',
    })
  ),

  unlinkAccount: vi.fn(() => Promise.resolve(true)),

  getLinkedAccounts: vi.fn(() =>
    Promise.resolve([
      {
        id: '1',
        provider: 'google' as SocialProvider,
        provider_id: 'google-123',
        email: 'test@gmail.com',
        linked_at: new Date().toISOString(),
      },
    ])
  ),
};

export const createMockSocialAuthService = () => mockSocialAuthService;
