import { vi } from 'vitest';

/**
 * Mock i18next i react-i18next
 * Eliminuje warning: "You will need to pass in an i18next instance"
 */

// Translation map for testing
const translations: Record<string, string> = {
  // Social auth translations
  'auth.social.google': 'Continue with Google',
  'auth.social.github': 'Continue with GitHub',
  'auth.social.linkedin': 'Continue with LinkedIn',
  'auth.social.microsoft': 'Continue with Microsoft',
  'auth.social.apple': 'Continue with Apple',
  
  // Divider
  'auth.divider.or': 'OR',
  
  // OAuth callback translations
  'auth.oauth.processing.title': 'Completing Sign In',
  'auth.oauth.processing.message': 'Please wait while we complete your authentication...',
  'auth.oauth.success.title': 'Successfully Signed In!',
  'auth.oauth.success.message': 'Redirecting you to your dashboard...',
  'auth.oauth.error.title': 'Authentication Failed',
  'auth.oauth.error.provider': 'The authentication provider returned an error',
  'auth.oauth.error.failed': 'Failed to complete authentication',
  'auth.oauth.error.generic': 'An error occurred during authentication',
  'auth.oauth.retry': 'Back to Login',
  'auth.oauth.help': 'Need help?',
  'common.contactSupport': 'Contact support',
};

// Mock useTranslation hook
export const mockUseTranslation = () => ({
  t: (key: string) => translations[key] || key, // Returns translation or key if not found
  i18n: {
    changeLanguage: vi.fn(),
    language: 'en',
    languages: ['en', 'pl'],
  },
  ready: true,
});

// Mock Trans component
export const MockTrans = ({ children }: { children: React.ReactNode }) => children;

// Mock withTranslation HOC
export const mockWithTranslation = () => (Component: any) => Component;

// Mock i18next instance
export const mockI18next = {
  use: vi.fn().mockReturnThis(),
  init: vi.fn().mockResolvedValue(undefined),
  t: (key: string) => translations[key] || key,
  changeLanguage: vi.fn().mockResolvedValue(undefined),
  language: 'en',
  languages: ['en', 'pl'],
};
